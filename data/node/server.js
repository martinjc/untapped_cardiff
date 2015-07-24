
var fs = require('fs');
var url = require('url');
var http = require('http');
var schedule = require('node-schedule');

var d = require('./data');
var twit = require('./twit');
var untappd = require('./untappd');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8088;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var data_dir = process.env.OPENSHIFT_DATA_DIR || "cache/";


//schedule the server to update data from untappd server once every 30 minutes
schedule.scheduleJob('*/10 * * * *', function(){
    untappd.get_drinks(51.48, -3.18, 10);
});

// return a subset of the data
var return_subset = function(property, from, to, response) {

    var response = response;
    d.extract_subset(property, from, to, function(err, data) {
        if(err) {
            console.error(err);
        }
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(data));
    });
};

// return the whole data file
var read_and_return = function(file, response) {
    fs.readFile(file, 'utf8', function(err, data){
        if(err) {
            console.error(err);
        }
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(data);
    });
};

// set up the server
var server = http.createServer(function(request, response){
    var u = url.parse(request.url, true);

    // are we looking for a subset of the data?
    var subset = false;
    if(u.query.hasOwnProperty('from') && u.query.hasOwnProperty('to')){
        subset = true;
    }

    // retrieve and return the correct data
    if(u.pathname === '/api/venues') {
        if(subset) {
            return_subset('venue', u.query.from, u.query.to, response);
        } else {
            read_and_return(data_dir + 'venues.json', response);    
        }
    }
    else if(u.pathname === '/api/breweries') {
        if(subset) {
            return_subset('brewery', u.query.from, u.query.to, response);
        } else {
            read_and_return(data_dir + 'breweries.json', response);    
        }  
    }
    else if(u.pathname === '/api/beers') {
        if(subset) {
            return_subset('beer', u.query.from, u.query.to, response);
        } else {
            read_and_return(data_dir + 'beers.json', response);    
        }
    }
    else if(u.pathname === '/api/checkins') {
        if(subset) {
            d.checkin_subset(u.query.from, u.query.to, function(err, checkins) {
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(checkins));                            
            });

        } else {
            read_and_return(data_dir + 'checkins.json', response);     
        }   
    }
});
untappd.get_drinks(51.48, -3.18, 10);
server.listen(server_port, server_ip_address);