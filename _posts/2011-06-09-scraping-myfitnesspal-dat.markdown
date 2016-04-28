---
author: martin
comments: true
date: 2011-06-09 08:07:33+00:00
layout: post
link: http://martinjc.com/2011/06/09/scraping-myfitnesspal-dat/
slug: scraping-myfitnesspal-dat
title: Scraping data from MyFitnessPal with python
wordpress_id: 244
categories:
- Coding
tags:
- coding
- diet
- web
---

Following my [success](http://users.cs.cf.ac.uk/M.J.Chorley/2011/06/07/web-search-wordle/) with [extracting](http://users.cs.cf.ac.uk/M.J.Chorley/2011/06/05/google-web-history/) my Google Search History in a simple manner, I've decided that I should do something similar to extract all the data I've been feeding into [myfitnesspal](http://www.myfitnesspal.com) for the last 5 months. As I briefly mentioned in the [review of the app + website](http://users.cs.cf.ac.uk/M.J.Chorley/2011/06/07/reviewmfp/), the progress graphs leave a lot to be desired and there's very little in the way of analysis of the data. I have a lot of questions about my progress and there is no easy way to answer all of them using just the website. For instance, what is my average sugar intake? Is this more or less than my target intake? How does my weekend nutrition compare to my weekday nutrition? How much beer have I drunk since starting to log all my food?

Unfortunately there isn't an API for the website yet, so I'm going to need to resort to screen scraping to extract it all. This should be pretty easy using the [BeautifulSoup](http://www.crummy.com/software/BeautifulSoup/) python library, but first I need to get access to the data. My food diary isn't public, so I need to be logged in to get access to it. This means my scraping script needs to pretend to be a web browser and log me in to the website in order to access the pages I need.

I initially toyed with the idea of reading cookies from the web browser sqlite cookie database, but this is overly complex. It's actually much easier just using python to do the login as a POST request and to store any cookies received back from that. Fortunately I'm not the first person to try and do this, so there's [plenty](http://stackoverflow.com/questions/2954381/python-form-post-using-urllib2-also-question-on-saving-using-cookies) of [examples](http://stackoverflow.com/questions/301924/python-urllib-urllib2-httplib-confusion) on [StackOverflow](http://www.stackoverflow.com) of how to do it. I'll post my own solution once it's done.
