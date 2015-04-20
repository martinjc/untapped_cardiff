var fs=require("fs"),url=require("url"),http=require("http"),schedule=require("node-schedule"),untappd=require("./untappd");schedule.scheduleJob("*/20 * * * *",function(){untappd.get_drinks(51.48,-3.18,15),untappd.extract_data()});var checkin_subset=function(e,r,n){e=new Date(e),r=new Date(r);var t=[];fs.readFile("checkins.json","utf8",function(a,u){a&&(console.error(a),n(a));var s=JSON.parse(u);s.forEach(function(n){var a=new Date(n.time);a>=e&&r>=a&&t.push(n)}),n(null,t)})},return_subset=function(e,r,n,t){var a=[],u={};checkin_subset(r,n,function(r,n){r&&console.error(r),n.forEach(function(r){-1===a.indexOf(r[e])&&a.push(r[e]),u.hasOwnProperty(r[e])?u[r[e]]+=1:u[r[e]]=1});var s;s="brewery"===e?"breweries.json":e+"s.json";var o;o="beer"===e?"bid":e+"_id",fs.readFile(s,"utf-8",function(e,r){var n=[],s=JSON.parse(r);s.forEach(function(e){-1!==a.indexOf(e[o])&&n.push(e)}),n.forEach(function(e){e.count=u[e[o]]}),t.writeHead(200,{"Content-Type":"application/json"}),t.end(JSON.stringify(n))})})},read_and_return=function(e,r){fs.readFile(e,"utf8",function(e,n){e&&console.error(e),r.writeHead(200,{"Content-Type":"application/json"}),r.end(n)})},server=http.createServer(function(e,r){var n=url.parse(e.url,!0),t=!1;n.query.hasOwnProperty("from")&&n.query.hasOwnProperty("to")&&(t=!0),"/api/venues"===n.pathname?t?return_subset("venue",n.query.from,n.query.to,r):read_and_return("venues.json",r):"/api/breweries"===n.pathname?t?return_subset("brewery",n.query.from,n.query.to,r):read_and_return("breweries.json",r):"/api/beers"===n.pathname?t?return_subset("beer",n.query.from,n.query.to,r):read_and_return("beers.json",r):"/api/checkins"===n.pathname&&(t?checkin_subset(n.query.from,n.query.to,function(e,n){r.writeHead(200,{"Content-Type":"application/json"}),r.end(JSON.stringify(n))}):read_and_return("checkins.json",r))});untappd.get_drinks(51.48,-3.18,15),untappd.extract_data(),server.listen(2e3);