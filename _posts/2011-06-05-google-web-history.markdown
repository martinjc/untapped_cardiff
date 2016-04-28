---
author: martin
comments: true
date: 2011-06-05 22:57:04+00:00
layout: post
link: http://martinjc.com/2011/06/05/google-web-history/
slug: google-web-history
title: How to access and download your Google Web History with wget
wordpress_id: 219
categories:
- Coding
tags:
- cli
- data
- google
---

[Google Web History](https://www.google.com/history/) has now been recording all of the searches I made in Google since about 2005. Obviously 6 years of search queries and results is a phenomenal amount of data, and it would be nice to get hold of it all to see what I could make of it. Fortunately Google make the data available as an RSS feed, although it's not particularly well [documented](http://www.google.com/support/accounts/bin/answer.py?hl=en&answer=54464).

(caution - many 'ifs' coming up next)

If you're logged into your Google account the rss feed can be accessed at:

    
    https://www.google.com/history/?q=&output=rss&num=NUM&start=START


If you're using a *nix based operating system (Linux, Mac OS X etc) you can then use wget on the command line to get the data. The below example works for retrieving the 1000 most recent searches in your history:

    
    wget --user=GOOGLE_USERNAME  \
    --password=PASSWORD --no-check-certificate \
    "https://www.google.com/history/?q=&output=rss&num=1000&start=0"


If you've enabled 2-factor authentication on your google account you'll need to add an [app-specific](https://www.google.com/accounts/IssuedAuthSubTokens) password for wget so it can access your account - the password in the example above should be this app-specific password, not your main account password. If you haven't enabled 2 factor authentication then you might be able to use your normal account password, but I haven't tested this.

A simple bash script will then allow you to download the entire search history:
[code lang="bash"]
for START in 0 1000 2000 3000 ... 50000  
do   
 wget --user=GOOGLE_USERNAME \
  --password=WGET_APP_SPECIFIC_PASSWORD --no-check-certificate \
  "https://www.google.com/history/?output=rss&amp;num=1000&amp;start=$START"
done
[/code]
You may need to adjust the numbers in the first line - I had to go up to 50000 to get my entire search history back to 2005, you may need to make fewer calls if your history is shorter, or more if its longer.
