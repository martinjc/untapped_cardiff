var fs = require('fs');

var data_dir = process.env.OPENSHIFT_DATA_DIR || "cache/";

// filter the set of checkins
var checkin_subset = function(from, to, callback) {

    f = new Date(from);
    t = new Date(to);

    var from = new Date(Date.UTC(f.getFullYear(), f.getMonth(), f.getDate(), f.getHours(), f.getMinutes(), f.getSeconds()));
    var to = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds()));

    var return_data = [];

    // read the checkins, return only those within the from and to dates
    fs.readFile(data_dir + 'checkins.json', 'utf8', function(err, data){
        if(err) {
            console.error(err);
            callback(err);
        }

        try {
            var checkins = JSON.parse(data);

            checkins.forEach(function(c) {
                var d = new Date(c.time);

                if(d >= from && d < to) {
                    return_data.push(c);
                }
            });
            callback(null, return_data);            
        } catch(ex) {
            console.error(ex);
            checkin_subset(from, to, callback);
        }

    });
};

var extract_subset = function(property, from, to, callback) {
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

        // use the correct id property
        var id_property;
        if(property === "beer") {
            id_property = "bid";
        } else {
            id_property = property + "_id";    
        }
        
        // open the file, extract the relevant ids and return it
        fs.readFile(data_dir + data_file, 'utf-8', function(err, data) {

            if(err) {
                callback(err);
                return;
            }
            var return_data = [];
            try {
                var items = JSON.parse(data);

                items.forEach(function(i){
                    if(ids.indexOf(i[id_property]) !== -1) {
                        return_data.push(i);
                    }                
                });

                return_data.forEach(function(i){
                    i.count = count[i[id_property]];
                });

                if(callback) {
                    callback(null, return_data);
                }                
            } catch(ex) {
                console.error(ex);
                extract_subset(property, from, to, callback);
            }

        });        
    });    
}

module.exports.checkin_subset = checkin_subset;
module.exports.extract_subset = extract_subset;