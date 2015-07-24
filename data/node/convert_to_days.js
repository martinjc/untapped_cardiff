var fs = require('fs');

var data_dir = process.env.OPENSHIFT_DATA_DIR || "cache/";

fs.readFile(data_dir + 'drinks.json', function(error, data){
    if(error) {
        console.error(error);
    } else {
        console.log(data.length);

        var drinks = JSON.parse(data);
        var checkins = [];

        // drink_days = {}

        drinks.forEach(function(d){

            checkins.push({
                'checkin_id': d.checkin_id,
                'beer': d.beer.bid,
                'brewery': d.brewery.brewery_id,
                'venue': d.venue.venue_id,
                'time': d.created_at                
            });

            // var d_date = new Date(d.created_at);
            // var date_string = "" + d_date.getUTCDate() + "-" + (d_date.getUTCMonth()+1) + "-" + d_date.getUTCFullYear();

            // if(drink_days.hasOwnProperty(date_string)) {
            //     drink_days[date_string].push(d);
            // } else {
            //     drink_days[date_string] = [d];
            // }

        });

        // var today = new Date();
        // var date_string = "" + today.getUTCDate() + "-" + (today.getUTCMonth()+1) + "-" + today.getUTCFullYear();

        // var filename = data_dir + date_string + "_drinks.json";

        // console.log(date_string, drink_days[date_string].length);

        fs.writeFile(data_dir + 'checkins.json', JSON.stringify(checkins), {flag: 'w'}, function(error){
            if(error) {
                console.error(error);
            }
        }); 
    }
});