/* global d3, colorbrewer */
(function(){

    function DayChart(element_selector) {

        this.width = undefined;
        this.height = undefined;

        this.element_selector = element_selector;

        this.checkin_data = {};

        this.day = d3.time.format("%w");
        this.week = d3.time.format("%U");
        this.percent = d3.format(".1%");
        this.format = d3.time.format("%Y-%m-%d");

        this.colour_scale = d3.scale.quantile().range(colorbrewer.Reds[9]);

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
            .attr("height", this.height)
            .attr("width", this.width);
    };

    DayChart.prototype.add_data = function(checkins) {

        this.checkins = checkins;
    };

    DayChart.prototype.draw = function() {
        this.set_size();
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
                .attr("x", function(d) { return chart.week(d) * chart.cellSize; })
                .attr("y", function(d) { return chart.day(d) * chart.cellSize; })
                .datum(this.format);

        var months = this.svg.selectAll(".month")
            .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("g")
            .attr("class", "month");

        var monthPath = function(t0) {
            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                d0 = +chart.day(t0), w0 = +chart.week(t0),
                d1 = +chart.day(t1), w1 = +chart.week(t1);
            return "M" + (w0 + 1) * chart.cellSize + "," + d0 * chart.cellSize + 
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



function BarChart(element_selector, padding) {

    this.transition_duration = 1000;

    this.element_selector = element_selector;
    this.padding = padding;

    this.colour_scale = d3.scale.quantile().range(colorbrewer.Reds[9]);

    this.svg = d3.select(this.element_selector)
        .append("svg");

    this.svg.append("g")
        .attr("class", "x axis");
        
    this.svg.append("g")
        .attr("class", "y axis");

    this.x_scale = d3.scale.ordinal();
    this.y_scale = d3.scale.linear().nice();

    this.x_axis = d3.svg.axis()
      .scale(this.x_scale)
      .orient("bottom");

    this.y_axis = d3.svg.axis()
      .scale(this.y_scale)
      .orient("left")
      .ticks(8);

    this.set_size();
    this.data = undefined;
    this.display_data = undefined;

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

BarChart.prototype.add_data = function(data, x, y, y_label, sorted_and_clipped) {

    this.set_size();
    var chart = this;

    this.data = data;
    this.x = x;
    this.y = y;

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
        .attr("class", "bar");

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

    this.svg.select(".x.axis")
        .attr("transform", "translate(0," + (this.height - this.padding.bottom) + ")")
        .transition()
        .duration(this.transition_duration)
        .call(this.x_axis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
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

}());