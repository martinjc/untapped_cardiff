/* global d3, colorbrewer */
(function(){

    function SingleDayChart(element_selector, padding) {
        this.transition_duration = 1000;

        this.element_selector = element_selector;
        this.padding = padding;

        this.colour_scale = d3.scale.quantile().range(colorbrewer.Reds[7]);

        this.svg = d3.select(this.element_selector)
            .append("svg");

        this.svg.append("g")
            .attr("class", "x axis");
            
        this.svg.append("g")
            .attr("class", "y axis");

        this.x_scale = d3.time.scale.utc();
        this.y_scale = d3.scale.linear().nice();

        this.x_axis = d3.svg.axis()
          .scale(this.x_scale)
          .orient("bottom")
          .ticks(d3.time.minute, 30)
          .tickFormat(d3.time.format("%I:%M%p"));

        this.y_axis = d3.svg.axis()
          .scale(this.y_scale)
          .orient("left")
          .ticks(8);

        this.set_size();
        this.data = undefined;
        this.display_data = undefined;      
    }

    SingleDayChart.prototype.set_size = function() {
        this.width = +d3.select(this.element_selector).node().getBoundingClientRect().width;
        this.height = +d3.select(this.element_selector).node().getBoundingClientRect().height;

        this.x_scale.range([this.padding.left, this.width-this.padding.right]);
        this.y_scale.range([this.height-this.padding.bottom, this.padding.top]);

        this.svg
            .transition()
            .attr("height", this.height)
            .attr("width", this.width);

        d3.select(".x.axis")
            .attr("transform", "translate(0," + (this.height - this.padding.bottom) + ")");

        d3.select(".y.axis")
            .attr("transform", "translate(" + this.padding.left + ",0)");          
    };

    SingleDayChart.prototype.add_data = function(data, x, y, y_label) {
        this.set_size();
        var chart = this;

        this.data = data;
        this.x = x;
        this.y = y;
        this.y_label = y_label;

        chart.display_data = chart.data.times;

        //this.x_labels = this.display_data.map(function(d){ return d[x]; });
        var largest_data_value = d3.max(this.display_data, function(d){ return d[chart.y]; });
        this.x_scale.domain([data.yesterday, data.now]);
        this.y_scale.domain([0, largest_data_value]);
        this.colour_scale.domain([0, largest_data_value]);        
    };

    SingleDayChart.prototype.draw = function() {
        this.set_size();
        var chart = this;

        var bars = this.svg
            .selectAll(".bar")
            .data(chart.display_data);

        bars
            .enter()
            .append("rect")
            .attr("x", function(d){ return chart.x_scale(new Date(d[chart.x])); })
            .attr("y", chart.height-chart.padding.bottom)
            .attr("width", "3px")
            .attr("height", 0 )
            .attr("fill", function(d) {
                return chart.colour_scale(d[chart.y]);
            })
            .attr("class", "bar");

        bars       
            .transition()
            .duration(chart.transition_duration)
            .attr("fill", function(d) {
                return chart.colour_scale(d[chart.y]);
            })
            .attr("width", "3px")
            .attr("x", function(d){ return chart.x_scale(new Date(d[chart.x])); })
            .attr("y", function(d){ return chart.y_scale(d[chart.y]); })
            .attr("height", function(d){ return chart.height-chart.padding.bottom - chart.y_scale(d[chart.y]);});

        bars
            .exit()
            .transition()
            .duration(this.transition_duration)
            .attr("y", chart.height)
            .attr("height", 0)
            .remove();


        if(this.width < 1000) {
            this.x_axis.ticks(d3.time.minute, 80);
        } else if(this.width < 800) {
            this.x_axis.ticks(d3.time.minute, 120);
        } else {
            this.x_axis.ticks(d3.time.minute, 30);
        }

        this.svg.select(".x.axis")
            .attr("transform", "translate(0," + (this.height - this.padding.bottom) + ")")
            .transition()
            .duration(this.transition_duration)
            .call(this.x_axis)
            .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "-.5em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-35)");
        
        this.svg.select(".y.axis")
            .attr("transform", "translate(" + this.padding.left + ",0)")
            .transition()
            .duration(this.transition_duration)
            .call(this.y_axis);

        this.svg.select(".y.axis")
            .append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("dx", "-3em")
            .attr("dy", "-3em")
            .attr("transform", "rotate(-90)")
            .text(this.y_label);      
    };

    function DayChart(element_selector) {

        this.width = undefined;
        this.height = undefined;

        this.element_selector = element_selector;

        this.checkin_data = {};

        this.day = d3.time.format("%w");
        this.week = d3.time.format("%U");
        this.percent = d3.format(".1%");
        this.format = d3.time.format("%Y-%m-%d");

        this.colour_scale = d3.scale.quantile().range(colorbrewer.Reds[7]);

        this.svg = d3.select(element_selector).selectAll('svg')
            .data([2015])
            .enter()
            .append('svg');

        this.set_size();

        this.cellSize = this.width / 53;
    }

    DayChart.prototype.set_size = function() {
        this.width = +d3.select(this.element_selector).node().getBoundingClientRect().width;
        this.height = +d3.select(this.element_selector).node().getBoundingClientRect().height;

        this.svg
            .transition()
            .attr("height", this.height)
            .attr("width", this.width);

        this.cellSize = (this.width) / 53;
    };

    DayChart.prototype.add_data = function(checkins) {

        this.checkins = checkins;
    };

    DayChart.prototype.draw = function() {
        this.set_size();

        this.svg.selectAll(".day").remove();
        this.svg.selectAll(".month").remove();


        var chart = this;

        this.rect = this.svg.selectAll(".day")
            .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter()
            .append("rect")
            .attr("class", "day")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("width", this.cellSize)
            .attr("height", this.cellSize)
            .attr("x", function(d) { return (chart.week(d) * chart.cellSize); })
            .attr("y", function(d) { return (chart.day(d) * chart.cellSize); })
            .datum(this.format);

        var months = this.svg.selectAll(".month")
            .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("g")
            .attr("class", "month");

        var monthPath = function(t0) {
            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                d0 = +chart.day(t0), w0 = +chart.week(t0),
                d1 = +chart.day(t1), w1 = +chart.week(t1);
            return "M" + ((w0 + 1) * chart.cellSize) + "," + d0 * chart.cellSize + 
                "H" + w0 * chart.cellSize + "V" + 7 * chart.cellSize + 
                "H" + w1 * chart.cellSize + "V" + (d1 + 1) * chart.cellSize + 
                "H" + (w1 + 1) * chart.cellSize + "V" + 0 +
                "H" + (w0 + 1) * chart.cellSize + "Z";
        };


        months.append('path')
            .attr("d", monthPath);

        months.append('text')
            .text(function(d){ return chart.get_month(d.getMonth()); })
            .attr("x", function(d){
                var w0 = +chart.week(d);
                return (w0 + 1) * chart.cellSize;
             })
            .attr("y", 8 * chart.cellSize);

        for(var c in this.checkins) {
            var date = new Date(this.checkins[c].time);
            date = date.toDateString();
            if(!(date in this.checkin_data)) {
                this.checkin_data[date] = 1;
            }
            else {
                this.checkin_data[date] = this.checkin_data[date] + 1;
            }
        }
        var max = 0;
        for(var d in this.checkin_data) {
            if(this.checkin_data[d] > max) {
                max = this.checkin_data[d];
            }
        }

        this.colour_scale.domain([1, max]);

        this.rect.filter(function(d) { return new Date(d).toDateString() in chart.checkin_data; })
          .attr("fill", function(d) {return chart.colour_scale(chart.checkin_data[new Date(d).toDateString()]); });
    };
                
    DayChart.prototype.get_month = function(m) {
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
    };

    DayChart.prototype.get_day = function(d) {
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
    };


function TimeLine(element_selector, padding) {
    this.transition_duration = 1000;

    this.element_selector = element_selector;
    this.padding = padding;

    this.colour_scale = d3.scale.quantile()
        .range(colorbrewer.Reds[7]);

    this.svg = d3.select(this.element_selector)
        .append('svg');

    this.svg.append("g")
        .attr("class", "x axis");
        
    this.svg.append("g")
        .attr("class", "y axis");

    var x_scale = d3.time.scale().nice();
    var y_scale = d3.scale.linear().nice();

    this.line = d3.svg.line()
        .x(function(d){ return x_scale(new Date(d.date)); })
        .y(function(d){ return y_scale(d.count); })
        .interpolate('step-after');

    this.x_scale = x_scale;
    this.y_scale = y_scale;

    var format = d3.time.format("%a %b %d %I%p");

    this.x_axis = d3.svg.axis()
      .scale(x_scale)
      .orient("bottom")
      .tickFormat(format);

    this.y_axis = d3.svg.axis()
      .scale(y_scale)
      .orient("left")
      .ticks(8);

    this.set_size();
    this.data = undefined;
}

TimeLine.prototype.set_size = function() {
    this.width = +d3.select(this.element_selector).node().getBoundingClientRect().width;
    this.height = +d3.select(this.element_selector).node().getBoundingClientRect().height;

    var left_indent = 200;
    if(this.width < 1000) {
        left_indent = 70;
    }

    this.x_scale.range([this.padding.left, this.width-this.padding.right-left_indent], 0.1);
    this.y_scale.range([this.height-this.padding.bottom, this.padding.top]);

    this.svg
        .transition()
        .attr("height", this.height)
        .attr("width", this.width);

    d3.select(".x.axis")
        .attr("transform", "translate(0," + (this.height - this.padding.bottom) + ")");

    d3.select(".y.axis")
        .attr("transform", "translate(" + this.padding.left + ",0)");       
};

TimeLine.prototype.add_data = function(checkins, items, item_id_property, item_display_property, checkin_id_property, y_label) {
    this.set_size();

    this.y_label = y_label;

    this.data = [];
    var ids = [];
    for(var i in items) {
        if(ids.indexOf(items[i][item_id_property]) === -1) {
            this.data.push({
                id: items[i][item_id_property],
                name: items[i][item_display_property],
                data: [],
                count: 0
            });
            ids.push(items[i][item_id_property]);
        }
    }

    var min_date = new Date(checkins[0].time);
    var max_date = new Date(checkins[0].time);
    var max_count = 0;

    for(var c in checkins) {
        var item = null;
        for(var d in this.data) {
            if(this.data[d].id === checkins[c][checkin_id_property]) {
                item = this.data[d];
                break;
            }
        }
        var count = item.count;
        var datapoint = {
            date: checkins[c].time,
            count: count + 1,            
        };
        item.data.push(datapoint);
        item.count += 1;
        if(new Date(checkins[c].time) < min_date) {
            min_date = new Date(checkins[c].time);
        }
        if(new Date(checkins[c].time) > max_date) {
            max_date = new Date(checkins[c].time);
        }
        if(item.count > max_count) {
            max_count = item.count;
        }
    }

    for(var dj in this.data) {
        this.data[dj].data.push({
            date: max_date,
            count: this.data[dj].count,
        });
    }

    this.data = this.data.sort(function(a, b){
        return b.count - a.count;
    });
    this.data = this.data.slice(0, 7);

    min_date.setHours(min_date.getHours()-2);
    min_date.setMinutes(0);
    max_date.setHours(max_date.getHours()+2);
    max_date.setMinutes(0);

    this.x_scale.domain([min_date, max_date]);
    this.y_scale.domain([0, max_count+10]);
    this.colour_scale.domain([max_count, 0]);
    this.draw();
};

TimeLine.prototype.draw = function() {
    this.set_size();
    var chart = this;

    this.svg.selectAll('.line')
        .transition()
        .duration(this.transition_duration)
        .attr('d', 'M 0,' + (this.height - this.padding.bottom) + 'L ' + this.padding.left + ',' + (this.height - this.padding.bottom))
        .remove();
    
    this.svg.selectAll('.label')
        .remove();

    this.svg.selectAll('.pointer')
        .remove();

    var lines = this.svg.selectAll('.line')
        .data(this.data);

    lines
        .enter()
        .append('path');
    
    lines
        .transition()
        .duration(chart.transition_duration)
        .attr('class', 'line')
        .attr('stroke', function(d) {
            return chart.colour_scale(d.count);
        })
        .attr('d', function(d){
            return chart.line(d.data);
        });

    var labels = this.svg.selectAll('.label')
        .data(this.data);

    labels
        .enter()
        .append('text');

    var ys = [];

    labels
        .transition()
        .duration(chart.transition_duration)
        .attr('class', 'label')
        .attr("x", function(d){
            var max_date = d3.max(d.data, function(di){
                return new Date(di.date);
            });
            return chart.x_scale(max_date) + 10;
        })
        .attr("y", function(d){
            var y_point = chart.y_scale(d.count);
            if(ys.length > 0) {
                var last_y = ys[ys.length-1];
                if(y_point - last_y < 15) {
                    y_point = last_y + 15;
                }
            }
            ys.push(y_point);
            return y_point;
        })
        .attr("fill", function(d){
            return chart.colour_scale(d.count);
        })
        .attr("stroke-width", "0.3px")
        .attr("stroke", "black")
        .text(function(d){
            return d.name;
        });


    var pointers = this.svg.selectAll('.pointer')
        .data(this.data);

    pointers
        .enter()
        .append('line')
        .attr('class', 'pointer')
        .attr('x1', function(d){
            var max_date = d3.max(d.data, function(di){
                return new Date(di.date);
            });
            return chart.x_scale(max_date);
        })
        .attr('y1', function(d) {
            return chart.y_scale(d.count);
        })
        .attr('x2', function(d){
            var max_date = d3.max(d.data, function(di){
                return new Date(di.date);
            });
            return chart.x_scale(max_date) + 8;
        })
        .attr('y2', function(d, i){
            return ys[i]-5;
        })
        .attr('stroke', 'black')
        .attr('stroke-width', '1px');

    lines
        .exit()
        .remove();

    labels
        .exit()
        .remove();

    this.svg.select(".x.axis")
        .attr("transform", "translate(0," + (this.height - this.padding.bottom) + ")")
        .transition()
        .duration(this.transition_duration)
        .call(this.x_axis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.5em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-35)");
    
    this.svg.select(".y.axis")
        .attr("transform", "translate(" + this.padding.left + ",0)")
        .transition()
        .duration(this.transition_duration)
        .call(this.y_axis);

    this.svg.select(".y.axis")
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("dx", "-6em")
        .attr("dy", "-3em")
        .attr("transform", "rotate(-90)")
        .text(this.y_label); 
};


function BarChart(element_selector, padding) {

    this.transition_duration = 1000;

    this.element_selector = element_selector;
    this.padding = padding;

    this.colour_scale = d3.scale.quantile().range(colorbrewer.Reds[7]);

    this.svg = d3.select(this.element_selector)
        .append("svg");

    this.svg.append("g")
        .attr("class", "x axis");
        
    this.svg.append("g")
        .attr("class", "y axis");

    this.x_scale = d3.scale.ordinal();
    this.x_label_scale = d3.scale.ordinal();
    this.y_scale = d3.scale.linear().nice();

    this.x_axis = d3.svg.axis()
      .scale(this.x_scale)
      .orient("bottom")
      .ticks(10);

    this.y_axis = d3.svg.axis()
      .scale(this.y_scale)
      .orient("left")
      .ticks(8);

    this.set_size();
    this.data = undefined;
    this.display_data = undefined;

    this.tooltip = d3.select(this.element_selector)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background-color", "rgba(255,255,255,0.8)")
        .text("a simple tooltip");
    this.tooltip_active = false;

}

BarChart.prototype.set_size = function() {
    this.width = +d3.select(this.element_selector).node().getBoundingClientRect().width;
    this.height = +d3.select(this.element_selector).node().getBoundingClientRect().height;

    this.x_scale.rangeRoundBands([this.padding.left, this.width-this.padding.right], 0.1);
    this.y_scale.range([this.height-this.padding.bottom, this.padding.top]);

    this.svg
        .transition()
        .attr("height", this.height)
        .attr("width", this.width);

    d3.select(".x.axis")
        .attr("transform", "translate(0," + (this.height - this.padding.bottom) + ")");

    d3.select(".y.axis")
        .attr("transform", "translate(" + this.padding.left + ",0)");

    if(this.width <= 400) {
        this.num_bars = 10;
    } else if(this.width > 400 && this.width <= 600) {
        this.num_bars = 15;
    } else {
        this.num_bars = 20;
    }        
};

BarChart.prototype.add_data = function(data, x, y, y_label, sorted_and_clipped, tooltip_function) {

    this.set_size();
    var chart = this;

    this.data = data;
    this.x = x;
    this.y = y;

    this.tooltip_function = tooltip_function;

    if(sorted_and_clipped) {
        this.data.sort(function(a, b) {
            if (a[chart.y] > b[chart.y]) {
                return -1;
            }
            if (a[chart.y] < b[chart.y]) {
                return 1;
            }
            return 0;
        });

        chart.display_data = chart.data.slice(0, this.num_bars);
    } else {
        chart.display_data = chart.data;
    }

    this.x_labels = this.display_data.map(function(d){ return d[x]; });

    var largest_data_value = d3.max(this.display_data, function(d){ return d[chart.y]; });

    this.x_scale.domain(this.x_labels);
    this.y_scale.domain([0, largest_data_value]);
    this.colour_scale.domain([0, largest_data_value]);

    this.y_label = y_label;
};

BarChart.prototype.draw = function() {

    this.set_size();
    var chart = this;

    var bars = this.svg
        .selectAll(".bar")
        .data(chart.display_data);

    bars
        .enter()
        .append("rect")
        .attr("x", function(d){ return chart.x_scale(d[chart.x]); })
        .attr("y", chart.height-chart.padding.bottom)
        .attr("width", chart.x_scale.rangeBand())
        .attr("height", 0 )
        .attr("fill", function(d) {
            return chart.colour_scale(d[chart.y]);
        })
        .attr("class", "bar")
        .on("mouseover", function(d){
            if(chart.tooltip_function) {
                chart.tooltip.html(chart.tooltip_function(d));
                chart.tooltip_active = true;
                chart.tooltip.style("visibility", "visible");                
            }

        })
        .on("mousemove", function(){
            if(chart.tooltip_function) {
                chart.tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
            }
            
        })
        .on("mouseout", function(){
            if(chart.tooltip_function) {
                chart.tooltip_active = false;
                chart.tooltip.style("visibility", "hidden");
            }
        })
        .on("click", function(d){
            if(chart.tooltip_function) {
                if(chart.tooltip_active) {
                    chart.tooltip.style("visibility", "hidden");
                    chart.tooltip_active = false;
                } else {
                    chart.tooltip.html(chart.tooltip_function(d));
                    chart.tooltip.style("visibility", "visible");
                    chart.tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
                    chart.tooltip_active = true;
                }
            }
        });

    bars       
        .transition()
        .duration(chart.transition_duration)
        .attr("fill", function(d) {
            return chart.colour_scale(d[chart.y]);
        })
        .attr("width", chart.x_scale.rangeBand())
        .attr("x", function(d){ return chart.x_scale(d[chart.x]); })
        .attr("y", function(d){ return chart.y_scale(d[chart.y]); })
        .attr("height", function(d){ return chart.height-chart.padding.bottom - chart.y_scale(d[chart.y]);});

    bars
        .exit()
        .transition()
        .duration(this.transition_duration)
        .attr("y", chart.height)
        .attr("height", 0)
        .remove();

    if(this.width < 600 && this.x_labels.length > 20) {
        var x_tick_labels = [];
        for(var i = 0; i < this.x_labels.length; i = i+2) {
            x_tick_labels.push(this.x_labels[i]);
        }
        this.x_axis.tickValues(x_tick_labels);
    } else {
        this.x_axis.tickValues(this.x_labels);
    }

    this.svg.select(".x.axis")
        .attr("transform", "translate(0," + (this.height - this.padding.bottom) + ")")
        .transition()
        .duration(this.transition_duration)
        .call(this.x_axis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.5em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-35)");
    
    this.svg.select(".y.axis")
        .attr("transform", "translate(" + this.padding.left + ",0)")
        .transition()
        .duration(this.transition_duration)
        .call(this.y_axis);

    this.svg.select(".y.axis")
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("dx", "-6em")
        .attr("dy", "-3em")
        .attr("transform", "rotate(-90)")
        .text(this.y_label); 
};

    this.BarChart = BarChart;
    this.DayChart = DayChart;
    this.TimeLine = TimeLine;
    this.SingleDayChart = SingleDayChart;

}());