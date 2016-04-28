---
author: martin
comments: true
date: 2014-09-15 14:22:18+00:00
layout: post
link: http://martinjc.com/2014/09/15/ccgs-and-wpcs-via-the-medium-of-oas/
slug: ccgs-and-wpcs-via-the-medium-of-oas
title: CCGs and WPCs via the medium of OAs
wordpress_id: 1130
categories:
- Coding
- Places
- WorkDiary
tags:
- coding
- data
- geo
- github
- hack
- nhs
- ons
- python
---

As I was eating lunch this afternoon, I spotted a conversation between [@JoeReddington](https://twitter.com/joereddington) and [@MySociety](https://twitter.com/mysociety) whizz past in Tweetdeck. I traced the conversation back to the beginning and found this request for data:

https://twitter.com/joereddington/status/511105946710716416

I've been doing a lot of playing with geographic data recently while preparing to release a site making it easier to get GeoJSON boundaries of various areas in the UK. As a result, I've become pretty familiar with the [Office of National Statistics Geography portal](https://geoportal.statistics.gov.uk/geoportal/catalog/search/browse/browse.page), and the data available there. I figured it must be pretty simple to hack something together to provide the data Joseph was looking for, so I took a few minutes out of lunch to see if I could help.

Checking the lookup tables at the ONS, it was clear that unfortunately there was no simple 'NHS Trust to Parliamentary Constituency' lookup table. However, there were two separate lookups involving Output Areas (OAs). One allows you to lookup [which Parliamentary Constituency (WPC) an OA belongs to](https://geoportal.statistics.gov.uk/geoportal/catalog/search/resource/details.page?uuid=%7B441E0CBF-1421-4BF5-BBC9-5B7C0EA0FE44%7D). The other allows you to lookup [which NHS Clinical Commissioning Group (CCG) an OA belongs to](https://geoportal.statistics.gov.uk/geoportal/catalog/search/resource/details.page?uuid=%7B15C3A07F-F5E1-4CE8-9CFD-24B3589C725B%7D). Clearly, all that's required to link the two together is a bit of quick scripting to tie them both together via the Output Areas.

First, let's create a dictionary with an entry for each CCG. For each CCG we'll store it's ID, name, and a set of OAs contained within. We'll also add  an empty set for the WPCs contained within the CCG:


    
    import csv
    from collections import defaultdict
    
    data = {}
    
    # extract information about clinical commissioning groups
    with open('OA11_CCG13_NHSAT_NHSCR_EN_LU.csv', 'r') as oa_to_cgc_file:
      reader = csv.DictReader(oa_to_cgc_file)
      for row in reader:
        if not data.get(row['CCG13CD']):
          data[row['CCG13CD']] = {'CCG13CD': row['CCG13CD'], 'CCG13NM': row['CCG13NM'], 'PCON11CD list': set(), 'PCON11NM list': set(), 'OA11CD list': set(),}
        data[row['CCG13CD']]['OA11CD list'].add(row['OA11CD'])



Next we create a lookup table that allows us to convert from OA to WPC:


    
    # extract information for output area to constituency lookup
    oas = {}
    pcon_nm = {}
    
    with open('OA11_PCON11_EER11_EW_LU.csv', 'r') as oa_to_pcon_file:
      reader = csv.DictReader(oa_to_pcon_file)
      for row in reader:
        oas[row['OA11CD']] = row['PCON11CD']
        pcon_nm[row['PCON11CD']] = row['PCON11NM']



As the almost last step we go through the CCGs, and for each one we go through the list of OAs it covers, and lookup the WPC each OA belongs to:


    
    # go through all the ccgs and lookup pcons from oas
    for ccg, d in data.iteritems():
    
     for oa in d['OA11CD list']:
       d['PCON11CD list'].add(oas[oa])
       d['PCON11NM list'].add(pcon_nm[oas[oa]])
     
    del d['OA11CD list']



Finally we just need to output the data:


    
    for d in data.values():
    
     d['PCON11CD list'] = ';'.join(d['PCON11CD list'])
     d['PCON11NM list'] = ';'.join(d['PCON11NM list'])
    
    with open('output.csv', 'w') as out_file:
      writer = csv.DictWriter(out_file, ['CCG13CD', 'CCG13NM', 'PCON11CD list', 'PCON11NM list'])
      writer.writeheader()
      writer.writerows(data.values())



Run the script, and we get a nice CSV with one row for each CCG, each row containing a list of the WPC ids and names the CCG covers.

Of course, this data only covers England (as CCGs are a division in NHS England). Although there don't seem to be lookups for OAs to Health Boards in Scotland, or from OAs to Local Health Boards in Wales, it should still be possible to do something similar for these countries using Parliamentary Wards as the intermediate geography, as lookups for Wards to Health Boards and Local Health Boards are available. It's also not immediately clear how well the boundaries for CCGs and WPCs match up, that would require further investigation, depending on what the lookup is to be used for.

All the code, input and output for this task is available on [my github page](https://github.com/martinjc/CCG--Constituencies).
