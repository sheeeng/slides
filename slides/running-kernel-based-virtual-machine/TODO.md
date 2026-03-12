# Bridge

**Work In Progress**

```console
➜  ~ sudo virsh net-list --all
 Name      State    Autostart   Persistent
--------------------------------------------
 default   active   yes         yes

➜  ~ sudo virsh net-dumpxml default
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

➜  ~
➜  ~
➜  ~ ip link show type bridge
4: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN mode DEFAULT group default qlen 1000
    link/ether 52:54:00:a8:72:47 brd ff:ff:ff:ff:ff:ff
➜  ~
➜  ~ ip link show dev virbr0
4: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN mode DEFAULT group default qlen 1000
    link/ether 52:54:00:a8:72:47 brd ff:ff:ff:ff:ff:ff
➜  ~

```


```console
➜  ~ sudo ip link show type bridge
4: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN mode DEFAULT group default qlen 1000
    link/ether 52:54:00:a8:72:47 brd ff:ff:ff:ff:ff:ff
➜  ~
➜  ~ sudo ip link add br0 type bridge
➜  ~
➜  ~ sudo ip link show type bridge
4: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN mode DEFAULT group default qlen 1000
    link/ether 52:54:00:a8:72:47 brd ff:ff:ff:ff:ff:ff
5: br0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether 2e:7e:59:50:a5:33 brd ff:ff:ff:ff:ff:ff
➜  ~


➜  ~ sudo ip link
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: enp0s31f6: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel state DOWN mode DEFAULT group default qlen 1000
    link/ether 3c:52:82:48:f2:f2 brd ff:ff:ff:ff:ff:ff
3: wlp2s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP mode DORMANT group default qlen 1000
    link/ether 14:ab:c5:0d:6f:ba brd ff:ff:ff:ff:ff:ff
4: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN mode DEFAULT group default qlen 1000
    link/ether 52:54:00:a8:72:47 brd ff:ff:ff:ff:ff:ff
5: br0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether 2e:7e:59:50:a5:33 brd ff:ff:ff:ff:ff:ff
➜  ~


➜  ~ sudo ip link set enp0s31f6 master br0
➜  ~

➜  ~ sudo ip link show master br0
2: enp0s31f6: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel master br0 state DOWN mode DEFAULT group default qlen 1000
    link/ether 3c:52:82:48:f2:f2 brd ff:ff:ff:ff:ff:ff
➜  ~

➜  ~ sudo ip address add dev br0 192.168.0.90/24
➜  ~
➜  ~ sudo ip addr show br0
5: br0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN group default qlen 1000
    link/ether 2e:7e:59:50:a5:33 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.90/24 scope global br0
       valid_lft forever preferred_lft forever
➜  ~


➜  ~ vi brigde.xml
➜  ~ cat brigde.xml
<network>
    <name>bridge</name>
    <forward mode="bridge" />
    <bridge name="br0" />
</network>
➜  ~



➜  ~ sudo virsh net-define bridge.xml
Network bridge defined from bridge.xml

➜  ~ sudo virsh net-start bridge
Network bridge started

➜  ~

➜  ~ sudo virsh net-list --all
 Name      State    Autostart   Persistent
--------------------------------------------
 bridge    active   no          yes
 default   active   yes         yes

➜  ~



➜  ~ sudo virsh net-destroy bridge
Network bridge destroyed

➜  ~ sudo virsh net-list --all
 Name      State      Autostart   Persistent
----------------------------------------------
 bridge    inactive   no          yes
 default   active     yes         yes

➜  ~ sudo virsh net-undefine bridge
Network bridge has been undefined

➜  ~ sudo virsh net-list --all
 Name      State    Autostart   Persistent
--------------------------------------------
 default   active   yes         yes

➜  ~




➜  ~ sudo ip address show enp0s31f6
2: enp0s31f6: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel master br0 state DOWN group default qlen 1000
    link/ether 3c:52:82:48:f2:f2 brd ff:ff:ff:ff:ff:ff
➜  ~
➜  ~ sudo ip address show br0
5: br0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN group default qlen 1000
    link/ether 2e:7e:59:50:a5:33 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.90/24 scope global br0
       valid_lft forever preferred_lft forever
➜  ~
➜  ~ sudo ip link delete br0 type bridge
➜  ~ sudo ip address show br0
Device "br0" does not exist.
➜  ~
➜  ~ sudo ip address show enp0s31f6
2: enp0s31f6: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel state DOWN group default qlen 1000
    link/ether 3c:52:82:48:f2:f2 brd ff:ff:ff:ff:ff:ff
➜  ~

```

