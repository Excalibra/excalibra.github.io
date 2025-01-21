---
title: "The Difference Between Computer Sleep and Hibernate Modes, and How to Set Up Hibernate"
date: 2025-01-20 07:25:00 +0800
author: Excalibra
category: [2025.]
tags: [windows]
permalink: /:year/:month-:day/01
---

# The Difference Between Sleep and Hibernate on Computers, and How to Enable Hibernate

## 1. Reasons to Choose Sleep or Hibernate

Imagine you're writing a paper, your browser has multiple research tabs open, and you're working on an unfinished coding project. The day's work isn't complete, but you need a break and want to continue tomorrow. If you shut down your computer now, all your progress will be lost. What should you do?

Thankfully, your computer offers two handy options: **Sleep** and **Hibernate**.  

<!-- more -->

By choosing either Sleep or Hibernate, you can resume your work exactly where you left off, ensuring all your data is preserved.

But what is the difference between Sleep and Hibernate?

---

## 2. Key Differences Between Sleep and Hibernate  

### 2.1 Data Storage Location

- **Sleep**: Data is stored in the computer's **RAM (memory)**. The RAM remains powered, while other components are turned off. This means Sleep mode still consumes a small amount of power. If the power source is disconnected, any unsaved data will be lost.

- **Hibernate**: Data is saved to the **hard drive**, and all components, including the RAM, are powered down. When the system is turned on again, data is restored from the hard drive. Hibernate consumes no power, similar to shutting down the computer.

---

### 2.2 Wake-Up Method

- **Sleep**: To wake the computer from Sleep, simply move the mouse or press a key on the keyboard.

- **Hibernate**: To wake the computer from Hibernate, you must press the power button.

---

### 2.3 Wake-Up Speed

- Sleep mode resumes faster since data is restored directly from RAM.
- Hibernate mode takes longer to resume because data is loaded from the hard drive.

---

## 3. How to Enable Hibernate in Windows  

Newly installed Windows systems, whether Windows 7 or Windows 10, come with Sleep enabled by default. However, Hibernate is often disabled. To enable Hibernate, two steps are required:  

1. Run the command to enable Hibernate.  
2. Configure the settings in the operating system interface.  

To disable Hibernate, simply reverse either of the steps above.

### Commands to Enable or Disable Hibernate

- **Enable Hibernate**: `powercfg.exe /hibernate on`  
- **Disable Hibernate**: `powercfg.exe /hibernate off`  

---

### Enabling Hibernate on Windows Systems

For a Windows operating system where the Hibernate feature is not displayed, the steps to enable Hibernate are as follows (in C++ pseudocode):

```
1. Press Win+R and enter "powercfg.exe /hibernate on"; // Note: There is a space between "exe" and "/".

if (OperationSystem == "Windows 7")
{
    2. Press Win+R and enter "control"; // This opens the Control Panel.
    3. Navigate to "Hardware and Sound".
    4. Under "Power Options", select "Change power-saving settings".
    5. Choose "Change plan settings".
    6. Click on "Change advanced power settings".
    7. Expand "Sleep".
    8. Set "Allow hybrid sleep" to "Off".
    9. Click "OK".
}

if (OperationSystem == "Windows 10")
{
    2. Press Win+R and enter "control"; // This opens the Control Panel.
    3. Navigate to "Hardware and Sound".
    4. Under "Power Options", select "Change what the power button does".
    5. Click "Change settings that are currently unavailable".
    6. Under "Shutdown settings", check the box for "Hibernate".
    7. Click "Save changes".
}
```

For Windows systems where Hibernate is not displayed, follow these steps:

#### Step 1: Run the Command
1. Press **Win + R**, type `powercfg.exe /hibernate on` (or `powercfg -h on`), and press Enter.

![image](https://github.com/user-attachments/assets/e6e76129-e794-4dbf-b614-fb2dd991ffa5)

#### Step 2: Adjust System Settings
- **Windows 7**:
  1. Press **Win + R**, type `control`, and open the Control Panel.
  2. Go to **Hardware and Sound** > **Power Options** > **Change Plan Settings** > **Change Advanced Power Settings**.
  3. Navigate to **Sleep** > **Allow Hybrid Sleep** and set it to **Off**.
  4. Click **OK** to save changes.

- **Windows 10**:
  1. Press **Win + R**, type `control`, and open the Control Panel.
  ![image](https://github.com/user-attachments/assets/eeaaed6f-ec20-42a9-b93f-5518d90b1b37)

  3. Go to **Hardware and Sound** > **Power Options** > **Choose what the power button does**.
  ![image](https://github.com/user-attachments/assets/b11e3a71-c4ec-4786-a2a7-e424bf68ff21)

  4. Click **Change settings that are currently unavailable**.
  ![image](https://github.com/user-attachments/assets/b47a786e-3425-4a04-ba79-2902dff15ec2)

  5. Under **Shutdown settings**, check the box for **Hibernate**.
  ![image](https://github.com/user-attachments/assets/963eabd0-23d6-4098-8e15-a9462af32215)

  7. Click **Save Changes**.

---

### How to Disable Hibernate
To remove the Hibernate option, use the command `powercfg.exe /hibernate off` (or `powercfg -h off`) in Step 1. No further action is needed.

![image](https://github.com/user-attachments/assets/b614ed7d-4bdb-4c3b-8a65-f21a7c16748f)

---

### Visual Guide
Below are visual steps for enabling Hibernate:

1. Open the Run dialog with **Win + R** and enter the command `powercfg.exe /hibernate on`.  
2. Follow the respective settings adjustments for your operating system (Windows 7 or Windows 10) as outlined above.  

---

## References

1. "What to Do When the Hibernate Button is Missing in Windows 7"  
2. "The Difference Between Sleep and Hibernate on Computers"  
3. "Sleep vs Hibernate in Windows Systems"

