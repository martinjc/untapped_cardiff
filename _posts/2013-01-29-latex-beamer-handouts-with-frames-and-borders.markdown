---
author: martin
comments: true
date: 2013-01-29 09:46:45+00:00
layout: post
link: http://martinjc.com/2013/01/29/latex-beamer-handouts-with-frames-and-borders/
slug: latex-beamer-handouts-with-frames-and-borders
title: LaTeX beamer handouts (with frames and borders)
wordpress_id: 780
categories:
- Coding
- Teaching
tags:
- beamer
- border
- coding
- development
- frame
- latex
---

I'm working on some notes for a beginners LaTeX course that I'm giving for the University Graduate College this week. In a temporary fit of insanity I decided it would be nice to write all the slides in LaTeX, so that I can distribute the source to the students so they get some real world LaTeX examples to go along with the course notes.

I was attempting to make handouts for the students using the great [handoutWithNotes](http://www.guidodiepen.nl/2009/07/creating-latex-beamer-handouts-with-notes/) package. However, as my slides are white, they looked a bit odd on a page without a frame around them:


[![Slides without border](http://martinjc.com/wp-content/uploads/2013/01/Screen-Shot-2013-01-29-at-09.40.18.png)](http://martinjc.com/wp-content/uploads/2013/01/Screen-Shot-2013-01-29-at-09.40.18.png)


I wanted to add a border to make the handouts look better, but there were no suggestions at the [site I got the package from](http://www.guidodiepen.nl/2009/07/creating-latex-beamer-handouts-with-notes/) as to how to add a frame, and I'm too lazy to go digging in CTAN to see if there's any documentation.

Instead, a little bit of googling (thank you[ tex.stackexchange](http://tex.stackexchange.com/)!) revealed [the answer](http://tex.stackexchange.com/questions/74637/problem-with-drawing-borders-around-slides-in-latex-beamer-handouts-with-adobe-r):

    
    \pgfpageslogicalpageoptions{1}{border code=\pgfusepath{stroke}}
    \pgfpageslogicalpageoptions{2}{border code=\pgfusepath{stroke}}
    \pgfpageslogicalpageoptions{3}{border code=\pgfusepath{stroke}}


You'll need one command for each slide on a page, and you get simple frames around the slides:


[![Handouts with Frames](http://martinjc.com/wp-content/uploads/2013/01/Screen-Shot-2013-01-29-at-09.43.19.png)](http://martinjc.com/wp-content/uploads/2013/01/Screen-Shot-2013-01-29-at-09.43.19.png) Easy!
