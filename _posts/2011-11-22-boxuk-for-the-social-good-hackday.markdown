---
author: martin
comments: true
date: 2011-11-22 10:51:04+00:00
layout: post
link: http://martinjc.com/2011/11/22/boxuk-for-the-social-good-hackday/
slug: boxuk-for-the-social-good-hackday
title: BoxUK "For the Social Good" Hackday
wordpress_id: 498
categories:
- Coding
- Research
tags:
- coding
- data
- development
- django
- hackday
- web
---

Yesterday I attended the "[For the Social Good](http://hackday.boxuk.com/)" hackday, organised by [BoxUK](http://www.boxuk.com/) and held at the Students Union at Cardiff University. As you may have gathered from the title, it was a hackday themed around creating apps that had some benefit to society. The event ran from 10am to 10pm, so it was a fairly short hack event [compared to some](http://martinjc.com/2011/09/14/foursquare-hackathon/), which had a big influence on what could be done during the time available. In total, given the time needed for introductions and getting started in the morning, then for presentations and judging at the end of the day there was only actually about nine and a half hours of coding time, so it was quite a tough day. I went along with [Matt Williams](http://www.twitter.com/voxmjw) and [Mark Greenwood](http://www.twitter.com/whitehankey) as our team and over the course of the day we managed to put together a fairly functional web app.

We took [what we learnt](http://martinjc.com/2011/11/22/foursquare-hackathon-post-mortem/) from hosting and participating in the Foursquare hackathon and used that to guide what we did at this hackday. At the last event we had been slow to get going, took too long to form a team and decide upon an idea. We had aimed too high to begin with, and then also let feature creep affect what we wanted to build. Finally, our teams were far too big, meaning it was hard to divide labour up so that everyone was participating and had something to do. We finished with a working app at the end of the event, but we were determined not to make the same mistakes this time so we could get a more successful outcome. (Not that FourCrawl wasn't a successful outcome of course, but more on that in the next couple of weeks.)

Going in to this hackday we solved the team size problem naturally, as there were only three of us able to attend which made forming a small team compulsory! To try and get a good start on the day of the event we met together on the Wednesday before to have a think about ideas and a bit of a brainstorming session. While we had a lot of ideas, most of them were too complex for a short day long hack event, so unfortunately we didn't really come up with anything. We did have a vague idea of doing something related to cold weather though, to make whatever 'it' was topical, given that we're heading into winter now. Fortunately at least one of us (not me) had obviously been thinking about it further after the meeting and on Saturday evening Matt sent round a message on G+ that he'd found a good data set we could use for an app that would be both easy to code within the time limit, and would hit the brief for the hackday pretty well. He'd found a dataset on [data.gov.uk](http://data.gov.uk/) related to [road accidents](http://data.gov.uk/dataset/road-accidents-safety-data) that included information on weather and road surface conditions that we could use to show people where to avoid in icy weather, or to give them an idea of previous incidents in their area. With an idea starting to form we went into Sunday in a pretty good state, and ready to start coding very quickly.

The day started well, everyone arrived pretty much on time, which made for a quick start. Our app idea solidified easily, and early on we realised that while we had historical data to display it would also be nice to have some current updates, so we added a social element to the idea, by scraping twitter for a certain hashtag so that people could report problems with icy roads in their area, along the lines of the '#uksnow' hashtag that has been used frequently the last couple of winters. We were able to jump in quickly to start getting things built. Matt was in charge of getting the data into a database and building an api to query to retrieve it, using django to get a backend up and running quickly. I was in charge of building a front end map to display the data on, primarily working with HTML and javascript (and the Google Maps API obviously) and then Mark was in charge of getting the twitter scraping and postcode geo-locating working using python (so it could be slotted into the django backend), accessing the twitter API through [tweepy](http://tweepy.github.com/).

Things went really well with the implementation, I spent a while cannibalising elements from previous sites to get a frontend up and running quickly (and also thank you [bootstrap](http://twitter.github.com/bootstrap/)!) and by lunch we were pretty close to starting to consolidate things together. We set a target of starting to deploy by 6, so that by the time dinner was served Matt was starting to battle his server and its stubborn refusal to allow easy deployment of django apps. Things went so smoothly in fact that we were all finished and ready with almost an hour to spare, meaning we were the only team able to slope off for a self-congratulatory pint before the presentations and judging. We headed to the Taf (a place I hadn't been in at least five years) for a swift one, then went back to the hackday for the final presentations.

Our presentation was first, and Matt demoed the app well while I played around on the laptop next to him. After us the rest of the teams went, and there were some really good apps shown off. My particular favourite was the '[occupy where](http://occupywhere.herokuapp.com/)' app which allowed you to search for an 'occupy' camp or demo near a location, then presented information pulled in from multiple sources about that particular 'occupy' movement. A nice idea, well executed. Following the presentations the judges spent some time talking, then announced the winners. The surprise of the day was that they'd decided our app was the best and that we'd won! I was pretty shocked, but it was a very nice surprise. A group of first years from COMSC were runners up, and then a third year COMSC student ([Tom Hancocks](http://www.twitter.com/TomJHancocks)) won the best individual developer prize, so COMSC actually walked away with all the prizes! After a quick tear down of the venue it was time to head to the Taf for some celebratory drinks, a satisfying end to a really great day.

[gallery link="file" orderby="ID"]

**UPDATE 25/11/11:**

There some excellent other write ups by various other people involved in the event below. I'll add to this list as and when I find any more:

[http://www.boxuk.com/news/box-uks-public-hacking-event-a-resounding-success](http://www.boxuk.com/news/box-uks-public-hacking-event-a-resounding-success)

[http://johngreenaway.co.uk/hack-day-for-the-social-good](http://johngreenaway.co.uk/hack-day-for-the-social-good)

[http://marvelley.com/2011/11/24/for-the-social-good-box-uk-hackday-1-recap/](http://marvelley.com/2011/11/24/for-the-social-good-box-uk-hackday-1-recap/)

[http://whitehandkerchief.co.uk/blog/?p=53](http://whitehandkerchief.co.uk/blog/?p=53)

[http://www.cs.cf.ac.uk/newsandevents/hackday.html](http://www.cs.cf.ac.uk/newsandevents/hackday.html)

[http://www.cardiff.ac.uk/news/articles/diwrnod-hacio-7933.html](http://www.cardiff.ac.uk/news/articles/diwrnod-hacio-7933.html)

[http://www.boxuk.com/blog/the-box-uk-hack-day-a-review ](http://www.boxuk.com/blog/the-box-uk-hack-day-a-review )
