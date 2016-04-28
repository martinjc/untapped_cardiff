---
author: martin
comments: true
date: 2011-10-01 16:24:07+00:00
layout: post
link: http://martinjc.com/2011/10/01/colourful-foursquare-category-icons/
slug: colourful-foursquare-category-icons
title: 'Colourful Foursquare category icons '
wordpress_id: 448
categories:
- Coding
tags:
- coding
- foursquare
- python
---



**UPDATE [01 August 2014]: Even more breaking! More recent version of the script [here](http://martinjc.com/2014/08/01/foursquare-icon-downloading-yet-again/)**

**UPDATE 31/01/2011 - new version of the [downloader](http://martinjc.com/2012/01/31/foursquare-category-icon-downloader-2/) script is here**

A couple of projects I'm working on at the moment need the ability to add foursquare venues to a map. This is pretty straightforward, but what is also needed is the ability to distinguish between the categories of the venues. To do this, I'm adding custom markers to a google map at a venue location, with the marker having an icon representing the venue category.

Foursquare already have lots of category icons ready made, and they supply the urls in the [/venues/category](https://developer.foursquare.com/docs/explore.html#req=venues/categories) endpoint, which is handy.  It seems from [official responses](https://groups.google.com/forum/#!topic/foursquare-api/TsRBGdXDgzg) on the forum that they don't mind you downloading these icons for use in your apps, and they also supply the icons in [several sizes](https://groups.google.com/d/topic/foursquare-api/Pw0p4qqW79A/discussion), so hacking together a script to download all the available icons is pretty easy. The following python code will do just that - grab the latest category hierarchy from Foursquare, process it to extract all the category id's and icon locations, then download each icon in all available sizes:

[code lang="py"]
import urllib2
import urllib
import json

# supply oauth token as parameter
params = {
    'oauth_token' : 'VALID_FOURSQUARE_OAUTH_TOKEN'
}

api_base_url = 'https://api.foursquare.com/v2'

icons = {}

# function to extract category info from json and
# process any sub-categories
def process_category( category_json ):
    icons[category_json['id']] = category_json['icon']

    if 'categories' in category_json:
        [ process_category( c ) for c in category_json['categories'] ]

if __name__ == "__main__":

    url = api_base_url + '/venues/categories?' + urllib.urlencode( params )

    # try and retrieve the json
    try:
        response = urllib2.urlopen( url )
    except urllib2.HTTPError, e:
        raise e
    except urllib2.URLError, e:
        raise e

    # read the json
    raw_data = response.read( )
    py_data = json.loads( raw_data )

    categories_json = py_data['response']

    # extract all the categories
    for category in categories_json['categories']:
        process_category( category )

    # download all the icons
    for foursq_id, icon in icons.iteritems( ):
        sizes = [ '_32', '_64', '_256', '']
        for size in sizes:
            try:
                url = icon.replace( '.png', '%s.png' % size )
                u = urllib2.urlopen( url )
                file_name = '%s%s.png' % ( foursq_id, size )
                localFile = open( file_name, 'w' )
                localFile.write( u.read( ) )
                localFile.close( )
            except Exception:
                pass
[/code]

After running this script, we have a local copy of all the category icons to use in our application downloaded. In my case, I need to be able to differentiate between venues within the categories, so it would be nice to have different coloured icons for my different classes of venue. Luckily this is also pretty simple. You'll need [ImageMagick](http://www.imagemagick.org/script/index.php) installed, but if it is, the following code will go through all the greyscale icons downloaded with the previous script and convert them to whichever colours you like:

[code lang="py"]
import os

#
# colour name, and imagemagick colour name
colours = {
    'red' : 'red',
    'crimson' : 'crimson',
    'pink' : 'DeepPink',
    'purple' : 'purple',
    'indigo' : 'indigo',
    'blue' : 'blue',
    'navy' : 'navy',
    'turquoise' : 'turquoise1',
    'teal' : 'teal',
    'lime' : 'lime',
    'yellow' : 'yellow',
    'orange' : 'orange',
}

#
# list all the files in the current directory
current_dir = os.getcwd( )
files = os.listdir( current_dir )

#
# run through the file list
for fname in files:
    # for all the png's
    if '.png' in fname:
        # get the file name
        stripped_name = fname[ :fname.rfind( '.' ) ]
        # convert to a new colour and save
        for colour, magickcolour in colours.iteritems( ):
            colour_name = '%s_%s.png' % ( stripped_name, colour)
            os.system( 'convert %s +level-colors %s, %s'
                        % ( fname, magickcolour, colour_name ) )
[/code]

The colour names come from [this list](http://www.imagemagick.org/script/color.php) of imagemagick colours, you can obviously pick whichever colours you want. If you run this script in the directory with the downloaded Foursquare category icons, you'll end up with a multitude of differently sized, differently coloured icons:

[gallery link="file" orderby="ID"]

And that's that. Later I'll post about how to use these as custom markers in a google map.

UPDATE 3/10/11:

As this example stores icons by category id, it actually duplicates some of the icons, which is un-necessary. This version ([Foursquare Category Icons downloader](http://martinjc.com/wp-content/uploads/2011/10/dloader.txt)) stores the icons by icon name, so saving the downloading and processing of around 100 duplicate icons. It also splits the different sizes into different directories for better file management.

UPDATE 5/10/11:

There's a change in the category json coming which will break this code. Use "v=20111002" as an extra parameter in the code that calls the Foursquare API and it'll keep working.
