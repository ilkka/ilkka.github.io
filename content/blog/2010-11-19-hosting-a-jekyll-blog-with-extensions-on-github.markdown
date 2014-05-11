---
title: Hosting a Jekyll blog with extensions on Github
created_at: 2010-11-20T20:39:09+02:00
tags: [meta, ruby, jekyll, coding]
kind: article
excerpt: I've finally gone and done it, it seems, and started a blog that's more focused than my previous attempts at Internet wordsmithery.
---

I've finally gone and done it, it seems, and started a blog that's
more focused than my previous attempts at Internet wordsmithery.

No, wait, actually this blog is *less* focused, the [previous
one](http://ilkkalaukkanen.blogspot.com) tried to be about my
photography hobby. From the top, then:

I've finally gone and... crud. Let's not write one more of *those*
posts. You know the ones. The beef here is that this is my blog, it's
about stuff, you can find it at <http://ilkka.github.com>, and I had
some fun with [Jekyll](http://jekyllrb.com) while making it. If you
want to use Jekyll too, and especially want to use Jekyll `_plugins`
together with GitHub pages, or just have a few minutes to waste with
nothing good on the youtubes, read on.

I'm not going to talk about basic Jekyll usage since you can read all
about that elsewhere (like on the [Jekyll GitHub
wiki](https://github.com/mojombo/jekyll/wiki)), and if you happen to
care about things like this I probably don't have to go into detail
about the reasons why I chose it, either: the content is statically
generated from Liquid templates and a bunch of Markdown or Textile
files or even HTML, so all one needs for hosting is a web server,
everything is stored safely in git, clean and simple etc. etc. GitHub
pages is a pretty ideal hosting choice since it automagically
jekyllifies your pages -- which we'll see is sometimes not so good --
and is just generally totally sweet, so let's not go there either.

## The Revolution will be archived

So. I did some Jekyll testing and saw that it was Good, but I found
that it lacked something I wanted for my site, namely archive
pages. After messing around a bit with the Liquid template language, I
came to the conclusion that it wouldn't cut it alone and that I needed some
custom site-specific code in the form of [Jekyll
plugins](https://github.com/mojombo/jekyll/wiki/Plugins) to get what I
wanted. The plugin mechanism in Jekyll allows one to put ruby code
along with the post sources, layouts and other stuff and have it be
executed when Jekyll runs. Ominous!

In the interest of coherent narrative, I'm going to totally ignore how
things actually went down and try to tell it the way they should've,
and the first milestone on that journey is the creation of a new page
class in Jekyll. The `ArchivePage` class' source is below.

<script src="https://gist.github.com/707020.js?file=archivepage.rb">&nbsp;</script>

Most of `ArchivePage`'s methods and ideas are copied from Jekyll's own
`Page` class. It mixes in `Convertible`, therefore it can be laid out
and converted like any other page. What it does not do is read its
content from a file, instead the content is initialized in the
constructor. I know, I know, suboptimal and I *am* coming up with a
better solution but this is not the point. `ArchivePage` relies on
being provided with a ready-made list of `posts`, and also, again
rather crudely, on a `month` parameter that's actually a string of the
format "YYYY/MM", like in post URLs, and that will be in fact used as
part of an URL, which you see if you look at the `url` method.

The `ext` and `basename` are quite self-explanatory, but the `data`
hash is what determines the layout and makes the posts available to
the template code in `content`. Anything that could be set in a page's
YAML front matter can be set here. I set the `type` of the page to be
"archive" so that I can identify these pages later as I'm iterating
`site.pages`.

The `render` method is what the site uses to render pages into their
final form, ready to be written to the destination. The layouts and
sitewide data are passed to it as `layouts` and `site_payload`, and it
combines its own data with `site_payload` and passes all that to the
`Convertible` method `do_layout` that does the actual converter
selection according to source format, template parsing, rendering and
so on. It uses the `to_liquid` method which is really just a leftover
from `Page`, I'm not sure if it could be just folded into either the
constructor or `render`.

`write` is just more slightly modified copypasta from `Page`: figure
out the destination file path into `dest`, create the directory path
there (in two steps that could probably be combined), open a `File`
for writing and dump the `output` from `render` into it.

## Talkin' bout my generation

That's the `ArchivePage` class in a nutshell, but that alone won't do
much: there has to a plugin class too, namely a `Generator` subclass:

<script src="https://gist.github.com/707909.js?file=archivegenerator.rb">&nbsp;</script>

`Generator` plugins have a single method for an interface,
`generate`. It takes the `site` as parameter, and from there one can
do pretty much what one wants. Here I go through all posts in
`collate_by_month`, where build a hash of lists of posts keyed on the
year and month they were created. Then I simply create an
`ArchivePage` instance for every month and, crucially, add the pages
into `site.pages` so that I can later access them in my template.

Now I have the archive pages for all my months stored neatly with all
my other pages. All I have to do now is make them accessible. To that
end I wrote some template code, the results of which you can see down
at the bottom of this page and others, and the code looks like this:

<script src="https://gist.github.com/708018.js?file=archivelinks.html">&nbsp;</script>

This bit is not too elegant either, but it gets the job done and works
reasonably well -- which is easy to say given the single-digit post
counts I've tested. All it does is iterate over the whole `site.pages`
list and pick out the pages that have a `type` value of "archive",
which the `ArchivePage` instances have. Presto, instant archive pages!

This approach leads to a problem that I hinted at in the beginning
though: naturally GitHub doesn't want random people (even if they all
are brilliant hackers) running their code on GitHub's servers, so
Jekyll plugins don't work when GitHub regenerates the
pages. Unfortunately I only found this out at this point, and I
already had some development history in my pages' repository's master
branch which I didn't want to throw away. Also I didn't want to find
hosting elsewhere, and really didn't want separate repos for the
source and the content, so I found myself with two problems:

1. I need a good workflow for writing, generating and uploading, and
2. I need a good way to host both the Jekyll source and the generated site in one repo.

Both of these actually kind of tie together, since the way Jekyll
normally works, meaning with the out-of-the box configuration, is to
generate the site in the `_site` folder under the root of the source
tree. Now, if I want to not have to maintain two repos, I must host
the sources to this blog in the `ilkka.github.com` repo alongside the
generated site. However, the generated site needs to be in the master
branch, and it needs to start at the root of the tree, meaning the
main `index.html` file needs to be in the root directory, not in
e.g. `_site`.

## Branching out

The way I came up with to solve this is to use two branches: `master`
is for the generated site, since that's what GitHub pages wants, and
I'll create a second branch called `source` to keep the sources
in. Then I'll add the `master` branch as a submodule of the `source`
branch so that it shows up as the `_site` directory. This allows me to
have both branches essentially checked out at the same time, which
makes updating a breeze even if it means using twice the disk space
locally.

The first thing I need to do is move the sources out of `master` and
into `source`. I don't want to lose the history though, so I'll have
to rename the branch, and I also don't want the branches to share a
root -- there's no commonality there -- so I want a pristine `master`
branch. Happily this is easy with Git. First I rename the old branch
locally:

<pre><code class="language-sh">
git branch -m master source
</code></pre>

This only renames the local branch though: I still have to rename the
remote branch in GitHub, which I'll do later. Now I create a pristine
new `master`, which is well documented in the [Git Community
Book](http://book.git-scm.com/5_creating_new_empty_branches.html):

<pre><code class="language-sh">
git symbolic-ref HEAD refs/heads/master
rm .git/index 
git clean -fdx 
touch index.html
git add your files 
git commit -m 'Blank new master branch'
</code></pre>

Now I cannot just do a normal push with this new `master` branch
because the master in GitHub is unrelated and cannot be merged. What I
*can* do is borrow a page from George Lucas' book and force-push:

<pre><code class="language-sh">
git push --force origin master
</code></pre>

This will essentially clobber the remote repo and is really not
recommended on a published repo, but in my case I think it's pretty
unlikely that anybody else has cloned it yet.

Now all that remains is to push the `source` branch:

<pre><code class="language-sh">
git push origin source:source
</code></pre>

Also done but not detailed here is that `source` was set to follow
`origin/master` so I actually had to recreate it locally and set it to
follow `origin/source`. Then I checked out `source` and added the
submodule, using my private URL so that I could commit changes to the
generated site easily:

<pre><code class="language-sh">
git checkout source
git submodule add git@github.com:ilkka/ilkka.github.com.git _site
git commit -m "Added site as submodule"
</code></pre>

Now whenever I run Jekyll, or as I normally do, namely have `compass
watch` running in one window and `jekyll --auto --server` in another,
the site is generated into `_site` and I can commit and push the
changes directly.

All in all this seems to work pretty nicely, and Jekyll really
scratches some fundamental itch for me. I get to code and tweak, which
is all I really need right now, now that I've no time or need for
programming professionally, at least not right now. In a way it's
pretty liberating, since I can totally get my hack on without getting
brainburn from too much time spent staring at my code. Expect more of
that then, in this space, along with other stuff. As I said in the
beginning, I'm gonna play pretty fast and loose here.

If you want to check out the code and source in full, take a look at
the [`source` branch in
GitHub](https://github.com/ilkka/ilkka.github.com/tree/source). I'll
be posting about new developments in this front as well.
