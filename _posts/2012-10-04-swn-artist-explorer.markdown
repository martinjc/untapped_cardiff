---
author: martin
comments: true
date: 2012-10-04 09:48:18+00:00
layout: post
link: http://martinjc.com/2012/10/04/swn-artist-explorer/
slug: swn-artist-explorer
title: SWN Artist Explorer
wordpress_id: 706
categories:
- Coding
- Home
- Music
tags:
- coding
- development
- last.fm
- music
- SWN
- visualisation
---

It's that time of year again: [SWN Festival](http://swnfest.com/) is once more upon us. It's the highlight of the musical year in Cardiff, and probably the one thing I'll miss about the city when (if?) I leave. In fact, I'm pretty certain that even if I left the city I'd make the pilgrimage back once a year for SWN because it's just too much fun to miss.

The lineup this year is another cracking one, but as usual with four days of bands spread across so many venues there are a whole bunch of names that I don't recognise. As per usual I've cooked up a [Spotify playlist](http://open.spotify.com/user/martinjc/playlist/4O56MWAi1qIO6XfCDXEtjG), but even sorting through that takes some time:



I decided this year that it would be nice to have an easy visual way to see what the bands are like, so decided to build myself a little [artist explorer](http://martinjc.com/swn/). This uses tags from [Last.FM](www.last.fm) and generates word clouds using a nice [javascript plugin](https://github.com/jasondavies/d3-cloud) for [d3](http://mbostock.github.com/d3/) written by [Jason Davies](http://www.jasondavies.com/). Most of the word cloud js was hacked together from Jason's [example](http://www.jasondavies.com/wordcloud/), with some mangling and modification from me. I downloaded the tags for artists offline and stuck them in a .json file so it doesn't hit the Last.FM servers on every page load. What we end up with is a fairly simple tag cloud example that allows you to see at a glance how Last.FM users have categorised the bands. Selecting a tag in the word cloud will show you the other bands in the lineup that have also had that tag applied to them. Screenshots of the site are below:

[gallery link="file"]

but of course it's also [online here](http://martinjc.com/swn)!

Meanwhile, the code is available on [github](https://github.com/martinjc/swn_tagger), with no guarantees that any of it actually works.
