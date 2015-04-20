
var fs = require('fs');
var url = require('url');
var http = require('http');
var schedule = require('node-schedule');

var untappd = require('./untappd');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'


// schedule the server to update data from untappd server once every 30 minutes
schedule.scheduleJob('*/30 * * * *', function(){
    untappd.get_drinks(51.48, -3.18, 10);
    untappd.extract_data();
});

// filter the set of checkins
var checkin_subset = function(from, to, callback) {

    from = new Date(from);
    to = new Date(to);

    var return_data = [];

    // read the checkins, return only those within the from and to dates
    fs.readFile(process.env.OPENSHIFT_DATA_DIR + 'checkins.json', 'utf8', function(err, data){
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


// return a subset of the data
var return_subset = function(property, from, to, response) {

    // store ids and count of ids to be returned
    var ids = [];
    var count = {};

    // get the subset of checkins we're dealing with
    checkin_subset(from, to, function(err, checkins){
        if(err) {
            console.error(err);
        }

        // extract the ids of the relevant data
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

        // open the correct data file
        var data_file;
        if(property === "brewery") {
            data_file = "breweries.json";
        } else {
            data_file = property + "s.json";
        }

        // use the correct id file
        var id_property;
        if(property === "beer") {
            id_property = "bid";
        } else {
            id_property = property + "_id";    
        }
        
        // open the file, extract the relevant ids and return it
        fs.readFile(process.env.OPENSHIFT_DATA_DIR + data_file, 'utf-8', function(err, data) {

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
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(return_data));
        });        
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
            read_and_return(process.env.OPENSHIFT_DATA_DIR + 'venues.json', response);    
        }
    }
    else if(u.pathname === '/api/breweries') {
        if(subset) {
            return_subset('brewery', u.query.from, u.query.to, response);
        } else {
            read_and_return(process.env.OPENSHIFT_DATA_DIR + 'breweries.json', response);    
        }  
    }
    else if(u.pathname === '/api/beers') {
        if(subset) {
            return_subset('beer', u.query.from, u.query.to, response);
        } else {
            read_and_return(process.env.OPENSHIFT_DATA_DIR + 'beers.json', response);    
        }
    }
    else if(u.pathname === '/api/checkins') {
        if(subset) {
            checkin_subset(u.query.from, u.query.to, function(err, checkins) {
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(checkins));                            
            });

        } else {
            read_and_return(process.env.OPENSHIFT_DATA_DIR + 'checkins.json', response);     
        }   
    }
});
untappd.get_drinks(51.48, -3.18, 10);
untappd.extract_data();
server.listen(server_port, server_ip_address);