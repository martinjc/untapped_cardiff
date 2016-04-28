---
author: martin
comments: true
date: 2011-06-09 14:58:03+00:00
layout: post
link: http://martinjc.com/2011/06/09/logging-in-to-websites-with-python/
slug: logging-in-to-websites-with-python
title: Logging in to websites with python
wordpress_id: 255
categories:
- Coding
tags:
- coding
- data
- python
---

As [previously explained](http://users.cs.cf.ac.uk/M.J.Chorley/2011/06/09/scraping-myfitnesspal-dat/), I needed a python script to login to a website so I could access data. There's loads of examples out on the web of how to do this, my solution (mashed together from many examples) is described below. For the whole script, jump to the end.

Firstly, we need to set some simple variables about the website we're trying to log in to. Obviously, I'm trying to login to myfitnesspal, but this process should work with most websites that use a simple form + cookie based login process. We need to set the url we are trying to access, where to post the login information to, and a file to store cookies in:
[code lang="py"]
# url for website        
base_url = 'http://www.myfitnesspal.com'       
# login action we want to post data to       
login_action = '/account/login'       
# file for storing cookies       
cookie_file = 'mfp.cookies'
[/code]
Then we need to setup our cookie storage, and url opener. We want the opener to be able to handle cookies and redirects:
[code lang="py"]
import urllib, urllib2
import cookielib

# set up a cookie jar to store cookies
cj = cookielib.MozillaCookieJar(cookie_file)

# set up opener to handle cookies, redirects etc
self.opener = urllib2.build_opener(
     urllib2.HTTPRedirectHandler(),
     urllib2.HTTPHandler(debuglevel=0),
     urllib2.HTTPSHandler(debuglevel=0),            
     urllib2.HTTPCookieProcessor(cj)
)
# pretend we're a web browser and not a python script
opener.addheaders = [('User-agent',
    ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) '
     'AppleWebKit/535.1 (KHTML, like Gecko) '
     'Chrome/13.0.782.13 Safari/535.1'))
]
[/code]
Next we need to open the front page of the website once to set any initial tracking cookies:
[code lang="py"]
# open the front page of the website to set
# and save initial cookies
response = opener.open(base_url)
cj.save()</pre>
Then finally we can call the login action with our username and password and login to the website:
<pre># parameters for login action
login_data = urllib.urlencode({
    'username' : 'my_username',
    'password' : 'my_password',
    'remember_me' : True
})
# construct the url
login_url = base_url + login_action
# then open it
response = opener.open(login_url, login_data)
# save the cookies and return the response       
cj.save()
[/code]
The parameters for the POST request (and the action to POST to) can usually be found by examining the source of the login page.

There you have it - you should now be logged into the website and can access any pages that the logged in user can normally access through a web browser. Any calls using the 'opener' created above will present the right cookies for the logged in user. The cookies are saved to file, so next time you run the script you can check for cookies, try and use them, and only re-login if that doesn't work.

My full version is [attached](http://martinchorley.com/wp-content/uploads/2011/06/web_login.py_2.txt) to this post, it's under a [CC-BY-SA](http://creativecommons.org/licenses/by-sa/3.0/) license, so feel free to use it for whatever.

Quite how this will cope when websites catch up to the new EU cookie legislation is anyone's guess. My guess is it won't.
