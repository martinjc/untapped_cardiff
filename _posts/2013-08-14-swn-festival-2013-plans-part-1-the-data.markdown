---
author: martin
comments: true
date: 2013-08-14 12:38:53+00:00
layout: post
link: http://martinjc.com/2013/08/14/swn-festival-2013-plans-part-1-the-data/
slug: swn-festival-2013-plans-part-1-the-data
title: 'SWN Festival 2013 plans -  part 1: the data'
wordpress_id: 894
categories:
- Coding
- Music
tags:
- beautifulsoup
- coding
- data
- music
- python
- SWN
---

As [I mentioned](http://martinjc.com/2013/08/11/swn-festival-2013-plans/), I'm planning on doing a bit more development work this year connected to the [SWN Festival](http://www.swnfest.com). The first stage is to get hold of the data associated with the festival in an accessible and machine readable form so it can be used in other apps.

Unfortunately (but unsurprisingly), being a smallish local festival, there is no API for any of the data. So, getting a list of the bands and their info means we need to resort to web scraping. Fortunately, with a couple of lines of python and the BeautifulSoup library, getting the list of artists playing the festival is pretty straightforward:

    
    import urllib2
    import json
    
    from bs4 import BeautifulSoup
    root_page = "http://swnfest.com/"
    lineup_page = root_page + "lineup/"
    
    try:
        response = urllib2.urlopen(lineup_page)
    except urllib2.HTTPError, e:
        raise e
    except urllib2.URLError, e:
        raise e
    
    raw_data = response.read()
    
    soup = BeautifulSoup(raw_data)
    
    links = soup.select(".artist-listing h5 a")
    
    artists = {}
    
    for link in links:
        url = link.attrs["href"]
        artist = link.contents[0]
    
        artists[artist] = {}
        artists[artist]["swn_url"] = url


All we're doing here is loading the [lineup](http://swnfest.com/lineup/) page for the main festival website, using BeautifulSoup to find all the links to individual artist pages (which are in a div with a class of "artist-listing", each one in a h5 tag), then parsing these links to extract the artist name, and the url of their page on the festival website.

Each artist page on the website includes handy links to soundcloud, twitter, youtube etc (where these exist), and since I'm going to want to include these kinds of things in the apps I'm working on, I'll grab those too:

    
    for artist, data in artists.iteritems():
        try:
            response = urllib2.urlopen(data["swn_url"])
        except urllib2.HTTPError, e:
            raise e
        except urllib2.URLError, e:
            raise e
    
        raw_data = response.read()
    
        soup = BeautifulSoup(raw_data)
    
        links = soup.select(".outlinks li")
    
        for link in links:
             source_name = link.attrs["class"][0]
             source_url = link.findChild("a").attrs["href"]
             data[source_name] = source_url


This code iterates through the list of artists we just extracted from the lineup page, retrieves the relevant artist page, and parses it for the outgoing links, stored in list items in an unordered list with a class of 'outlinks'. Fortunately each link in this list has a class describing what type of link it is (facebook/twitter/soundcloud etc) so we can use the class as a key in our dictionary, with the link itself as an item. Later on once schedule information is included in the artist page we can add some code to parse stage-times and venues, but at the moment that data isn't present on the pages, so we can't extract it yet.

Finally we can just dump our artist data to json, and we have the information we need in an easily accessible format:

    
    with open("bands.json", "w") as outfile:
        json.dump(artists, outfile)


Now we have the basic data for each artist, we can go on to search for more information on other music sites. The nice thing about this script is that when the lineup gets updated, we can just re-run the code and capture all the new artists that have been added. I should also mention that all the code I'm using for this is available on [github](https://github.com/martinjc/swnScraper2013).
