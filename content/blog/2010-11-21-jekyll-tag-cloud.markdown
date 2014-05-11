---
title: Jekyll tag cloud
created_at: 2010-11-21T23:11:50+02:00
tags: [meta, ruby, jekyll, coding]
kind: article
excerpt: Having gotten the blog project off the ground and archives working, I decided to tackle the task of creating a tag cloud in Jekyll.
---

Having [gotten archives
working](/blog/2010/11/20/hosting-a-jekyll-blog-with-extensions-on-github)
nicely, I decided to next tackle the task of creating a tag cloud for
my blog. The [Jekyll
docs](https://github.com/mojombo/jekyll/wiki/Template-Data) are,
sadly, a bit ambiguous on how exactly to get at all the available
categories, for example, but as with my archive plugin, I decided to
go ahead and try out stuff until something workable emerged. With
archive pages, all that needed to be done was to write a generator
plugin to create more pages. With tags, however, I want to do
more. Specifically, I want to generate a tag cloud into my layout.

Googling a bit I came across [a gist](https://gist.github.com/364416)
where tag cloud generation was done in the `Rakefile`. I didn't want
to clutter my (as-of-then-nonexistant) `Rakefile` with stuff like
this, and instead thought that the logical place to put this code is
in a plugin. I decided to implement the same basic idea though, where
the tag links go in `<span>`s that get dynamically styled with
different font sizes. Here's the source of my new tag plugin:

<script src="https://gist.github.com/710577.js?file=tag_cloud_tag.rb">
</script>

The plugin class inherits from `Liquid::Tag` and has just one method
apart from the constructor, `render`. The `context` parameter to
`render` includes whatever data would be accessible in the template
via the `registers` hash.

> Here I must take a moment to vent a very tiny bit at Jekyll: why
> and/or how is it that while the [Liquid docs clearly state that only
> tags in double curly brackets may resolve to
> text](https://github.com/Shopify/liquid/wiki/Liquid-for-Designers),
> tags defined in Jekyll tag plugins *must* be put in brackets +
> percent signs? Illogical, and it bit me on the ass more than once
> as I was writing my plugin.

The `render` method gets all the tags in all the articles from
`context.registers[:site].tags`. That's a hash keyed on the tags as
strings, and the values are lists of articles that have that tag. The
`inject` on the next lines calculates the average length of the
article arrays. Next, I just iterate over all the tags once more, and
this time use the average to calculate a weight for every
tag. Finally, I output HTML for each tag, with a `<span>` that gets
its `font-size` set dynamically to a percentage based on the
weight. Finally the tag is registered with Liquid and it's ready to
use... provided you remember to use the brackets-plus-percent signs
markup.

The tag page class and the associated generator are very similar to
the archive plugin, so I'm just going to direct you to the [gist with
the source code](https://gist.github.com/710577).
