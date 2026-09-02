---
title: "Exposure of a Botnet Linked to an Israeli Listed Company"
categories: Threat Intelligence
tags: ['popa', 'neunative', 'residential-proxy', 'botnet', 'sdk', 'alarum-technologies', 'netnut', 'android-malware', 'windows-sdk', 'vo1d-botnet', 'ai-scraping', 'proxy-network', 'malware-analysis', 'threat-intelligence']
date: 2026-07-23
featured: true
weight: 20
slug: "20260723220000"
description: "In-depth technical analysis of the Popa/Neunative proxy SDK ecosystem that transforms consumer devices into residential proxy nodes. The infrastructure shows deep ties to NetNut under Israeli-listed Alarum Technologies, with millions of daily active IPs used for AI data scraping and other activities."
---
<p align="center">
  <img width="85%" alt="Popa Botnet Infrastructure" src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Ft8qaf5xksecwb4fxe9t5.png" />
</p>
<br/>

**Article Summary:** A proxy software development kit (SDK) named Popa has been exposed, capable of transforming mobile phones, TV boxes, and other devices into residential proxy network nodes. The SDK is distributed through pirated applications, counterfeit boxes, and bundled installations across Android and Windows platforms. Its operations are highly stealthy, employing dynamic configuration to evade blocks and utilising proprietary protocols for communication with backend servers. Notably, this infrastructure shows deep connections with NetNut, a residential proxy provider under the Israeli listed company Alarum Technologies. The report indicates the network maintains millions of active IPs daily and is used for activities such as AI data scraping, posing risks to user device security and enterprise networks.  
 

---


Many users remain unaware that their mobile phones or home TV boxes may be quietly integrated into commercial residential proxy networks in the background, forwarding network traffic for third parties.

On 18 June 2026, Synthient, Nokia Deepfield, Qurium Media Foundation, and KrebsOnSecurity simultaneously released research reports that fully exposed the ecosystem surrounding the Popa and Neunative proxy SDKs.

This SDK spans Android and Windows platforms. It is implanted via pirated streaming applications, counterfeit TV boxes, download tools, and other channels, ultimately feeding into the same residential proxy infrastructure. This network maintains deep ties with NetNut, the residential proxy service under the listed company Alarum Technologies.


![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/f1umxk42wnnkmaqf2i1j.png)



## Popa: A Multi-Platform Proxy SDK Family

Popa is not a single malicious program but a long-evolving family of proxy software development kits. Its core objective is to convert ordinary consumer devices into exit nodes for residential proxy networks. Over years of iteration, it has developed a comprehensive matrix across multiple languages, platforms, and brands, with variants tailored to different implantation scenarios.

| Branch Name     | Package Name          | Development Language | Earliest Sample Date | Primary Platforms     |
|-----------------|-----------------------|----------------------|----------------------|-----------------------|
| Moneytiser     | io.moneytise         | Java                | December 2020       | Android              |
| Popa           | io.popanet           | Java                | March 2022          | Android              |
| Loopop         | io.nn.lp             | Java                | November 2023       | Android              |
| Neupop / Neunative | io.nn.neunative / NeunativeWin.dll | C++          | February 2026       | Android, Windows     |

The SDK’s distribution channels cover a broad range of consumer devices; virtually any terminal capable of installing third-party applications may serve as a carrier.

