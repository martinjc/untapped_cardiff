---
author: martin
comments: true
date: 2013-04-22 10:51:12+00:00
layout: post
link: http://martinjc.com/2013/04/22/open-sauce-hackathon-post-mortem/
slug: open-sauce-hackathon-post-mortem
title: Open Sauce Hackathon - Post Mortem
wordpress_id: 863
categories:
- Coding
tags:
- coding
- development
- foursquare
- hackathon
- last.fm
---

This weekend saw the second '[Open Sauce Hackathon](http://www.cs.cf.ac.uk/hackathon/)' run by undergraduate students here in the school. Last years was pretty successful, and they improved upon it this year, pulling in many more sponsors and offering more prizes.

Unlike last year, when I turned up having already decided with Jon Quinn what we were doing, I went along this year with no real ideas. I had a desire to do something with a map, as I'm pretty sure building stuff connected to maps is going to play a big part in work over the next couple of months. Other than that though, I was at a bit of a loss. After playing around with some ideas and APIs I finally came up with my app: [dionysus](http://martinjc.com/dionysus/).

[![Dionysus Screenshot](http://martinjc.com/wp-content/uploads/2013/04/Screen-Shot-2013-04-22-at-11.37.57.png)](http://martinjc.com/wp-content/uploads/2013/04/Screen-Shot-2013-04-22-at-11.37.57.png)

It's a mobile friendly mapping app that shows you two important things: Where the pubs are (using venue data from [Foursquare](http://www.foursquare.com)) and where the gigs are at (using event data from [last.fm](http://www.last.fm)). If you sign in to either last.fm or Foursquare it will also pull in recommended bars and recommended gigs and highlight these for you.

The mapping is done using [leaflet.js](http://leafletjs.com/), which I found to be nicer and easier to use than Google Maps. The map tiles are based on [OpenStreetMap](http://www.openstreetmap.org/) data and come from [CloudMade](http://cloudmade.com/), while the (devastatingly beautiful) icons were rushed together by me over the weekend. The entire app is just client side Javascript and HTML, with HTML5 persistent localStorage used to maintain login authentication between sessions. It's a simple app, but I'm pretty pleased with it. In the end I even won a prize for it (£50), so it can't be too bad.

The app is hosted [here](http://martinjc.com/dionysus/), and the source code is available [here](https://github.com/martinjc/dionysus). Obviously though the code is not very pretty and quite hacky, but it does the job!
