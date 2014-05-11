---
created_at: 2011-01-31T14:30:00+02:00
kind: article
title: Fix Outlook Quoting Style
tags: [coding, ruby, tools]
excerpt: Like many others before and after myself, I find myself having to use MS Outlook in my daily work. Also like many, I loathe its style of quoting email messages. Fortunately I use Exchange's rather surprisingly good (as of the 2007 version) OWA web client, so with Firefox's "It's All Text" extension, Vim and some Ruby code, I can fix quoting in messages I'm replying to easily.
---

Like many others before and after myself, I find myself having to use MS
Outlook in my daily work. Also like many, I loathe its style of quoting email
messages. Fortunately I use Exchange's rather surprisingly good (as of the
2007 version) OWA web client, so with Firefox's [It's All
Text](https://addons.mozilla.org/en-US/firefox/addon/its-all-text/) extension,
Vim and some Ruby code, I can fix quoting in messages I'm replying to easily.

Googling for a ready-made solution I came across [a post to gnhlug's mailing
list](http://www.mail-archive.com/gnhlug@zk3.dec.com/msg13395.html) that had a
Perl solution, albeit one supporting only English and only older Exchange
versions, but it gave me the spark I needed to write my own implementation.

Whereas (as far as I can tell) the original author wanted to correct the
quoting style of all the participants in the conversation, I thought that was
unnecessarily disruptive and only opted to correctly quote the message I would
be replying to. The usage scenario then is something like this:

1. In OWA, choose to reply to a message. Horribly quoted message text appears.

2. Use It's All Text or some other similar tool to open message text in a
   reasonably smart editor.

3. Filter entire message text through this script. E.g. in Vim type
   `:%!path-to-script.rb`, after making the script executable of course.

4. Replace original mesage text with output of filter. If using It's All Text,
   just type `:wq`.

5. Presto! Correctly quoted message. You might have to move your sig, though.

That's how to use it, now here's the script:

<script
src="https://gist.github.com/803961.js?file=fix-outlook-quoting.rb"></script>

