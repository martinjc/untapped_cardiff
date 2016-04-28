---
author: martin
comments: true
date: 2013-10-25 09:02:51+00:00
layout: post
link: http://martinjc.com/2013/10/25/python-oauth/
slug: python-oauth
title: Python + OAuth
wordpress_id: 951
categories:
- Coding
- Research
tags:
- api
- coding
- fitbit
- oauth
- python
- web service
---

As part of a current project I had the misfortune of having to to deal with a bunch of OAuth authenticated web services using a command line script in Python. Usually this isn't really a problem as most decent client libraries for services such as [Twitter](https://github.com/tweepy/tweepy) or [Foursquare](https://pypi.python.org/pypi/foursquare) can handle the authentication requests themselves, usually wrapping their own internal OAuth implementation. However, when it comes to web services that don't have existing python client libraries, you have to do the implementation yourself. Unfortunately support for OAuth in Python is a mess, so this is not the most pleasant of tasks, especially when most stackoverflow [posts](http://stackoverflow.com/questions/12628246/how-to-send-oauth-request-with-python-oauth2) [on](http://stackoverflow.com/questions/15610749/github-api-v3-access-via-python-oauth2-library-redirect-issue) [the](http://stackoverflow.com/questions/1666415/python-oauth-library) topic point to massively [outdated](http://code.daaku.org/python-oauth/) and [unmaintained](https://github.com/simplegeo/python-oauth2) Python libraries.

Fortunately after some digging around, I was able to find a nice, well maintained and [fairly well documented](https://rauth.readthedocs.org/en/latest/) solution: [rauth](https://github.com/litl/rauth), which is very clean and easy to use. As an example, I was trying to connect to the Fitbit API, and it really was as simple as following their example.

Firstly, we create an OAuth1Service:

    
    import rauth
    from _credentials import consumer_key, consumer_secret
    
    base_url = "https://api.fitbit.com"
    request_token_url = base_url + "/oauth/request_token"
    access_token_url = base_url + "/oauth/access_token"
    authorize_url = "http://www.fitbit.com/oauth/authorize"
    
    fitbit = rauth.OAuth1Service(
     name="fitbit",
     consumer_key=consumer_key,
     consumer_secret=consumer_secret,
     request_token_url=request_token_url,
     access_token_url=access_token_url,
     authorize_url=authorize_url,
     base_url=base_url)


Then we get the temporary request token credentials:

    
    
    request_token, request_token_secret = fitbit.get_request_token()
    
    print " request_token = %s" % request_token
    print " request_token_secret = %s" % request_token_secret
    print


We then ask the user to authorise our application, and give us the PIN so we can prove to the service that they authorised us:

    
    authorize_url = fitbit.get_authorize_url(request_token)
    
    print "Go to the following page in your browser: " + authorize_url
    print
    
    accepted = 'n'
    while accepted.lower() == 'n':
     accepted = raw_input('Have you authorized me? (y/n) ')
    pin = raw_input('Enter PIN from browser ')


Finally, we can create an authenticated session and access user data from the service:

    
    session = fitbit.get_auth_session(request_token,
     request_token_secret,
     method="POST",
     data={'oauth_verifier': pin})
    
    print ""
    print " access_token = %s" % session.access_token
    print " access_token_secret = %s" % session.access_token_secret
    print ""
    
    url = base_url + "/1/" + "user/-/profile.json"
    
    r = session.get(url, params={}, header_auth=True)
    print r.json()


It really is that easy to perform a 3-legged OAuth authentication on the command line. If you're only interested in data from 1 user, and you want to run the app multiple times, once you have the access token and secret, there's nothing to stop you just storing those and re-creating your session each time without having to re-authenticate (assuming the service does not expire access tokens):

    
    base_url = "https://api.fitbit.com/"
    api_version = "1/"
    token = (fitbit_oauth_token, fitbit_oauth_secret)
    consumer = (fitbit_consumer_key, fitbit_consumer_secret)
    
    session = rauth.OAuth1Session(consumer[0], consumer[1], token[0], token[1])
    url = base_url + api_version + "user/-/profile.json"
    r = session.get(url, params={}, header_auth=True)
    print r.json()


So there we have it. Simple OAuth authentication on the command line, in Python. As always, the code is available on [github](https://github.com/martinjc/rauth---fitbit-example) if you're interested.
