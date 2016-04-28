---
author: martin
comments: true
date: 2011-04-04 13:36:44+00:00
layout: post
link: http://martinjc.com/2011/04/04/twitter-wordle/
slug: twitter-wordle
title: Twitter Wordle
wordpress_id: 79
categories:
- Coding
tags:
- coding
- development
- django
- python
- wordle
- work
---

Next week we have the project partners coming over to Cardiff for a workshop. Stu and myself were discussing that we should have some way to display information throughout the day, something that makes it easy to pick out the main themes of talks etc. I'm a big fan of the [Wordle](http://www.wordle.net/) as a way of displaying text, so we thought it would be nice if we could have a dynamic Wordle displayed that people could add to throughout the workshop.

I found a python library called [pyTagCloud](https://github.com/atizo/PyTagCloud) that will turn text into wordle-like tag clouds either as images or as html. As I [mentioned previously](http://users.cs.cf.ac.uk/M.J.Chorley/2011/03/28/fun-with-django/) I already have a django based project on the go which interfaces with twitter, so I already had code written that uses [Tweepy](https://github.com/joshthecoder/tweepy) to OAuth with twitter and do a search for keywords. Combining the two, I get an app that will continually search twitter for a given keyword, extract the text from all the tweets and display a wordle along with the latest tweets. People can contribute to the display by tweeting with a given hash tag, and as long as we search for that hash tag, their opinions and notes will be displayed.

For instance, here's the display running with one of today's trending topics: 'Alan Titchmarsh':

[![](http://martinchorley.com/wp-content/uploads/2011/04/tweets12-300x182.png)](http://martinchorley.com/wp-content/uploads/2011/04/tweets12.png)

It's not entirely perfect, I need to do some more filtering on the text to remove some words that aren't removed by the stop word filtering that pyTagCloud does such as 'rt', 'http', 'bit', 'ly' and so on. It would also be good to remove things that aren't words, like 'xxxxxx'. I've been looking at the [Natural Language Toolkit](http://www.nltk.org/) for a couple of days for the other project, so I'll probably re-use some of that code here too.

The only problem now is that I'm probably going to be the only person at the workshop tweeting...