---

## Bridged Networking

```text
➜  ~ nmcli connection show --active
NAME          UUID                                  TYPE    DEVICE
Computas-IoT  03054a47-e711-4462-a500-6274470acb5e  wifi    wlp2s0
virbr0        fceb5fb1-02fd-403e-9c95-37e991ca2341  bridge  virbr0
➜  ~
➜  ~ nmcli connection show
NAME                UUID                                  TYPE      DEVICE
Computas-IoT        03054a47-e711-4462-a500-6274470acb5e  wifi      wlp2s0
virbr0              fceb5fb1-02fd-403e-9c95-37e991ca2341  bridge    virbr0
Thomson9A1FC2       9ffb2bfa-9390-43dc-9c80-09910cc8efe5  wifi      --
Wired connection 1  df92578e-8537-3537-8177-ac5dbdeadfc0  ethernet  --
➜  ~
➜  ~

# Insert External Ethernet Adapter

➜  ~ nmcli connection show
NAME                UUID                                  TYPE      DEVICE
Computas-IoT        03054a47-e711-4462-a500-6274470acb5e  wifi      wlp2s0
virbr0              fceb5fb1-02fd-403e-9c95-37e991ca2341  bridge    virbr0
Thomson9A1FC2       9ffb2bfa-9390-43dc-9c80-09910cc8efe5  wifi      --
Wired connection 1  df92578e-8537-3537-8177-ac5dbdeadfc0  ethernet  --
Wired connection 2  4d313639-1195-3360-b797-fc3282cfd9f3  ethernet  --
➜  ~


➜  ~ nmcli --fields UUID,TIMESTAMP-REAL con show | tail --lines +2 | awk '{print $1}'
03054a47-e711-4462-a500-6274470acb5e
fceb5fb1-02fd-403e-9c95-37e991ca2341
9ffb2bfa-9390-43dc-9c80-09910cc8efe5
df92578e-8537-3537-8177-ac5dbdeadfc0
4d313639-1195-3360-b797-fc3282cfd9f3
➜  ~

➜  ~ nmcli --fields UUID,TIMESTAMP-REAL con show | tail --lines +2 | awk '{print $1}' | while read line; do echo "${line}"; done
03054a47-e711-4462-a500-6274470acb5e
fceb5fb1-02fd-403e-9c95-37e991ca2341
9ffb2bfa-9390-43dc-9c80-09910cc8efe5
df92578e-8537-3537-8177-ac5dbdeadfc0
4d313639-1195-3360-b797-fc3282cfd9f3
➜  ~


➜  ~ nmcli connection add type bridge con-name br0 ifname br0
Connection 'br0' (6008c77f-306e-4eac-a6aa-19fa2e46c146) successfully added.
➜  ~ nmcli connection show
NAME                UUID                                  TYPE      DEVICE
br0                 6008c77f-306e-4eac-a6aa-19fa2e46c146  bridge    br0
Computas-IoT        03054a47-e711-4462-a500-6274470acb5e  wifi      wlp2s0
virbr0              fceb5fb1-02fd-403e-9c95-37e991ca2341  bridge    virbr0
Thomson9A1FC2       9ffb2bfa-9390-43dc-9c80-09910cc8efe5  wifi      --
Wired connection 1  df92578e-8537-3537-8177-ac5dbdeadfc0  ethernet  --
Wired connection 2  4d313639-1195-3360-b797-fc3282cfd9f3  ethernet  --
➜  ~



➜  ~ ip -4 addr show wlp2s0
3: wlp2s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    inet 10.47.20.97/24 brd 10.47.20.255 scope global dynamic noprefixroute wlp2s0
       valid_lft 601849sec preferred_lft 601849sec
➜  ~



nmcli con mod br0 ipv4.addresses "10.47.20.97/24"
nmcli con mod br0 ipv4.gateway "192.168.1.1"
nmcli con mod br0 ipv4.dns "192.168.1.254 "
nmcli con mod br0 ipv4.dns-search "example.com"
nmcli con mod br0 ipv4.may-fail no





```

---

<!--
Some speaker notes here that might be useful.

Hints:
https://linuxconfig.org/how-to-use-bridged-networking-with-libvirt-and-kvm
-->
