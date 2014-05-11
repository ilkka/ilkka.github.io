---
title: Shooting tethered with the Nikon D80 and Ubuntu
created_at: 2010-12-08T17:09:38+02:00
tags: [photography]
kind: article
excerpt: I really like shooting tethered with Lightroom and my MacBook, but today while thinking about a band shoot I had coming up, I wondered how easy it would be to do the same on Ubuntu on my Nokia Booklet.
---

I really like shooting tethered with Lightroom and my MacBook, but today while
thinking about a band shoot I had coming up, I wondered how easy it would be
to do the same on Ubuntu on my Nokia Booklet.

After a bit of Googling I came across [a
post](http://rian76.blogspot.com/2009/09/tethering-from-your-nikon-to-your-linux.html)
that had a nice and simple script that I could use as a starting point. It
even calls itself via gphoto2 while working which is a nice solution to the
problem of needing a script for downloading and another one for viewing the
images (the hook script provided to gphoto2).

It has one problem however: I shoot RAW and therefore would need for whatever
image viewer I call to be able to display NEF files. I know of no such tool
for Ubuntu, so I switched my D80 to shoot RAW+JPEG instead and edited the
script to this:

<pre><code class="language-sh">
#!/bin/bash

case "$ACTION" in
download)
  if [ $(expr match "$ARGUMENT" '.*\.JPG$') -gt 0 ]; then
    killall eog
    eog -f "$ARGUMENT" &
  fi
  ;;
"")
  me=$(cd ${0%/*} && echo $PWD/${0##*/})
  gphoto2 --capture-tethered --hook-script=$me
  ;;
esac
</code></pre>

Only the `download` branch of the case statement is edited. I just check if
the filename ends in `.JPG`, and call `eog` to display the image if it does.
The `.NEF` files are downloaded too, they're just ignored.

The downside to this is that I can't seem to be able to leave the images on
the card as well as download them, in `--capture-tethered` mode gphoto2 always
deletes them. But still, this is a workable solution for when I don't have the
MacBook handy.

