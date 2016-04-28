---
author: martin
comments: true
date: 2012-02-27 09:20:01+00:00
layout: post
link: http://martinjc.com/2012/02/27/django-last-fm-authentication/
slug: django-last-fm-authentication
title: Django + Last.FM Authentication
wordpress_id: 553
categories:
- Coding
tags:
- coding
- django
- last.fm
- python
---

Following a conversation with [Jon](http://www.cs.cf.ac.uk/contactsandpeople/staffpage.php?emailname=J.A.Quinn) last week, I've been having thoughts about playing around with Last.FM data again, having not looked at that [API](http://www.last.fm/api/intro) for a couple of years. We had discussed the possibility of using the Last.FM web services as part of a project at a [hackathon](http://www.cs.cf.ac.uk/hackathon/) that some of the undergraduates are running in a couple of weeks time, and since I've moved from primarily developing using Java to mainly using Python since I last did anything with Last.FM I thought it would be useful to develop some basic python examples using the Last.FM API.

Yesterday I made a basic skeleton Django site that uses Last.FM for user authentication and includes a basic API wrapper for making queries. The code is all up on [github](https://github.com/martinjc/djangoLastFMAuth) for those that are interested.
