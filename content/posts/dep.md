---
title: "部署成功"
date: 2025-10-07
url: /dep/
---

昨天是 MR2，恰逢中秋，工作并不繁忙，正好有空就想着把 Ubuntu 云服务器弄好，把网站部署上去。但不知为何一直没能成功。后来决定直接进入 OCI 后台，将系统重装一遍，反正原来的 Ubuntu 太慢且臃肿了。之前我也曾用 `netboot.xyz` 重装过一次服务器，所以这次重装不算麻烦。为了记录这次的操作过程以及网站成功部署上线，写下这篇随笔。

首先，下载了 `netboot.xyz`。网上推荐使用 `tftp`，但我试了多个服务器都没有效果。后来我意识到，既然我可以登录进去，那就不需要救援模式，于是决定直接从官网下载。

对于 x86_64 架构（需要 root 权限）：

    wget -O /boot/efi/EFI/netboot.xyz.efi https://boot.netboot.xyz/ipxe/netboot.xyz.efi

对于 ARM64 架构（需要 root 权限）：

    wget -O /boot/efi/EFI/netboot.xyz-arm64.efi https://boot.netboot.xyz/ipxe/netboot.xyz-arm64.efi

然后，在安装过程中遇到一个问题，系统卡在了 `EFI stub: Loaded initrd from LINUX_EFI_INITRD_MEDIA_GUID device path` 不动。网上的解决方案提到："如果是 AMD/Intel（X86）架构，需要输入串口参数（ARM 架构跳过此步骤）。"

解决方法是，进入 `netboot` 菜单，选择 `Utilities`，然后进入 `Kernel cmdline params` 设置，输入以下参数：

    console=ttyS0,9600

按回车即可。

有个小插曲，开始选系统时，我选了 Debian 13。但在启动时系统一直卡住，提示：

    Booting Debian GNU/Linux
    
    Loading Linux 6.12.48+deb13-amd64...
    
    Loading initial ramdisk...

后来发现 Debian 13 还不够稳定，于是重新安装，选择了 Debian 12。

一切准备好后，回家就顺利完成了网站的部署。
