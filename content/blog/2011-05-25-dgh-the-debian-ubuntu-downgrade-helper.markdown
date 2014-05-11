---
kind: article
title: "Dgh, The Debian/Ubuntu Downgrade Helper"
created_at: 2011-05-25T22:39:00+03:00
tags: [ubuntu, sysadmin]
excerpt: Ever had the bright idea of upgrading, say, your Ubuntu machine to use some snazzy new software from a PPA, only to have it blow up in your face? The grim realization that there's no easy downgrade path, instead you'll have to find every single package the PPA upgraded and downgrade them by hand to keep software from breaking? Me too!
---

Ever had the bright idea of upgrading, say, your Ubuntu machine to use some
snazzy new software from a PPA, only to have it blow up in your face? The grim
realization that there's no easy downgrade path, instead you'll have to find
every single package the PPA upgraded and downgrade them by hand to keep
software from breaking? Me too!

I recently had this exact situation with the [gnome3-team
PPA](https://launchpad.net/~gnome3-team/+archive/gnome3). It worked like a
charm in my work computer, but when I tried it on my Nokia Booklet, it totally
failed, probably thanks to the infamous GMA500 graphics hardware. Anyway,
after a bit of hand-wringing I realized that:

  1. I had to downgrade, there was stuff on the machine I didn't want to wipe,
  2. I had been in this same situation before, and
  3. probably others had, too.

So I wrote a little tool to help, and I'm glad to say it worked perfectly. The
tool is [dgh](http://github.com/ilkka/dgh), and it helps by finding the
packages that look like they need to be downgraded. It does this by looking at
`apt-cache policy` output, and finding packages whose installed version is not
available in any repository. Usage is simple, but requires some manual work
(for now):

  1. Remove the offending package archive from apt's sources
  2. Run `apt-get update`
  3. Produce `apt-cache policy` output for all installed packages, e.g.:
  
        <pre><code>dpkg --get-selections| \
	egrep '\binstall'|awk '{print $1}'| \
	xargs env LANG=C apt-cache policy| \
	tee packages.list</code></pre>

  4. Run `dgh` on the output:

        <pre><code>$ dgh packages.list</code></pre>

Dgh will report packages it thinks are downgrade candidates. Note that it will
probably report all manually installed packages too, so be careful when
downgrading.

I have a few enhancements I want to do before I call it 1.0, like not
requiring a pre-created policy output file and perhaps even performing the
downgrade by itself, but it's usable now, just [grab the
code](http://github.com/ilkka/dgh) or `gem install dgh` directly from
rubygems.
