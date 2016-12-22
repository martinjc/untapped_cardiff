function barChart() {

    var width = 600;
    var height = 400;

    var padding = {top: 10, bottom: 200, left: 80, right: 10};

    var data = [];

    var y_label;

    var x_property = 'x';
    var y_property = 'y';

    var colour_scale = d3.scaleQuantile()
            .range(colorbrewer.Reds[7])
            .domain(d3.extent(data, function(d){ return d[y_property]; }));

    var transition_duration = 1000;

    var tooltip_function = undefined;

    var updateWidth;
    var updateHeight;
    var updateData;

    function chart(selection) {
        selection.each(function(){

            var x_scale = d3.scaleBand()
                .rangeRound([padding.left, width-padding.right], 0.1)
                .domain(data.map(function(d){ return d[x_property]; }))
                .paddingInner(0.1);
            var y_scale = d3.scaleLinear()
                .range([height - padding.bottom, padding.top])
                .domain([0, d3.max(data, function(d){ return d[y_property]; })]);

            colour_scale
                .domain(d3.extent(data, function(d){ return d[y_property]; }));

            var dom = d3.select(this);
            var svg = dom
                .append("svg")
                .attr('class', 'bar-chart')
                .attr('width', width)
                .attr('height', height);

            var bars = svg.selectAll('rect.bar')
                .data(data);

            var tooltip_active = false;
            var tooltip = dom
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .style("background-color", "rgba(255,255,255,0.8)")
                .text("a simple tooltip");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (height - padding.bottom) + ")");

            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + padding.left + ",0)");

            if(y_label) {
                svg.append('text')
                    .attr('class', 'y label')
            }

            var x_axis = d3.axisBottom(x_scale)

            var y_axis = d3.axisLeft(y_scale)
              .tickArguments([8]);

            draw = function() {

                var update = svg.selectAll('rect.bar')
                    .data(data);

                update
                    .exit()
                    .transition()
                    .duration(transition_duration)
                    .attr('y', function(d){ return height-padding.bottom; })
                    .attr('x', function(d){ return x_scale(d[x_property]); })
                    .attr('height', function(d){ return 0; })
                    .attr('width', function(d){ return x_scale.rangeBand(); })
                    .remove();

                update
                    .enter()
                        .append('rect')
                        .attr('class', 'bar')
                    .merge(update)
                        .attr('y', function(d){ return height-padding.bottom; })
                        .attr('x', function(d){ return x_scale(d[x_property]); })
                        .attr('width', function(d){ return x_scale.bandwidth(); })
                        .on("mouseover", function(d){
                            if(tooltip_function) {
                                tooltip.html(tooltip_function(d));
                                tooltip_active = true;
                                tooltip.style("visibility", "visible");
                            }
                        })
                        .on("mousemove", function(){
                            if(tooltip_function) {
                                tooltip
                                    .style("top", (d3.event.pageY-10)+"px")
                                    .style("left",(d3.event.pageX+10)+"px");
                            }

                        })
                        .on("mouseout", function(){
                            if(tooltip_function) {
                                tooltip_active = false;
                                tooltip.style("visibility", "hidden");
                            }
                        })
                        .on("click", function(d){
                            if(tooltip_function) {
                                if(tooltip_active) {
                                    tooltip.style("visibility", "hidden");
                                    tooltip_active = false;
                                } else {
                                    tooltip.html(tooltip_function(d));
                                    tooltip.style("visibility", "visible");
                                    tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
                                    tooltip_active = true;
                                }
                            }
                        })
                    .transition()
                    .duration(transition_duration)
                    .attr('x', function(d){ return x_scale(d[x_property]); })
                    .attr('y', function(d){ return y_scale(d[y_property]); })
                    .attr('height', function(d){ return height - padding.bottom - y_scale(d[y_property]); })
                    .attr('width', function(d){ return x_scale.bandwidth(); })
                    .attr('fill', function(d){ return colour_scale(d[y_property]); });

                svg.select(".x.axis")
                    .transition()
                    .duration(transition_duration)
                    .attr("transform", "translate(0," + (height - padding.bottom) + ")")
                    .call(x_axis)
                    .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.5em")
                        .attr("dy", ".15em")
                        .attr("transform", "rotate(-35)");

                svg.select(".y.axis")
                    .transition()
                    .duration(transition_duration)
                    .attr("transform", "translate(" + padding.left + ",0)")
                    .call(y_axis);

                if(y_label) {
                    svg.select(".y.label")
                        .attr("transform", "rotate(-90)")
                        .attr("text-anchor", "middle")
                        .attr("font-size", "12px")
                        .attr("dx", -(height-padding.bottom)/2)
                        .attr("dy", "2em")
                        .text(y_label);
                }

            };

            updateSize = function() {

                x_scale.rangeRoundBands([padding.left, width-padding.right], 0.1);
                y_scale.range([height - padding.bottom, padding.top]);

                svg
                    .transition()
                    .attr('width', width)
                    .attr('height', height);

                draw();

            };

            updateData = function() {
                x_scale.domain(data.map(function(d){ return d[x_property]; }));
                y_scale.domain(d3.extent(data, function(d){ return d[y_property]; }));
                colour_scale.domain(d3.extent(data, function(d){ return d[y_property]; }));
                draw();
            };

            draw();

        });
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        if (typeof updateSize === 'function') updateSize();
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        if (typeof updateSize === 'function') updateSize();
        return chart;
    };

    chart.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        if (typeof updateData === 'function') updateData();
        return chart;
    };

    chart.padding = function(value) {
        if (!arguments.length) return padding;
        padding = value;
        if (typeof updateSize === 'function') updateSize();
        return chart;
    };

    chart.y_label = function(value) {
        if(!arguments.length) return y_label;
        y_label = value;
        return chart;
    };

    chart.tooltip_function = function(value) {
        if(!arguments.length) return tooltip_function;
        tooltip_function = value;
        return chart;
    }

    return chart;

}
