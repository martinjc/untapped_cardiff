/* global d3, queue, WeekHandler, DayChart, BarChart, SingleDayChart, MapChart */

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
    var map_chart = new MapChart('map-container');
    var single_day_chart = new SingleDayChart("#pastday .vis", {top: 10, bottom: 70, left: 50, right: 10});

    window.addEventListener("resize", function(){
        day_chart.draw();
        time_chart.draw();
        year_chart.draw();            
        beer_chart.draw();
        map_chart.draw();
        breweries_chart.draw();
        styles_chart.draw();
        venues_chart.draw();
        single_day_chart.draw();
    });

    function get_month(m) {
        if(m === 0) {
            return "Jan";
        } else if(m === 1) {
            return "Feb";
        } else if(m === 2) {
            return "Mar";
        } else if(m === 3) {
            return "Apr";
        } else if(m === 4) {
            return "May";
        } else if(m === 5) {
            return "Jun";
        } else if(m === 6) {
            return "Jul";
        } else if(m === 7) {
            return "Aug";
        } else if(m === 8) {
            return "Sep";
        } else if(m === 9) {
            return "Oct";
        } else if(m === 10) {
            return "Nov";
        } else if(m === 11) {
            return "Dec";
        } 
    }

    function get_day(d) {
        if(d === 0) {
            return "Sunday";
        } else if (d === 1) {
            return "Monday";
        } else if (d === 2) {
            return "Tuesday";
        } else if (d === 3) {
            return "Wednesday";
        } else if (d === 4) {
            return "Thursday";
        } else if (d === 5) {
            return "Friday";
        } else if (d === 6) {
            return "Saturday";
        }
    }

    function past_24_hours(stats, now, yesterday) {

        stats.forEach(function(s){
            s.time = new Date(s.time);
            s.time.setMinutes(s.time.getMinutes()-(s.time.getMinutes()%10));
            s.time.setSeconds(0);
            s.time.setMilliseconds(0);
        });
        var data = d3.nest()
                    .key(function(d){ return new Date(d.time.getFullYear(), d.time.getMonth(), d.time.getDate(), d.time.getHours(), d.time.getMinutes()); })
                    .rollup(function(leaves) { return leaves.length; })
                    .entries(stats);
        var chart_data = {};
        chart_data.now = now;
        chart_data.yesterday = yesterday;
        chart_data.times = data;
        single_day_chart.add_data(chart_data, "key", "values", "Number of Beers Drunk");
        single_day_chart.draw();
    }

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

    function go_back() {
        pageState = "previousweek";
        if(week_handler.can_page_back()) {
            week_handler.page_back();
            window.history.pushState({}, "", location + week_handler.get_query_string());
            do_dashboard(week_handler.get_query_string());
        }
        checkState();        
    }

    d3.select('#previous').on("click", go_back);

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

    function showall() {
        pageState = "all";
        window.history.pushState({"all": "all"}, "", location + "?all=all");
        do_dashboard("");
        checkState();        
    }

    d3.select('#showall').on('click', showall);

    function check_valid_dates() {
        if(week_handler.can_page_back() && pageState !== "all") {
            d3.select('#previous').attr("disabled", null);
        } else {
            d3.select('#previous').attr("disabled", "disabled");
        }
        if(week_handler.can_page_forward() && pageState !== "all") {
            d3.select('#next').attr("disabled", null);
        } else {
            d3.select('#next').attr("disabled", "disabled"); 
        }
    }

    function do_dashboard(date_query) {

        var now = new Date();
        var yesterday = new Date();
        yesterday.setUTCDate(now.getUTCDate()-1);
        now.setUTCHours(now.getUTCHours()+4);
        yesterday.setUTCHours(yesterday.getUTCHours()+4);

        var previous_day = "?from=" + yesterday.toUTCString() + "&to=" + now.toUTCString();
        console.log(previous_day);
        queue()
        .defer(d3.xhr, "http://bardiff-martinjc.rhcloud.com/api/venues" + date_query)
        .defer(d3.xhr, "http://bardiff-martinjc.rhcloud.com/api/breweries" + date_query)
        .defer(d3.xhr, "http://bardiff-martinjc.rhcloud.com/api/beers" + date_query)
        .defer(d3.xhr, "http://bardiff-martinjc.rhcloud.com/api/checkins" + date_query)
        .defer(d3.xhr, "http://bardiff-martinjc.rhcloud.com/api/checkins" + previous_day)
        .await(function(error, venues, breweries, beers, checkins, stats){

            venues = JSON.parse(venues.response);
            breweries = JSON.parse(breweries.response);
            beers = JSON.parse(beers.response);
            checkins = JSON.parse(checkins.response);
            stats = JSON.parse(stats.response);
            now.setUTCHours(now.getUTCHours()-4);
            yesterday.setUTCHours(yesterday.getUTCHours()-4);
            past_24_hours(stats, now, yesterday);

            console.log(checkins);

            if(error) {
                console.log(error);
            }

            if(checkins.length === 0) {
                pageState = "previousweek";
                if(week_handler.can_page_back()) {
                    week_handler.page_back();
                    window.history.pushState({}, "", location + week_handler.get_query_string());
                    do_dashboard(week_handler.get_query_string());
                }
                checkState();
                return;
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

            var l = new Date(latest);
            var e = new Date(earliest);

            if(window.innerWidth < 760) {
                l_string = "" + l.getUTCDate() + "/" + (l.getUTCMonth()+1) + "/" + l.getUTCFullYear();
                e_string = "" + e.getUTCDate() + "/" + (e.getUTCMonth()+1) + "/" + e.getUTCFullYear();
            } else {
                l_string = "" + get_day(l.getUTCDay()) + " " + l.getUTCDate() + " " + get_month(l.getUTCMonth()) + " " + l.getUTCFullYear();
                e_string = "" + get_day(e.getUTCDay()) + " " + e.getUTCDate() + " " + get_month(e.getUTCMonth()) + " " + e.getUTCFullYear();           
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

            var style_list = {};
            styles.forEach(function(s){
                style_list[s.key] = [];
                beers.forEach(function(b){
                    if(b.beer_style === s.key) {
                        style_list[s.key].push(b);
                    }
                });
                style_list[s.key].sort(function(a, b) {
                    if (a.count > b.count) {
                        return -1;
                    } else if(a.count < b.count) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                style_list[s.key] = style_list[s.key].slice(0, 10);
            });

            var style_tooltip = function(d) {
                var text = "";
                style_list[d.key].forEach(function(b, i) {
                    text += "" + (i+1) + ". " + b.beer_name + " " + b.beer_abv + "% <br>";
                });
                return text;
            };

            var beer_tooltip = function(d) {
                var text = "";
                text += "<img src='" + d.beer_label + "' width=40><br>" + d.beer_name + "<br>ABV: " + d.beer_abv + "%<br>Style: " + d.beer_style;
                return text;
            };

            var venue_tooltip = function(d) {
                var text = "";
                text += d.venue_name + "<br>";
                if(d.contact.twitter) {
                    text += d.contact.twitter + "<br>";
                }
                if(d.location.venue_address) {
                    text += d.location.venue_address + "<br>";
                }
                if(d.location.venue_city) {
                    text += d.location.venue_city;
                }
                return text;
            };

            var brewery_tooltip = function(d) {
                var text = "";
                text += "<img src='" + d.brewery_label + "' width=40><br>" + d.brewery_name + "<br>" + d.contact.url + "<br>" + "@" + d.contact.twitter;
                return text;
            };

            beer_chart.add_data(beers, "beer_name", "count", "Number of checkins per beer", true, beer_tooltip);
            breweries_chart.add_data(breweries, "brewery_name", "count", "Number of checkins per brewery", true, brewery_tooltip);
            styles_chart.add_data(styles, "key", "values", "Number of checkins per style", true, style_tooltip);
            venues_chart.add_data(venues, "venue_name", "count", "Number of checkins per venue", true, venue_tooltip);
            map_chart.add_data(venues);
            map_chart.draw();
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

        day_chart.add_data(days, 'day', 'average', 'Average beers drunk per day', false, null);
        time_chart.add_data(times, 'time', 'average', 'Average beers drunk per hour', false, null);
        day_chart.draw();
        time_chart.draw();

        d3.xhr("http://bardiff-martinjc.rhcloud.com/api/checkins", function(err, checkins){
            checkins = JSON.parse(checkins.response);
            year_chart.add_data(checkins);
            year_chart.draw();
        });
    }
}());