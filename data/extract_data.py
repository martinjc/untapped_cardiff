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


def get_venue_counts(drinks):

    venues = []
    venue_ids = set()
    venue_count = defaultdict(int)

    for drink in drinks:
        
        foursq_id = drink['venue']['parent_category_id']

        if not drink['venue']['venue_id'] in venue_ids:
            venues.append(drink['venue'])
            venue_ids.add(drink['venue']['venue_id'])
        venue_count[drink['venue']['venue_id']] += 1

        for venue in venues:
            venue['count'] = venue_count[venue['venue_id']]

    print(venues)
    json.dump(venues, open('venues.json', 'w'))

def load_drinks():

    cache = JSONFileCache()

    cache_file = "drinks.json"

    if cache.file_exists(cache_file):
        drinks = cache.get_json(cache_file)
    return drinks

if __name__ == "__main__":

    drinks = load_drinks()
    get_venue_counts(drinks)