Android devices are the primary target. The Vo1d botnet infects large numbers of counterfeit TV boxes and implants Popa plugins. Additionally, numerous pirated streaming applications actively bundle the SDK, including Ocean Streamz, CyberFlix, Flixoid, Sportzfy, and dozens of other popular titles. Users installing these applications inadvertently join the proxy network. (Initial discovery referenced from XLab: https://blog.xlab.qianxin.com/long-live-the-vo1d_botnet/)



![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/ul4d24ou646ul2emv15d.png)



Even the open-source application Smart Tube was compromised, with the proxy SDK inserted across multiple versions for five months before community detection. On Windows, prominent examples include RoboVPN — a commercial VPN marketed for privacy protection — which bundles the complete Neunative proxy SDK via NuGet dependencies in its installer. The well-known BitTorrent client MediaGet similarly incorporates the SDK, automatically enrolling users’ devices into the proxy pool upon installation.

Smart TV platforms have also seen significant penetration. According to Spur research, 42.5% of applications on LG webOS and 26.5% on Samsung Tizen contain similar proxy SDKs. Installing a simple game or utility application can transform a household television into a permanently online proxy node.

## Stealth Design of the Android Popa SDK

In newer Popa versions, the SDK avoids hard-coded command-and-control server addresses. Instead, it dynamically fetches configuration from public cloud storage. Specifically, it contains a built-in download link pointing to Google Drive; the file is encrypted with AES-ECB, and decryption reveals the real relay server addresses.

This approach of hosting configuration on mainstream cloud services substantially enhances infrastructure resilience and circumvents conventional domain blocking. Device registration and network enrolment occur in two stages. First, a qualification check: upon launch, the SDK queries an initial interface, and the server determines whether the device meets enrolment criteria, filtering out unsuitable devices. Second, node list acquisition: verified devices call the registration interface, receive a list of available relay servers, establish connections, and begin forwarding traffic.

Although recent SDK versions include interfaces for user consent dialogues, developers rarely invoke this functionality in practice. Qurium’s static analysis confirmed the presence of complete consent dialogue components within the code, yet no call paths from the startup process to these dialogues exist. Devices proceed directly to registration upon boot without notifying the user.

## Windows Neunative SDK

Nokia Deepfield’s reverse engineering of RoboVPN fully details the operation of the Windows Neunative SDK, revealing stealth far exceeding the Android variant. The RoboVPN client itself provides full VPN functionality via WireGuard protocol, supporting country selection, speed testing, and standard features.

The proxy SDK is embedded as a NuGet dependency, indistinguishable in the installation manifest from ordinary components such as JSON parsing libraries. Its activation logic is particularly deceptive: the SDK does not run during VPN connections. Instead, it activates only when the VPN is disconnected or the client is idle after login, preceded by a random delay of 30 to 90 minutes. Reconnecting the VPN immediately halts the proxy service.

This design serves a clear purpose. WireGuard operates in full-tunnel mode; simultaneous proxy operation during VPN connectivity would route exit traffic through datacentre IPs, undermining residential proxy value. Activation solely during VPN disconnection ensures forwarded traffic originates from genuine residential user IPs, aligning perfectly with commercial residential proxy characteristics. Short-term packet captures by ordinary users are unlikely to detect anomalies, often leading to the erroneous conclusion that the software is clean.

## Proprietary Relay Protocol and Security Vulnerabilities

The Neunative core consists of a 194 KB x64 C++ binary containing 598 functions. It relies on the system Schannel library for TLS encryption without additional cryptographic bundles. Communication utilises a custom binary TLV (Type-Length-Value) protocol, with messages distinguished by 4-byte type codes across seven core message types:

1. Registration message – for device enrolment to relay nodes  
2. Registration response – returning enrolment results  
3. Heartbeat message – maintaining connection liveness  
4. Open tunnel instruction – carrying target hostname and port  
5. Tunnel data – carrying forwarded raw traffic  
6. Close tunnel instruction – terminating a specified tunnel  
7. Disconnect message – normal connection termination  

Upon receiving an open-tunnel instruction, the SDK spawns an independent thread, resolves the target domain and port, establishes a direct connection, and performs bidirectional data forwarding between the relay server and destination. The SDK includes destination address filtering to block private, loopback, link-local, and multicast addresses, preventing third-party access to user internal networks. However, this filtering contains clear deficiencies: it does not block the 0.0.0.0/8 range and lacks any port blacklist. On Android, accessing port 5555 on 0.0.0.0 directly targets the device’s ADB debugging service, enabling attackers to compromise the device and convert proxy nodes into botnet zombies. Observations indicate that port 5555 ranks as the third most active outbound port across the Popa network, confirming such attacks are occurring in the wild.

## Two-Tier Backend Infrastructure

Qurium and Nokia’s investigations jointly reconstruct the backend’s full scale. The network employs a two-tier architecture of a scheduling layer and relay layer. The top tier features load-balancing domains, with lb.gmslb.net as the primary enrolment entry point backed by ten servers in OVH datacentres. Devices register here and receive geographically matched relay node lists. The lower tier comprises relay node clusters using numbered domains with numerous fronting domains.

A single relay server may correspond to up to 30 different fronting domains such as viki-play.com and star-layer.com. All domains are hosted on Cloudflare under two accounts to avoid single-point failure from blocks. Domain names mimic legitimate technology products through compound English words, enhancing deception. Enumeration of numbered domains reveals approximately 360 active relay servers, all deployed in commercial datacentres (OVH, GTHost, Hetzner, Linode) with none being residential nodes.


![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/lh0yz40hn930b27ho8vd.png)


The true residential exits are the compromised user devices implanted with the SDK.


## Two Faces of the Same Backend: Botnet and Commercial Software

Popa first gained public attention as a traffic-forwarding plugin for the Vo1d botnet, which targets Android TV boxes. At disclosure in 2024, Vo1d infected approximately 1.3 million devices, growing to 1.6 million by 2025 across 226 countries and regions. Infected devices download the Popa plugin and contribute to the residential proxy network for profit. Meanwhile, Neunative functions as a commercial SDK embedded in legitimately distributed software such as RoboVPN through voluntary user installation.

Despite divergent distribution paths, both ultimately connect to identical backend infrastructure. Technical architecture comparison reveals near-identical core relay protocols, message types, and node scheduling logic, with only minor differences in registration ports and interface paths. Windows Neunative build path records confirm the compilation directory was named after the Android native SDK, indicating a cross-platform port of the same codebase. Consequently, a virus-infected counterfeit TV box and a user-installed free VPN on a home computer become exit nodes within the same proxy pool, serving identical paying customers. The backend makes no distinction regarding enrolment method or verification of genuine informed consent.

## Attribution Chain: From NinjaTech to NetNut

Qurium’s investigation, tracing domain history and corporate records, ultimately points to the well-known residential proxy provider NetNut and its parent company Alarum Technologies. Key evidence emerged from domain transitions. Following Google and security vendors’ 2025 crackdown on Badbox 2.0, which blocked numerous Popa control domains, dozens of replacement domains appeared. Among these, only ninjatech.io was a long-registered domain. Internet Archive records show ninjatech.io as the former website of NinjaTech, promoting bandwidth monetisation SDKs that allow developers to earn from users’ idle bandwidth without displaying advertisements.



![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/31ot8zrt898746ff1qer.png)



Latvian corporate records indicate NinjaTech SIA was registered in January 2020 under Moshe Yehuda Kramer. Public profiles confirm Kramer as NetNut co-founder, primary architect of its platform, and current Chief Strategy and Innovation Officer plus Senior Vice President of R&D at Alarum Technologies. Multiple infrastructure overlaps exist: early SDK domains such as cyberprotector.online, sdk.netnut.io, and sdk.ninjatech.io shared identical server IPs between 2021 and 2025. Synthient’s controlled testing verified that devices running Popa SDK route exit traffic through NetNut’s commercial gateways.

In response, Kramer stated that NinjaTech ceased operations years ago, with the SDK code sold and licensed to third parties; subsequent modifications and deployments are unrelated to him or NetNut. He denied registering the 2025 replacement domains or controlling current Popa infrastructure.


![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/22qda3n6f4xgchritalo.png)



![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/l1m7bo785l535sipu2bg.png)



The proxy network’s scale far exceeds common perceptions. Black Lotus Labs (under Lumen) monitoring shows 1.5 to 2.5 million daily active IPs and 250–300 control nodes. Nokia Deepfield sampling from 26 relays estimates 35,000–60,000 clients per relay, suggesting a potentially larger total. Its industry penetration is particularly concerning: NetNut serves as a core residential proxy provider, with numerous downstream resellers amplifying Popa exit IPs across dozens of services.


![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/joxgaqtcll4wxbt3ohym.png)



The primary driver of expansion is massive web scraping demand for AI training. Datacentre IPs are easily blocked by anti-bot measures, whereas residential IPs enjoy higher trust. AI companies procure residential proxies at scale for content collection, fuelling demand and the proliferation of grey SDKs. This scraping has produced tangible public impact: in May 2026, the ARIJ independent media website faced massive scraping from 1.35 million IPs across 223 countries and regions originating from this network. Numerous non-profits, academic institutions, and public knowledge bases suffer service degradation or outages.

Enterprise risks are equally pronounced. Infoblox data indicate 65% of corporate networks exhibit residential proxy-related domain queries, exceeding 90% in pharmaceuticals and food & beverage, and over 60% in government and finance sectors. Personal devices connecting to corporate networks create outbound channels to enterprise IPs; if exploited for attacks, organisations face attribution challenges and reputational damage.

Alarum Technologies issued a statement asserting the reports contain numerous inaccurate claims and flawed inferences, denying botnet classification. The company maintains the SDK enables legitimate bandwidth sharing without compromising device security, operates a compliant commercial proxy network with full KYC, abuse monitoring, and compliance measures. However, Spur noted that NetNut does not enforce rigorous enterprise verification; individual users require only email and payment, while downstream white-label resellers face minimal checks, often limited to cryptocurrency and temporary email.

All research teams emphasised analytical boundaries. Evidence derives from sample reverse engineering, network telemetry, and public records. It does not conclusively prove direct NetNut operation of the SDK implantation network, nor rule out downstream reseller or third-party developer violations. Infrastructure and traffic-layer associations are reproducible facts, while precise commercial relationships and intent remain inconclusive.

**Windows Detection:** Users may inspect the registry key `HKCU\Software\Neunative` and log files such as `NeuNative.log` in the AppData directory to determine potential SDK implantation.

**Enterprise and Institutional Mitigation:** Block known Popa and Neunative scheduling domains and relay IPs at network perimeters to prevent enrolment. Enhance monitoring of outbound TLS traffic on port 6000 to identify anomalous relay connections.

## Conclusion

The comprehensive exposure of the Popa and Neunative ecosystem has brought long-standing grey areas within the residential proxy industry into sharp focus. From virus-infected TV boxes to user-installed free software, millions of devices are enlisted into commercial proxy networks without owner knowledge, consuming bandwidth and electricity while introducing risks of device compromise and identity theft. As AI data collection demands continue to grow, the residential proxy market will expand, creating further opportunities for similar grey SDKs.


**References:**  
- https://synthient.com/blog/popa-from-sourcing-to-distribution  
- https://github.com/deepfield/public-research/blob/main/reports/2026-06-18-robovpn-neunative.md  
- https://krebsonsecurity.com/2026/06/popa-botnet-linked-to-publicly-traded-israeli-firm/  
- https://www.qurium.org/forensics/finding-popa/


---

> **Disclaimer:** The programs and technical methods described in this article are intended solely for legitimate, compliant security research and educational purposes to enhance cybersecurity defences and possess clear technical research attributes. Any unauthorised use for attacks, destruction, or other illegal activities shall result in the perpetrator bearing full legal, civil, and joint liability; this site assumes no liability. Content is published for technical exchange and knowledge sharing. For copyright or other disputes, please contact us via the provided channels.
