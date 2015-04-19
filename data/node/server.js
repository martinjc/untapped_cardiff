var fs = require('fs');
var url = require('url');
var http = require('http');

var credentials = require('./_credentials');
var untappd = require('./untappd');

untappd.get_drinks(51.48, -3.18, 15);
untappd.extract_data();


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