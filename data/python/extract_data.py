#!/usr/bin/env python
#
# Copyright 2014 Martin J Chorley
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

import json
from collections import defaultdict

from file_cache import JSONFileCache


def get_venues(drinks):

    venues = []
    venue_ids = set()
    venue_count = defaultdict(int)

    for drink in drinks:

        if not drink['venue']['venue_id'] in venue_ids:
            venues.append(drink['venue'])
            venue_ids.add(drink['venue']['venue_id'])
        venue_count[drink['venue']['venue_id']] += 1

    for venue in venues:
        venue['count'] = venue_count[venue['venue_id']]
    json.dump(venues, open('venues.json', 'w'))


def get_breweries(drinks):

    breweries = []
    brewery_ids = set()
    brewery_count = defaultdict(int)

    for drink in drinks:

        if not drink['brewery']['brewery_id'] in brewery_ids:
            breweries.append(drink['brewery'])
            brewery_ids.add(drink['brewery']['brewery_id'])
        brewery_count[drink['brewery']['brewery_id']] += 1

    for brewery in breweries:
        brewery['count'] = brewery_count[brewery['brewery_id']]

    json.dump(breweries, open('breweries.json', 'w'))


def get_beers(drinks):

    beers = []
    beer_ids = set()
    beer_count = defaultdict(int)

    for drink in drinks:

        if not drink['beer']['bid'] in beer_ids:
            beers.append(drink['beer'])
            beer_ids.add(drink['beer']['bid'])
        beer_count[drink['beer']['bid']] += 1

    for beer in beers:
        beer['count'] = beer_count[beer['bid']]

    json.dump(beers, open('beers.json', 'w'))


def get_checkins(drinks):

    checkins = []
    
    for drink in drinks:
        checkins.append({
            'beer': drink['beer']['bid'],
            'brewery': drink['brewery']['brewery_id'],
            'venue': drink['venue']['venue_id'],
            'time': drink['created_at']
        })

    json.dump(checkins, open('checkins.json', 'w'))


def load_drinks():

    cache = JSONFileCache()

    cache_file = "drinks.json"

    if cache.file_exists(cache_file):
        drinks = cache.get_json(cache_file)
    return drinks

if __name__ == "__main__":

    drinks = load_drinks()
    get_venues(drinks)
    get_beers(drinks)
    get_breweries(drinks)
    get_checkins(drinks)