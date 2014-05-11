---
title: Rakefile for Jekyll site management
created_at: 2010-12-08T17:00:52+02:00
tags: [meta, ruby, rake, jekyll, coding]
kind: article
excerpt: Previously I've used a bunch of scripts for managing post creation and site compilation tasks, but recently I decided to move over to Rake.
---

Previously I've used a bunch of scripts for managing post creation and site
compilation tasks, but recently I decided to move over to Rake. The whole
Rakefile as-it-stands is [in the
repo](https://github.com/ilkka/ilkka.github.com/tree/source), naturally, but
here's a couple of bits I'm finding useful.

I have a `default` task set up that runs compass, jekyll, and `git commit`s
and `git push`es the result. The compass and jekyll bits are simple `sh`
steps, but the rest is a bit more involved. Let's start with post creation
though, in the spirit of the real workflow.

<pre><code class="language-ruby">
namespace "post" do
  desc "Given a title as an argument, create a new post file"
  task :new, [:title] do |t, args|
    now = DateTime::now().to_date()
    filename = "#{now.strftime}-#{args.title.gsub(/\s/, '_').downcase}.markdown"
    path = File.join("_posts", filename)
    if File.exist? path; raise RuntimeError.new("Won't clobber #{path}"); end
    File.open(path, 'w') do |file|
      file.write <<-EOS
---
layout: post
title: #{args.title}
---

Content goes here
EOS
    end
    puts "Now open #{path} in an editor."
  end
end
</code></pre>

The above listing is the new post creation task, and the entirety of the
`post` namespace currently, as it happens. It takes the post title as an
argument, and uses that and the current date to generate a filename. At the
moment it just replaces whitespace with underscores, but it might be good to
do more escaping to ensure a good filename. Then the task writes a post
template into the file and prints the filename so it's easy to launch an
editor for it.

To ensure good clean commits of the site I clean the `_site` directory before
compilation, i.e. delete all files except for any dotfiles, so as not to
destroy the `.git` dir in there. I use a helper method to get a list of all
the files:

<pre><code class="language-ruby">
def site_files
  FileList['_site/**/*'].find_all {|f| File.file? f}
end
</code></pre>

This file list is then used in the `clean` and `commit` tasks like this:

<pre><code class="language-ruby">
desc "Clean generated site files"
task :clean do
  FileUtils.rm site_files
end

desc "Commit compiled site to Git"
task :commit do
  g = Git.open('_site')
  g.add site_files.map {|f| f.gsub(/^_site\//, '')}
  g.commit "Regenerated"
end

desc "Push committed site to GitHub"
task :push do
  g = Git.open('_site')
  g.push
end
</code></pre>

The `clean` task is simple because one can use the filelist directly, but when
committing, the `_site` dir bit has to be dropped from the filenames with a
simple `map` + `gsub` combo. I'm using [Scott
Chacon's](https://github.com/schacon) [ruby-git
gem](https://github.com/schacon/ruby-git) to perform git operations on the
repo.

That's pretty much it for the moment. I might expand the post management
features a bit at some point though, but since most of that is no simpler via
Rake than through shell commands and an editor, it remains to be seen what
those new features might be.
