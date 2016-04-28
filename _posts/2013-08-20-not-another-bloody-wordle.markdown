---
author: martin
comments: true
date: 2013-08-20 08:04:53+00:00
layout: post
link: http://martinjc.com/2013/08/20/not-another-bloody-wordle/
slug: not-another-bloody-wordle
title: not another bloody wordle?!?!
wordpress_id: 915
categories:
- PhD
tags:
- nltk
- phd
- python
- thesis
- visualisation
- wordle
---

(UPDATE: an earlier version of this was totally wrong. It's better now.)

Inspired by a Facebook post from a colleague, I decided to waste ten minutes this week knocking together a word cloud from the text of my thesis. The process was pretty straightforward.

First up - extracting the text from the thesis. Like all good scienticians, my thesis was written in LaTeX. I thought I could have used a couple of different tools to extract the plain text from the raw .tex input files, but actually none of the tools available from a quick googling seemed to work properly, so I went with extracting the text from the pdf file instead. Fortunately on Mac OS X this is pretty simple, as you can create a straightforward Automator application to extract the text from any pdf file, as documented in step 2 [here](http://craiccomputing.blogspot.co.uk/2010/11/extracting-text-from-pdf-documents-on.html).

Once I had the plain text contents of my thesis in a text file it was just a simple few lines of python (using the excellent [NLTK](http://nltk.org/)) to get a frequency distribution of the words in my thesis:

    
    from nltk.probability import FreqDist
    from nltk.tokenize import word_tokenize, sent_tokenize
    
    fdist = FreqDist()
    with open("2012chorleymjphd.txt", "r") as inputfile:
        for sentence in sent_tokenize(inputfile.read()):
            for word in word_tokenize(sentence):
                fdist.inc(word.lower())
    
        for word, count in fdist.iteritems():
            if count > 10:
                print "%s: %d" % (word, count)


Then it was just a matter of copying and pasting the word frequency distribution into [wordle](http://www.wordle.net/):

[![Thesis Wordle](http://martinjc.com/wp-content/uploads/2013/08/thesis-wordle-2.png)](http://martinjc.com/wp-content/uploads/2013/08/thesis-wordle-2.png)

And there we have it. A not particularly informative but quite nice looking representation of my thesis. As you can guess from the cloud, it's not the most exciting thesis in the world. Interestingly, the word error doesn't seem to be there ;-).
