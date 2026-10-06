---
title: "Without Writing a Single Line of Shellcode: How to Inject a DLL into Another Process"
categories: Malware, Vulnerability Analysis, Red Team, Penetration Testing, Security Tools
tags: ['dll-injection', 'poolparty', 'thread-pool', 'shellcode', 'edr-bypass', 'windows-internals', 'process-injection', 'red-team', 'malware', 'detection-engineering']
date: 2026-10-06
slug: "20261006-shellcodeless-dll-injection-thread-pool-poolparty"
description: "An analysis of the PoolParty technique for shellcode-free DLL injection, abusing Windows thread pool internals to construct an execution primitive from allocation and writing primitives, with discussion of callback signature mismatches, limitations, and detection strategies."
---

> **Article Summary:**  
> This article examines the PoolParty technique, a DLL injection method that requires no shellcode. It exploits the work item structures of the Windows thread pool, constructing an execution primitive from allocation and writing primitives so that a target process's worker thread executes `LoadLibraryW` to load a malicious DLL, thereby bypassing EDR detection. The article analyses in detail the detection weaknesses of traditional injection, thread pool structures, the three-step primitive, callback signature issues and limitations, and notes that the 2023 complete-bypass conclusion has partially expired after 2025, requiring attention to changes in the detection landscape.
>
> **Categories:** Malware, Vulnerability Analysis, Red Team, Penetration Testing, Security Tools

## Executive Summary

The textbook DLL injection sequence comprises four steps: `OpenProcess`, `VirtualAllocEx`, `WriteProcessMemory`, and `CreateRemoteThread(LoadLibraryW, path)`. A block of memory is allocated in the target process, the DLL path string is written into it, and a remote thread is created with its entry point pointing directly to `LoadLibraryW`, with the path as the argument. Once the DLL is loaded, `DllMain` executes automatically and the code has landed.

The problem is that every API in this sequence has been "memorised" by security products. SafeBreach Labs, in its research, decomposed process injection into three primitives—allocation, writing, and execution—and reached a key conclusion through experimentation:

> **EDR detection focus is almost entirely concentrated on the execution primitive, while the most basic forms of allocation and writing primitives are essentially undetected.**

The line of thinking therefore changes: can an execution primitive be constructed that relies solely on allocation and writing? Further still—what if the trigger for execution originates from a completely legitimate system behaviour, rather than an explicit call initiated by the attacker?

The Windows user-mode thread pool is precisely the answer to this question.

## 1. Why the Old Approach Is Becoming Less Effective

The textbook DLL injection sequence is as follows:

```
OpenProcess → VirtualAllocEx → WriteProcessMemory → CreateRemoteThread(LoadLibraryW, path)
```

A block of memory is allocated in the target process, the DLL path string is written into it, and a remote thread is created. The thread entry point points directly to `LoadLibraryW`, with the argument being that path. Once the DLL is loaded, `DllMain` executes automatically and the code has landed.

The problem is that every API in this sequence has already been "memorised" by security products. SafeBreach Labs, in its research, decomposed process injection into **three primitives**—allocation, writing, and execution—and reached a key conclusion through experimentation:

> **EDR detection focus is almost entirely concentrated on the execution primitive, while the most basic forms of allocation and writing primitives are essentially undetected.**

The line of thinking therefore changes: **can an execution primitive be constructed that relies solely on allocation and writing?** Further still—what if the trigger for execution originates from a **completely legitimate system behaviour**, rather than an explicit call initiated by the attacker?

The Windows user-mode thread pool is precisely the answer to this question.

## 2. The Thread Pool: An Underestimated Execution Primitive Factory

<p align="center">
  <img src="https://github.com/user-attachments/assets/4b8c22c2-6e9e-4f00-bb3d-46a37388a037" width="85%" alt="Figure 1: Windows thread pool architecture" />
</p>

Modern Windows user-mode processes can all access the thread pool implementation in ntdll. Most GUI, service, and shell processes (notepad.exe, explorer.exe, and various svchost instances) will have usable default thread pool state within the process once a thread pool API or a dependent subsystem triggers initialisation. Once the pool is active, it is a **three-layer collaborative structure**:

| Layer and Key Object | Role |
| --- | --- |
| User-mode handle layer: `PTP_POOL` | The pool handle, returned by `CreateThreadpoolWork` and similar functions |
| User-mode work item layer: `_TP_WORK` and others | Structures containing the **callback pointer, context, and cleanup group linkage** |
| Kernel-mode scheduling layer: Worker Factory | The threads that actually retrieve tasks and run callbacks |

> **Note:** The first two layers reside on the **caller's heap**. The third layer is established by `NtCreateWorkerFactory` and resides in the system address space. In addition to `_TP_WORK`, work item types include `_TP_TIMER`, `_TP_WAIT`, `_TP_IO`, `_TP_DIRECT`, `_TP_ALPC`, and `_TP_JOB`.

