---
title: "The Correct Approach to Managing Apple Devices in Business — ABM"
date: 2025-01-22 18:06:00 +0800
author: Excalibra
category: [2025.]
tags: [Apple]
permalink: /:year/:month-:day/01
---

With the development of mobile internet technology, more and more businesses are adopting mobile devices for their operations. Among the many choices available on the market, Apple’s iPhone, iPad, and MacBook have gained popularity due to their high-quality user experience and premium image. Do you know how to correctly procure Apple devices for business use? Most users don’t see this as an issue, as Apple devices are sold through physical stores or online shops. However, products sold through these retail channels are aimed at regular consumers. Apple also has a separate business sales channel, and the biggest difference between Apple devices for businesses and those for regular consumers is the enterprise management function called ABM (Apple Business Manager).

Apple manages the use of its devices through Apple ID. Whether it’s for downloading apps or ensuring device security, Apple ID is essential. However, Apple ID is a personal account, and using it directly for company-issued devices can lead to several unexpected problems.

Firstly, there is the issue of software procurement and installation. Commercial software used by businesses is typically purchased through official business channels, but Apple ID requires individual users to buy software through the App Store. This not only prevents the company from benefiting from bulk purchasing discounts, but also raises issues about software ownership. Software purchased using an employee’s personal Apple ID is linked to that employee’s account. If the employee leaves the company, it’s impossible to transfer ownership of the software to the business.

Secondly, there’s the issue of device lifecycle management. When an employee leaves, they return the company device, but if they haven’t unlinked their Apple ID from the device, the new employee cannot register a new account. Some disgruntled employees may even lock the device. Unlocking Apple devices can be a hassle—you must prove to Apple that you own the device by providing the purchase receipt (with the device’s serial number).

Thirdly, personal privacy is often overlooked. There was an instance where a company owner purchased a batch of iPads for office use and, for convenience and cost-saving, registered all the devices with his personal Apple ID. Software purchased from the App Store can be shared across multiple devices using the same Apple ID. However, Apple assumes these devices are for personal use, so it will synchronise other information, such as contacts, text messages, and photos, across all devices. The unfortunate consequences of this scenario are easy to imagine.

In reality, Apple provides businesses with a solution called Managed Apple ID, which belongs to the company rather than an individual employee, solving the above-mentioned issues. The Managed Apple ID works alongside ABM (Apple Business Manager), which integrates Apple’s enterprise device registration system (DEP - Device Enrollment Program) and volume software purchase program (VPP - Volume Purchase Program).


## Centralised Management of Enterprise Devices:

Each Apple device has a unique serial number. Devices purchased through Apple’s business sales channel are registered in the ABM system backend. Upon powering on the device, activation occurs automatically, and management control is transferred to the company’s designated MDM (Mobile Device Management) system, such as VMware Workspace ONE. The MDM system manages all devices owned by the business. Administrators can register the MDM system’s service URL through ABM’s portal. Devices purchased via retail channels can also be manually registered in the ABM system.


## Bulk Software Purchasing and Distribution Management:

In the ABM system, devices purchased by the company are linked to the company’s Managed Apple ID. The company can then purchase software in bulk and manage the allocation and retrieval of software licenses. These licenses belong to the company’s Managed Apple ID, not to any individual employee.

Once ABM is in place to manage Apple devices, MDM becomes a standard requirement for enterprise mobile device management. The MDM system will deploy an MDM Profile on each enrolled device, which configures the device with the necessary parameters, installs relevant applications, and sets the device to supervised mode. In this mode, various management policies can be enforced, such as prohibiting the deletion of business apps, setting up app blacklists or whitelists, and ensuring automatic Wi-Fi connection in the company’s network. This supervisory mode cannot be disabled by the user. If a device is lost or stolen, the administrator can remotely lock the device to prevent further use (effectively rendering it unusable).

VMware Workspace ONE is currently the best MDM solution for Apple devices on the market. It was named a leader in Gartner’s Magic Quadrant for Unified Endpoint Management software for two consecutive years (2018-2019). Its predecessor, AirWatch, was named a leader for seven years in a row (2011-2017) in Gartner’s Magic Quadrant for Enterprise Mobility Management software, and it has also been repeatedly named a market leader by IDC and Forrester. VMware collaborates closely with Apple to ensure its devices receive timely support, and when Apple releases new operating system versions, Workspace ONE is always prepared and tested in advance to ensure support on the first day of release.

![image](https://github.com/user-attachments/assets/3c83674d-3438-44f3-bdb1-1dbeb3ba0e32)
![image](https://github.com/user-attachments/assets/63ce0258-4c8d-4df9-aef0-a999342efbcc)

Here is a demonstration video of an iPad being automatically deployed under ABM and MDM management (tip: select the “HD 720P” option below the video to watch). After turning on a new iPad, the user is prompted to select the language and country, connect to a Wi-Fi network, and then Workspace ONE takes over. In the demonstration, we can see the iPad being enrolled in the company’s remote management. Workspace ONE automatically configures the iPad, installs the necessary software, and customises the home screen layout according to the company’s style, including removing unnecessary apps, changing the wallpaper, and organising apps into folders. This unified, automated configuration is essential for businesses, as Workspace ONE can configure all Apple devices purchased by the company without requiring administrators or vendors to manually set up each device, significantly reducing the administrative workload.

In addition to supporting Apple devices, Workspace ONE also supports Android, Windows 10, Chrome OS, and other types of devices, known as Unified Endpoint Management (UEM). Through Workspace ONE, businesses can manage all their endpoint devices on one platform, which is a key advantage over other vendors.



---
