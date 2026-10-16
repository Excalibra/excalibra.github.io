---
title: "From a Daily Password Bypass to RCE: Dissecting Three CVEs in the Danfoss Supermarket Refrigeration Controller"
categories: Vulnerability Analysis, IoT Security, Penetration Testing, Web Security, Security Tools
tags: ['danfoss', 'ak-sm-800a', 'cve-2025-41450', 'cve-2025-41451', 'cve-2025-41452', 'iot-security', 'ics-security', 'vulnerability-analysis', 'rce', 'authentication-bypass', 'nginx']
date: 2026-10-16
slug: "20261016-danfoss-ak-sm-800a-three-cve-refrigeration-controller"
description: "A technical dissection of three CVE vulnerabilities in the Danfoss AK-SM 800A refrigeration controller: a date-based hidden maintenance password authentication bypass, a mail password field shell injection leading to RCE, and runtime modification of nginx configuration."
---

> **Article Summary:**  
> This article dissects three CVE vulnerability chains in the Danfoss AK-SM 800A refrigeration controller: CVE-2025-41450 is a date-based hidden maintenance password authentication bypass; CVE-2025-41451 achieves RCE by concatenating the mail password field into a shell command; and CVE-2025-41452 permits runtime modification of nginx configuration. Approximately 2,765 devices are exposed to the public internet. Upgrading to firmware R4.3.1 and avoiding public exposure of the management plane are recommended.
>
> **Categories:** Vulnerability Analysis, IoT Security, Penetration Testing, Web Security, Security Tools

## Executive Summary

A recent news story has circulated widely in security circles: around 12 October 2026, the refrigeration units of several French supermarket chains were remotely altered, with setpoints pushed to approximately 50°C, causing large quantities of refrigerated food to be written off. Supermarket refrigeration units are normally held at a few degrees Celsius; once pushed to fifty degrees, a few hours are enough to produce extensive losses.

The list of affected parties is not short—Intermarché, Carrefour, Monoprix, E.Leclerc, as well as chains such as Super U and Hyper U. Intermarché reportedly told French media that 150 of its stores were affected, with losses in the hundreds of thousands of euros. Multiple reports mention that the attackers targeted Danfoss refrigeration systems within the stores.

It must be stated clearly at the outset: the **specific attack method in this incident has not been publicly confirmed**, and whether the CVEs dissected below were used remains undetermined. The CERT-FR advisory of 13 October also expanded the scope to the Copeland and Dixell XWEB platforms, stating that multiple intrusions into such systems are known and recommending that they all be removed from the public internet.

This article therefore does not chase conclusions. It dissects one confirmed matter: the **Danfoss AK-SM 800A** attack surface disclosed by Claroty Team82 in August 2026 and presented at DEF CON. The researcher is Amir Zaltzman. News is news, and technology is technology; the two should not be conflated.


<p align="center">
  <img src="https://github.com/user-attachments/assets/4430a186-790f-4492-bd9d-0680ff7a1ef5" width="85%" />
</p>


## The Controller Governs the Entire Store's Cold Chain

Danfoss is one of the world's major manufacturers of refrigeration and HVAC equipment, with products deployed in supermarkets, cold stores, warehouses, and commercial buildings. The AK-SM 800A is one of its **central refrigeration managers**: a single unit governs the refrigeration circuits across an entire store.

From a single console, administrators can monitor temperatures, adjust temperature thresholds, review historical alarms, schedule operating periods, configure notification services, manage users and permissions, and perform remote maintenance. In a word, it is the operational hub of the entire store's cold chain.

Because maintenance engineers frequently manage these devices remotely, the device includes a web management interface, eliminating the need to visit each store in person and considerably reducing maintenance costs. But convenience is a double-edged sword: once this "hub" is exposed to the public internet, it becomes the attacker's path of least resistance.

## First Question: Can These Machines Actually Be Reached?

Industrial control systems are often assumed by default to be "safely hidden inside an isolated network," but reality is frequently otherwise. The first step in the research is not to dig through firmware, but to confirm whether attackers can actually reach these devices. Team82 searched Shodan and Censys using the fingerprint of the management interface and quickly found results—a large number of controllers were directly exposed to the public internet.

<p align="center">
  <img src="https://github.com/user-attachments/assets/d105ed32-df0d-4226-8c3a-714efe229ca6" width="85%" />
</p>

The Censys result was approximately **2,765 devices**, many still carrying the signature HTTP title of the Danfoss StoreView management interface, indicating that administrators had deliberately exposed the web console to the external network for remote operations. For attackers, the barrier is immediately lowered: there is no need to first compromise the corporate network, nor to physically access the store to reach the machine. Simply scan, select those running older firmware, and attack directly.

This also determined the direction of the research. Although the device supports multiple industrial communication protocols, for a remote attacker this internet-facing web interface is the most realistic entry point, and the focus was therefore placed here first.

## Web Architecture: A Four-Layer Chain

Extracting the firmware and examining the file system revealed that this web service is not straightforward—it is not a single HTTP server working alone, but multiple layers of reverse proxy, CGI handlers, and application logic distributed across several independent processes.

The outermost layer is a publicly reachable Nginx, performing pure reverse proxying. Its `nginx.conf` specifies that requests with a `.cgi` suffix are forwarded to the CGI instance `sm_fcgi_app`.


<p align="center">
  <img src="https://github.com/user-attachments/assets/03e9295f-acea-4f80-a8ab-f2acd504da4e" width="85%" />
