---
author: martin
comments: true
date: 2015-02-05 11:02:36+00:00
layout: post
link: http://martinjc.com/2015/02/05/accessing-and-scraping-myfitnesspal-data-with-python/
slug: accessing-and-scraping-myfitnesspal-data-with-python
title: Accessing and Scraping MyFitnessPal Data with Python
wordpress_id: 1254
categories:
- Coding
tags:
- coding
- data
- health
- lifelogging
- mfp
- python
---

Interesting news this morning that MyFitnessPal has been bought by Under Armour for  $475 million. I've used MFP for many years now, and it was pretty helpful in helping me lose all the excess PhD weight that I'd put on, and then maintaining a healthy(ish) lifestyle since 2010.

News of an acquisition always has me slightly worried though - not for someone else having access to my data, as I've made my peace with the fact that using a free service generally means that it's me that's being sold. Giving away my data is the cost of doing business. Rather, it worries me that I may lose access to all the data I've collected. I have no idea what Under Armour intend for the service in the long run, and while its likely that MFP will continue with business as usual for the foreseeable, it's always worth having a backup of your data.

[A few years ago, I wrote a couple of python scripts](http://martinjc.com/2011/06/09/logging-in-to-websites-with-python/) to back up data from MFP and then extract the food and exercise info from the raw HTML. These scripts use Python and Beautiful Soup to do a login to MFP, then go back through your diary history and save all the raw HTML pages, essentially scraping your data.

I came to run them this morning and found they needed a couple of changes to deal with site updates. I've made the necessary updates and the full code for all the scripts is [available on GitHub](https://github.com/martinjc/mfp-scraper). It's not great, but it works. The code is Python 2 and requires BeautifulSoup and Matplotlib (if you want to use generate_plots.py).
