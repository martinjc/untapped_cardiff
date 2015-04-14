#!/usr/bin/env python
#
# Copyright 2015 Martin J Chorley
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
import time
import threading

import urllib
import urllib2

from datetime import datetime

from _credentials import *


class API:

    def __init__(self):


        # URL for accessing API
        scheme = "https://"
        api_url = "api.untappd.com"
        version = "v4"

        self.api_base = scheme + api_url + "/" + version

        #
        # seconds between queries to each endpoint
        # queries limited to 100 per hour
        query_interval = float(60 * 60)/(100)

        #
        # rate limiting timer
        self.__monitor = {'wait':query_interval,
                               'earliest':None,
                               'timer':None}


    #
    # rate_controller puts the thread to sleep 
    # if we're hitting the API too fast
    def __rate_controller(self, monitor_dict):

        # 
        # join the timer thread
        if monitor_dict['timer'] is not None:
            monitor_dict['timer'].join()  

            # sleep if necessary
            while time.time() < monitor_dict['earliest']:
                time.sleep(monitor_dict['earliest'] - time.time())
            
        # work out then the next API call can be made
        earliest = time.time() + monitor_dict['wait']
        timer = threading.Timer( earliest-time.time(), lambda: None )
        monitor_dict['earliest'] = earliest
        monitor_dict['timer'] = timer
        monitor_dict['timer'].start()


    def query_get(self, endpoint, aspect, get_params={}):
        #
        # rate limiting
        self.__rate_controller(self.__monitor)

        str_param_data = {}
        for k, v in get_params.items():
            str_param_data[str(k)] = str(v)

        url = self.api_base + "/" + endpoint + "/" + aspect + "/"

        url = url + "?" + urllib.urlencode(str_param_data)
        print(url)
        request = urllib2.Request(url)

        try:
            response = urllib2.urlopen(request)
        except urllib2.HTTPError as e:
            print(e)
            raise e
        except urllib2.URLError as e:
            print(e)
            raise e

        raw_data = response.read().decode("utf-8")
        return json.loads(raw_data)


if __name__ == "__main__":

    ta = API()
    params = {"lat" : 51.48, "lng": -3.18, "client_id": client_id, "client_secret": client_secret}
    print(ta.query_get("thepub", "local", params))

