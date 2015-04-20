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

import os
import sys
import csv
import json

from api import API
from file_cache import JSONFileCache

from _credentials import *


# method to run once to get the most recent history
def _bootstrap_history(api):

    count = 0

    # make an api call to get the most recent drinks in the area
    params = {"lat": 51.48, 
            "lng": -3.18, 
            "client_id": client_id, 
            "client_secret": client_secret,
            "radius": 10}
    
    drinks = api.query_get("thepub", "local", params)

    max_id = drinks['response']['pagination']['max_id']
    print(max_id)

    drinks = drinks['response']['checkins']['items']

    while count < 99 & max_id != "":

            # make an api call to get the drinks prior 
            # to our earliest retrieved drink so far
            params['max_id'] = max_id

            new_drinks = api.query_get("thepub", "local", params)
            count += 1

            # add the newly retrieved drinks to our list
            drinks.extend(new_drinks['response']['checkins']['items'])
            max_id = new_drinks['response']['pagination']['max_id']
            print(max_id)
            
    return drinks


def remove_non_cardiff(drinks):
    to_remove = []

    for drink in drinks:
        if drink['venue']['location']['venue_state'] == 'Bristol' or drink['venue']['location']['venue_city'] == 'Bristol':
            to_remove.append(drink)
        if drink['venue']['location']['venue_state'] == 'Somerset' or drink['venue']['location']['venue_state'] == 'North Somerset':
            to_remove.append(drink)

    for drink in to_remove:
        drinks.remove(drink)

    return drinks



def get_latest_drinks(api, drinks):

    # find the latest tweet retrieved
    latest_id = 0
    for drink in drinks:
        if drink["checkin_id"] > latest_id:
            latest_id = drink["checkin_id"]

    # make a call and find the latest drinks
    params = {"lat": 51.48, 
                "lng": -3.18, 
                "client_id": client_id, 
                "client_secret": client_secret,
                "radius": 10}
    params['min_id'] = latest_id
            
    new_drinks = api.query_get("thepub", "local", params)

    # add the newly retrieved drinks to our list
    drinks.extend(new_drinks['response']['checkins']['items'])

    # assume there's more
    more_drinks = True

    # find the latest tweet
    for drink in drinks:
        if drink["checkin_id"] > latest_id:
            latest_id = drink["checkin_id"]

    count = 1

    while more_drinks and count < 99:

        # make a call and find the latest drinks
        params['min_id'] = latest_id
        new_drinks = api.query_get("thepub", "local", params)
        count += 1

        # add the newly retrieved drinks to our list
        drinks.extend(new_drinks['response']['checkins']['items'])

        current_latest = latest_id
        for drink in drinks:
            if drink["checkin_id"] > latest_id:
                latest_id = drink["checkin_id"]

        if current_latest == latest_id:
            more_drinks = False

    return drinks


def remove_duplicates(drinks):

    drink_ids = []
    to_remove = []
    # go through all the drinks
    for drink in drinks:
        # if we've already seen this drink
        if drink["checkin_id"] in drink_ids:
            # add it to the list of drinks to remove
            to_remove.append(drink) 
        else:
            # otherwise add the ID to the list of drinks we've seen
            drink_ids.append(drink["checkin_id"])

    for drink in to_remove:
        drinks.remove(drink)

    return drinks


if __name__ == "__main__":

    cache = JSONFileCache()
    ta = API()

    # get the list of drinks that have been downloaded, if it exists
    cache_file = "drinks.json"

    if cache.file_exists(cache_file):
        drinks = cache.get_json(cache_file)
    else:
        drinks = []

    print(len(drinks))

    if len(drinks) > 0:
        drinks = get_latest_drinks(ta, drinks)
    else:
        drinks = _bootstrap_history(ta)

    print(len(drinks))

    drinks = remove_duplicates(drinks)

    print(len(drinks))

    drinks = remove_non_cardiff(drinks)

    print(len(drinks))
        
    cache.put_json(drinks, cache_file)

            