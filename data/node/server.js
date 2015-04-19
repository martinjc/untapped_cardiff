
var fs = require('fs');
var url = require('url');
var http = require('http');
var schedule = require('node-schedule');

var untappd = require('./untappd');


schedule.scheduleJob('*/60 * * * *', function(){
    untappd.get_drinks(51.48, -3.18, 15);
    untappd.extract_data();
    console.log('checked drinks');
});

var checkin_subset = function(from, to, callback) {

    from = new Date(from);
    to = new Date(to);

    var return_data = [];

    fs.readFile('checkins.json', 'utf8', function(err, data){
        if(err) {
            console.error(err);
            callback(err);
        }

        var checkins = JSON.parse(data);

        checkins.forEach(function(c) {
            var d = new Date(c.time);

            if(d >= from && d <= to) {
                return_data.push(c);
            }
        });
        callback(null, return_data);
    });
};

var return_subset = function(property, from, to, response) {
    var ids = [];
    var count = {};

    checkin_subset(from, to, function(err, checkins){
        if(err) {
            console.error(err);
        }

        console.log(checkins.length);

        checkins.forEach(function(c) {
            if(ids.indexOf(c[property]) === -1) {
                ids.push(c[property]);
            }
            if(count.hasOwnProperty(c[property])) {
                count[c[property]] += 1;
            } else {
                count[c[property]] = 1;
            }
        });

        console.log(ids.length);

        var data_file;
        if(property === "brewery") {
            data_file = "breweries.json";
        } else {
            data_file = property + "s.json";
        }

        var id_property;
        if(property === "beer") {
            id_property = "bid";
        } else {
            id_property = property + "_id";    
        }
        
        fs.readFile(data_file, 'utf-8', function(err, data) {

            var return_data = [];
            var items = JSON.parse(data);

            items.forEach(function(i){
                if(ids.indexOf(i[id_property]) !== -1) {
                    return_data.push(i);
                }                
            });

            return_data.forEach(function(i){
                i.count = count[i[id_property]];
            });

            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(data);
        });        
    });
};

var read_and_return = function(file, response) {
    fs.readFile(file, 'utf8', function(err, data){
        if(err) {
            console.error(err);
        }
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(data);
    });
};

var server = http.createServer(function(request, response){
    var u = url.parse(request.url, true);
    var subset = false;
    if(u.query.hasOwnProperty('from') && u.query.hasOwnProperty('to')){
        console.log(u.query.from);
        console.log(u.query.to);
        subset = true;
    }
    if(u.pathname === '/api/venues') {
        if(subset) {
            return_subset('venue', u.query.from, u.query.to, response);
        } else {
            read_and_return('venues.json', response);    
        }
    }
    else if(u.pathname === '/api/breweries') {
        if(subset) {
            return_subset('brewery', u.query.from, u.query.to, response);
        } else {
            read_and_return('breweries.json', response);    
        }  
    }
    else if(u.pathname === '/api/beers') {
        if(subset) {
            return_subset('beer', u.query.from, u.query.to, response);
        } else {
            read_and_return('beers.json', response);    
        }
    }
    else if(u.pathname === '/api/checkins') {
        if(subset) {
            checkin_subset(u.query.from, u.query.to, function(err, checkins) {
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(checkins));                            
            });

        } else {
            read_and_return('checkins.json', response);     
        }
          
    }

});
server.listen(2000);