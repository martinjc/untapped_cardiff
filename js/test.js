        // the width and height of the visualisation
        var width;
        var height;

        var padding = {
            top: 10,
            bottom: 140,
            left: 100,
            right: 20
        }

        var transition_duration = 2000;

        var do_year = function(checkins) {

            var checkin_data = {};

            var day = d3.time.format("%w");
            var week = d3.time.format("%U");
            var percent = d3.format(".1%");
            var format = d3.time.format("%Y-%m-%d");

            var colour_scale = d3.scale.quantile().range(colorbrewer.Reds[9]);

            var g = document.getElementById("day_box");
            g = g.getElementsByClassName("vis")[0];
            width = g.clientWidth;
            height = g.clientHeight;
            height = height - padding.bottom;

            var cellSize = width / 60;

            // the svg element that will hold the visualisation
            var svg = d3.select("#day_box .vis").selectAll('svg')
                .data([2015])
                .enter()
                .append("svg")
                .attr("height", height+padding.top+padding.bottom)
                .attr("width", width);

            svg.append("text")
                .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
                .style("text-anchor", "middle")
                .text(function(d) { return d; });

            var rect = svg.selectAll(".day")
                .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
              .enter().append("rect")
                .attr("class", "day")
                .attr("fill", "none")
                .attr("stroke", "#ccc")
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("x", function(d) { return week(d) * cellSize; })
                .attr("y", function(d) { return day(d) * cellSize; })
                .datum(format);

            rect.append('title')
                .text(function(d){return d;})
            var months = svg.selectAll(".month")
                .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
              .enter().append("g")
                .attr("class", "month");

            months.append('path')
                .attr("d", monthPath);

            months.append('text')
                .text(function(d){ return get_month(d.getMonth()); })
                .attr("x", function(d){
                    w0 = +week(d);
                    return (w0 + 1) * cellSize;
                 })
                .attr("y", function(d){
                    return 8 * cellSize;
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
            function monthPath(t0) {
              var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                  d0 = +day(t0), w0 = +week(t0),
                  d1 = +day(t1), w1 = +week(t1);
              return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
                  + "H" + w0 * cellSize + "V" + 7 * cellSize
                  + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
                  + "H" + (w1 + 1) * cellSize + "V" + 0
                  + "H" + (w0 + 1) * cellSize + "Z";
            }

            for(c in checkins) {
                date = new Date(checkins[c].time);
                date = date.toDateString();
                if(!(date in checkin_data)) {
                    checkin_data[date] = 1;
                }
                else {
                    checkin_data[date] = checkin_data[date] + 1
                }
            }
            var max = 0;
            for(date in checkin_data) {
                if(checkin_data[date] > max) {
                    max = checkin_data[date];
                }
            }

            colour_scale.domain([1, max]);

            rect.filter(function(d) { return new Date(d).toDateString() in checkin_data; })
              .attr("fill", function(d) {return colour_scale(checkin_data[new Date(d).toDateString()]); });
        }

        var calc_time = function(checkins) {

            function zero(time) {
                return (time < 10 ? "0" : "") + time +  ":00";
            }

            days_seen = [];

            var days = [
            {'day': 'Sunday', 'count': 0, 'days_seen': 0, 'average': 0},
            {'day': 'Monday', 'count': 0, 'days_seen': 0, 'average': 0},
            {'day': 'Tuesday', 'count': 0, 'days_seen': 0, 'average': 0},
            {'day': 'Wednesday', 'count': 0, 'days_seen': 0, 'average': 0},
            {'day': 'Thursday', 'count': 0, 'days_seen': 0, 'average': 0},
            {'day': 'Friday', 'count': 0, 'days_seen': 0, 'average': 0}, 
            {'day': 'Saturday', 'count': 0, 'days_seen': 0, 'average': 0},
            ]
            var times = d3.range(0, 23);

            var times = []
            for(i in d3.range(0, 24)) {
                times.push({'time': zero(i), 'count': 0, 'average': 0});
            }

            checkins.forEach(function(c) {
                d = new Date(c.time);
                d_string = d.toDateString();
                if(days_seen.indexOf(d_string) === -1) {
                    days_seen.push(d_string);
                    days[d.getDay()].days_seen +=1;
                }
                days[d.getDay()].count += 1;
                times[d.getHours()].count += 1;
            });

            days.forEach(function(d) {
                d.average = d.count / d.days_seen;
            });

            times.forEach(function(t) {
                t.average = t.count / days_seen.length;
            })

            draw_plot('day', days, 'average', 'day', false, 'Average beers drunk per day');
            draw_plot('hour', times, 'average', 'time', false, 'Average beers drunk per hour');

        }

        var draw_plot = function(element, data, value_label, x_label, sort, y_axis_label) {

            var g = document.getElementById(element);
            g = g.getElementsByClassName("vis")[0];
            width = g.clientWidth;
            height = g.clientHeight;
            height = height - padding.bottom;

            if(width < 400) {
                max_bars = 10;
            } else if(width > 400 & width < 1000) {
                max_bars = 15;
            } else {
                max_bars = 20;
            }

            // the svg element that will hold the visualisation
            var svg;

            // a scale of colours
            var colour_scale = d3.scale.quantile().range(colorbrewer.Reds[9]);

            // define x-scale and y-scale
            var x_scale = d3.scale.ordinal();
            var y_scale = d3.scale.linear().nice();

            // define xaxis
            var x_axis = d3.svg.axis()
              .scale(x_scale)
              .orient("bottom")
              .ticks(8);

            // define Y axis
            var y_axis = d3.svg.axis()
              .scale(y_scale)
              .orient("left")
              .ticks(8);

            x_scale.rangeRoundBands([padding.left, width-padding.right], 0.1);
            y_scale.range([height, padding.top]);

            svg = d3.select("#" + element + " .vis")
                .append("svg")
                .attr("height", height+padding.top+padding.bottom)
                .attr("width", width);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")");

            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + padding.left + ",0)");

            if(sort) {
                data.sort(function(a, b){
                    if (a[value_label] > b[value_label]) {
                        return -1;
                    }
                    if (a[value_label] < b[value_label]) {
                        return 1;
                    }
                    return 0;
                })

                data = data.slice(0,max_bars);                
            }





            bars = svg
                .selectAll(".bar")
                .data(data);               

            bars
                .enter()
                .append("rect")
                .attr("x", function(d){ return x_scale(d[x_label]); })
                .attr("y", height)
                .attr("width", x_scale.rangeBand())
                .attr("height", 0 )
                .attr("fill", function(d) {
                    return colour_scale(d[value_label]);
                })
                .attr("class", "bar");

            bars       
                .transition()
                .duration(transition_duration)
                .attr("y", function(d){ return y_scale(d[value_label]); })
                .attr("height", function(d){ return height - y_scale(d[value_label])})

            bars
                .exit()
                .transition()
                .duration(transition_duration)
                .attr("y", height)
                .attr("height", 0)
                .remove();

            // create x-axis
            svg.select(".x.axis")
                .transition()
                .duration(transition_duration)
                .call(x_axis)
                .selectAll("text")  
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-35)" 
                    });
            
            // create y-axis
            svg.select(".y.axis")
                .transition()
                .duration(transition_duration)
                .call(y_axis);
            svg.select(".y.axis")
                .append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("dx", "-4em")
                .attr("dy", "-3.5em")
                .attr("transform", "rotate(-90)")
                .text(y_axis_label);
        }

        var init = function() { 
            queue()
                .defer(d3.json, "data/venues.json")
                .defer(d3.json, "data/breweries.json")
                .defer(d3.json, "data/beers.json")
                .defer(d3.json, "data/checkins.json")
                .await(function(error, venues, breweries, beers, checkins){
                    console.log(venues);
                    console.log(breweries);
                    console.log(beers);
                    console.log(checkins);


                    styles = d3.nest()
                    .key(function(d) {
                      return d.beer_style;
                    })
                    .rollup(function(d) {
                      return d3.sum(d, function(g) {
                        return g.count;
                      });
                    })
                    .entries(beers);

                    console.log(styles);

                    earliest = Date.parse(checkins[0].time);
                    latest = earliest;
                    checkins.forEach(function(d) {
                        var t = Date.parse(d.time);
                        if(t < earliest) {
                            earliest = t;
                        }
                        if(t > latest) {
                            latest = t;
                        }
                    })

                    l = new Date(latest);
                    e = new Date(earliest);

                    l_string = l.toDateString();
                    e_string = e.toDateString();

                    d3.select('#from-date').text(e_string);
                    d3.select('#to-date').text(l_string);

                    draw_plot("where", venues, "count", "venue_name", true, "Number of beers drunk at Venue");
                    draw_plot("breweries", breweries, "count", "brewery_name", true, "Number of beers drunk from brewery");
                    draw_plot("beers", beers, "count", "beer_name", true, "Number of checkins per beer");
                    draw_plot("styles", styles, "values", "key", true, "Number of beers drunk per style");

                    calc_time(checkins);
                    do_year(checkins);
                })
        }();