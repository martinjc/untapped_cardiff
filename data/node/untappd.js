var fs = require('fs');
var request = require('request');

var credentials = require('./_credentials');

var data_dir = process.env.OPENSHIFT_DATA_DIR || "cache/";

var latest_id = 0;

var extract_data = function(drinks) {

    fs.readFile(data_dir + 'beers.json', 'utf-8', function(err, data){
        if(err) {
            console.error(err);
        } else {

            old_beers = JSON.parse(data);
            console.log("pre-beers: " + old_beers.length);

            var beers = [];
            var beer_ids = [];
            var beer_count = {};

            old_beers.forEach(function(b){
                if(beer_ids.indexOf(b.bid) === -1) {
                    beer_ids.push(b.bid);
                    beers.push(b);
                }
                beer_count[b.bid] = b.count;
            });

            drinks.forEach(function(d){
                if(beer_ids.indexOf(d.beer.bid) === -1) {
                    beers.push(d.beer);
                    beer_ids.push(d.beer.bid);
                } else {
                    beers[beer_ids.indexOf(d.beer.bid)] = d.beer;
                }
                if(beer_count.hasOwnProperty(d.beer.bid)) {
                    beer_count[d.beer.bid] += 1;    
                } else {
                    beer_count[d.beer.bid] = 1;    
                } 
            });

            beers.forEach(function(b){
                b.count = beer_count[b.bid];
            });

            fs.writeFile(data_dir + 'beers.json', JSON.stringify(beers), function(err){
                if(err) {
                    console.error(err);
                }
            });
            console.log("post-beers: " + beers.length);
        } 
    });

    fs.readFile(data_dir + 'breweries.json', 'utf-8', function(err, data){
        if(err) {
            console.error(err);
        } else {

            var breweries = [];
            var brewery_ids = [];
            var brewery_count = {};
            
            var old_breweries = JSON.parse(data);
            console.log("pre-breweries: " + old_breweries.length);

            old_breweries.forEach(function(b) {
                if(brewery_ids.indexOf(b.brewery_id) === -1) {
                    brewery_ids.push(b.brewery_id);
                    breweries.push(b);
                }
                brewery_count[b.brewery_id] = b.count;
            });

            drinks.forEach(function(d){
                if (brewery_ids.indexOf(d.brewery.brewery_id) === -1) {
                    breweries.push(d.brewery);
                    brewery_ids.push(d.brewery.brewery_id);
                } else {
                    breweries[brewery_ids.indexOf(d.brewery.brewery_id)] = d.brewery;
                }
                if(brewery_count.hasOwnProperty(d.brewery.brewery_id)) {
                    brewery_count[d.brewery.brewery_id] += 1;    
                } else {
                    brewery_count[d.brewery.brewery_id] = 1;    
                }                
            });

            breweries.forEach(function(b){
                b.count = brewery_count[b.brewery_id];
            });

            fs.writeFile(data_dir + 'breweries.json', JSON.stringify(breweries), function(err){
                if(err) {
                    console.error(err);
                }
            });
            console.log("post-breweries: " + breweries.length);
        }
        
    });

    fs.readFile(data_dir + 'venues.json', 'utf-8', function(err, data){
        if(err) {
            console.error(err);
        } else {

            var venues = [];
            var venue_ids = [];
            var venue_count = {};

            var old_venues = JSON.parse(data);
            console.log("pre-venues: " + old_venues.length);

            old_venues.forEach(function(v){
                if(venue_ids.indexOf(v.venue_id) === -1) {
                    venue_ids.push(v.venue_id);
                    venues.push(v)
                }
                venue_count[v.venue_id] = v.count;
            });

            drinks.forEach(function(d){
                if(venue_ids.indexOf(d.venue.venue_id) === -1) {
                    venues.push(d.venue);
                    venue_ids.push(d.venue.venue_id);
                } else {
                    venues[venue_ids.indexOf(d.venue.venue_id)] = d.venue;
                }
                if(venue_count.hasOwnProperty(d.venue.venue_id)) {
                    venue_count[d.venue.venue_id] += 1;
                } else {
                    venue_count[d.venue.venue_id] = 1;
                }
            });

            venues.forEach(function(v){
                v.count = venue_count[v.venue_id];
            });

            // write out data files
            fs.writeFile(data_dir + 'venues.json', JSON.stringify(venues), function(err){
                if(err) {
                    console.error(err);
                }
            });

            console.log("post-venues: " + venues.length);
        }
    });

    fs.readFile(data_dir + 'checkins.json', 'utf-8', function(err, data){
        
        if(err) {
            console.error(err);
        } else {

            var old_checkins = JSON.parse(data);
            console.log("pre-checkins: " + old_checkins.length);

            var checkins = [];
            var checkin_ids = [];

            old_checkins.forEach(function(c){
                if(checkin_ids.indexOf(c.checkin_id) === -1) {
                    checkin_ids.push(c.checkin_id);
                    checkins.push(c);
                }
            });

            drinks.forEach(function(d){
                if(checkin_ids.indexOf(d.checkin_id) === -1) {
                    checkins.push({
                        'checkin_id': d.checkin_id,
                        'beer': d.beer.bid,
                        'brewery': d.brewery.brewery_id,
                        'venue': d.venue.venue_id,
                        'time': d.created_at
                    });
                }
            });

            fs.writeFile(data_dir + 'checkins.json', JSON.stringify(checkins), function(err){
                if(err) {
                    console.error(err);
                }
            });

            console.log("post-checkins: " + checkins.length);
        }
    });    
};

