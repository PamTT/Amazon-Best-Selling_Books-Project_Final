// Step 1: Set up our chart
//= ================================
var svgWidth = 960;
var svgHeight = 700;

var margin = {
    top: 40,
    right: 60,
    bottom: 300,
    left: 200
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
    .select("#Auth-bar")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// d3.csv("assests/data/bestsellers_with_categories.csv").then(function(booksData) {
fetch('/all_books')
    .then(function (response) {
        return response.json();
    }).then(function (booksData) {
        
        booksData.forEach(book => {
        book.Reviews = +book.Reviews,
            book.Price = +book.Price
        });
    
        // get unique authors
        var Authors = [...new Set(booksData.map(book => book.Author))];
        Author_data = [];

        // filter data by author
        Authors.forEach(author => {
            filterdata = booksData.filter(book => book.Author == author);
            var totalPrice = filterdata.reduce(function (prev, cur) {
                return prev + cur.Price;
            }, 0);
            var totalReview = filterdata.reduce(function (prev, cur) {
                return prev + cur.Reviews;
            }, 0);
            var dict = {
                "Author": author,
                "TotalP": totalPrice,
                "TotalR": totalReview
            }
            Author_data.push(dict);
        });
        console.log(Author_data);
        Author_data.sort((a, b) => b.TotalR - a.TotalR);

        var filtered_books = Author_data.slice(0, 10);
        console.log(filtered_books);

        // Scales
        var xScale = d3.scaleBand()
            .domain(filtered_books.map(d => d.Author))
            .range([0, width])
            .padding(0.5);

        var yLinearScale1 = d3.scaleLinear()
            .domain([d3.min(filtered_books, d => d.TotalR) - 10000, d3.max(filtered_books, d => d.TotalR) + 10000])
            .range([height, 0]);

        var yLinearScale2 = d3.scaleLinear()
            .domain([d3.min(filtered_books, d => d.TotalP) - 10, d3.max(filtered_books, d => d.TotalP) + 10])
            .range([height, 0]);

        // axes
        var bottomAxis = d3.axisBottom(xScale)
        var leftAxis = d3.axisLeft(yLinearScale1);
        var rightAxis = d3.axisRight(yLinearScale2);

        // // Add bottomAxis
        // chartGroup.append("g")
        //     .attr("transform", `translate(0, ${height})`)
        //     .call(bottomAxis);

        // CHANGE THE TEXT TO THE CORRECT COLOR
        chartGroup.append("g")
            .attr("stroke", "green") // NEW!
            .call(leftAxis);

        // CHANGE THE TEXT TO THE CORRECT COLOR
        chartGroup.append("g")
            .attr("transform", `translate(${width}, 0)`)
            .attr("stroke", "orange") // NEW!
            .call(rightAxis);

        var line1 = d3.line()
            .x(d => xScale(d.Author))
            .y(d => yLinearScale1(d.TotalR));

        var line2 = d3.line()
            .x(d => xScale(d.Author))
            .y(d => yLinearScale2(d.TotalP));


        // Append a path for line1
        chartGroup.append("path")
            .data([filtered_books])
            .attr("d", line1)
            .classed("line green", true);

        // Append a path for line2
        chartGroup.append("path")
            .data([filtered_books])
            .attr("d", line2)
            .classed("line orange", true);

            //Circles
        var selectCircle = chartGroup.selectAll("circle").data(filtered_books);
        selectCircle.enter().append("circle")
        .attr("class", "circle")
        .attr("r", 3.5)
        .attr("cx", d => xScale(d.Author))
        .attr("cy", d => yLinearScale2(d.TotalP));
        
    // circle for review
        selectCircle.enter().append("circle")
        .attr("class", "circle")
        .attr("r", 3.5)
        .attr("cx", d => xScale(d.Author))
        .attr("cy", d => yLinearScale1(d.TotalR));

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 80})`)
            .classed("authorsActive atext", true)
            // .attr("text-anchor", "middle")
            // .attr("font-size", "16px")
            // .attr("fill", "black")
            .text("Authors");

        chartGroup.append("text")
            .attr("transform","rotate(-90)")
            .attr("y", 0 - margin.left +120)
            .attr("x", 0 - (height / 2))
            .classed("reviewActive atext", true)
            // .attr("text-anchor", "middle")
            // .attr("font-size", "16px")
            // .attr("fill", "green")
            .text("Total Reviews");

        chartGroup.append("text")
            .attr("transform","rotate(-90)")
            .attr("y", 0 - margin.left + width + margin.right + 190)
            .attr("x", 0 - (height / 2))
            .classed("priceActive atext", true)
            // .attr("text-anchor", "middle")
            // .attr("font-size", "16px")
            // .attr("fill", "orange")
            .text("Total Price");

        chartGroup.append("g")
            .classed("axis", true)
            .attr("transform",`translate(0,${height})`)
            .call(bottomAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-65)"); 
    });