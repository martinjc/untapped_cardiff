---
author: martin
comments: true
date: 2012-05-18 12:47:18+00:00
layout: post
link: http://martinjc.com/2012/05/18/tweetcues-twitter-experiment/
slug: tweetcues-twitter-experiment
title: TweetCues Twitter Experiment
wordpress_id: 607
categories:
- Coding
- Research
- WorkDiary
---

As I mentioned in the last post, our Twitter Experiment (called [TweetCues](http://www.cs.cf.ac.uk/recognition/twitterexp/)) is now live. Just this morning I updated it to version 2.0 to begin collection of data for a journal paper, assuming of course that our conference paper on the initial findings gets accepted somewhere.

[caption id="attachment_611" align="alignright" width="300" caption="TweetCues Homepage"][![TweetCues Homepage](http://martinjc.com/wp-content/uploads/2012/05/exp11-300x199.png)](http://martinjc.com/wp-content/uploads/2012/05/exp11.png)[/caption]

This has been an interesting project that has taken quite a long while to come to fruition. Stuart had the idea for the experiment way back at the beginning of the Recognition project - in fact the initial project document is dated from March 2011. We thought it would be a good quick easy win for the start of the project, and would get us a publication very quickly - how wrong we were.

The reasons for it taking so long to get off the ground are many. Firstly, there's the event we don't talk about from last April. We were also distracted by a couple of other conference papers that needed writing, and then a new idea for the next experiment that became quite distracting. There was also the small matter of closing the SocialNets project and getting the Recognition project off the ground in the first year deliverables. However, in the background this project has always been ticking along.

I actually started implementing the experiment in August and once I got going it was pretty quick. I used Django for the site, so development was quick and easy, and my git logs show a commit from the beginning of September with the message "_basically got everything working_". It didn't go live then, and was actually a very different experiment. There was a lot of concern over comparing tweets and showing the content - we wanted to remove the actual content of the tweet from the decision making as much as possible, so I was doing a lot of tweet analysis using AlchemyAPI to try and match tweets so they were as close as possible in terms of topics or keywords. This rarely worked. Between August and December I spent time bug fixing and attempting to improve the tweet matching, but it wasn't really happening.

Then in December we find a git commit message: "_removed all the old code to start to create new version post meeting with Marc Buehner_". We decided at some point that as we're scientists that don't generally do people-based experiments it would be good to get some feedback from someone that does, so in December 2011 we met with Marc Buehner from the School of Psychology for a meeting that produced a lot of useful ideas for strengthening the experiment, but that meant it would be easier to rewrite from scratch than to hack around at the edges of the application. It was at this meeting that we came up with the ultimate solution for removing the content of the tweet from the decision making process: _don't show the content_. How it took us that long to come up with this solution I will never know.

By January the experiment was "_pretty much totally working_" according to my git commits, so the re-implementation did not take too long. Working out deployment onto the school web server took a little while, but eventually it was done, we went live, and collected our initial data. The findings are pretty interesting, (which will be covered in another post) but the analysis of this data revealed that we could actually do with collecting a little more information about the user interaction with the experiment - hence v2.0 going live this morning.
