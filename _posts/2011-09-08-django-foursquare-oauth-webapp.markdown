---
author: martin
comments: true
date: 2011-09-08 17:36:13+00:00
layout: post
link: http://martinjc.com/2011/09/08/django-foursquare-oauth-webapp/
slug: django-foursquare-oauth-webapp
title: Django + Foursquare + OAuth = webapp?
wordpress_id: 416
categories:
- Coding
- Research
tags:
- django
- foursquare
- python
---

Moving on from my fun with getting django + twitter + oauth to play nicely, it's now time to start writing a web app that uses foursquare as the authentication/login method. As part of this, I need a basic django framework for doing authentication with foursquare. This may be useful to someone else at some point (including me when I forget in three months time how I did things), so I've written up the details and added the code to [github](https://github.com/martinjc/DjangoFoursq).

Firstly, you need to [register an application](https://foursquare.com/oauth/) with Foursquare to get your Client ID and Client Secret. You can enter any name and website you want, but the callback url needs to be our local development machine (assuming that's where you're doing the development), and to be the callback url that we're going to specify in a minute:

[caption id="attachment_418" align="alignnone" width="300" caption="Form to register an application with Foursquare"][![Form to register an application](http://martinjc.com/wp-content/uploads/2011/09/Foursquare-Register-300x174.jpg)](http://martinjc.com/wp-content/uploads/2011/09/Foursquare-Register.jpg)[/caption]

The more observant will notice that the callback url is currently http://127.0.0.1/foursq_auth/callback/, but that the django web server actually runs on port 8000, so the url really needs to be http://127.0.0.1:8000/foursq_auth/callback/. Unfortunately the form validation doesn't allow you to use a ':' in your callback url. However, once the consumer is registered you can edit the callback url, and the form for that doesn't validate the url (or does but doesn't moan about the colon). Eventually, you are looking for the consumer to be registered with a callback url like this:

[![](http://martinjc.com/wp-content/uploads/2011/09/CapturFiles-300x51.jpg)](http://martinjc.com/wp-content/uploads/2011/09/CapturFiles.jpg)

Once that is registered, we can get on with writing the code. The basic premise is pretty simple, we need just five urls in our django app, five views to go with them, and two basic html pages, one for login, and one to show we are logged in. Assuming you have a django project started (for reference the one I'm using here is called 'Dj4sq') we can start by creating our foursquare app:

    
    django-admin.py startapp foursq_auth


We then want to edit urls.py for our main django project to allow the new app to handle its own views:
[code lang="py"]
urlpatterns = patterns('',
    (r'^foursq_auth/', include('Dj4sq.foursq_auth.urls')),
)
[/code]
and create and edit a file urls.py in the foursq_auth app with the five views we want:
[code lang="py"]
    urlpatterns = patterns('foursq_auth.views',
    # main page redirects to start or login
    url(r'^$', view=main, name='main'),
    # receive OAuth token from 4sq
    url(r'^callback/$', view=callback, name='oauth_return'),
    # logout from the app
    url(r'^logout/$', view=unauth, name='oauth_unauth'),
    # authenticate with 4sq using OAuth
    url(r'^auth/$', view=auth, name='oauth_auth'),
    # main page once logged in
    url( r'^done/$', view=done, name='oauth_done' ),
)
[/code]
We then need our two basic html pages login.html and done.html:
[code lang="html"]
<html>
    <head>
        <title>Foursquare OAuth Example</title>
    </head>
    <body>
    <div id="login">
        <p>Sign in with Foursquare to begin.</p>
        <p><a href="auth/">Login</a></p>
    </div>
    </body>
</html>
<html>
    <head>
        <title>Foursquare OAuth Example</title>
    </head>
    <body>
        <p>Hi {{ name }}, you've successfully logged in! </p>
	<a href="../logout/">Logout</a>
    </body>
</html>
[/code]
All that's left after that is to write the views to tie it all together. We need a few variables defined for our code to work:
[code lang="py"]
CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

request_token_url = 'https://foursquare.com/oauth2/authenticate'
access_token_url = 'https://foursquare.com/oauth2/access_token'
redirect_url = 'http://127.0.0.1:8000/foursq_auth/callback'
[/code]
We can then write the views. The first one, 'main' is super easy, as it only needs to return our login page:
[code lang="py"]
def main( request ):
    return render_to_response( 'foursq_auth/login.html' )
[/code]
The second, 'auth', is the first step in our authentication process, requesting an authorisation code from foursquare and redirecting the user to the page to authorise our app:
[code lang="py"]
def auth( request ):
    # build the url to request
    params = {'client_id' : CLIENT_ID,
            'response_type' : 'code',
            'redirect_uri' : redirect_url }
    data = urllib.urlencode( params )
    # redirect the user to the url to confirm access for the app
    return HttpResponseRedirect('%s?%s' % (request_token_url, data))
[/code]
If the user accepts our app, they'll be re-directed to our callback url, and an authorisation code will be passed back as one of the parameters of the url, so the next view, 'callback' needs to deal with this. It then needs to post a request to foursquare with the authorisation code in order to receive the access_token for the user:
[code lang="py"]
    # get the code returned from foursquare
    code = request.GET.get('code')

    # build the url to request the access_token
    params = { 'client_id' : CLIENT_ID,
               'client_secret' : CLIENT_SECRET,
               'grant_type' : 'authorization_code',
               'redirect_uri' : redirect_url,
               'code' : code}
    data = urllib.urlencode( params )
    req = urllib2.Request( access_token_url, data )

    # request the access_token
    response = urllib2.urlopen( req )
    access_token = json.loads( response.read( ) )
    access_token = access_token['access_token']

    # store the access_token for later use
    request.session['access_token'] = access_token

    # redirect the user to show we're done
    return HttpResponseRedirect(reverse( 'oauth_done' ) )
[/code]
If we've got the access token, we're all set. From now on we can make any calls to the Foursquare API that require authorisation, as long as we supply this token as a parameter to the request named 'oauth_token'. To prove that we're logged in, we'll re-direct the user at the end of the callback to a 'done' page, which will display some user details:
[code lang="py"]
def done( request ):
    # get the access_token
    access_token = request.session.get('access_token')

    # request user details from foursquare
    params = { 'oauth_token' : access_token }
    data = urllib.urlencode( params )
    url = 'https://api.foursquare.com/v2/users/self'
    full_url = url + '?' + data
    print full_url
    response = urllib2.urlopen( full_url )
    response = response.read( )
    user = json.loads( response )['response']['user']
    name = user['firstName']

    # show the page with the user's name to show they've logged in
    return render_to_response('foursq_auth/done.html', {'name':name})
[/code]
And with that, we're all done. We can fire up the django server with:

    
    python manage.py runserver


open our browser to 127.0.0.1:8000/foursq_auth/ and go through the login process:

[caption id="attachment_420" align="alignnone" width="300" caption="Login page for our app"][![](http://martinjc.com/wp-content/uploads/2011/09/login-html-300x189.jpg)](http://martinjc.com/wp-content/uploads/2011/09/login-html.jpg)[/caption]

[caption id="attachment_427" align="alignnone" width="300" caption="Approving the app at Foursquare"][![](http://martinjc.com/wp-content/uploads/2011/09/foursquare-approval1-300x185.jpg)](http://martinjc.com/wp-content/uploads/2011/09/foursquare-approval1.jpg)[/caption]

[caption id="attachment_422" align="alignnone" width="300" caption="Successfully logged in"][![](http://martinjc.com/wp-content/uploads/2011/09/done-html-300x189.jpg)](http://martinjc.com/wp-content/uploads/2011/09/done-html.jpg)[/caption]

And that's that - A Django web app doing OAuth authentication with Foursquare. The full code is up on [github](https://github.com/martinjc/DjangoFoursq) if you want to take a closer look.
