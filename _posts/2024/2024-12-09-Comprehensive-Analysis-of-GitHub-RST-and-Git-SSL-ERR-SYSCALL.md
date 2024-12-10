---
title: "Comprehensive Analysis of GitHub RST and Git SSL_ERR_SYSCALL"
author: Excalibra
categories: [2024.]
tags: [chip]
math: true
mermaid: true
date: 2024-12-09 00:53:01
---

* Eliminate subjective emotional factors
* Consider multiple possible causes
* Identify and establish connections between issues (commonalities)

Subjective emotional factors compromise objective analytical judgment and must be eliminated to ensure accurate analysis.

<!-- more -->

### RST

Network reset due to blocking or issues with hosts IP-DNS mapping.

### SSL_ERR_SYSCALL

An issue where a manually configured proxy socket for the transport layer causes inaccessibility. It could stem from proxy configuration errors or issues with the URL, which may involve improper hosts mapping settings.

### Anecdote

A ping test for GitHub revealed that although it couldn't be pinged, the website was still accessible. For security considerations, the website likely disabled ICMP responses or enabled ICMP filtering.

### Why Are Some Websites Unreachable via PING but Still Accessible?

When you try to ping a website, it shows `Request timed out `. Four packets are sent, but none are returned, resulting in a 100% packet loss. If it's unreachable via PING, why is it still accessible?

The likely reason is that the website has disabled ICMP responses or enabled ICMP filtering. If ICMP filtering is set, devices not on the whitelist will not receive a response.

Disabling ICMP could be based on the following considerations:

1. ICMP Protocol and Network Security
   - The ICMP protocol is critically important for network security. However, its characteristics make it susceptible to being used for attacks on routers and hosts within the network.

2. ICMP Flood Attacks
   - Continuously sending large amounts of ICMP packets to a target host can overwhelm its system, eventually leading to a crash. Excessive ICMP packets can create an "ICMP storm," consuming significant CPU resources on the target host to process them.

By disabling ICMP responses, websites can protect themselves against such vulnerabilities and attacks.

````
$ curl -v www.github.com
*   Trying 13.250.177.223:80...
* Connected to www.github.com (13.250.177.223) port 80 (#0)
> GET / HTTP/1.1
> Host: www.github.com
> User-Agent: curl/7.70.0
> Accept: */*
>
* Recv failure: Connection was reset
* Closing connection 0
curl: (56) Recv failure: Connection was reset
````

### Summary

RST and SSL_ERR_SYSCALL share a common problem: hosts IP-DNS mapping.

The application-layer hosts file resolves domain names to specific IP addresses. A proxy merely forwards client requests for these addresses without transforming the IP path. If either the IP or DNS in the hosts file doesn't exist, access will fail, even with a configured proxy.

Since hosts files have higher precedence over remote DNS, the system queries the hosts file for DNS mapping first. If no mapping exists in hosts, it queries remote DNS servers. Although a VPN creates a tunnel for external server access, the DNS mapping sent by the host to external servers remains incorrect, leading to inaccessibility.

Even with hosts redirection, temporary access to sites may work due to factors like `keep-alive`, browser, or system DNS caching. 
