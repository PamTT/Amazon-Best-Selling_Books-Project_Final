// Creating References to load dropdown
var dropdown = d3.select("#selDataset");

// Function to get the scales for chart2
getScale_Chart2=(axis, data, chosenAxis, chartHeight, chartWidth)=>{

    // Getting min & max value
    var min = d3.min(data, d => d[chosenAxis]);
    var max = d3.max(data, d => d[chosenAxis]);

    // Define buffer value according to the axis chosen
    var buffer;
    if(chosenAxis == "Price"){
        buffer = 10;
    } else if (chosenAxis == "Reviews") {
        buffer = 1000;
    } else if(chosenAxis == "User_Rating"){
        buffer = 0.5;
    }

    // Define min & max scales
    var scale_min = (parseFloat(min-buffer)).toFixed(2);
    var scale_max = (parseFloat(max+buffer)).toFixed(2);

    // Get linear scale
    var LinearScale = d3.scaleLinear()
    .domain([scale_min, scale_max])
    .range([axis === "x" ? 0 : chartHeight, axis === "x" ? chartWidth : 0]);

    // Return linear scale
    return LinearScale;
}

// Render axis according to new scale
renderAxis=(axis, newScale, newAxis)=>{
    // Define the axis position depending on the axis selected.
    var axisPos = (axis === "x") ? d3.axisBottom(newScale) : d3.axisLeft(newScale)
    newAxis.transition()
        .duration(1000)
        .call(axisPos);

    return newAxis;
}

// Render Circles with new scale
renderCircles=(circlesGroup, newScale, newChosenAxis)=>{
    circlesGroup.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cy", d => newScale(d[newChosenAxis]));
}

/* UpdateToolTip
* function to create and display tooltip.
*/
updateToolTip=(chosenXAxis, chosenYAxis, circlesGroup)=>{
    var label2;
    var label1 = "User Rating";
    var isdollar = false;
    // Create a lebel according to the axis label selected for Y axis
    switch(chosenYAxis){
        case "Reviews":
            label2 = "Reviews";
            break;

        case "Price":
            label2 = "Price";
            isdollar = true;
            break;
    }

    // Create Tooltip
    var toolTip = d3.tip()
        .attr("class","d3-tip")
        .offset([80, -60])
        .html(function(d){
            return (`${d['Name']}</br>${label1} : ${d[chosenXAxis]}</br>${label2} : ${isdollar?"$":""}${d[chosenYAxis]}`)
        });
    
    // call tooltip on circlesGroup        
    circlesGroup.call(toolTip);
    
    // mouseover & mouseout events to show and hide toolip respectively.
    circlesGroup.on("mouseover", function(data){
        toolTip.show(data);
    }).on("mouseout",function(data){
        toolTip.hide(data);
    });
    
    return circlesGroup;
}

// Function to wrap the tick-text on axis. Reference - https://bl.ocks.org/guypursey/f47d8cd11a8ff24854305505dbbd8c07
wrap=(text, width)=>{
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
}

