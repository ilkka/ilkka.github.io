---
kind: article
title: Teach Vim about Gemfiles
created_at: 2011-02-03T18:27:00+02:00
tags: [ruby, vim, coding]
---

By default, the excellent Vim editor doesn't know what the filetype of
Gemfiles is (it's `ruby`, of course). I've been sprinkling Vim modelines in
mine for ages, but just now as I was hacking at [my clone of
ticgit](https://github.com/ilkka/ticgit), I realized that it makes no sense to
sprinkle these onto other people's code so liberally when I could just teach
Vim to Do The Right Thing. So, I promptly added the following autocommand into
my `vimrc`:

<pre><code>
" I put my autocommands in a block like this
if !exists("autocommandsLoaded")
  let autocommandsLoaded = 1
  ...
  autocmd BufNewFile,BufRead Gemfile setlocal filetype=ruby
endif
</code></pre>

Now all `Gemfile`s are opened in ruby mode and I don't have to annoy other
people with my editor-specific modelines any more.
