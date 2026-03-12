---
marp: true
lang: en-US
title: "Running Kernel Kernel-based Virtual Machine"
description: "Create, access, and manage kernel-based virtual machines on Linux systems."
theme: uncover
transition: fade
author: "Leonard Sheng Sheng Lee"
header: "[Running Kernel-based Virtual Machine](https://sheeeng.github.io/slides/running-kernel-based-virtual-machine/) | [Getting Started with Kernel-based Virtual Machine (KVM)](https://osseu2022.sched.com/event/15z24)"
footer: "Made with [Marp](https://marp.app/) by [Leonard Sheng Sheng Lee](https://github.com/sheeeng)."
paginate: true
_paginate: false
backgroundImage: url('https://marp.app/assets/hero-background.svg')
keywords: kvm,linux,virtualization
math: mathjax
---

## Getting Started with Kernel-based Virtual Machine (KVM)

### _Running Kernel-based Virtual Machine_

![bg 100% opacity blur](https://marp.app/assets/hero-background.svg)

---

## Abstract (Part 1/5)

- Want to get started with Kernel-based Virtual Machine (KVM)?
- Want to run a virtual machine on your system using open source technologies?
- Want to interact with KVM virtual machines from command line interface (CLI)?

---

## Abstract (Part 2/5)

In this tutorial, Leonard will be teaching people to familiarize themselves with KVM technologies, which allows virtual machines to run with near native performance.

---

## Abstract (Part 3/5)

Participants must have a basic knowledge of how the Linux operating system works, and must have a recent Linux based operating system running on a portable computer to join this tutorial.

---

## Abstract (Part 4/5)

We will be focusing on tasks such as creating, accessing, modifying, and deleting KVMs, primarily using CLI and if time permits, using a graphical user interface (GUI) too.

---

## Abstract (Part 5/5)

At the end of this tutorial, participants are expected to know how to check if KVM is supported on their computer hardware and manage KVMs with confidence.

---

## Agenda / Tasks / 90 Minutes

- Setup Kernel-based Virtual Machine (KVM)
- Manage KVM Using:
    - Command Line Interface (CLI)
    - Graphical User Interface (GUI)\*

$_{*If\ time\ permits.}$

---

## <!--fit--> :raising_hand_man: :raising_hand: :raising_hand_woman:

---

## Overview of Kernel-based Virtual Machine (KVM) (Part 1/2)

- An open source virtualization technology built into Linux®. Turn Linux into a hypervisor.
- Allows a host machine to run multiple, isolated virtual environments called guests or virtual machines (VMs).
- Available from Linux 2.6.20 or newer.

<!--
Some speaker notes here that might be useful.

The default virtualization technology supported in Ubuntu is KVM. For Intel and AMD hardware KVM requires virtualization extensions. But KVM is also available for IBM Z and LinuxONE, IBM POWER as well as for ARM64.
-->

---

## Overview of Kernel-based Virtual Machine (KVM) (Part 2/2)

- KVM converts Linux into a type-1 (bare-metal) hypervisor.
- Every VM is implemented as a regular Linux process, scheduled by the standard Linux scheduler, with dedicated virtual hardware components.

<!--
Some speaker notes here that might be useful.

+KVM converts Linux into a type-1 (bare-metal) hypervisor. All hypervisors need some operating system-level components—such as a memory manager, process scheduler, input/output (I/O) stack, device drivers, security manager, a network stack, and more—to run VMs. KVM has all these components because it’s part of the Linux kernel. Every VM is implemented as a regular Linux process, scheduled by the standard Linux scheduler, with dedicated virtual hardware like a network card, graphics dapter, CPU(s), memory, and disks.

https://www.redhat.com/en/topics/virtualization/what-is-KVM
-->

---

## Overview of Hypervisor

- A hypervisor is software that creates and runs virtual machines (VMs).
- It is also called a virtual machine monitor (VMM).
- It isolates the hypervisor operating system and resources from the virtual machines and enables the creation and management of those VMs.

<!--
Some speaker notes here that might be useful.

https://www.redhat.com/en/topics/virtualization/hat-is-a-hypervisor
-->

---

## Overview of QEMU (Quick Emulator)

- QEMU (Quick Emulator) is part of the KVM experience being the userspace backend for it, but it also can be used for hardware without virtualization extensions by using its Tiny Code Generator (TCG) mode.

<!--
Some speaker notes here that might be useful.

The Tiny Code Generator (TCG) is the core binary translation engine that is responsible for QEMU ability to emulate foreign processors on any given supported host.
-->

---

### Why Virtual Machines Called Domain? (Part 1/2)

- `Domain0` is the first domain started by the hypervisor at boot, and will be running a Linux OS. This domain is privileged: it may access the hardware and can run the tools that manage other domains.

<!--
Some speaker notes here that might be useful.

https://wiki.xenproject.org/wiki/Domain
https://wiki.xenproject.org/wiki/Dom0
-->

---

### Why Virtual Machines Called Domain? (Part 2/2)

- These other domains are referred to as `DomU`s with the `U` standing for "user". They are unprivileged, and the equivalent to a guest system or guest virtual machine.

<!--
Some speaker notes here that might be useful.

https://wiki.xenproject.org/wiki/Domain
https://wiki.xenproject.org/wiki/DomU
-->

---

## Task 1

### Setup Kernel-based Virtual Machine (KVM)

---

## Hardware Virtualization Support (Part 1/2)

- KVM requires a CPU with virtualization extensions.
    - Intel® Virtualization Technology (Intel® VT)
        - CPU flag is **`vmx`** (_Virtual Machine Extensions_).
    - AMD virtualization (AMD-V)
        - CPU flag is **`svm`** (_Secure Virtual Machine_).

---

## Hardware Virtualization Support (Part 2/2)

```shell
egrep --count '^flags.*(vmx|svm)' /proc/cpuinfo
```

- If output is 0, your system does not support the relevant virtualization extensions _or_ disabled on BIOS. You can still use QEMU/KVM, but the emulator will fall back to software virtualization, which is much slower.

---

## Installing Virtualization Packages (Fedora)

```shell
dnf groupinfo virtualization

dnf group install \
    virtualization \
    --with-optional \
    --assumeyes

```

- See Fedora's [Installation Documentation](https://docs.fedoraproject.org/en-US/quick-docs/getting-started-with-virtualization/#installing-virtualization-software).

---

## Installing Virtualization Packages (Ubuntu)

```console
# apt-get install \
    bridge-utils \
    qemu-kvm \
    virt-manager
```

---

## Installing Virtualization Packages (CentOS)

```console
# yum install \
    libvirt \
    qemu-kvm \
    virt-install \
    virt-install \
    virt-manager
```

---

## Enable **`libvirtd`** Service

- The **`libvirtd`** service is a server side daemon and driver required to manage the virtualization capabilities of the KVM hypervisor.

- Start **`libvirtd`** service and enable it on boot.

```shell
systemctl start libvirtd

systemctl enable libvirtd
```

---

## Verify KVM Kernel Modules

- Verify that the KVM kernel modules are properly loaded.

```shell
lsmod | egrep 'kvm_*(amd|intel)'
```

- If output contains **kvm_intel** or **kvm_amd**, KVM is properly configured.

---

## Append Groups to Manage KVM

- Append current user to `kvm` and `libvirt` groups to create and manage virtual machines.

```shell
usermod --append --groups=kvm,libvirt ${USER}

cat /etc/group | egrep "^(kvm|libvirt).*${USER}"
```

- Log out and log in again to apply this modification.

<!--
Some speaker notes here that might be useful.

Note that this if this command only displays guest virtual machines created by the root user. If it does not display a virtual machine you know you have created, it is probable you did not create the virtual machine as root.

Guests created using the virt-manager interface are by default created by root.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-editing_and_displaying_a_description_and_title_of_a_domain#doc-wrapper
-->

---

## Update QEMU Configuration

```console
# cp /etc/libvirt/qemu.conf /etc/libvirt/qemu.conf.original
# sed --in-place \
    "s,\#user = \"root\",\#user = \"${USER}\",g" \
    /etc/libvirt/qemu.conf
# sed --in-place \
    "s,\#group = \"root\",\#group = \"libvirt\",g" \
    /etc/libvirt/qemu.conf
# diff --unified \
    /etc/libvirt/qemu.conf.original \
    /etc/libvirt/qemu.conf
systemctl restart libvirtd
```

---

## Task 2

### Manage KVM using Command Line Interface (CLI)

- [Install Debian from Network](#26).

---

#### Install Debian from Network

```shell
$ virt-install \
    --name Debian11 --os-variant debian11 --description 'Debian11' \
    --vcpus 2 --ram 2048 \
    --location \
    https://ftp.debian.org/debian/dists/stable/main/installer-amd64 \
    --network bridge=virbr0 \
    --graphics vnc,listen=127.0.0.1,port=5901 \
    --noreboot --noautoconsole \
    --extra-args 'console=ttyS0,115200n8 serial'
$ virt-viewer --connect qemu:///session --wait Debian11
```

<!--
Some speaker notes here that might be useful.

Opens an interactive console that you can use to manually install the guest virtual machine.

An example kernel command line option to specify the serial console (and it's settings) are:

    console=ttyS0,115200n8

This option tells the kernel to use ttyS0 (the first serial port), with settings of speed=115200 cps, no stop bits and 8 data bits. The serial ports of the host and the target should be configured to match in terms of the speed, stop bits and data bits. Minicom is a common serial communications program used on host machines for accessing the console from the host.
-->

---

### View Serial Console Message

```console
$ virsh console Debian11
Connected to domain 'Debian11'
Escape character is ^] (Ctrl + ])
```

---

### Guest Virtual Machine States and Types (Part 1/2)

Several `virsh` commands are affected by the type of the guest virtual machine:
‎
**`Transient`** or **`Persistent`**.

<!--
Some speaker notes here that might be useful.


- Transient (A transient guest does not survive reboot.)
- Persistent (A persistent guest virtual machine survives reboot and lasts until it is deleted.)

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/chap-managing_guest_virtual_machines_with_virsh#domain-states
-->

---

### Guest Virtual Machine States and Types (Part 2/2)

During the life cycle of a virtual machine, `libvirt` will classify the guest as any of the following states:
‎
**`Undefined`**, **`Shut off`**, **`Running`**, **`Paused`**, **`Saved`**

<!--
Some speaker notes here that might be useful.

During the life cycle of a virtual machine, libvirt will classify the guest as any of the following states:
  Undefined - This is a guest virtual machine that has not been defined or created. As such, libvirt is unaware of any guest in this state and will not report about guest virtual machines in this state.
  Shut off - This is a guest virtual machine which is defined, but is not running. Only persistent guests can be considered shut off. As such, when a transient guest virtual machine is put into this state, it ceases to exist.
  Running - The guest virtual machine in this state has been defined and is currently working. This state can be used with both persistent and transient guest virtual machines.
  Paused - The guest virtual machine's execution on the hypervisor has been suspended, or its state has been temporarily stored until it is resumed. Guest virtual machines in this state are not aware they have been suspended and do not notice that time has passed when they are resumed.
  Saved - This state is similar to the paused state, however the guest virtual machine's configuration is saved to persistent storage. Any guest virtual machine in this state is not aware it is paused and does not notice that time has passed once it has been restored.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/chap-managing_guest_virtual_machines_with_virsh#domain-states
-->

---

### Display `virsh` Version

`virsh version`
`virsh version --daemon`

<!--
Some speaker notes here that might be useful.

The virsh version command displays the current libvirt version and displays information about the local virsh client.

The virsh version --daemon is useful for getting information about the libvirtd version and package information, including information about the libvirt daemon that is running on the host.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-generic_commands-version#doc-wrapper
-->

---

### Connect to Hypervisor (Part 1/2)

`virsh connect [hostname-or-URI] [--readonly]`
‎
The most commonly used URIs are:
`qemu:///system`, `qemu:///session`, `lxc:///`

<!--
Some speaker notes here that might be useful.

The most commonly used URIs are:
qemu:///system - connects locally as the root user to the daemon supervising guest virtual machines on the KVM hypervisor.
qemu:///session - connects locally as a user to the user's set of guest local machines using the KVM hypervisor.
lxc:/// - connects to a local Linux container.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-generic_commands-connect#doc-wrapper
-->

---

### Connect to Hypervisor (Part 2/2)

For example, establish a session to connect to your set of guest virtual machines (VMs), with you as the local user:
‎
`virsh connect qemu:///session`

<!--
Some speaker notes here that might be useful.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-generic_commands-connect#doc-wrapper
-->

---

### List Guest VM Connected to Hypervisor

`virsh list --all`
`virsh list --inactive`

<!--
Some speaker notes here that might be useful.

Each guest virtual machine is listed with its ID, name, and state.

  Note that this if this command only displays guest virtual machines created by the root user. If it does not display a virtual machine you know you have created, it is probable you did not create the virtual machine as root.

  Guests created using the virt-manager interface are by default created by root.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-editing_and_displaying_a_description_and_title_of_a_domain#doc-wrapper
-->

---

### Display Information about Hypervisor

`virsh hostname`
`virsh sysinfo`

<!--
Some speaker notes here that might be useful.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-editing_and_displaying_a_description_and_title_of_a_domain#doc-wrapper
-->

---

### Take Screenshot of Virtual Machine

`virsh screenshot $<Domain-{Id,Name,Uuid}> [imagefilepath] [--screen screenID]`
‎
Example: `virsh screenshot Debian11`

<!--
Takes a screenshot of a current domain console and stores it into a file. Optionally, if hypervisor supports more displays for a domain, screenID allows to specify which screen will be captured. It is the sequential number of screen. In case of multiple graphics cards, heads are enumerated before devices, e.g. having two graphics cards, both with four heads, screen ID 5 addresses the second head on the second card.

https://linux.die.net/man/1/virsh
-->

---

### Extra: Start Guest Virtual Machine

`virsh start $<Domain-{Id,Name,Uuid}> [--console] [--paused] [--autodestroy] [--bypass-cache] [--force-boot]`
‎
Starts the `$<Domain-{Id,Name,Uuid}>` that you already created and is currently in the inactive state.

<!--
Some speaker notes here that might be useful.

Starts an inactive virtual machine that was already defined but whose state is inactive since its last managed save state or a fresh boot. By default, if the domain was saved by the virsh managedsave command, the domain will be restored to its previous state. Otherwise, it will be freshly booted.

The command can take the following arguments and the name of the virtual machine is required.

  --console - will attach the terminal running virsh to the domain's console device. This is runlevel 3.
  --paused - if this is supported by the driver, it will start the guest virtual machine in a paused state
  --autodestroy - the guest virtual machine is automatically destroyed when virsh disconnects
  --bypass-cache - used if the guest virtual machine is in the managedsave
  --force-boot - discards any managedsave options and causes a fresh boot to occur

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-starting_a_defined_domain#sect-start-vm
-->

---

### Configuring a Virtual Machine to be Started Automatically at Boot

`virsh autostart [--disable] $<Domain-{Id,Name,Uuid}>`
‎
Example: `virsh autostart Debian11`

<!--
Some speaker notes here that might be useful.

The command will automatically start the guest virtual machine when the host machine boots.

Adding the --disable argument to this command disables autostart. The guest in this case will not start automatically when the host physical machine boots.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-starting_a_defined_domain#sect-Domain_Commands-Configuring_a_domain_to_be_started_automatically_at_boot
-->

---

### Extra: Rebooting a Guest Virtual Machine

`virsh reboot $<Domain-{Id,Name,Uuid}> [--mode <RebootModeName>]`
‎
Example: `virsh reboot Debian11 --mode initctl`

<!--
Some speaker notes here that might be useful.

Remember that this action will only return once it has executed the reboot, so there may be a time lapse from that point until the guest virtual machine actually reboots. You can control the behavior of the rebooting guest virtual machine by modifying the on_reboot element in the guest virtual machine's XML configuration file. By default, the hypervisor attempts to select a suitable shutdown method automatically. To specify an alternative method, the --mode argument can specify a comma separated list which includes acpi and agent. The order in which drivers will try each mode is undefined, and not related to the order specified in virsh. For strict control over ordering, use a single mode at a time and repeat the command.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-starting_a_defined_domain#sect-Shutting_down_rebooting_and_force_shutdown_of_a_guest_virtual_machine-Rebooting_a_guest_virtual_machine
-->

---

### Extra: Save Guest Virtual Machine's Configuration

`virsh save [--bypass-cache] domain file [--xml string] [--running] [--paused] [--verbose]`
‎
Example: `virsh save Debian11 Debian11-Configuration.xml --running`

<!--
Some speaker notes here that might be useful.

command stops the specified domain, saving the current state of the guest virtual machine's system memory to a specified file. This may take a considerable amount of time, depending on the amount of memory in use by the guest virtual machine. You can restore the state of the guest virtual machine with the virsh restore command.

The difference between the virsh save command and the virsh suspend command, is that the virsh suspend stops the domain CPUs, but leaves the domain's qemu process running and its memory image resident in the host system. This memory image will be lost if the host system is rebooted.

The virsh save command stores the state of the domain on the hard disk of the host system and terminates the qemu process. This enables restarting the domain from the saved state.

You can monitor the process of virsh save with the virsh domjobinfo command and cancel it with the virsh domjobabort command.

The virsh save command can take the following arguments:
  --bypass-cache - causes the restore to avoid the file system cache but note that using this flag may slow down the restore operation.
  --xml - this argument must be used with an XML file name. Although this argument is usually omitted, it can be used to supply an alternative XML file for use on a restored guest virtual machine with changes only in the host-specific portions of the domain XML. For example, it can be used to account for the file naming differences in underlying storage due to disk snapshots taken after the guest was saved.
  --running - overrides the state recorded in the save image to start the guest virtual machine as running.
  --paused - overrides the state recorded in the save image to start the guest virtual machine as paused.
  --verbose - displays the progress of the save.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-save-config#sect-Starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-Save_a_guest_virtual_machine
-->

---

### Extra: Define Guest VM with XML File

`virsh define $<Domain-{Id,Name,Uuid}>.xml`
‎
Example: `virsh define Debian11-Configuration.xml`

<!--
Some speaker notes here that might be useful.

This command defines a guest virtual machine from an XML file. The guest virtual machine definition in this case is registered but not started. If the guest virtual machine is already running, the changes the changes will take effect once the domain is shut down and started again.
-->

---

### Extra: Extract Guest VM XML File

`virsh save-image-dumpxml file --security-info`
‎
Example: `virsh save-image-dumpxml Debian11-Configuration.xml`

<!--
Some speaker notes here that might be useful.

The command will extract the guest virtual machine XML file that was in effect at the time the saved state file (used in the virsh save command) was referenced. Using the --security-info argument includes security sensitive information in the file.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-save-config#sect-Starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-Extracting_the_domain_XML_file
-->

---

### Extra: Edit Guest VM Configuration

`virsh save-image-edit <file> [--running] [--paused]`
‎
Example: `virsh save-image-edit Debian11-Configuration.xml --running`

<!--
Some speaker notes here that might be useful.

The command edits the XML configuration file that was created by the virsh save command.

When the guest virtual machine is saved, the resulting image file will indicate if the virtual machine should be restored to a --running or --paused state. Without using these arguments in the save-image-edit command, the state is determined by the image file itself. By selecting --running (to select the running state) or --paused (to select the paused state) you can overwrite the state that virsh restore should use.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-save-config#sect-Starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-Edit_Domain_XML_configuration_files
-->

---

### Extra: Restore Guest Virtual Machine

`virsh restore <file> [--bypass-cache] [--xml /path/to/file] [--running] [--paused]`
‎
Example: `virsh restore Debian11-Configuration.xml --running`

<!--
Some speaker notes here that might be useful.

The command restores a guest virtual machine previously saved with the virsh save command.

The restore action restarts the saved guest virtual machine, which may take some time. The guest virtual machine's name and UUID are preserved, but the ID will not necessarily match the ID that the virtual machine had when it was saved.

The virsh restore command can take the following arguments:
  --bypass-cache - causes the restore to avoid the file system cache but note that using this flag may slow down the restore operation.
  --xml - this argument must be used with an XML file name. Although this argument is usually omitted, it can be used to supply an alternative XML file for use on a restored guest virtual machine with changes only in the host-specific portions of the domain XML. For example, it can be used to   account for the file naming differences in underlying storage due to disk snapshots taken after the guest was saved.
  --running - overrides the state recorded in the save image to start the guest virtual machine as running.
  --paused - overrides the state recorded in the save image to start the guest virtual machine as paused.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-starting_a_defined_domain#sect-Starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-Restore_a_guest_virtual_machine
-->

---

### Extra: Resuming a Guest Virtual Machine

`virsh resume $<Domain-{Id,Name,Uuid}>`

<!--
Some speaker notes here that might be useful.

The command restarts the CPUs of a domain that was suspended. This operation is immediate. The guest virtual machine resumes execution from the point it was suspended. Note that this action will not resume a guest virtual machine that has been undefined. This action will not resume transient virtual machines and will only work on persistent virtual machines.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-starting_a_defined_domain#sect-Starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-Resuming_a_guest_virtual_machine
-->

---

### Display Host Physical Machine Name

`virsh domhostname $<Domain-{Id,Name,Uuid}>`

<!--
Some speaker notes here that might be useful.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-generic_commands-version
-->

---

### Display Guest VM General Information

`virsh dominfo $<Domain-{Id,Name,Uuid}>d/Domain-Name/Uuid}`

<!--
Some speaker notes here that might be useful.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-domain_retrieval_commands#sect-virshdominfo
-->

---

### Display Guest VM's ID Number

`virsh domid $<Domain-{Id,Name,Uuid}>`

<!--
Some speaker notes here that might be useful.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-domain_retrieval_commands#sect-virsh-domid
-->

---

### Extra: Abort Running Jobs on a Guest VM

`virsh domjobabort $<Domain-{Id,Name,Uuid}>`

<!--
Some speaker notes here that might be useful.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-domain_retrieval_commands#virsh-domjobabort
-->

---

### List Statistic about Guest VM

`virsh domjobinfo $<Domain-{Id,Name,Uuid}>`

<!--
Some speaker notes here that might be useful.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-domain_retrieval_commands#virsh-domjobinfo
-->

---

### Display Guest Virtual Machine's Name

`virsh domname $<Domain-{Id,Uuid}>`

<!--
Some speaker notes here that might be useful.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-domain_retrieval_commands#sect-virsh-domname
-->

---

### Display Virtual Machine's State

`virsh domstate $<Domain-{Id,Name,Uuid}>`

<!--
Some speaker notes here that might be useful.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-domain_retrieval_commands#sect-virsh-domstate
-->

---

### Display Connection State to the Virtual Machine

`virsh domcontrol $<Domain-{Id,Name,Uuid}>`

<!--
Some speaker notes here that might be useful.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-domain_retrieval_commands#sect-virsh-domcontrol
-->

---

### Shut Down Guest Virtual Machine

`virsh shutdown $<Domain-{Id,Name,Uuid}> [--mode modename]`
‎
Example: `virsh shutdown Debian11 --mode acpi`

<!--
Some speaker notes here that might be useful.

The command shuts down a guest virtual machine. You can control the behavior of how the guest virtual machine reboots by modifying the on_shutdown parameter in the guest virtual machine's configuration file. Any change to the on_shutdown parameter will only take effect after the domain has been shutdown and restarted.

The virsh shutdown command command can take the following optional argument:
  --mode chooses the shutdown mode. This can be either acpi, agent, initctl, signal, or paravirt.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-managing_guest_virtual_machines_with_virsh-shutting_down_rebooting_and_force_shutdown_of_a_guest_virtual_machine#sect-Shutting_down_rebooting_and_force_shutdown_of_a_guest_virtual_machine-Shut_down_a_guest_virtual_machine
-->

---

### Suspend Guest Virtual Machine

`virsh suspend $<Domain-{Id,Name,Uuid}>`
‎
Example: `virsh suspend Debian11`

<!--
Some speaker notes here that might be useful.

When a guest virtual machine is in a suspended state, it consumes system RAM but not processor resources. Disk and network I/O does not occur while the guest virtual machine is suspended. This operation is immediate and the guest virtual machine can only be restarted with the virsh resume command. Running this command on a transient virtual machine will delete it.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-managing_guest_virtual_machines_with_virsh-shutting_down_rebooting_and_force_shutdown_of_a_guest_virtual_machine#sect-Starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-Suspending_a_guest_virtual_machine
-->

---

### Reset Virtual Machine

`virsh reset $<Domain-{Id,Name,Uuid}>`
‎
Example: `virsh reset Debian11`

<!--
Some speaker notes here that might be useful.

The command resets the guest virtual machine immediately without any guest shutdown. A reset emulates the reset button on a machine, where all guest hardware sees the RST line and re-initializes the internal state. Note that without any guest virtual machine OS shutdown, there are risks for data loss.

  Resetting a virtual machine does not apply any pending domain configuration changes. Changes to the domain's configuration only take effect after a complete shutdown and restart of the domain.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-managing_guest_virtual_machines_with_virsh-shutting_down_rebooting_and_force_shutdown_of_a_guest_virtual_machine#sect-Starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-Suspending_a_guest_virtual_machine
-->

---

### Stop Running Guest Virtual Machine To Restart It Later

`virsh managedsave $<Domain-{Id,Name,Uuid}> --bypass-cache --running | --paused | --verbose`
‎
Example: `virsh managedsave Debian11 --running`

<!--
Some speaker notes here that might be useful.

The command saves and destroys (stops) a running guest virtual machine so that it can be restarted from the same state at a later time. When used with a virsh start command it is automatically started from this save point. If it is used with the --bypass-cache argument the save will avoid the filesystem cache. Note that this option may slow down the save process speed and using the --verbose option displays the progress of the dump process. Under normal conditions, the managed save will decide between using the running or paused state as determined by the state the guest virtual machine is in when the save is done. However, this can be overridden by using the --running option to indicate that it must be left in a running state or by using --paused option which indicates it is to be left in a paused state. To remove the managed save state, use the virsh managedsave-remove command which will force the guest virtual machine to do a full boot the next time it is started. Note that the entire managed save process can be monitored using the domjobinfo command and can also be canceled using the domjobabort command.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-managing_guest_virtual_machines_with_virsh-shutting_down_rebooting_and_force_shutdown_of_a_guest_virtual_machine#sect-Starting_suspending_resuming_saving_and_restoring_a_guest_virtual_machine-Suspending_a_guest_virtual_machine
-->

---

### Extra: Listing, Creating, Applying, and Deleting a Snapshot

`qemu-img snapshot [ -l | -a snapshot | -c snapshot | -d snapshot ] filename`

<!--
Some speaker notes here that might be useful.

The qemu-img command-line tool is used for formatting, modifying, and verifying various file systems used by KVM.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/chap-using_qemu_img

Using different parameters from the qemu-img snapshot command you can list, apply, create, or delete an existing snapshot (snapshot) of specified image (filename).

The accepted arguments are as follows:
  -l lists all snapshots associated with the specified disk image.
  The apply option, -a, reverts the disk image (filename) to the state of a previously saved snapshot.
  -c creates a snapshot (snapshot) of an image (filename).
  -d deletes the specified snapshot.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-using_qemu_img-listing_creating_applying_and_deleting_a_snapshot

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-using_qemu_img-supported_qemu_img_formats
-->

---

### Remove and Delete a Virtual Machine

`virsh undefine $<Domain-{Id,Name,Uuid}> [--managed-save] [storage] [--remove-all-storage] [--wipe-storage] [--snapshots-metadata] [--nvram]`
‎
Example: `virsh undefine Debian11 --remove-all-storage`

<!--
Some speaker notes here that might be useful.

The command undefines a domain. If domain is inactive, the configuration is removed completely. If the domain is active (running), it is converted to a transient domain. When the guest virtual machine becomes inactive, the configuration is removed completely.

This command can take the following arguments:
  --managed-save - this argument guarantees that any managed save image is also cleaned up. Without using this argument, attempts to undefine a guest virtual machine with a managed save will fail.
  --snapshots-metadata - this argument guarantees that any snapshots (as shown with snapshot-list) are also cleaned up when undefining an inactive guest virtual machine. Note that any attempts to undefine an inactive guest virtual machine with snapshot metadata will fail. If this argument is used and the guest virtual machine is active, it is ignored.
  --storage - using this argument requires a comma separated list of volume target names or source paths of storage volumes to be removed along with the undefined domain. This action will undefine the storage volume before it is removed. Note that this can only be done with inactive guest virtual machines and that this will only work with storage volumes that are managed by libvirt.
  --remove-all-storage - in addition to undefining the guest virtual machine, all associated storage volumes are deleted. If you want to delete the virtual machine, choose this option only if there are no other virtual machines using the same associated storage. An alternative way is with the virsh vol-delete.
  --wipe-storage - in addition to deleting the storage volume, the contents are wiped.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-virsh-delete
-->

---

### Force a Guest Virtual Machine to Stop

`virsh destroy $<Domain-{Id,Name,Uuid}>`
‎
Example: `virsh undefine Debian11 --remove-all-storage`

<!--
Some speaker notes here that might be useful.

The command initiates an immediate ungraceful shutdown and stops the specified guest virtual machine. Using virsh destroy can corrupt guest virtual machine file systems. Use the virsh destroy command only when the guest virtual machine is unresponsive. The virsh destroy command with the --graceful option attempts to flush the cache for the disk image file before powering off the virtual machine.

https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-virsh-delete
-->

---

### Virtual Machine Termination

```console
$ virsh shutdown Debian11 # Graceful Shutdown
Domain 'Debian11' is being shutdown

$ virsh destroy Debian11 # Force Shutdown
Domain 'Debian11' destroyed

$ virsh undefine Debian11
Domain 'Debian11' has been undefined
```

---

### Extra: Related Commands

```shell
$ virsh nodeinfo
$ virsh edit

$ virt-df
$ virt-top
$ virt-viewer

$ virsh pool-list --all
$ virsh pool-destroy
$ virsh pool-undefine
```

---

### Extra: List OS Variant

`virt-install --os-variant list`

---

#### Extra: Install Ubuntu from ISO Image

```shell
$ virt-install \
    --name Ubuntu --os-variant ubuntu22.04 --description 'Ubuntu' \
    --vcpus 2 --ram 2048 \
    --network bridge=virbr0,model=virtio \
    --graphics vnc,listen=127.0.0.1,port=5902 \
    --cdrom ~/Downloads/ubuntu-22.04-desktop-amd64.iso \
    --noreboot --noautoconsole
$ virt-viewer --connect qemu:///session --wait Ubuntu
```

---

#### Extra: Install Ubuntu from Network

```shell
$ virt-install \
    --name Ubuntu --os-variant ubuntu20.04 --description 'Ubuntu' \
    --vcpus 2 --ram 2048 \
    --location \
    http://archive.ubuntu.com/ubuntu/dists/focal/main/installer-amd64/ \
    --network bridge=virbr0,model=virtio \
    --graphics vnc,listen=127.0.0.1,port=5902 \
    --noreboot --noautoconsole \
    --extra-args='console=ttyS0,115200n8 serial edd=off'
$ virt-viewer --connect qemu:///session --wait Ubuntu
$ virsh console Ubuntu
```

<!--
Some speaker notes here that might be useful.

Opens an interactive console that you can use to manually install the guest virtual machine.
-->

---

#### Extra: Install Fedora from ISO Image

```shell
$ virt-install \
    --name Fedora --os-variant fedora36 --description 'Fedora' \
    --vcpus 2 --ram 2048 \
    --network bridge=virbr0,model=virtio \
    --graphics vnc,listen=127.0.0.1,port=5904 \
    --cdrom ~/Downloads/Fedora-Workstation-Live-x86_64-36-1.5.iso \
    --noreboot --noautoconsole
$ virt-viewer --connect qemu:///session --wait Fedora
```

---

#### Extra: Install Fedora from Network

```shell
$ virt-install \
    --name Fedora --os-variant fedora36 --description 'Fedora' \
    --vcpus 2 --ram 2048 \
    --location \
    https://download.fedoraproject.org/pub/fedora/linux/releases/36/Server/x86_64/os \
    --network bridge=virbr0,model=virtio \
    --graphics vnc,listen=127.0.0.1,port=5904 \
    --noreboot \
    --extra-args='console=ttyS0,115200n8 edd=off'
$ virsh console Fedora
```

<!--
Some speaker notes here that might be useful.

https://download.fedoraproject.org/pub/fedora/linux/releases/36/Server/x86_64/os

Opens an interactive console that you can use to manually install the guest virtual machine.
-->

---

#### Extra: Install AlmaLinux from ISO Image

```shell
$ virt-install \
    --name AlmaLinux --os-variant almalinux9 --description 'AlmaLinux' \
    --vcpus 2 --ram 3072 \
    --network bridge=virbr0,model=virtio \
    --graphics vnc,listen=127.0.0.1,port=5903 \
    --cdrom ~/Downloads/AlmaLinux-9.0-x86_64-dvd.iso \
    --noreboot --noautoconsole
$ virt-viewer --connect qemu:///session --wait AlmaLinux
```

---

#### Extra: Install AlmaLinux from Network

```shell
$ virt-install \
    --name AlmaLinux --os-variant almalinux9 --description 'AlmaLinux' \
    --vcpus 2 --ram 3072 \
    --location \
    https://almalinux.uib.no/9.0/BaseOS/x86_64/os/ \
    --network bridge=virbr0,model=virtio \
    --graphics vnc,listen=127.0.0.1,port=5905 \
    --noreboot \
    --extra-args='console=ttyS0,115200n8 edd=off'
$ virsh console AlmaLinux
```

<!--
Some speaker notes here that might be useful.

https://mirrors.almalinux.org/isos/x86_64/9.0.html

https://almalinux.uib.no/9.0/isos/x86_64/
https://almalinux.uib.no/9.0/BaseOS/x86_64/os/

Opens an interactive console that you can use to manually install the guest virtual machine.
-->

---

#### Extra: Install CentOS from ISO Image

```shell
$ virt-install \
    --name CentOS --os-variant centos-stream9 --description 'CentOS' \
    --vcpus 2 --ram 3072 \
    --network bridge=virbr0,model=virtio \
    --graphics vnc,listen=127.0.0.1,port=5902 \
    --cdrom ~/Downloads/CentOS-Stream-9-latest-x86_64-dvd1.iso \
    --noreboot --noautoconsole
$ virt-viewer --connect qemu:///session --wait CentOS
```

---

#### Extra: Install CentOS from Network

```shell
$ virt-install \
    --name CentOS --os-variant centos-stream9 --description 'CentOS' \
    --vcpus 2 --ram 3072 \
    --location \
    https://mirror.netsite.dk/centos-stream/9-stream/BaseOS/x86_64/os/ \
    --network bridge=virbr0,model=virtio \
    --graphics vnc,listen=127.0.0.1,port=5904 \
    --noreboot \
    --extra-args='console=ttyS0,115200n8 edd=off'
$ virt-viewer --connect qemu:///session --wait CentOS
$ virsh console CentOS
```

<!--
Some speaker notes here that might be useful.

https://www.centos.org/download/mirrors/
https://admin.fedoraproject.org/mirrormanager/mirrors/CentOS
https://mirror.netsite.dk/centos-stream/9-stream/BaseOS/x86_64/os/

Opens an interactive console that you can use to manually install the guest virtual machine.
-->

---

### Error: Refusing to Undefine

```console
$ virsh undefine Ubuntu --remove-all-storage
error: Refusing to undefine while domain managed save image exists
```

```console
$ virsh managedsave-remove Ubuntu
Removed managedsave image for domain 'Ubuntu'
$ virsh undefine Ubuntu
Domain 'Ubuntu' has been undefined
```

---

### Error: Failed to Get MTU of Bridge

```text
stderr=failed to get mtu of bridge `virbr0': No such device
```

```console
# systemctl restart libvirtd
$ brctl show
bridge name	bridge id		STP enabled	interfaces
virbr0		8000.525400a87247	yes
```

<!--
Some speaker notes here that might be useful.

MTU means Maximum Transmission Unit.
-->

---

### Error: Hangs on Probing EDD

```text
Booting from Hard disk....
Probing EDD (edd=off to disable)... ok
```

```shell
$ virt-install \
    ...
    --extra-args='... edd=off'
```

<!--
Some speaker notes here that might be useful.

EDD means BIOS Enhanced Disk Device Services (EDD)
-->

---

### Error: Failed to Get Domain

- [Ensure](https://serverfault.com/a/840520>) that specified storage pool has correct permissions and path.

```console
$ virsh pool-list --all
$ virsh pool-info default
$ virsh pool-dumpxml default
$ virsh pool-dumpxml default \
    | xmlstarlet sel --template --copy-of "/pool/target"
$ virsh pool-dumpxml default \
    | xmlstarlet sel --template --value-of "/pool/target/path"

```

---

### Error: Cannot Access Storage File (UID:107, GID:107)

```console
# cp /etc/libvirt/qemu.conf /etc/libvirt/qemu.conf.original
# sed --in-place \
    "s,\#user = \"root\",\#user = \"${USER}\",g" \
    /etc/libvirt/qemu.conf
# sed --in-place \
    "s,\#group = \"root\",\#group = \"libvirt\",g" \
    /etc/libvirt/qemu.conf
# systemctl restart libvirtd
```

---

### Error: Missing 'Default' Network?

```console
$ virsh net-list --all
 Name   State   Autostart   Persistent
----------------------------------------

$ sudo virsh net-list --all
 Name      State    Autostart   Persistent
--------------------------------------------
 default   active   yes         yes
```

[Read this post if default network is still missing.](https://blog.programster.org/kvm-missing-default-network)

<!--
Some speaker notes here that might be useful.

https://blog.programster.org/kvm-missing-default-network
-->

---

## Task 3

### Manage KVM using Graphical User Interface (GUI)\* $_{(*if\ time\ permits)}$

Use **`virt-manager`** to create, manage, & delete KVMs.

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-12-12.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-12-34.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-14-21.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-14-40.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-14-50.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-14-58.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-15-22.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-15-47.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-15-52.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-15-55.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-16-03.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-16-08.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-16-13.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-16-16.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-16-25.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-16-40.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-17-10.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-17-14.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-17-17.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-17-21.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-17-25.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-17-31.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-17-33.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-17-35.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-17-44.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-17-55.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-18-02.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-18-07.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-18-12.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-18-15.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-18-19.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-18-22.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-18-42.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-18-50.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-07.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-11.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-13.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-14.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-16.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-20.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-22.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-25.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-29.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-33.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-35.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-36.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-38.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-39.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-42.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-44.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-19-53.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-20-04.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-22-26.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-22-34.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-24-01.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-24-03.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-24-09.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-24-18.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-24-23.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-24-28.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-30-27.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-35-44.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-35-52.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-35-55.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-35-57.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-37-13.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-37-18.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-37-22.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-37-25.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-37-28.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-37-38.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-38-23.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-38-39.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-38-46.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-40-03.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-40-39.png)

---

![height:14em](./assets/screenshots/Screenshot%20from%202022-09-08%2014-40-58.png)

---

## Bonus: Unattended Install

- [Preseeding (Debian-based Linux Distributions)](https://wiki.debian.org/DebianInstaller/Preseed) or [Kickstart (Red Hat-based Linux Distributions)](https://docs.fedoraproject.org/en-US/fedora/latest/install-guide/advanced/Kickstart_Installations/) provides a way to set answers to questions asked during the installation process, without having to manually enter the answers while the installation is running.

<!--
Some speaker notes here that might be useful.

Hints:
https://github.com/sheeeng/debian-vm-install/tree/debian10
https://github.com/sheeeng/kickstart-fedora-workstation
-->

---

## Bonus: Assign Host USB Device

<https://www.linux-kvm.org/page/USB_Host_Device_Assigned_to_Guest>

<!--
## Bonus: Bridged Networking

- The standard [NAT forwarding (aka. "default virtual network")](https://wiki.libvirt.org/page/Networking#NAT_forwarding_.28aka_.22virtual_networks.22.29) based connectivity is useful for quick & easy deployments, or on machines with dynamic/sporadic networking connectivity. Advanced users will want to use [Bridged networking (aka. "shared physical device")](https://wiki.libvirt.org/page/Networking#Bridged_networking_.28aka_.22shared_physical_device.22.29), where the guest is connected directly to the LAN.
- -->

<!--
Some speaker notes here that might be useful.

```console
$ sudo virsh net-dumpxml default
<network>
  <name>default</name>
  <uuid>258ae95f-f434-45e8-aa8c-09fb2d9735d0</uuid>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <bridge name='virbr0' stp='on' delay='0'/>
  <mac address='52:54:00:a8:72:47'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.122.2' end='192.168.122.254'/>
    </dhcp>
  </ip>
</network>
```
-->

---

### <!--fit--> :pray:

---

### End
