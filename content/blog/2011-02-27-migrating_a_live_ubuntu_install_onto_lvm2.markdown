---
kind: article
title: Migrating a live Ubuntu install onto LVM2
created_at: 2011-02-27T13:56:40+02:00
tags: [ubuntu]
excerpt: My only home computer is, and has been for a while, a Nokia Booklet. It's a nice ultra-portable fanless laptop that gets about 6-7 hours of use per charge, and is in my opinion one of the most stylish products ever shipped by Nokia.
---

My only home computer is, and has been for a while, a Nokia Booklet. It's a
nice ultra-portable fanless laptop that gets about 6-7 hours of use per
charge, and is in my opinion one of the most stylish products ever shipped by
Nokia. Granted, it's not too powerful, only sporting a dual-core Intel Atom
Z530 running at 1.6 GHz, and it has one major flaw from a Linux user's
standpoint in that it has the almost infamous GMA500 graphics hardware
courtesy of the "Poulsbo" chipset. [Support nowadays is
okay](https://wiki.ubuntu.com/HardwareSupportComponentsVideoCardsPoulsbo/), in
that I run Maverick on it at native panel resolution, and can actually pretty
consistently put the machine to sleep with `uswsusp` and have it wake up
correctly, but I can't for example run the snazzy new `gnome-shell` on it, or
use compiz.

Anyway, I used to have the original Windows 7 install on a second partition,
but it soon became apparent that I would find no use for it and decided to use
the whole disk for Ubuntu. I didn't want to reinstall, however, and
unfortunately hadn't originally put it on LVM, so the exercise would be a bit
more substantial than simply growing a logical volume.

This, then, was my plan of action:

  1. Nuke the windows partition, make a LVM partition in it's place, and
     create a volume group and logical volume with it, then create a new ext4
     fs on the logical volume.
  2. Copy over the running Ubuntu installation onto the new filesystem.
  3. Update grub to locate the new-old Ubuntu on the LVM filesystem.
  4. Boot from the logical volume.
  5. Add the old Ubuntu partition to the volume group and grow the logical
     volume and filesystem onto that.

Simple! There are a couple of glaring holes in the plan but we'll handle those
as we get to 'em.

Nuke 'em high
-------------

The first step was simple: first, just delete the windows partition and create
a new partition in its place with the partition type set to `0x8e` for Linux
LVM. Then we need to tell LVM about this new partition, or "physical volume"
in LVM terminology, by running `pvcreate` on it (I'm running all these
commands as root):

<pre><code>
# pvcreate /dev/sda1
</code></pre>

Then we create a volume group, which is a container of physical volumes, and
itself acts as a container for logical volumes:

<pre><code>
# vgcreate vg-0 /dev/sda1
</code></pre>

Finally, create a logical volume that fills up the new volume group:

<pre><code>
# lvcreate -n root -l 100%VG vg-0
</code></pre>

Now there's a brand spanking new logical volume called `root` on the volume
group `vg-0`. As evidence of this, there is a new device node for it at
`/dev/vg-0/root`. Next, create the filesystem:

<pre><code>
# mkfs.ext4 /dev/vg-0/root
</code></pre>

Replica
-------

Now the new filesystem can be mounted and the running installation copied onto
it. There might be some cases where copying from a live fs might be a bad
idea, but generally as long as you don't do anything substantial at the same
time, you shouldn't have too much trouble.

I used `rsync` to do the actual copying, but any similar tool could be used as
long as it correctly preserves all file attributes. What's just as important
is to skip all the special pseudofilesystems and the mountpoint itself:

<pre><code>
# mount /dev/vg-0/root /mnt
# rsync -a / --exclude=/{dev,proc,sys,var/run,var/lock} /mnt | \
  tee transfer.log; \
  ogg123 /usr/share/sounds/ubuntu/stereo/system-ready.ogg
</code></pre>

I used `tee` to capture the output from rsync and save it in a logfile, and
made it play a sound when it finished so I wouldn't have to keep checking.
It's always a good idea to do a dry run first, and `rsync` has the `-n` flag
for that. For me the command complained about not being able to copy all file
attributes, but even after trawling the verbose logs I couldn't find any
specific file-related errors, so I decided to ignore that message and went
ahead with the real copy. All told the process took a couple of hours for 20+
GB.

Rub-a-dub-dub
-------------

I haven't played with grub a whole lot, but after looking at how the thing was
configured on Ubuntu, I tentatively came to the conclusion that grub (version
2 that is) should find the copied Ubuntu from the logical volume and add it to
the boot menu automagically. So I updated `grub.cfg`:

<pre><code>
# update-grub
</code></pre>

The output hinted at what a look at `/boot/grub/grub.cfg` confirmed, i.e. that
grub had indeed found the copy. However, I happened to notice that the root
settings for the LVM kernels were incorrect, and had the UUIDs of my old root
partition. I didn't think much of it, expecting them to be set correctly as I
ran `update-grub` from the new partition, and simply fixed them manually.

At this point I rebooted, selected the latest kernel from the logical volume
and found Ubuntu running nicely. I used fdisk to delete the old root partition
and created a new LVM partition in its place, and shutdown the machine,
deciding to call it a day.

This was a near-catastrophic error, as it turns out. Well, catastrophic in a
relative sense.

Disco inferno
-------------

Booting in the morning, I was greeted by a friendly grub message saying
"ERROR: no such disk", and a `grub-rescue>` prompt that didn't know a single
command, not even help.

After thinking about it for a few moments, my error was glaringly obvious:
grub on the MBR was still looking for it's config file from the old root
partition, which I had nuked, because I had never reinstalled it, only
recreated the config file. And even if I *had* reinstalled it, it wouldn't
have booted, because I had only updated the `grub.cfg` file on the old root,
not on the new one. Facepalm.

Well, thankfully I happened to have another Ubuntu machine available, so I
quickly created a bootable USB stick and started fixing things. The default
Ubuntu live image doesn't have the userspace LVM tools, but as long as there's
network connectivity, one can just install them on the running ramdisk, so
that's no problem.

The first order of business was to get the new root mounted using the live
image:

<pre><code>
# apt-get install -y lvm2
# vgchange -a y vg-0
# mount /dev/vg-0/root /mnt
</code></pre>

The `vgchange` command makes the volume group active, this is required so that
the logical volume can be mounted. Now the mounted root has all the tools
required to reinstall and reconfigure grub, so the easiest method is to chroot
into the mount and fix it from there. For this to work, the most important
pseudofilesystems need to be bind-mounted into the chroot:

<pre><code>
# for d in dev/pts dev proc sys; do mount -B /$d /mnt/$d; done
</code></pre>

Now we can chroot into the volume, reinstall grub and rebuild the
configuration:

<pre><code>
# chroot /mnt
# grub-install /dev/sda
# update-grub
</code></pre>

Easy peasy. Now for a reboot...

...and the same error message.

<img alt="WTF?!" class="img-responsive"
src="http://4.bp.blogspot.com/_dcdi--LdAeQ/Sa1sWd8j4pI/AAAAAAAAEBg/BGX_vc32JHc/s400/wtf.jpg"/>

I did the same boot from USB stick, install lvm, mount root rumba again and
started scratching my head and looking at files. In the end it was a simple
comment on some forum somewhere that tipped me off as to what the actual
problem was. I forget where (sorry) but someone said that the format for the
parameter for the `set root` command of grub was the same as the volume node
name in the `/dev/mapper` directory. Now, `update-grub` had put entries like
`set root='(vg-0-root)'` in the `grub.cfg`, but *actually* the dash in the
volume group name gets kinda-sorta escaped, so the node is in fact named
`/dev/mapper/vg--0-root`. It appears there is a [bug in
`update-grub`](https://bugs.launchpad.net/ubuntu/+source/grub2/+bug/726021)
that causes this behavior.

As manually fixing the file would have just been a one-off solution, I renamed
the volume group (which was thankfully very easy):

<pre><code>
# umount /mnt
# vgchange -a n vg-0
# vgrename vg-0 vg0
# vgchange -a y vg0
# mount /dev/vg0/root /mnt
</code></pre>

The volume group needs to be deactivated to rename it, but other than that
it's straightforward. Now I `grub-install`ed and `update-grub`'d again and
confirmed that this time it generated correct config files. Time to wipe off
that cold sweat and lean back.

Grow your own
-------------

All that then remained was to add the old root's physical volume to the volume
group, then use up that space. For this, you first need to initialize the
partition for LVM, then extend the volume group onto it, *then* grow the
logical volume, and **finally** grow the filesystem to match the new volume
size. Sounds complicated but is just a few simple steps really (/dev/sda6 is
the old root partition here):

<pre><code>
# pvcreate /dev/sda6
# vgextend vg0 /dev/sda6
# lvextend -l 100%VG vg0/root
# resize2fs /dev/vg0/root
</code></pre>

And that's it! One reboot later I'm here typing this and feeling a bit smug
for shooting myself in the leg, then managing to bandage it up without doing
any more damage in the process.