For an injector, this component is an almost perfect target for four reasons:

1. **Every Windows process has a thread pool by default**—meaning the technique's applicability covers all processes.
2. **Both work items and pools are represented by structures**—naturally suited to constructing an execution primitive using allocation and writing primitives.
3. **Multiple work item types are supported**—more queue types mean more opportunities.
4. **The component spans both kernel mode and user mode**, with high complexity—the attack surface is naturally enlarged.

> **Note:** The thread pool is **deliberately opaque** to user code. The field offsets of `_TP_WORK` are not part of any header file that can be `#include`d; only the function pointer prototypes are public. SafeBreach's contribution was precisely to reverse-engineer these structures and demonstrate that **as long as a syntactically valid `_TP_*` structure can be placed in the target process's address space, and its existence "announced" to that process's worker factory, the thread pool will execute the callback in the target process on the attacker's behalf, without requiring the creation of any thread.**

### What a "Normal" Submission Looks Like

```
ntdll!TpAllocWork  → RtlAllocateHeap                                    // allocate a TP_WORK on the local heap
                    → TP_WORK.CleanupGroupMember.Pool = process default pool
                    → TP_WORK.Task.Callback            = callback
                    → TP_WORK.Task.Context             = context
ntdll!TpPostWork (or SubmitThreadpoolWork)
                    → insert TP_WORK into Pool->WorkQueue (lock-free linked list)
                    → set WorkState.Exchange = 2                        // mark as "retrievable"
                    → NtSetIoCompletion(Pool->IoCompletion, 1)          // wake a worker thread
[worker thread wakes on NtRemoveIoCompletion]
                    → dequeue WorkQueue head
                    → call TP_WORK.Task.Callback(TP_WORK.Task.Context)
```

Two points are worth noting:

- The callback **executes in a worker thread already owned by the operating system**; no new thread is created by user code.
- The entire insertion and dispatch path passes through an **in-process I/O completion port** (`Pool->IoCompletion`), signalling via `NtSetIoCompletion` to wake a worker. This handle is precisely what the various variants ultimately attack in different ways.

## 3. The Three-Step Primitive of PoolParty

<p align="center">
  <img src="https://github.com/user-attachments/assets/b6fc6f2a-9ae2-429e-b505-f51bbbcafa7e" width="85%" alt="Figure 2: PoolParty three-step primitive" />
</p>


All PoolParty variants converge on the same three-step shape. **The difference lies only in the third step:**

```
1. OPEN     —— OpenProcess(target, PROCESS_VM_OPERATION | PROCESS_VM_WRITE | PROCESS_DUP_HANDLE)
2. WRITE    —— VirtualAllocEx(target, RW) + WriteProcessMemory(forged _TP_* structure)
               · its Task.Callback points to the code to be executed
               · its CleanupGroupMember.Pool points to the target's default pool
                 (read via NtQueryInformationProcess + ReadProcessMemory)
3. ANNOUNCE —— how to tell the target's worker factory: "Wake up, you have new work in the queue, the address is here"
```

SafeBreach presented **eight variants** at Black Hat Europe 2023, which can be grouped into two tactical classes:

**Seven "task ticket delivery" tactics** (using native system events as triggers to insert malicious callbacks into the task queue): `TP_WORK` forging a high-priority task ticket, `TP_WAIT` binding to event signals, `TP_IO` disguising itself as a file I/O completion packet, `TP_ALPC` impersonating trusted inter-component communication, `TP_JOB` exploiting process join-job-object events, `TP_TIMER` setting delayed or periodic callbacks, and the bare completion packet form that directly delivers a callback pointer to the IoCompletion queue.

**One "worker modification" tactic:** bypassing the task queue and directly tampering with the Worker Factory's `StartRoutine`, so that newly created worker threads immediately execute the attacker's logic.

In that year's testing, this technique achieved complete bypass against five mainstream EDR products (Palo Alto Cortex, SentinelOne, CrowdStrike Falcon, Microsoft Defender for Endpoint, and Cybereason).

> **Important clarification (added by this article):** Conclusions of this "100% bypass" nature are a **snapshot of testing at a point in time in 2023** and do not necessarily still hold today. Trustwave's subsequent C# implementation, SharpParty, observed that after Microsoft received reports and implemented detection in March 2025, related detections rose noticeably. **Treating such conclusions as eternal truths is the easiest pitfall for operations teams to fall into.**

## 4. Where "No Shellcode" Is Actually Difficult: Callback Signatures and Argument Position Mismatch

<p align="center">
  <img src="" width="85%" alt="Figure 3: Callback signature and argument mismatch" />
