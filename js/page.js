/* global d3, queue, WeekHandler, DayChart, BarChart */

(function(){

    var urlParams;
    var location;

    var pageState = "thisweek";

    function checkState() {
        if(pageState === "thisweek") {
            d3.select('#showall').attr("disabled", null);
            d3.select('#today').attr("disabled", "disabled");
            check_valid_dates();        
        } else if(pageState === "all") {
            d3.select('#showall').attr("disabled", "disabled");
            d3.select('#today').attr("disabled", null);
            d3.select('#previous').attr("disabled", "disabled");
            d3.select('#next').attr("disabled", "disabled"); 
        } else if(pageState === "previousweek") {
            d3.select('#showall').attr("disabled", null);
            d3.select('#today').attr("disabled", null);
            check_valid_dates();
        }
    }

    function getparams(callback) {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);

        urlParams = {};
        while ((match = search.exec(query)) !== null) {
           urlParams[decode(match[1])] = decode(match[2]);
        }
        location = window.location.origin + window.location.pathname;
        if(callback) {
            callback();    
        }
        
    }

    window.onpopstate = function() {
        getparams(reset_page);
    };
    window.onpopstate();

    var padding = {
        top: 10,
        bottom: 140,
        left: 90,
        right: 10
    };

    var beer_chart = new BarChart("#beers .vis", padding);
    var styles_chart = new BarChart("#styles .vis", padding);
    var breweries_chart = new BarChart("#breweries .vis", padding);
    var venues_chart = new BarChart("#venues .vis", padding);
    var day_chart = new BarChart("#day .vis", padding);
    var time_chart = new BarChart("#time .vis", padding);
    var year_chart = new DayChart("#year .vis");

    window.addEventListener("resize", function(){
        day_chart.draw();
        time_chart.draw();
        year_chart.draw();            
        beer_chart.draw();
        breweries_chart.draw();
        styles_chart.draw();
        venues_chart.draw();
    });

    var week_handler;
    function reset_page() {
        getparams();
        week_handler = new WeekHandler();
        if(urlParams.hasOwnProperty('from') && urlParams.hasOwnProperty('to')) {
            pageState = "previousweek";
            week_handler.current_week.start = new Date(urlParams.from);
            week_handler.current_week.end = new Date(urlParams.to);
        } else if(urlParams.hasOwnProperty('all')) {
            pageState = "all";
            do_dashboard("");
        } else {
            pageState = "thisweek";
        }
        var query = week_handler.get_query_string();
        checkState();
        do_dashboard(query);            
    }

    d3.select('#previous').on("click", function(){
        pageState = "previousweek";
        if(week_handler.can_page_back()) {
            week_handler.page_back();
            window.history.pushState({}, "", location + week_handler.get_query_string());
            do_dashboard(week_handler.get_query_string());
        }
        checkState();
    });

    d3.select('#next').on('click', function() {
        if(week_handler.can_page_forward()) {
            week_handler.page_forward();
            window.history.pushState({}, "", location + week_handler.get_query_string());
            do_dashboard(week_handler.get_query_string());
            if(week_handler.can_page_forward()) {
                pageState = "previousweek";
            } else {
                pageState = "thisweek";
            }
        }
        checkState();
    });

    d3.select('#today').on('click', function() {
        pageState = "thisweek";
        window.history.pushState({}, "", location);
        checkState();
        reset_page();
    });

    d3.select('#showall').on('click', function(){
        pageState = "all";
        window.history.pushState({"all": "all"}, "", location + "?all=all");
        do_dashboard("");
        checkState();
    });

    function check_valid_dates() {
        if(week_handler.can_page_back()) {
            d3.select('#previous').attr("disabled", null);
        } else {
            d3.select('#previous').attr("disabled", "disabled");
        }
        if(week_handler.can_page_forward()) {
            d3.select('#next').attr("disabled", null);
        } else {
            d3.select('#next').attr("disabled", "disabled"); 
        }
    }

    function do_dashboard(date_query) {

        queue()
        .defer(d3.xhr, "http://bardiff-martinjc.rhcloud.com/api/venues" + date_query)
        .defer(d3.xhr, "http://bardiff-martinjc.rhcloud.com/api/breweries" + date_query)
        .defer(d3.xhr, "http://bardiff-martinjc.rhcloud.com/api/beers" + date_query)
        .defer(d3.xhr, "http://bardiff-martinjc.rhcloud.com/api/checkins" + date_query)
        .await(function(error, venues, breweries, beers, checkins){

            venues = JSON.parse(venues.response);
            breweries = JSON.parse(breweries.response);
            beers = JSON.parse(beers.response);
            checkins = JSON.parse(checkins.response);

            if(error) {
                console.log(error);
            }

            var earliest = Date.parse(checkins[0].time);
            var latest = earliest;
            checkins.forEach(function(d) {
                var t = Date.parse(d.time);
                if(t < earliest) {
                    earliest = t;
                }
                if(t > latest) {
                    latest = t;
                }
            });

            var l_string;
            var e_string;

            if(window.innerWidth < 760) {
                var l = new Date(latest);
                l_string = "" + l.getDate() + "/" + (l.getMonth()+1) + "/" + l.getFullYear();
                var e = new Date(earliest);
                e_string = "" + e.getDate() + "/" + (e.getMonth()+1) + "/" + e.getFullYear();
            } else {
                l_string = new Date(latest).toDateString();
                e_string = new Date(earliest).toDateString();                
            }


            d3.select('#from-date').text(e_string);
            d3.select('#to-date').text(l_string);

            var styles = d3.nest()
            .key(function(d) {
              return d.beer_style;
            })
            .rollup(function(d) {
              return d3.sum(d, function(g) {
                return g.count;
              });
            })
            .entries(beers);


            beer_chart.add_data(beers, "beer_name", "count", "Number of checkins per beer", true);
            breweries_chart.add_data(breweries, "brewery_name", "count", "Number of checkins per brewery", true);
            styles_chart.add_data(styles, "key", "values", "Number of checkins per style", true);
            venues_chart.add_data(venues, "venue_name", "count", "Number of checkins per venue", true);
            beer_chart.draw();
            breweries_chart.draw();
            styles_chart.draw();
            venues_chart.draw();
            calc_time(checkins);

            check_valid_dates();
            
        });
    }

    function calc_time(checkins) {

        function zero(time) {
            return (time < 10 ? "0" : "") + time +  ":00";
        }

        var days_seen = [];

        var days = [
            {'day': 'Sunday', 'count': 0, 'days_seen': 0, 'average': 0},
            {'day': 'Monday', 'count': 0, 'days_seen': 0, 'average': 0},
            {'day': 'Tuesday', 'count': 0, 'days_seen': 0, 'average': 0},
            {'day': 'Wednesday', 'count': 0, 'days_seen': 0, 'average': 0},
            {'day': 'Thursday', 'count': 0, 'days_seen': 0, 'average': 0},
            {'day': 'Friday', 'count': 0, 'days_seen': 0, 'average': 0}, 
            {'day': 'Saturday', 'count': 0, 'days_seen': 0, 'average': 0},
        ];

        var times = [];

        for(var i in d3.range(0, 24)) {
            times.push({'time': zero(i), 'count': 0, 'average': 0});
        }

        checkins.forEach(function(c) {
            var d = new Date(c.time);
            var d_string = d.toDateString();
            if(days_seen.indexOf(d_string) === -1) {
                days_seen.push(d_string);
                days[d.getDay()].days_seen +=1;
            }
            days[d.getDay()].count += 1;
            times[d.getHours()].count += 1;
        });

        days.forEach(function(d) {
            if(d.days_seen > 0) {
                d.average = d.count / d.days_seen;    
            }
        });

        times.forEach(function(t) {
            t.average = t.count / days_seen.length;
        });

        day_chart.add_data(days, 'day', 'average', 'Average beers drunk per day', false);
        time_chart.add_data(times, 'time', 'average', 'Average beers drunk per hour', false);
        day_chart.draw();
        time_chart.draw();

        d3.xhr("http://bardiff-martinjc.rhcloud.com/api/checkins", function(err, checkins){
            checkins = JSON.parse(checkins.response);
            year_chart.add_data(checkins);
            year_chart.draw();
        });
    }
}());