</p>

The `sm_fcgi_app` performs initial processing according to its own configuration, `sm_fcgi_app.conf`, and then uses `forward_xml_request` to forward the request to the **inner Nginx**.

The inner Nginx listens only on the local loopback and continues to forward `.cgi` requests to a task within `sm_app` called `Task_Web`—this is the true core that parses, processes, and dispatches requests for the web application. The layering appears convoluted, but clarifying this chain is precisely the starting point for each of the vulnerabilities that follow.

## CVE-2025-41450: The "Daily Password" Hidden in the Date

Authentication logic is often the most sensitive part of a management platform. Team82 focused on authentication requests sent to `xml.cgi` with `action="getauth"`.

Following the processing flow, the request enters `xml_get_data` and is then dispatched by operation type to the corresponding handler. When analysing the getauth path, two attributes with unclear purpose were found in the request. Once these are set to 1, the authentication flow no longer performs the normal password comparison but diverts into another branch, ultimately calling a function named `check_code_of_day`.

This is clearly a hidden authentication channel, most likely left by the vendor for after-sales or maintenance use. It does not compare against your configured administrator password, but instead calculates a "daily password" from the device's **current date** and compares the submitted value against it.

Having reversed `check_code_of_day`, the algorithm becomes clear: it uses `Get_syst_current_tds` to obtain the current date, and then concatenates the password according to a format such as `"%02d%02d%02d%02d"` (month, day, year, month). In other words, **anyone who reproduces this algorithm can calculate the password for any given day**, without knowing the administrator password at all, and obtain a complete administrator session. A hidden maintenance password is, in essence, a backdoor.

## CVE-2025-41451: Mail Password Field Concatenated into a Shell

Having bypassed authentication, the attack surface opens up considerably. Whereas previously only a few unauthenticated interfaces could be touched, the entire management interface is now available: network, alarms, users, mail notifications, logs, and system maintenance can all be accessed. When reversing an embedded web application, the first task is to look for functionality that "invokes system commands," because such places frequently concatenate user input into shell commands.

The SMTP mail notification configuration page quickly came to the fore. Following the "update mailbox settings" request downwards, the code that concatenates OS commands was traced: the value taken from item 0x1be1—that is, the **mailbox authentication password field**—is placed directly into a shell command, with no sanitisation at any point.

This means that inserting backticks, semicolons, pipes, or similar shell metacharacters into the password field allows the device to run the attacker's commands. And since the authentication barrier has already been bypassed by CVE-2025-41450, the two combine into a remote code execution chain requiring no password. The implications of being able to execute arbitrary commands on a cold chain controller require little elaboration.

## CVE-2025-41452: Runtime Modification of Nginx Configuration

There is a third vulnerability. Within the public-facing Nginx's server block, `headers.conf` is included.

The problem is that the web application exposes functionality to replace this file and reload Nginx at runtime—`action="load_nginx_headers"`. After authentication, uploading a new `headers.conf` as a file is sufficient; the device need not even be restarted, and the new directives take effect immediately.

An attacker can therefore implant arbitrary routing directives into the public-facing Nginx, altering how requests are handled and manipulating the client interacting with the device. During testing, an edge case was also encountered: accessing an implanted malicious route triggered an unhandled exception in `sm_app`, and the web service crashed outright. An authenticated user could trigger this repeatedly, reducing the management interface to a sustained denial of service.

## Remediation and Recommendations

Team82 followed a coordinated disclosure process, reporting the issues privately to Danfoss. Following investigation, the vendor released firmware **R4.3.1** to address these vulnerabilities. Those still using an affected AK-SM 800A should upgrade to R4.3.1 or later as soon as possible.

More important still is the old rule: do not expose the management interface directly to the public internet. Restrict management services to trusted network segments, or place them behind a VPN or network segmentation. Of the 2,765 devices Team82 originally discovered, how many have been upgraded and how many remain exposed cannot be determined—which is precisely why an incident involving this class of exposure surface affects so many at once.

## Commentary

The fact that a controller managing supermarket cold chains can be attacked from the public internet all the way to RCE stems fundamentally from several familiar classes of problem converging.

1. **Do not expose CPS management planes to the public internet.** For centralised controllers in refrigeration and industrial control, exposure is tantamount to handing the entire store's cold chain to scanners.
2. **Hidden maintenance passwords are backdoors.** Once the date-based "daily password" is reversed, the administrator password is rendered meaningless. This kind of "after-sales convenience" design will eventually backfire.
3. **Do not concatenate configuration into shells, and do not dynamically modify Nginx.** Fields entering commands must be sanitised, and a runtime-replaceable configuration file is itself a privilege escalation surface.

Transposed to remote management planes in connected vehicle charging infrastructure and building HVAC, the questions are essentially the same: close off the public internet, remove maintenance backdoors, and enforce whitelist validation for critical configuration. The French supermarket news cycle will pass, but these lessons will not. Securing one's own management plane is far more practical than chasing headlines.

---

**Disclaimer:**

> The procedures and technical methods contained in this article are intended solely for legal and compliant security research and teaching scenarios, with the aim of enhancing network security protection capabilities. They possess clear technical research attributes.
>
> Any unit or individual that uses the content of this article for illegal purposes such as attack or destruction without authorisation shall bear all legal liability, civil compensation, and joint liability independently; this site assumes no joint liability.
>
