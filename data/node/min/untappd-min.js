var fs=require("fs"),request=require("request"),credentials=require("./_credentials");module.exports.extract_data=function(){fs.readFile("cache/drinks.json","utf8",function(e,r){if(e)return void console.error(e);var n=JSON.parse(r),i=[],o=[],s={},t=[],c=[],u={},l=[],d=[],a={},f=[];n.forEach(function(e){-1===o.indexOf(e.venue.venue_id)&&(i.push(e.venue),o.push(e.venue.venue_id)),s.hasOwnProperty(e.venue.venue_id)?s[e.venue.venue_id]+=1:s[e.venue.venue_id]=1,-1===c.indexOf(e.brewery.brewery_id)&&(t.push(e.brewery),c.push(e.brewery.brewery_id)),u.hasOwnProperty(e.brewery.brewery_id)?u[e.brewery.brewery_id]+=1:u[e.brewery.brewery_id]=1,-1===d.indexOf(e.beer.bid)&&(l.push(e.beer),d.push(e.beer.bid)),a.hasOwnProperty(e.beer.bid)?a[e.beer.bid]+=1:a[e.beer.bid]=1,f.push({beer:e.beer.bid,brewery:e.brewery.brewery_id,venue:e.venue.venue_id,time:e.created_at})}),i.forEach(function(e){e.count=s[e.venue_id]}),t.forEach(function(e){e.count=u[e.brewery_id]}),l.forEach(function(e){e.count=a[e.bid]}),fs.writeFile("venues.json",JSON.stringify(i),function(e){e&&console.error(e)}),fs.writeFile("breweries.json",JSON.stringify(t),function(e){e&&console.error(e)}),fs.writeFile("beers.json",JSON.stringify(l),function(e){e&&console.error(e)}),fs.writeFile("checkins.json",JSON.stringify(f),function(e){e&&console.error(e)})})},module.exports.get_drinks=function(e,r,n){var i=credentials.client_id,o=credentials.client_secret,s="https://api.untappd.com/v4/thepub/local/";fs.readFile("cache/drinks.json","utf8",function(t,c){var u=JSON.parse(c),l={lat:e,lng:r,client_id:i,client_secret:o,radius:n};console.log(u.length);var d=0;u.forEach(function(e){e.checkin_id>d&&(d=e.checkin_id)}),console.log(d);for(var a=function(e,r,n){if(e)return void console.log(e);var i=JSON.parse(n).response.checkins.items;u=u.concat(i)},f=1,v=!0;v&&99>f;){l.min_id=d,console.log(d),request({url:s,qs:l},a);var h=d;for(var b in u)u[b].checkin_id>d&&(d=u[b].checkin_id);console.log(d),h===d&&(v=!1),f+=1}console.log(u.length);var _=[],p=[];for(var w in u)u[w].checkin_id in p?_.push(w):"Bristol"===u[w].venue.location.venue_state||"Bristol"===u[w].venue.location.venue_city?_.push(w):"Somerset"===u[w].venue.location.venue_state||"North Somerset"===u[w].venue.location.venue_state?_.push(w):p.push(u[w].checkin_id);_.sort(function(e,r){return r-e});for(var y in _)u.splice(_[y],1);console.log(u.length),fs.writeFile("cache/drinks.json",JSON.stringify(u),function(e){e&&console.log(e)})})};