var get_existing_drinks = function(filename, callback) {

    var drinks = [];

    // quick test to see if file for today exists, if not - create it
    fs.open(filename, 'r+', function(err, fd){
        if(err) {
            // error opening file - it doesn't exist, so create a file for today
            fs.writeFile(filename, JSON.stringify(drinks), {flag: 'wx'}, function(error){
                if(error) {
                    console.error(error);
                    callback(error);
                }
                callback(null, drinks);
            }); 
        } else {
            fs.readFile(filename, 'utf8', function(err, data){
                if(err) {
                    console.error(err);
                    callback(err);
                } else {
                    drinks = JSON.parse(data);
                    callback(null, drinks);
                }
            });
        }
        if(fd) {
            fs.close(fd, null);             
        } 
    });
}


module.exports.get_drinks = function(lat, lng, radius) {   

    var c_id = credentials.client_id;
    var c_secret = credentials.client_secret;

    var url = "https://api.untappd.com/v4/thepub/local/";

    var t = new Date();
    var date_string = "" + t.getUTCDate() + "-" + (t.getUTCMonth()+1) + "-" + t.getUTCFullYear();

    //var latest_id = 0;

    filename = data_dir + date_string + "_drinks.json";

    get_existing_drinks(filename, function(error, drinks){
        
        console.log(new Date().toUTCString());
        console.log("drinks at start: " + drinks.length);

        drinks.forEach(function(d){
            if(d.checkin_id > latest_id) {
                latest_id = d.checkin_id;
            }
        });

        console.log('latest id: ' + latest_id);

        var params = {
            "lat": lat, 
            "lng": lng, 
            "client_id": c_id, 
            "client_secret": c_secret,
            "radius": radius,
            "min_id": latest_id
        };

        request({url:url, qs:params}, function(err, response, body) {
            if(err) { 
                console.error(err); 
                return; 
            }
            var new_drinks = JSON.parse(body).response.checkins.items;
            console.log("received: " + new_drinks.length);
            drinks = drinks.concat(new_drinks);

            console.log("before removal: " + drinks.length);

            var to_remove = [];
            var ids = [];
            for(var d in drinks) {
                if(drinks[d].checkin_id in ids) {
                    to_remove.push(d);
                } else if(drinks[d].venue.location.venue_state === 'Bristol' || drinks[d].venue.location.venue_city === 'Bristol') {
                    to_remove.push(d);
                } else if(drinks[d].venue.location.venue_state === 'Somerset' || drinks[d].venue.location.venue_state === 'North Somerset') {
                    to_remove.push(d);
                } else {
                    ids.push(drinks[d].checkin_id);
                }
            }

            to_remove.sort(function(a,b){ return b-a; });

            for(var t in to_remove) {
                drinks.splice(to_remove[t], 1);
            }

            // find the latest drink
            drinks.forEach(function(d){
                if(d.checkin_id > latest_id) {
                    latest_id = d.checkin_id;
                }
            });

            console.log("after removal: " + drinks.length);
            extract_data(drinks);

            fs.writeFile(data_dir + date_string + '_drinks.json', JSON.stringify(drinks), function(err){
                if(err) {
                    console.error(err);
                }
            });
        });        
    });
};

module.exports.extract_data = extract_data;