// Function to plot the graph
getPlots=(filterdata)=>{

    // Get the all svg areas
    var svgArea1 = d3.select("#plots").selectAll("svg");

    // Remove the svg area if its already been there
    if (!svgArea1.empty()) {
        svgArea1.remove();
    }

    var svgWidth = 800;
    var svgHeight = 700;

    // Define the chart's margins as an object
    var chartMargin = {
        top: 30,
        right: 0,
        bottom: 300,
        left: 200
    };

    // Define dimensions of the chart area
    var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
    var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;
    
    // Select body, append SVG area to it, and set the dimensions
    var svg1 = d3
        .select("#plots")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);
        

    // Append a group to the SVG area and shift ('translate') it to the right and down to adhere
    // to the margins set in the "chartMargin" object.
    var chartGroup1 = svg1.append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

    // Select body, append SVG area to it, and set the dimensions
    var svg2 = d3
        .select("#plots")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append a group to the SVG area and shift ('translate') it to the right and down to adhere
    // to the margins set in the "chartMargin" object.
    var chartGroup2 = svg2.append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);
    
    // Initial Params for Chart2
    chart2_xLabel = "User_Rating";
    chart2_yLabel = "Reviews";

    // Filter Books data to get top 10 books by reviews
    filterdata.sort((a, b) => b.Reviews - a.Reviews);
    var unique_books = [...new Map(filterdata.map(item => [item['Name'], item])).values()];
    var filtered_books = unique_books.slice(0,10);

    // Get Scales for Chart1:
    var xScale_chart1 = d3.scaleBand()
        .domain(filtered_books.map(d => d.Name))
        .range([0, chartWidth])
        .padding(0.1);

    var yScale_chart1 = d3.scaleLinear()
        .domain([d3.min(filtered_books, d => d.Reviews) - 500, d3.max(filtered_books, d => d.Reviews) + 500])
        .range([chartHeight, 0]);

    // Get scales for chart2
    var xScale_chart2 = getScale_Chart2("x", filtered_books, chart2_xLabel, chartHeight, chartWidth);
    var yScale_chart2 = getScale_Chart2("y", filtered_books, chart2_yLabel, chartHeight, chartWidth);

    // Create initial axis function for chart1
    var chart1_bottomAxis = d3.axisBottom(xScale_chart1);
    var chart1_leftAxis = d3.axisLeft(yScale_chart1);

    // Apend axis
    var chart1_xAxis = chartGroup1.append("g")
        .attr("transform",`translate(0, ${chartHeight})`)
        .call(chart1_bottomAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)")
        .call(wrap, 200);
        
    var chart1_yAxis = chartGroup1.append("g")
        .call(chart1_leftAxis)

    // Add Chart1 axis labels
    chartGroup1.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartMargin.left + 100)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("class", "active aText")
        .text("Reviews");

    chartGroup1.append("text")
        .attr("transform", `translate(${chartWidth / 2 - 50}, ${chartHeight + chartMargin.top + 200})`)
        .attr("class", "active aText")
        .text("Book Names");

    // Create initial axis function for chart2
    var chart2_bottomAxis = d3.axisBottom(xScale_chart2);
    var chart2_leftAxis = d3.axisLeft(yScale_chart2);

    // Apend axis
    var chart2_xAxis = chartGroup2.append("g")
        .attr("transform",`translate(0, ${chartHeight})`)
        .call(chart2_bottomAxis);
        
    var chart2_yAxis = chartGroup2.append("g")
        .call(chart2_leftAxis)

    // Add X-axis label for the chart2
    chartGroup2.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top + 30})`)
        .attr("class", "active aText")
        .text("User Ratings");
        
    // Add Chart2 Y-Axis Labels
    // Create group for y-Axis labels
    var chart2_yLabelGroup = chartGroup2.append("g")
        .attr("transform","rotate(-90)");
    
    const reviewLabel_chart2 = chart2_yLabelGroup.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 0 - chartMargin.left + 130 )
        .attr("value", "Reviews")
        .classed("active aText", true)
        .text("Reviews"); 

    const priceLabel_chart2 = chart2_yLabelGroup.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 0 - chartMargin.left + 100)
        .attr("value", "Price")
        .classed("inactive aText", true)
        .text("Price($)");

    // Plot chart1
    var barGroup =  chartGroup1.selectAll("rect")
        .data(filtered_books)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale_chart1(d.Name))
        .attr("y", d => yScale_chart1(d.Reviews))
        .attr("width", xScale_chart1.bandwidth())
        .attr("height", d => chartHeight - yScale_chart1(d.Reviews))
        .attr("fill", "blue"); 

    // tooltip foir chart1
    var tooltip = d3.tip()
        .attr("class","d3-tip")
        .offset([80, -60])
        .html(function(d){
            return (`Author : ${d.Author}`);
    });

    barGroup.call(tooltip);

    // Create the event listeners with transitions
    barGroup.on("mouseover", function(data) {
        d3.select(this)
            .transition()
            .duration(300)
            .attr("fill", "red");
        tooltip.show(data)
    }).on("mouseout", function(data) {
        d3.select(this)
            .transition()
            .duration(500)
            .attr("fill", "blue");
        toolTip.hide(data);
    });

    // Plot chart2

    // Create circle group which will contain circles & text.
    var circlesGroup = chartGroup2.append("g").selectAll("g") 
        .data(filtered_books)
        .enter()
        .append("g");

    circlesGroup.append("circle")
        //.classed("stateCircle", true)
        .attr("cx", d => xScale_chart2(d[chart2_xLabel]))
        .attr("cy", d => yScale_chart2(d[chart2_yLabel]))
        .attr("r", 15)
        .attr("fill", "purple")
        .attr("opacity", ".5");

    // call updateToolTip function to add tooltip on circles    
    updateToolTip(chart2_xLabel, chart2_yLabel, circlesGroup);

    // chart2 Y axis labels event listener
    chart2_yLabelGroup.selectAll("text").on("click", function(){
        currentAxis = "y";
        var selected_Y_Axis = d3.select(this).attr("value");

        if(selected_Y_Axis != chart2_yLabel){
            chart2_yLabel = selected_Y_Axis;

            //Update Y-scale with new data
            chart2_new_Yscale = getScale_Chart2("y", filtered_books, chart2_yLabel, chartHeight, chartWidth);
            
            // renderAxis
            chart2_yAxis = renderAxis("y", chart2_new_Yscale, chart2_yAxis);

            // Render circles
            renderCircles(circlesGroup, chart2_new_Yscale, chart2_yLabel);

            // Update Tooltip
            updateToolTip(chart2_xLabel, chart2_yLabel, circlesGroup);

            // Update label formatting:
            switch(chart2_yLabel){
                case "Reviews":
                    reviewLabel_chart2.classed("active aText", true).classed("inactive", false);
                    priceLabel_chart2.classed("inactive aText", true).classed("active", false);
                    break;
                case "Price":
                    priceLabel_chart2.classed("active aText", true).classed("inactive", false);
                    reviewLabel_chart2.classed("inactive aText", true).classed("active", false);
                    break;
            }
        }
    }); 
}

// Function to filter the data depending on the year selected. Gets trigged upon selecting different year
optionChanged=(year)=>{
    // Fetch the data from the flask API
    fetch('/all_books')
        .then(function (response) {
            return response.json();
        }).then(function (booksData) {
            
            // Parse data
            booksData.forEach(book => {
                book.User_Rating=+book.User_Rating,
                book.Reviews=+book.Reviews,
                book.Price=+book.Price,
                book.Year=+book.Year
            });
            
            // Filter data depending on the year selected
            var filterdata;
            if(year == "All"){
                filterdata = booksData;
            }
            else {
                // If specific year is been selected then filter all the books for that year
                filterdata = booksData.filter(book => book.Year == year)
            }
            
            // Call function getPlots and pass filterdata to plot plots
            getPlots(filterdata);

        });
}

// Function to get the invoked when page loads.
init=()=>{
    // fetch the data from the flask API
    fetch('/all_books')
        .then(function (response) {
            return response.json();
        }).then(function (booksData) {
            console.log(booksData);

            // Get the unique years in differnt array
            var years = [...new Set(booksData.map(book => book.Year))];

            // Sort years array in ascending order
            years.sort((a, b) => a - b);

            // Add ALL in years in the array
            years.unshift("All");

            // Load years in the dropdown
            years.forEach(year => {
                dropdown.append("option").attr("value",year).text(year);
            });

            optionChanged(years[0]);
        });
}

// Load init function
init()




