//function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }
  ///Set SVG area, svg margin, chart dimension
  //svg area
  //var svgWidth = window.innerWidth;
  //var svgHeight = window.innerHeight;
  var svgWidth = 960;
  var svgHeight = 660;

  //svg margin
  var chartMargin = {top:100, right:100, bottom:100,left:200};

  //chart dimension
  var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
  var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;


  //append SVG obj to the body of the page
  var svg = d3.select("#my_datavizchart")
              .append("svg")
              .attr("height", svgHeight)
              .attr("width", svgWidth);

  g = svg.append("g").attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

  //Append a group to the SVG area and shift ('translate') it to the right and down to adhere to the margins set in the "chartMargin" object.
  var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

  //The scale for spacing the group's bar
  var x0 = d3.scaleBand()
      .rangeRound([0,chartWidth])
      .paddingInner(0.1);

  //The scale for spacing each group's bar
  var x1 = d3.scaleBand()
      .rangeRound([0,chartWidth])
      .paddingInner(0.05);

  var y = d3.scaleLinear()
      .rangeRound([chartHeight, 0]);

  var z = d3.scaleOrdinal()
  .range(["#6b486b","#ff8c00"]);

  //load data
  d3.csv("static/data/books_by_genres_by_year.csv" , function(d, i, columns) {
    //d3.csv("/asset/data/books_by_genres_by_year.csv" , function(d, i, columns) {    
      for (var i = 1, n = columns.length; i<n; ++i) d[columns[i]] = +d[columns[i]];
      return d;
  }).then(function(data){
  //console.log(data);
  //)
  
  var keys = data.columns.slice(1);

  //console.log(keys);

  x0.domain(data.map(function(d) { return d.Year; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(data, function(d) {
     return d3.max(keys, function(key) { 
       return d[key];
       });
     })
  ]).nice();

  g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("class","bar")
            .attr("transform", function(d) { return "translate(" + x0(d.Year) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
            .enter().append("rect")
            .attr("x", function(d) { return x1(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("height", function(d) { return chartHeight - y(d.value); })
            .attr("fill", function(d) { return z(d.key); });

  g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + chartHeight + ")")
            .call(d3.axisBottom(x0));

  g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 8 - chartMargin.left/2)
            .attr("x", 0 - (chartHeight / 2))
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-family", "sans-serif")
            .attr("font-size", 20)
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Genre Counts");
  
  g.append("g")
            .attr("class", "x axis")
            .append("text")
            .attr("y", 70 + chartHeight)
            .attr("x", chartWidth / 2)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-family", "sans-serif")
            .attr("font-size", 25)
            .attr("font-weight", "bold")
            .text("Year");

  var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 15)
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
            .attr("x", chartWidth - 17)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", z)
            .attr("stroke", z)
            .attr("stroke-width",2)
            .on("click",function(d) { update(d) });

  legend.append("text")
            .attr("x", chartWidth - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });

  //Update and transition on click
  var filtered = [];
  function update(d) {
      //console.log(d);
    //update the array to filter the chart by adding the click key if not included or
    if (filtered.indexOf(d) == -1) {
      filtered.push(d);
      //if all bars are unchecked, reset:
      if(filtered.length == keys.length) filterd = [];
    }

    //otherwise remove it:  
    else {
          filtered.splice(filtered.indexOf(d), 1);
    }
    
    // Update the scales for each group( per genre)'s items
    var newKeys = [];
    keys.forEach(function(d) {
        if (filtered.indexOf(d) == -1 ) {
            newKeys.push(d);
        }
    })
    
    x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();

    // update the y axis:
    svg.select(".y")
        .transition()
        .call(d3.axisLeft(y).ticks(null, "s"))
        .duration(400);

    //filtered out the bands that need to be hidden
    var bars = svg.selectAll(".bar").selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]};
            });
         })

    bars.filter(function(d) {
            return filtered.indexOf(d.key) > -1;
        })
        .transition()
        .attr("x", function(d) {
                return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width"))/2;
        })
        .attr("height",0)
        .attr("width",0)
        .attr("y", function(d) { return chartHeight; })
        .duration(400);

    //adjust other bars
    bars.filter(function(d) {
      return filtered.indexOf(d.key) == -1;
      })
      .transition()
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return chartHeight - y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("fill", function(d) { return z(d.key); })
      .duration(400);

    //update Legend
    legend.selectAll("rect")
          .transition()
          .attr("fill",function(d) {
              if (filtered.length) {
                  if (filtered.indexOf(d) == -1) {
                      return z(d);
                  }
                  else {
                      return "white";
                  }
              }
              else {
                  return z(d);
              }
          })
          .duration(100);
    }
}); 

//}

//makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
//d3.select(window).on("resize", makeResponsive);
  
 






















