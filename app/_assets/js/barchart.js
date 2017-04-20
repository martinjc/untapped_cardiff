function barChart() {

    var width = 400;
    var height = 400;

    var margin = {
        top: 10,
        bottom: 100,
        left: 120,
        right: 10
    };

    var data = [];

    var x_label;

    var x_property = 'x';
    var y_property = 'y';

    var colour_scale = d3.scaleQuantile()
        .range(colorbrewer.Reds[7])
        .domain(d3.extent(data, function(d) {
            return d[x_property];
        }));

    var transition_duration = 1000;

    var tooltip_function = undefined;

    var updateWidth;
    var updateHeight;
    var updateData;

    function wrap(text, w) {
        text.each(function(d, i) {
            var t = d3.select(this);
            var words = d
                .split(/\s+/)
                .reverse();
            console.log(words);
            var word;
            var line = [];
            var lineNumber = 0;
            var lineHeight = 1;
            var y = t.attr("y");
            var x = t.attr("x");
            var dy = parseFloat(t.attr("dy") || 0);
            var dx = parseFloat(t.attr("dx") || 0);
            var tspan = t.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y);
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node()
                    .getComputedTextLength() > (w - x - dx)) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = t.append("tspan")
                        .attr("x", x)
                        .attr("dy", "1em")
                        .attr("dx", dx + "em")
                        .text(word);
                    lineNumber += 1;
                }
            }
            if (lineNumber > 0) {
                t.attr('dy', (-1 * ((lineNumber / 2) - .25)) + "em");
            }
        });
    }

    function chart(selection) {
        selection.each(function() {

            var dom = d3.select(this);
            var svg = dom
                .append("svg")
                .attr('class', 'bar-chart')
                .attr('width', width)
                .attr('height', height)


            svg.append('text')
                .attr('class', 'x label')



            svg = svg
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');

            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;



            var x_scale = d3.scaleLinear()
                .rangeRound([0, width])
                .domain([0, d3.max(data, function(d) {
                    return d[x_property];
                })]);

            var y_scale = d3.scaleBand()
                .rangeRound([0, height])
                .domain(data.map(function(d) {
                    return d[y_property];
                }))
                .paddingInner(0.2);;

            colour_scale
                .domain(d3.extent(data, function(d) {
                    return d[x_property];
                }));


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

            var x_axis = d3.axisBottom(x_scale)

            var y_axis = d3.axisLeft(y_scale);

            svg.append('g')
                .attr('class', 'bars');

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")");

            svg.append("g")
                .attr("class", "y axis");

            draw = function() {

                function tooltip_position() {
                    var full_width = +dom.style('width')
                        .replace('px', '');
                    var tooltip_width = +tooltip.style('width')
                        .replace('px', '');
                    return ((full_width - d3.event.pageX) > tooltip_width ? (d3.event.pageX + 10) : (d3.event.pageX - tooltip_width - 10)) + "px";
                }

                var update = svg.select('.bars')
                    .selectAll('rect.bar')
                    .data(data, function(d) {
                        return d.id;
                    });

                update
                    .exit()
                    .transition()
                    .duration(transition_duration)
                    .attr('y', function(d) {
                        return height - margin.bottom;
                    })
                    .attr('x', function(d) {
                        return 0;
                    })
                    .attr('height', function(d) {
                        return y_scale.bandwidth();
                    })
                    .attr('width', function(d) {
                        return 0;
                    })
                    .remove();

                update
                    .enter()
                    .append('rect')
                    .attr('class', 'bar')
                    .attr('y', function(d) {
                        return y_scale(d[y_property]);
                    })
                    .attr('x', function(d) {
                        return 0;
                    })
                    .attr('height', function(d) {
                        return y_scale.bandwidth();
                    })
                    .attr('width', function(d) {
                        return 0
                    })
                    .merge(update)
                    .on("mouseover", function(d) {
                        if (tooltip_function) {
                            tooltip.html(tooltip_function(d));
                            tooltip_active = true;
                            tooltip.style("visibility", "visible");
                        }
                    })
                    .on("mousemove", function() {
                        if (tooltip_function) {
                            tooltip
                                .style("top", (d3.event.pageY - 10) + "px")
                                .style("left", tooltip_position);
                        }

                    })
                    .on("mouseout", function() {
                        if (tooltip_function) {
                            tooltip_active = false;
                            tooltip.style("visibility", "hidden");
                        }
                    })
                    .on("click", function(d) {
                        if (tooltip_function) {
                            if (tooltip_active) {
                                tooltip.style("visibility", "hidden");
                                tooltip_active = false;
                            } else {
                                tooltip.html(tooltip_function(d));
                                tooltip.style("visibility", "visible");
                                tooltip
                                    .style("top", (d3.event.pageY - 10) + "px")
                                    .style("left", tooltip_position);
                                tooltip_active = true;
                            }
                        }
                    })
                    .transition()
                    .duration(transition_duration)
                    .attr('fill', function(d) {
                        return colour_scale(d[x_property]);
                    })
                    .attr('x', function(d) {
                        return 0;
                    })
                    .attr('y', function(d) {
                        return y_scale(d[y_property]);
                    })
                    .attr('height', function(d) {
                        return y_scale.bandwidth();
                    })
                    .attr('width', function(d) {
                        return x_scale(d[x_property]);
                    });


                svg.select('.x.axis')
                    .transition()
                    .duration(transition_duration)
                    .call(x_axis);

                svg.select('.y.axis')
                    .transition()
                    .duration(transition_duration)
                    .on('end', function(d) {
                        svg.select('.y.axis')
                            .selectAll('.tick text')
                            .call(wrap, margin.left - 15);
                    })
                    .call(y_axis)



                if (x_label) {
                    d3.select('.x.label')
                        .attr("text-anchor", "middle")
                        .attr("font-size", "12px")
                        .attr("x", margin.left + (width / 2))
                        .attr("y", height + 50)
                        .text(x_label);
                }

            };

            updateSize = function() {

                svg
                    .transition()
                    .attr('width', width)
                    .attr('height', height);

                width = width - margin.left - margin.right;
                height = height - margin.top - margin.bottom;

                x_scale.range([0, width]);
                y_scale.range([height, 0]);

                draw();

            };

            updateData = function() {
                y_scale.domain(data.map(function(d) {
                    return d[y_property];
                }));
                x_scale.domain(d3.extent(data, function(d) {
                    return d[x_property];
                }));
                colour_scale.domain(d3.extent(data, function(d) {
                    return d[x_property];
                }));
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

    chart.x_label = function(value) {
        if (!arguments.length) return x_label;
        x_label = value;
        return chart;
    };

    chart.tooltip_function = function(value) {
        if (!arguments.length) return tooltip_function;
        tooltip_function = value;
        return chart;
    }

    return chart;

}
