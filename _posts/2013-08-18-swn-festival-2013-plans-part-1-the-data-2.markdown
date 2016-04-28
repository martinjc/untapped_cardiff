---
author: martin
comments: true
date: 2013-08-18 11:36:21+00:00
layout: post
link: http://martinjc.com/2013/08/18/swn-festival-2013-plans-part-1-the-data-2/
slug: swn-festival-2013-plans-part-1-the-data-2
title: 'SWN Festival 2013 plans – part 1: the data (2!)'
wordpress_id: 898
categories:
- Coding
- Music
tags:
- api
- coding
- data
- python
- scraping
- SWN
---

In the previous post, I used python and BeautifulSoup to grab the list of artists appearing at [SWN Festival 2013](http://www.swnfest.com), and to scrape their associated soundcloud/twitter/facebook/youtube links (where available).

However, there are more places to find music online than just those listed on the festival site, and some of those extra sources include additional data that I want to collect, so now we need to search these other sources for the artists. Firstly, we need to load the artist data we previously extracted from the festival website, and iterate through the list of artists one by one:

    
    artists = {}
    with open("bands.json") as infile:
        artists = json.load(infile)
    
    for artist, artist_data in artists.iteritems():


The first thing I want to do for each artist it to search Spotify to see if they have any music available there. Spotify has a simple web [API](https://developer.spotify.com/technologies/web-api/) for searching which is pretty straightforward to use:

    
    params = {
        "q" : "artist:" + artist.encode("utf-8")
    }
    
    spotify_root_url = "http://ws.spotify.com/search/1/artist.json"
    spotify_url = "%s?%s" % (spotify_root_url, urllib.urlencode(params))
    
    data = retrieve_json_data(spotify_url)
    
    if data.get("artists", None) is not None:
        if len(data["artists"]) > 0:
            artist_id = data["artists"][0]["href"].lstrip("spotify:artist:")
            artist_data["spotify_id"] = data["artists"][0]["href"]
            artist_data["spotify_url"] = "http://open.spotify.com/artist/" + artist_id


The 'retrieve_json_data' function is just a wrapper to call a URL and parse the returned JSON data:

    
    def retrieve_json_data(url):
    
        try:
            response = urllib2.urlopen(url)
        except urllib2.HTTPError, e:
            raise e
        except urllib2.URLError, e:
            raise e
    
        raw_data = response.read()
        data = json.loads(raw_data)
    
        return data


Once I've searched Spotify, I then want to see if the artist has a page on Last.FM. If they do, I also want to extract and store their top-tags from the site. Again, the Last.FM API makes this straightforward. Firstly, searching for the artist page:

    
    params = {
        "artist": artist.encode("utf-8"),
        "api_key": last_fm_api_key,
        "method": "artist.getinfo",
        "format": "json"
    }
    
    last_fm_url = "http://ws.audioscrobbler.com/2.0/?" + urllib.urlencode(params)
    
    data = retrieve_json_data(last_fm_url)
    
    if data.get("artist", None) is not None:
        if data["artist"].get("url", None) is not None:
            artist_data["last_fm_url"] = data["artist"]["url"]


Then, searching for the artist's top tags:

    
    params = {
        "artist": artist.encode("utf-8"),
        "api_key": last_fm_api_key,
        "method": "artist.gettoptags",
        "format": "json"
    }
    
    last_fm_url = "http://ws.audioscrobbler.com/2.0/?" + urllib.urlencode(params)
    
    data = retrieve_json_data(last_fm_url)
    
    if data.get("toptags", None) is not None:
    
        artist_data["tags"] = {}
    
        if data["toptags"].get("tag", None) is not None:
            tags = data["toptags"]["tag"]
            if type(tags) == type([]):
                for tag in tags:
                    name = tag["name"].encode('utf-8')
                    count = 1 if int(tag["count"]) == 0 else int(tag["count"])
                    artist_data["tags"][name] = count
                else:
                    name = tags["name"].encode('utf-8')
                    count = 1 if int(tags["count"]) == 0 else int(tags["count"])
                    artist_data["tags"][name] = count


Again, once we've retrieved all the extra artist data, we can dump it to file:

    
    with open("bands.json", "w") as outfile:
        json.dump(artists, outfile)


So, I now have 2 scripts that I can run regularly to capture any updates to the festival website (including lineup additions) and to search for artist data on Spotify and Last.FM. Now I've got all this data captured and stored, it's time to start doing something interesting with it...
