---
kind: article
title: Jitsu is a meta build system for Ninja
created_at: 2011-02-13T22:19:50+02:00
tags: [jitsu, ninja, ruby, coding]
excerpt: A while back I hit upon [Ninja](https://github.com/martine/ninja), a very fast and very simple build system that is apparently used for building [Chromium](http://www.chromium.org/). Can't remember where I first heard of it, might've been [Hacker News](http://news.ycombinator.com) or just somebody's tweet, but having been interested in build systems for years, at least since setting up Linux builds from scratch for a big piece of software while working on my M.Sc. thesis, I immediately started playing around with it.
---

A while back I hit upon [Ninja](https://github.com/martine/ninja), a very fast
and very simple build system that is apparently used for building
[Chromium](http://www.chromium.org/). Can't remember where I first heard of
it, might've been [Hacker News](http://news.ycombinator.com) or just
somebody's tweet, but having been interested in build systems for years, at
least since setting up Linux builds from scratch for a big piece of software
while working on my M.Sc. thesis, I immediately started playing around with
it.

Ninja is indeed fast, but by design the buildfiles are hard to write. Ninja
sources include a patch to [Gyp](http://code.google.com/p/gyp), a higher-level
build system also somehow (not sure how exactly) related to Chromium, but the
support wasn't very complete, and somehow I just didn't find Gyp appealing. I
therefore did what anyone in my circumstances would've done, and started
writing a "meta build system" myself.

It's called [Jitsu](https://github.com/ilkka/jitsu), and since I really like
Ruby, that's what I wrote it in. It's at version 0.1.2 now and available from
rubygems.org, and as of now it can build (or rather, generate ninja buildfiles
for) C++ binaries and static libraries. Builds are specified as `build.jitsu`
files in YAML format, which the tool processes into `build.ninja` files that
can then be used by Ninja. I'll keep trying to use it in my own projects so
hopefully it'll keep on improving from here on out. Let's see where it will
go, I haven't really delineated the scope yet, to e.g. just doing C++ builds.

If you are interested, install the gem, maybe [grab the
source](https://github.com/ilkka/jitsu) and give it a spin. Let me know what
you think. Also see [the documentation](http://ilkka.github.com/jitsu).