</p>


This is the **true technical core** of the entire matter, and also the most easily glossed-over point.

Classic PoolParty writes shellcode into the target (often into a block of RWX memory) and then has `Task.Callback` point to it. The term **shellcodeless** means **writing no custom code into the target at all**, and instead having the callback point directly to a **legitimate function already present in the target process**—the most natural choice being `LoadLibraryW`.

This sounds straightforward, but the moment one tries it, one hits a wall. Empirical work in public sources explains the problem clearly:

The type expansion of `PTP_WORK_CALLBACK` is:

```c
VOID CALLBACK WorkCallback(
    PTP_CALLBACK_INSTANCE Instance,    // first argument
    PVOID                 Context,     // second argument
    PTP_WORK              Work         // third argument
);
```

And `TpAllocWork`'s `PVOID OptionalArg` is passed to the callback as **Context (the second argument)**. But `LoadLibraryA/W` **accepts only one argument**:

```c
HMODULE LoadLibraryW(LPCWSTR lpFileName);
```

Under the x64 calling convention, when the callback is invoked, `RCX = Instance`, `RDX = Context`, `R8 = Work`. But `LoadLibraryW` reads only `RCX`. Thus:

> Naively passing `LoadLibraryA` to `TpAllocWork` as the callback causes the DLL path (wininet.dll) to land in **RDX**, while **RCX receives a pointer to the `TP_CALLBACK_INSTANCE` structure dynamically generated inside ntdll by `TppWorkPost`**—which is not a path string. The result is either a load failure or the loading of incorrect content.

Empirical work has also tried a compromise: writing a stub callback that internally calls `LoadLibraryA(Context)`. This does indeed work, but the stub function itself resides in **private RX memory**, and the call stack becomes `LoadLibraryA → stub in RX region → RtlUserThreadStart`, returning to the old problem of being flagged by stack tracing—going around in a circle, equivalent to not going around at all.

**Therefore, the condition for "shellcodeless" to hold is essentially one thing:** making the memory pointed to by the callback's **first argument** directly be the DLL path string. Once this holds, `LoadLibraryW` becomes a "naturally usable" callback, and the target process gains only **one path string and one forged structure**—no custom code, no RX/RWX section, and no newly created thread.

> **⚠️ Unverified note:** The specific means by which DLLParty achieves first-argument-points-to-path (for example, how the memory layout of the "callback instance / context" region in the forged work item is arranged, or whether other work item types are used to bypass signature differences) **cannot be asserted in this article because the original text could not be retrieved**. The "argument position mismatch" problem and its consequences described above come from verifiable public empirical work; for DLLParty's specific solution, please refer to the original text.

## 5. Complete Flow (Logical Skeleton)

It should be emphasised that the following is only a **logical skeleton** and does not contain a complete implementation usable for direct attack.

```
① Open the target
   OpenProcess(PROCESS_VM_OPERATION | PROCESS_VM_WRITE | PROCESS_DUP_HANDLE | PROCESS_QUERY_INFORMATION)

② Locate the target's thread pool
   · Via the Worker Factory handle → NtQueryInformationWorkerFactory to obtain StartParameter
     (this parameter is essentially a pointer to the TP_POOL structure)
   · Or via NtQueryInformationProcess + ReadProcessMemory to read the default pool

③ Write the payload data
   VirtualAllocEx(target, RW) + WriteProcessMemory:
     · DLL path string (wide characters)
     · Forged _TP_WORK (or _TP_TIMER / _TP_WAIT / _TP_IO …)
       ├ Task.Callback            = address of LoadLibraryW in the target process
       ├ Task.Context             = address of the path string
       └ CleanupGroupMember.Pool  = target's default pool

④ Announce and trigger (variant difference point)
   · Conventional work item: link the forged structure into the target task queue linked list
   · Asynchronous work item: deliver to the I/O completion queue, triggered by subsequent I/O events
   · Timer work item: link into the timer queue, triggered on expiry
   · Or directly NtSetIoCompletion to wake a worker

⑤ Landing
   The target process's own worker thread (starting at ntdll!TppWorkerThread) dequeues the task,
   calls LoadLibraryW(path) → DLL loaded → DllMain executes with the target process's identity
```

**Comparison with the traditional approach:**

| Aspect | Traditional | Thread Pool |
| --- | --- | --- |
| Whether a new thread is created | Yes, `CreateRemoteThread` is a high-risk strong signal | No, reuses the system's existing worker |
| Whether shellcode is required | Not required, but a remote thread must be created | Not required, and no stub code either |
| New memory attributes in the target | Usually RWX, a strong signal | Only RW data—just the path string and forged structure |
| Execution trigger | Explicitly invoked by the attacker | Legitimate scheduling by the thread pool |
| Detection handles | `CreateRemoteThread`, RWX sections, remote thread start address | Cross-process modification of thread pool structures, abnormal module load call stack |

