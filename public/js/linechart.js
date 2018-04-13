var margin = {top: 10, right: 10, bottom: 100, left: 40},
    margin2 = {top: 430, right: 10, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

/*Create a legend and fill with text */
var svgLegend = d3.select("#svglegend")
                .attr("width", "500")
                .attr("height", "30")

var gLegend = svgLegend.append("g");

var colors = [{"color": "green" , "role" : "Maximum"},{"color": "orange", "role" : "Median"},
                {"color": "blue" , "role" : "Minimum"}];

var legendCircles = gLegend.selectAll("circle").data(colors)

legendCircles.
    enter().append("circle")
    .attr("fill", function (d) {
        return d.color;
    })
    .attr("cx", function (d,i) {
        return (i * 500/5) + margin.left;
    })
    .attr("cy", "45%")
    .attr("r", 5)
    .attr("class", "legend");

var labels = gLegend.selectAll("text").data(colors);

labels.
    enter().append("text")
    .data(colors)
    .attr("x", function (d,i) {
        return (i * 500/5) + margin.left * 1.2;
    })
    .attr("y", "60%")
    .text(function (d) {
        return d.role;
    })
    .attr("class", "legend");

/*Create a color scale */
var color = d3.scale.category10();

var parseDate = d3.time.format("%Y%m%d").parse;

/*define scales for x and y axes
x, y: for line charts
x2, y2: for brush chart
*/

var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brush);

//Initialize tooltip
// let tip = d3.tip().attr("class", "d3-tip-node").html((d) => {
//     return "hello";
// });

/* define line for line chart*/
var line = d3.svg.line()
    .defined(function(d) { return !isNaN(d.temperature); })
    .interpolate("cubic")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });
/* define line for brush chart*/
var line2 = d3.svg.line()
    .defined(function(d) { return !isNaN(d.temperature); })
    .interpolate("cubic")
    .x(function(d) {return x2(d.date); })
    .y(function(d) {return y2(d.temperature); });

/* Set properties for line chart svg*/
var svg = d3.select("#linechart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

/* define a group for line chart*/
var focus = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* define a group for brush chart*/
var context = svg.append("g")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

 /*read data from data.csv*/ 
d3.csv("data.csv", function(error, data) {

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));
    data.forEach(function(d) {
      d.date = parseDate(d.date);
    });

    /*create a json array with type of temperature and value */
  var sources = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d.date, temperature: +d[name]};
        })
      };
    });

    /** define domain values for x, y axis scales */
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([d3.min(sources, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
              d3.max(sources, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); }) ]);
    x2.domain(x.domain());
    y2.domain(y.domain());
    // set the initial extent of brush
    brush.extent([new Date(2017, 01, 15), new Date(2017, 11, 15)]);
    /** bind data and perform enter selection */
    var focuslineGroups = focus.selectAll("g")
        .data(sources)
        .enter().append("g");

    var focuslines = focuslineGroups.append("path")
        .attr("class","line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) {return color(d.name);})
        .attr("clip-path", "url(#clip)")
        .attr("fill","none");

    //Invoke the tip on the plot points
    // focuslines.call(tip)
    // .on("mouseover", tip.show)
    // .on("mouseout", tip.hide);

    /** render x-axis */
    focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    /** render y-axis label*/        
    focus.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "translate(0," + height/4 + ")" + "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Temperature, ºC");

    /** bind data and perform enter selection */
    var contextlineGroups = context.selectAll("g")
        .data(sources)
        .enter().append("g");

    /** append path element for brush chart*/    
    var contextLines = contextlineGroups.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line2(d.values); })
        .style("stroke", function(d) {return color(d.name);})
        .attr("clip-path", "url(#clip)")
        .attr("fill","none");;

    /** append x-axis for brush chart*/    
    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    /** append rectangle for brushing and set attributes*/
    context.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", height2 + 7)
        .attr("fill-opacity","0.4")
    
        
    brush();    
    brush.event(context.select('g.x.brush'));

        
});

/** define brush action */
function brush() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  focus.selectAll("path.line").attr("d",  function(d) {return line(d.values)});
  focus.select(".x.axis").call(xAxis);
  focus.select(".y.axis").call(yAxis);
}
