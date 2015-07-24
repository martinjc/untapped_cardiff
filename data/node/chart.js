var d = require('./data')


module.exports.get_week = function() {
    var last_week = {
        start: new Date(),
        today: new Date(),
        end: new Date()
    };

    last_week.get_query_string = function() {
        var start_string = "" + this.start.getFullYear() + "-" + (this.start.getMonth()+1) + "-" + this.start.getDate();
        var end_string = "" + this.end.getFullYear() + "-" + (this.end.getMonth()+1) + "-" + this.end.getDate();
        var query_string = "?from=" + start_string + "&to=" + end_string;
        return query_string;
    };

    last_week.today.setDate(last_week.today.getDate() - 7);
    last_week.start = new Date(last_week.today.getFullYear(), last_week.today.getMonth(), last_week.today.getDate());
    last_week.start.setDate(last_week.today.getDate() - last_week.today.getDay());    
    last_week.end = new Date(last_week.today.getFullYear(), last_week.today.getMonth(), last_week.today.getDate());
    last_week.end.setDate(last_week.start.getDate() + 7);

    return last_week;
}

module.exports.do_chart = function(property, from, to, callback) {
    d.extract_subset(property, from, to, function(err, data){
        if(err) {
            callback(err);
            console.error(err);
        }

        sorted = data.sort(function(a, b){
            return b.count - a.count;
        })

        callback(null, sorted.slice(0, 5));
    });
}