## 6. Scope, Limitations and Fragility (Added by This Article)

This class of technique is not universally applicable, and there are numerous practical constraints:

1. **The target thread pool must already be initialised.** If the process has not yet established usable thread pool state, there is nowhere to attach the work item.
2. **Considerably high process handle privileges are required.** `PROCESS_VM_OPERATION | PROCESS_VM_WRITE | PROCESS_DUP_HANDLE` should itself be a monitoring priority.
3. **Structure offsets drift with OS versions.** Structures such as `_TP_WORK` are not part of a public ABI, and field layouts are obtained through reverse engineering; Windows updates may render them ineffective or even crash the target process. This is the **most fundamental fragility** of this family of techniques.
4. **Dependence on the address of `LoadLibraryW` in the target process.** The target process's module export table must be resolved, and ASLR and architecture (x86/x64) differences must be accounted for.
5. **Dependence on the "argument position" convention.** Any change in signature or calling convention will render "directly using LoadLibrary as a callback" ineffective.
6. **Loader lock restrictions within DllMain.** The APIs callable within the DLL load lock are limited; performing complex initialisation within `DllMain` (such as bringing up C2 or loading other DLLs) can easily deadlock or hang. In practice, the safer approach is to perform only minimal actions in `DllMain`.
7. **The detection landscape is dynamic.** As noted above, the "complete bypass" conclusion of 2023 has been partially caught up with by some vendors after 2025.

## 7. Detection and Defence

<p align="center">
  <img src="" width="85%" alt="Figure 4: Detection and defence considerations" />
</p>


The good news for defenders is that **although the internal structures of the thread pool are opaque, their "normal form" is highly consistent, which makes anomalies stand out.**

- **Thread start address baseline:** The start address of a normal worker thread is invariably `ntdll!TppWorkerThread`. A thread that claims to be a worker but starts in **private or image-unsupported memory** warrants secondary scrutiny.
- **Structure integrity:** Verify the consistency of the `TP_POOL` task queue linked list and work item fields; identify forged work items that **do not belong to this process's allocator**.
- **Handle monitoring:** Monitor cross-process handle acquisition against `TpWorkerFactory` objects, and abnormal combinations of calls such as `NtSetIoCompletion` and `NtQueryInformationWorkerFactory`.
- **Behaviour telemetry (most critical):** Keep a close watch on **module load events**—a process loading a DLL of unusual provenance, with the `LoadLibrary` call stack returning into the thread pool scheduling path (rather than a normal business call chain). This is the landing point that "shellcodeless" cannot avoid: **the DLL must ultimately be loaded, and loading will leave telemetry.**
- **Privilege reduction:** Reduce the exposure surface of process handles that can be written to cross-process; enable mechanisms such as Protected Process Light (PPL) for sensitive processes.
- **Adjustment of detection philosophy:** Do not treat `CreateRemoteThread` as synonymous with process injection. **"Cross-process modification of thread pool structures"** should itself be collected as a first-class signal.

## References

1. DLLParty: Abusing Thread Pool Internals for Shellcodeless DLL Injection: https://medium.com/@persic.eno/dllparty-abusing-thread-pool-internals-for-shellcodeless-dll-injection-7c84106f7745
2. SafeBreach Labs original research: https://www.safebreach.com/blog/process-injection-using-windows-thread-pools
3. SafeBreach Labs PoC repository: https://github.com/SafeBreach-Labs/PoolParty
4. Thread pool internals and PoolParty variant analysis: https://taogoldi.github.io/reverse-engineer/blog/poolparty-itw-2026
5. Callback signature and argument position mismatch empirical work (0xdarkvortex): https://0xdarkvortex.dev/proxying-dll-loads-for-hiding-etwti-stack-tracing/
6. Windows thread pool security relevance overview: https://yunolay.com/windows-thread-pools
7. Thread pool injection PoC (variant comparison): https://deepwiki.com/dlima04/Thread-Pool-Injection-PoC/4.3-workerfactory-based-injection
8. SharpParty (C# implementation and detection landscape changes): https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog/sharpparty-process-injection-in-c/
9. Event coverage: https://securityaffairs.com/155464/hacking/pool-party-bypassing-edr.html

---

**Disclaimer:**

> The procedures and technical methods contained in this article are intended solely for legal and compliant security research and teaching scenarios, with the aim of enhancing network security protection capabilities. They possess clear technical research attributes.
>
> Any unit or individual that uses the content of this article for illegal purposes such as attack or destruction without authorisation shall bear all legal liability, civil compensation, and joint liability independently; this site assumes no joint liability.
>
