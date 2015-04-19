var fs = require('fs');
var url = require('url');
var http = require('http');
var request = require('request');

var credentials = require('./_credentials');

var extract_data = function() {
    fs.readFile('cache/drinks.json', 'utf8', function(err, data){
        var drinks = JSON.parse(data);

        var venues = [];
        var venue_ids = [];
        var venue_count = {};

        var breweries = [];
        var brewery_ids = [];
        var brewery_count = {};

        var beers = [];
        var beer_ids = [];
        var beer_count = {};

        var checkins = [];

        drinks.forEach(function(d){
            if(venue_ids.indexOf(d.venue.venue_id) === -1) {
                venues.push(d.venue);
                venue_ids.push(d.venue.venue_id);
            }
            if(venue_count.hasOwnProperty(d.venue.venue_id)) {
                venue_count[d.venue.venue_id] += 1;
            } else {
                venue_count[d.venue.venue_id] = 1;
            }
            

            if (brewery_ids.indexOf(d.brewery.brewery_id) === -1) {
                breweries.push(d.brewery);
                brewery_ids.push(d.brewery.brewery_id);
            }
            if(brewery_count.hasOwnProperty(d.brewery.brewery_id)) {
                brewery_count[d.brewery.brewery_id] += 1;    
            } else {
                brewery_count[d.brewery.brewery_id] = 1;    
            }
            

            if(beer_ids.indexOf(d.beer.bid) === -1) {
                beers.push(d.beer);
                beer_ids.push(d.beer.bid);
            }
            if(beer_count.hasOwnProperty(d.beer.bid)) {
                beer_count[d.beer.bid] += 1;    
            } else {
                beer_count[d.beer.bid] = 1;    
            }
            

            checkins.push({
                'beer': d.beer.bid,
                'brewery': d.brewery.brewery_id,
                'venue': d.venue.venue_id,
                'time': d.created_at
            });
        });

        venues.forEach(function(v){
            v.count = venue_count[v.venue_id];
        });

        breweries.forEach(function(b){
            b.count = brewery_count[b.brewery_id];
        });

        beers.forEach(function(b){
            b.count = beer_count[b.bid];
        });

        fs.writeFile('venues.json', JSON.stringify(venues), function(err){
            if(err) {
                console.log(err);
            }
        });

        fs.writeFile('breweries.json', JSON.stringify(breweries), function(err){
            if(err) {
                console.log(err);
            }
        });

        fs.writeFile('beers.json', JSON.stringify(beers), function(err){
            if(err) {
                console.log(err);
            }
        });

        fs.writeFile('checkins.json', JSON.stringify(checkins), function(err){
            if(err) {
                console.log(err);
            }
        });

    });
};


var get_drinks = function() {   

    var c_id = credentials.client_id;
    var c_secret = credentials.client_secret;

    var url = "https://api.untappd.com/v4/thepub/local/";

    fs.readFile('cache/drinks.json', 'utf8', function(err, data){
        var drinks = JSON.parse(data);

        console.log(drinks.length);

        var latest_id = 0;
        drinks.forEach(function(d){
            if(d.checkin_id > latest_id) {
                latest_id = d.checkin_id;
            }
        });

        console.log(latest_id);

        var params = {
            "lat": 51.48, 
            "lng": -3.18, 
            "client_id": c_id, 
            "client_secret": c_secret,
            "radius": 15,
            "min_id": latest_id
        };

        request({url:url, qs:params}, function(err, response, body) {
            if(err) { 
                console.log(err); 
                return; 
            }
            var new_drinks = JSON.parse(body).response.checkins.items;
            
            console.log(drinks.length);
            drinks = drinks.concat(new_drinks);
            console.log(drinks.length);

            // assume there's more drinks
            var more_drinks = true;

            // find the latest drink
            drinks.forEach(function(d){
                if(d.checkin_id > latest_id) {
                    latest_id = d.checkin_id;
                }
            });

            var get_more_drinks = function(err, response, body) {
                if(err) { 
                    console.log(err); 
                    return; 
                }
                var new_drinks = JSON.parse(body).response.checkins.items;
                drinks = drinks.concat(new_drinks);  
            };

            var count = 1;
            while(more_drinks && count < 99) {

                params.min_id = latest_id;
                console.log(latest_id);
                request({url:url, qs:params}, get_more_drinks);
                var current_latest = latest_id;

                // find the latest drink
                for(var i in drinks) {
                    if(drinks[i].checkin_id > latest_id) {
                        latest_id = drinks[i].checkin_id;
                    }
                }
                console.log(latest_id);
                if(current_latest === latest_id) {
                    more_drinks = false;
                }
                count += 1;
            }

            console.log(drinks.length);

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

            console.log(drinks.length);

            fs.writeFile('cache/drinks.json', JSON.stringify(drinks), function(err){
                if(err) {
                    console.log(err);
                }
                extract_data();
            });
        });
    });
}();


var server = http.createServer(function(request, response){
    var u = url.parse(request.url, true);
    if(u.pathname === '/api/venues') {
        var d = new Date(u.query.iso);
        var r = {
            'hour': d.getHours(),
            'minute': d.getMinutes(),
            'second': d.getSeconds(),
        };
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(r));
    }
    if(u.pathname === '/api/unixtime') {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({'unixtime': new Date(u.query.iso).getTime()}));
    }
});
//server.listen(process.argv[2]);