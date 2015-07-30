/* global L, d3, colorbrewer */
(function(){

    function MapChart(element_selector) {
        L.mapbox.accessToken = 'pk.eyJ1IjoibWFydGluamMiLCJhIjoiREhUQWk4cyJ9.g91QWy-CEqvercw_UHNm1A';
        // Replace 'mapbox.streets' with your map id.
        var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/martinjc.n04cmol3/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
            attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
        });

        var map = L.map(element_selector, {
            layers: mapboxTiles,
            center: [51.479677, -3.179254],
            zoom: 16
        });

        var points = [];

        var tooltip = d3.select(element_selector)
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("background-color", "rgba(255,255,255,0.8)")
            .text("a simple tooltip");

        var tooltip_active = false;

        var colour_scale = d3.scale.quantile().range(colorbrewer.Reds[7]);

        var add_data = function(venues) {
            var max = 0;
            venues.forEach(function(d){
                if(d.count > max) {
                    max = +d.count;
                }
                points.push({
                    'lat': d.location.lat,
                    'lon': d.location.lng,
                    'count': +d.count,
                    'name': d.venue_name,
                });
            });
            colour_scale.domain([0, max]);
        };

        var draw = function(){
            d3.select('#overlay').remove();
            var bounds = map.getBounds();
            var topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
            var existing = d3.set();
            var drawLimit = bounds.pad(0.4);

            var filteredPoints = points.filter(function(d) {
                var latlng = new L.LatLng(d.lat, d.lon);
                if(!drawLimit.contains(latlng)) {
                    return false;
                }
                var point = map.latLngToLayerPoint(latlng);

                var key = point.toString();
                if(existing.has(key)) {
                    return false;
                }
                existing.add(key);

                d.x = point.x;
                d.y = point.y;
                return true;
            });

            var tooltip_function = function(venue) {
                var text = "";
                text += venue.name + "<br>";
                // if(d.contact.twitter) {
                //     text += d.contact.twitter + "<br>";
                // }
                // if(d.location.venue_address) {
                //     text += d.location.venue_address + "<br>";
                // }
                // if(d.location.venue_city) {
                //     text += d.location.venue_city;
                // }
                return text;
            };

            var svg = d3.select(map.getPanes().overlayPane).append("svg")
                .attr('id', 'overlay')
                .attr("class", "leaflet-zoom-hide")
                .style("width", map.getSize().x + 'px')
                .style("height", map.getSize().y + 'px')
                .style("margin-left", topLeft.x + "px")
                .style("margin-top", topLeft.y + "px");

            var g = svg.append("g")
                .attr("transform", "translate(" + (-topLeft.x) + "," + (-topLeft.y) + ")");

            var svgPoints = g.attr("class", "points")
                .selectAll("g")
                .data(filteredPoints)
                .enter().append("g")
                .attr("class", "point");

            svgPoints.append("circle")
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .style('fill', function(d){return colour_scale(+d.count);})
                .style('stroke', '#000')
                .style('stroke-width', '0.5px')
                .attr("r", 8)
                .on("mouseover", function(d){
                    if(tooltip_function) {
                        tooltip.html(tooltip_function(d));
                        tooltip_active = true;
                        tooltip.style("visibility", "visible");                
                    }

                })
                .on("mousemove", function(){
                    if(tooltip_function) {
                        tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
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
                });            
        };

        map.on('viewreset moveend', draw);
        this.add_data = add_data;
        this.draw = draw;
    }

    this.MapChart = MapChart;
}());