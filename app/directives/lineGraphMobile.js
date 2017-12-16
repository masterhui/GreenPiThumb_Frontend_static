'use strict';

var TEMPERATURE_MIN = 8;
var TEMPERATURE_MAX = 28;
var HUMIDITY_MIN = 20;
var HUMIDITY_MAX = 80;
var LIGHT_MIN = 0;
var LIGHT_MAX = 100;
var SOIL_MOISTURE_MIN = 40;
var SOIL_MOISTURE_MAX = 100;
var WATER_PUMPED_MIN = 0;
var WATER_PUMPED_MAX = 4000;
var WATER_LEVEL_MIN = 0;
var WATER_LEVEL_MAX = 25;
var DEFAULT_TIME_DOMAIN = 1;   // [d]
var FONT_SIZE = 14
var FONT_SIZE_LABEL = 16

angular.module('greenPiThumbApp.directives')
  .directive('lineGraph', ['d3Service', function(d3Service) {
    return {
      restrict: 'E',
      replace: false,
      scope: {data: '=chartData', type: '@'},
      //template:'<div class="type"><h2>type is {{type}}</h2></div>',
      
      template: '<div class="form">' +
                '<button ng-click="minus24h()">-24h</button>' +
                '</div>',
      
      link: function(scope, element, attrs) {
        d3Service.d3().then(function(d3) {
            
          // Set the dimensions of the canvas / graph
          var margin = {top: 30, right: 20, bottom: 58, left: 50};
          var width = 650 - margin.left - margin.right;
          var height = 450 - margin.top - margin.bottom;

          var parseTimestamp = d3.utcParse('%Y%m%dT%H%M%Z');
          scope.time_domain = DEFAULT_TIME_DOMAIN;
          
          // Set the ranges
          var x = d3.scaleTime().range([0, width]);
          var y = d3.scaleLinear().range([height, 0]);

          // Define the axes
          function xTickMajorFunc(tickFreq) {
            return d3.timeHour.every(tickFreq);
          }
          
          function xAxisMajor(tickFreq) {
            var retVal = d3.axisBottom(x)
              .ticks(xTickMajorFunc(tickFreq))
              .tickFormat(d3.timeFormat('%H'));
            return retVal;
          }
          
          function xAxisMinor(tickFreq) {
            var retVal = d3.axisBottom(x)
              .ticks(d3.timeDay.every(tickFreq))
              .tickFormat(d3.timeFormat('%a, %e/%m/%Y'))
              .tickSize(-height)
              .tickPadding(28);
            return retVal;
          }
          
          var yAxis = d3.axisLeft(y)
            .ticks(5);

          // Define the line
          var valueline = d3.line()
            //~ .curve(d3.curveBasis)
            .x(function(d) { return x(d.timestamp); })
            .y(function(d) { return y(d.value); });
            
          // Define the area
          var area = d3.area()
              .curve(d3.curveMonotoneX)
              .x(function(d) { return x(d.timestamp); })
              .y0(height)
              .y1(function(d) { return y(d.value); });              

          // Define the div for the tooltip.
          var div = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

          // Format the time and values for the tooltip.
          var formatTime = d3.timeFormat('%I:%M %p');
          var formatValue = d3.format('.1f');
          var formatDate = d3.timeFormat('%Y-%m-%d');
          
          function getMinRange() { 
            var retVal = 0;
            
            if (attrs.type === "temperature")            
              retVal = TEMPERATURE_MIN   ;
            else if (attrs.type === "humidity")
              retVal = HUMIDITY_MIN;
            else if (attrs.type === "light")
              retVal = LIGHT_MIN;
            else if (attrs.type === "soil_moisture")
              retVal = SOIL_MOISTURE_MIN;
            else if (attrs.type === "water_pumped")
              retVal = WATER_PUMPED_MIN;
            else if (attrs.type === "water_level")
              retVal = WATER_LEVEL_MIN;                                                

            return retVal;
          }
      
          function getMaxRange() {
            var retVal = 0;
            
            if (attrs.type === "temperature")
              retVal = TEMPERATURE_MAX;
            else if (attrs.type === "humidity")
              retVal = HUMIDITY_MAX;
            else if (attrs.type === "light")
              retVal = LIGHT_MAX;
            else if (attrs.type === "soil_moisture")
              retVal = SOIL_MOISTURE_MAX;
            else if (attrs.type === "water_pumped")
              retVal = WATER_PUMPED_MAX;
            else if (attrs.type === "water_level")
              retVal = WATER_LEVEL_MAX;                                                

            return retVal;
          }     
          
          function getYAxisLabel() {
            var label = "";
            
            if (attrs.type === "temperature")
              label = "Temperature [°C]";
            else if (attrs.type === "humidity")
              label = "Humidity [%]";
            else if (attrs.type === "light")
              label = "Brightness [%]";
            else if (attrs.type === "soil_moisture")
              label = "Soil Moisture [%]";
            else if (attrs.type === "water_pumped")
              label = "Pump Event [ml]";
            else if (attrs.type === "water_level")
              label = "Tank Level [l]";                                                

            return label;
          }
          
          function getDotRadius() {
            if(attrs.type === "water_pumped") 
              return 6.0;
            else
              return 1.0;
          }
          
          function getDotColor() {
            if(attrs.type === "water_pumped") 
              return "steelblue";
            else
              return "black";
          }          

         function getVizStr() {
            if(attrs.type === "water_level") 
              return "area";
            else
              return "line";
          }  
          
         function getVizObj(data) {               
            if(attrs.type === "water_level") 
              return area(data);
            else
              return valueline(data);
          } 
          
          // Add the svg canvas
          var svg = d3.select(element[0])
            .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
            .append('g')
              .attr('transform',
                    'translate(' + margin.left + ',' + margin.top + ')');          
          
          var updateGraph = function(data, parseTimestampFlag) { 
            data.forEach(function(d) {
              if(parseTimestampFlag) {
                d.timestamp = parseTimestamp(d.timestamp);
              }
              d.value = scope.$eval(attrs.valueProperty, d);
            });
                      
            // Filter the date range
            //~ data = data.filter(function(d) {
              //~ return d.timestamp > timeDomainStart
            //~ })                       
      
            // Scale the range of the data            
            //~ x.domain(d3.extent(data, function(d) { return d.timestamp; }));                
            var timeDomainStart = new Date(d3.timeDay.offset(new Date(), -scope.time_domain)); 
            var timeDomainEnd = new Date();
            //~ console.log("timeDomainStart: " + timeDomainStart);
            //~ console.log("timeDomainEnd: " + timeDomainEnd);                    
            x.domain([timeDomainStart, timeDomainEnd])            
            y.domain([
              d3.min(data, function(d) { return getMinRange(); }),
              d3.max(data, function(d) { return getMaxRange(); })            
            ]);

            // Add the valueline path.
            svg.append('path')
              //~ .style("stroke", "red")
              .attr("clip-path", "url(#clip)")
              .attr('class', getVizStr())
              .attr('d', getVizObj(data));   
              
            svg.append("defs").append("clipPath")
                .attr("id", "clip")
              .append("rect")
                .attr("width", width)
                .attr("height", height);                
                 
            // Add the scatterplot
            svg.selectAll('dot')
              .data(data)
            .enter().append('circle')
              .attr('r', getDotRadius() )
              .attr('fill', getDotColor() )
              .attr('cx', function(d) { return x(d.timestamp); })
              .attr('cy', function(d) { return y(d.value); })
              .attr("clip-path", "url(#clip)")
              .on('mouseover', function(d) {
                    div.transition()
                      .duration(200)
                      .style('opacity', 0.9);
                    div.html(
                      formatValue(d.value) + '<br />' +
                      formatTime(d.timestamp) + '<br />' +
                      formatDate(d.timestamp))
                      .style('left', (d3.event.pageX + 3) + 'px')
                      .style('top', (d3.event.pageY - 52) + 'px');
                  })
                .on('mouseout', function(d) {
                  div.transition()
                    .duration(500)
                    .style('opacity', 0);
                });

            // We use major and minor ticks according to d3v4, seen here: https://stackoverflow.com/questions/21643787/d3-js-alternative-to-axis-ticksubdivide
            // Add the major x axis
            svg.append('g')
              .attr('class', 'x axis')
              .attr('transform', 'translate(0,' + height + ')')
              .attr('axis', 'font: 14px sans-serif')
              .style("font-size", FONT_SIZE)
              .call(xAxisMajor(scope.time_domain));
            
            // Add the minor x axis  
            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .style("font-size", FONT_SIZE)
              .call(xAxisMinor(scope.time_domain))              
              .selectAll(".tick")
              .data(x.ticks(xTickMajorFunc((scope.time_domain))), function(d) { return d; })
              .exit()
              .classed("minor", true);              
            
            // Add text label for the x axis
            svg.append("text") 
              .attr("x", width / 2 )
              .attr("y", height + margin.bottom)
              .style("text-anchor", "middle")
              .style("font-weight", "bold")
              .style("font-size", FONT_SIZE_LABEL)
              .text("Time");              

            // Add the y axis
            svg.append('g')
              .attr('class', 'y axis')
              .style("font-size", FONT_SIZE)
              .call(yAxis);
              
            // Add text label for the y axis
            svg.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 0 - margin.left)
              .attr("x",0 - (height / 2))
              .attr("dy", "1em")
              .style("text-anchor", "middle")
              .style("font-weight", "bold")
              .style("font-size", FONT_SIZE_LABEL)
              .text(getYAxisLabel());              
              
          };
          
          scope.minus24h = function(){ minus24h(); };
          function minus24h() {            
            scope.time_domain = scope.time_domain + DEFAULT_TIME_DOMAIN;
            console.log("New time domain: " + scope.time_domain)
            svg.selectAll("*").remove();
            updateGraph(scope.data, false);
          }
          
          scope.$watch('data', function(newValue) {
            if (!newValue) { return; }            
            updateGraph(newValue, true);
          });
        });
      }
    };
  }]);
