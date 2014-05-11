---
kind: article
title: Packaging a Qt app for OS X
created_at: 2011-10-19T23:06:27+03:00
tags: [qt, osx]
excerpt: I participated in BarCamp Tampere 2 recently, and one of the many very interesting presentations was Ville Ranki talking about Siilihai, a web forum reader app intentionally very reminiscent of newsreaders of old.
---

I participated in [BarCamp Tampere
2](http://barcamp.org/w/page/39167337/BarCampTampere2) recently, and one of
the many very interesting presentations was [Ville
Ranki](http://www.modeemi.fi/~cosmo) talking about
[Siilihai](http://siilihai.com/), a web forum reader app intentionally very
reminiscent of newsreaders of old.

Siilihai scrapes the content from web forums and presents it as threaded
conversations so that it's easier to read and follow conversations. Parsers
can be written pretty easily for most forum software, and while forum content
is only accessed locally by the client, it stores generated message IDs in the
siilihai.com service so that whatever messages you read in one client are
marked read in any other clients you might use as well. The service is also
used as a repository for forum parsers.

Anyway, as the event was held at [our office](http://www.futurice.com), I
grabbed a Mac that was handy so that I could try out Siilihai for myself.
Getting it built was simple as it is written using Qt, but I wanted to create
a distributable package (an app bundle in OS X parlance) so that all the other
beret wearers could enjoy it too. This, however, turned out to be a bit more
involved than I'd thought.

The anatomy of an app
---------------------

An app bundle is pretty self-contained. Apart from basic system libraries that
can be assumed to be available on every Mac, apps usually ship all their
libraries inside the app bundle together with the runnable binary. Some space
may be wasted this way if several apps bundle the same libraries, but
generally it seems pretty useful. At least it's simple to deploy applications
when they can simply be copied into place.

Siilihai uses a couple of shared libraries of its own, and naturally Qt. Since
Qt is not installed by default in OS X, I had to include all of these in the
app bundle. Bundling Qt is relatively simple using the
[macdeployqt](http://doc.qt.nokia.com/stable/deployment-mac.html) tool
included in the Qt SDK, but it only really takes care of the whole process if
the application is a single binary that is only dependent on Qt. Siilihai's
custom libraries required a bit more love.

Rewiring and rewriting
----------------------

For an app that uses dynamic libraries to work, the runtime linker must be
able to find the libraries when the app is run. In Unix-style OSes this is
generally accomplished by installing the libraries into standard paths such as
`/usr/lib`. The dynamic linker is preconfigured to look in these directories
when it is looking for library files.

If the libraries are for some reason installed into a nonstandard path, that
path can also be configured as an "rpath" in the app binary itself. This is
just another way of telling the dynamic linker where to look, but in a per-app
fashion.

These concepts are valid for OS X `.dylib` files as well, with some
differences. Using the command line utility `otool` we can examine this
search path information. Let's see the output for `otool` itself:

<pre><code>
$ otool -L `which otool`
/usr/bin/otool:
	/usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 159.0.0)
</code></pre>

We can see that otool depends on a single dylib, libSystem. Now, my knowledge
isn't broad enough to tell if the actual path to the lib is hardcoded in the
binary, or if the output is due to the dynamic linker knowing to look in
`/usr/lib`, but in the context of this discussion it doesn't really matter.
Let's look at the output for `libSystem.B.dylib` next:

<pre><code>
$ otool -L /usr/lib/libSystem.B.dylib
/usr/lib/libSystem.B.dylib:
	/usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 159.0.0)
	/usr/lib/system/libcache.dylib (compatibility version 1.0.0, current version 47.0.0)
	/usr/lib/system/libcommonCrypto.dylib (compatibility version 1.0.0, current version 55010.0.0)
	/usr/lib/system/libcompiler_rt.dylib (compatibility version 1.0.0, current version 6.0.0)
	/usr/lib/system/libcopyfile.dylib (compatibility version 1.0.0, current version 85.1.0)
	...
</code></pre>

We see that libSystem is linked against a whole bunch of other system
libraries, but also that the otool output lists the library itself. As far as
I can tell, this is because the library knows its own path, something that
needs to be taken into account later. If you know better, please leave a
comment.

The consequence is that because I was going to put siilihai's libraries in a
nonstandard place (inside the app bundle), I need to edit the library
locations stored in the app binary so that the libraries get found by the
linker. Siilihai's libraries also link to each other, so I have to do the same
thing to them too.
