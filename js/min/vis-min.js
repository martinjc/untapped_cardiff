!function(){function t(t){this.width=void 0,this.height=void 0,this.element_selector=t,this.checkin_data={},this.day=d3.time.format("%w"),this.week=d3.time.format("%U"),this.percent=d3.format(".1%"),this.format=d3.time.format("%Y-%m-%d"),this.colour_scale=d3.scale.quantile().range(colorbrewer.Reds[9]),this.svg=d3.select(t).selectAll("svg").data([2015]).enter().append("svg"),this.set_size(),this.cellSize=this.width/53}function e(t,e){this.transition_duration=1e3,this.element_selector=t,this.padding=e,this.colour_scale=d3.scale.quantile().range(colorbrewer.Reds[9]),this.svg=d3.select(this.element_selector).append("svg"),this.svg.append("g").attr("class","x axis"),this.svg.append("g").attr("class","y axis"),this.x_scale=d3.scale.ordinal(),this.y_scale=d3.scale.linear().nice(),this.x_axis=d3.svg.axis().scale(this.x_scale).orient("bottom"),this.y_axis=d3.svg.axis().scale(this.y_scale).orient("left").ticks(8),this.set_size(),this.data=void 0,this.display_data=void 0}t.prototype.set_size=function(){this.width=+d3.select(this.element_selector).node().getBoundingClientRect().width,this.height=+d3.select(this.element_selector).node().getBoundingClientRect().height,this.svg.attr("height",this.height).attr("width",this.width)},t.prototype.add_data=function(t){this.checkins=t},t.prototype.draw=function(){this.set_size();var t=this;this.rect=this.svg.selectAll(".day").data(function(t){return d3.time.days(new Date(t,0,1),new Date(t+1,0,1))}).enter().append("rect").attr("class","day").attr("fill","none").attr("stroke","#ccc").attr("width",this.cellSize).attr("height",this.cellSize).attr("x",function(e){return t.week(e)*t.cellSize}).attr("y",function(e){return t.day(e)*t.cellSize}).datum(this.format);var e=this.svg.selectAll(".month").data(function(t){return d3.time.months(new Date(t,0,1),new Date(t+1,0,1))}).enter().append("g").attr("class","month"),i=function(e){var i=new Date(e.getFullYear(),e.getMonth()+1,0),a=+t.day(e),s=+t.week(e),n=+t.day(i),r=+t.week(i);return"M"+(s+1)*t.cellSize+","+a*t.cellSize+"H"+s*t.cellSize+"V"+7*t.cellSize+"H"+r*t.cellSize+"V"+(n+1)*t.cellSize+"H"+(r+1)*t.cellSize+"V0H"+(s+1)*t.cellSize+"Z"};e.append("path").attr("d",i),e.append("text").text(function(e){return t.get_month(e.getMonth())}).attr("x",function(e){var i=+t.week(e);return(i+1)*t.cellSize}).attr("y",8*t.cellSize);for(var a in this.checkins){var s=new Date(this.checkins[a].time);s=s.toDateString(),this.checkin_data[s]=s in this.checkin_data?this.checkin_data[s]+1:1}var n=0;for(var r in this.checkin_data)this.checkin_data[r]>n&&(n=this.checkin_data[r]);this.colour_scale.domain([1,n]),this.rect.filter(function(e){return new Date(e).toDateString()in t.checkin_data}).attr("fill",function(e){return t.colour_scale(t.checkin_data[new Date(e).toDateString()])})},t.prototype.get_month=function(t){return 0===t?"Jan":1===t?"Feb":2===t?"Mar":3===t?"Apr":4===t?"May":5===t?"Jun":6===t?"Jul":7===t?"Aug":8===t?"Sep":9===t?"Oct":10===t?"Nov":11===t?"Dec":void 0},e.prototype.set_size=function(){this.width=+d3.select(this.element_selector).node().getBoundingClientRect().width,this.height=+d3.select(this.element_selector).node().getBoundingClientRect().height,this.x_scale.rangeRoundBands([this.padding.left,this.width-this.padding.right],.1),this.y_scale.range([this.height-this.padding.bottom,this.padding.top]),this.svg.transition().attr("height",this.height).attr("width",this.width),d3.select(".x.axis").attr("transform","translate(0,"+(this.height-this.padding.bottom)+")"),d3.select(".y.axis").attr("transform","translate("+this.padding.left+",0)"),this.num_bars=this.width<=400?10:this.width>400&&this.width<=600?15:20},e.prototype.add_data=function(t,e,i,a,s){this.set_size();var n=this;this.data=t,this.x=e,this.y=i,s?(this.data.sort(function(t,e){return t[n.y]>e[n.y]?-1:t[n.y]<e[n.y]?1:0}),n.display_data=n.data.slice(0,this.num_bars)):n.display_data=n.data,this.x_labels=this.display_data.map(function(t){return t[e]});var r=d3.max(this.display_data,function(t){return t[n.y]});this.x_scale.domain(this.x_labels),this.y_scale.domain([0,r]),this.colour_scale.domain([0,r]),this.y_label=a},e.prototype.draw=function(){this.set_size();var t=this,e=this.svg.selectAll(".bar").data(t.display_data);e.enter().append("rect").attr("x",function(e){return t.x_scale(e[t.x])}).attr("y",t.height-t.padding.bottom).attr("width",t.x_scale.rangeBand()).attr("height",0).attr("fill",function(e){return t.colour_scale(e[t.y])}).attr("class","bar"),e.transition().duration(t.transition_duration).attr("fill",function(e){return t.colour_scale(e[t.y])}).attr("width",t.x_scale.rangeBand()).attr("x",function(e){return t.x_scale(e[t.x])}).attr("y",function(e){return t.y_scale(e[t.y])}).attr("height",function(e){return t.height-t.padding.bottom-t.y_scale(e[t.y])}),e.exit().transition().duration(this.transition_duration).attr("y",t.height).attr("height",0).remove(),this.svg.select(".x.axis").attr("transform","translate(0,"+(this.height-this.padding.bottom)+")").transition().duration(this.transition_duration).call(this.x_axis).selectAll("text").style("text-anchor","end").attr("dx","-.8em").attr("dy",".15em").attr("transform","rotate(-35)"),this.svg.select(".y.axis").attr("transform","translate("+this.padding.left+",0)").transition().duration(this.transition_duration).call(this.y_axis),this.svg.select(".y.axis").append("text").attr("class","y label").attr("text-anchor","end").attr("dx","-6em").attr("dy","-3em").attr("transform","rotate(-90)").text(this.y_label)},this.BarChart=e,this.DayChart=t}();