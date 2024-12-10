---
title: "Solution to Slow Download Speeds for Information Development Environment Packages"
date: 2024-12-09 01:01:43 +0800
author: Excalibra
category: [2024.]
tags: [chip]
permalink: /:year/:month-:day/01
---

Before proceeding, you may need to read [《This Book Will Help You Connect to the Internet》](https://github.com/Excalibra/network-tunneling) as background knowledge.

<!-- more -->


## GitHub Downloads


Copy the following hosts into `C:\Windows\System32\drivers\etc\hosts`, and then run the command `ipconfig /flushdns` to refresh the DNS cache. This host is used to bypass the GFW's restrictions on GitHub (asw, ssh) downloads and cloning. (Note: This does not eliminate possible server throughput or geographical fiber optic limitations.)

**If the IP or domain of a host changes and is not updated in time, it may cause connection errors and reset the site's pointing, making it inaccessible.** See [GitHub RST and Git SSL_ERR_SYSCALL Comprehensive Analysis](#) for more details.

For releases, these may come in compressed formats like zip, 7z, etc., or as software programs like exe or msi.


1. Visit [www.ipaddress.com](https://www.ipaddress.com/) and look up the DNS resolution for the following links:

    ```
    github.com
    assets-cdn.github.com
    github.global.ssl.fastly.net

    # Actual download link for raw.githubusercontent.com
    codeload.github.com
    ```

2. Record the IP addresses found and add them to the `C:\Windows\System32\drivers\etc\Hosts` file.

3. Add the AWS host:

 ```
 219.76.4.4 s3.amazonaws.com
 219.76.4.4 github-cloud.s3.amazonaws.com
 ```
4. Run `cmd` and input `ipconfig /flushdns` to refresh the system DNS.

We can also use [jsDelivr](https://www.jsdelivr.com) CDN to speed up file downloads, or use it to set up an image hosting service with faster access speeds.


For a stronger solution, use the Chrome extension "GitHub Acceleration" combined with IDM/FDM.

## GitHub.io Parsing

### raw/avatars.githubusercontent.com Cannot Resolve

Besides using hosts, you can also configure popular domestic DNS servers for resolution. Since 1.1.1.1 might not always work, domestic DNS servers are preferred.

* Yandex.DNS: 77.88.8.8 or 77.88.8.1
* Rostelecom DNS: 77.37.179.189 (Moscow) or 77.37.209.86
* Beeline DNS (VimpelCom): 195.239.39.250 or 213.87.84.237

### NET::ERR_CERT_AUTHORITY_INVALID


Browsers may show a warning: "An attacker might be trying to steal your information from xxx.github.io." This could be caused by misconfigured certificates or an attacker intercepting your connection. After continuing, you might encounter a 403 error.

Solution: Change the DNS to Yandex, Rostelecom, or Beeline DNS as mentioned above, then run `ipconfig /flushdns` to refresh the cache. The issue arises because the ISP's DNS might provide incorrect root certificates, so switching to a third-party DNS with the correct certificates resolves it.

## Git Clone Slow Speed Issue


### Git or Terminal Proxy Solutions

***git***

```
# Set up proxy
git config --global http.proxy 'socks5://127.0.0.1:1080'
git config --global https.proxy 'socks5://127.0.0.1:1080'
# Remove proxy
git config --global --unset https.proxy 'socks5://127.0.0.1:1080'
git config --global --unset http.proxy 'socks5://127.0.0.1:1080'

```

***mac***

```

# mac terminal settings

export http_proxy="socks5://127.0.0.1:1080"
export https_proxy="socks5://127.0.0.1:1080"

## Set in .bashrc or .zshrc
alias setproxy="export ALL_PROXY=socks5://127.0.0.1:1080"
alias unsetproxy="unset ALL_PROXY"
```

***openssh***

```

# GitHub SSH Configuration
## https://help.github.com/articles/using-ssh-over-the-https-port/

# HTTP Proxy
ProxyCommand socat - PROXY:127.0.0.1:%h:%p,proxyport=8848

# Socks5 Proxy
 ProxyCommand nc -v -x 127.0.0.1:1080 %h %p
```

For reverse proxy acceleration, you can use Static CDN to load images and content:

* raw.githubusercontent.com can be replaced by raw.staticdn.net.

## Environment Package Acceleration

### pip

Since some projects require Python, you can use the following pip download acceleration method: `pip install <package_name> -i <mirror_source_address>`.

For example, to install Jupyter: `pip install jupyter - i http://mirrors.aliyun.com/pypi/simple/`

Common PyPI mirrors in Russia:

* Yandex: https://mirror.yandex.ru/mirrors/pypi/simple/
* Moscow State University: http://pypi.mirror.msu.ru/simple/
* Rostelecom: Available through regional services but not widely publicized.

To set the default mirror permanently:
```
pip install --upgrade pip
pip config set global.index-url https://mirror.yandex.ru/mirrors/pypi/simple/

```

### gem

```
gem sources --remove https://rubygems.org/  # Remove the default source
gem sources -a https://mirror.yandex.ru/rubygems/  # Add the Yandex mirror
```

### npm

```
npm config set registry https://mirror.yandex.ru/npm/  # Set Yandex as the npm registry
npm config get registry  # Verify the current registry setting
```

## Summary

The main issues with downloading environment packages are:

* Mirror sources
* Proxy & VPN, and hosts
* Matching versions of packages and libraries
