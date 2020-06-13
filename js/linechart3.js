var rowConverter = function (d) {
    return {
        Emission: parseInt(d.Emission),
        Country: d["Country"],
        Year: parseInt(d.Year)
    }
}
d3.csv("https://raw.githubusercontent.com/quynhhuong2401/INTERACTIVE-VISUALIZATION/master/data/lan3.csv",
    rowConverter,
    function (error, data) {
        if (error) {
            console.log(error);
        } else {
            console.log(data);

           
            var linechart3Selector = d3.select('#linechart3');

            // Set the margins
            var margin = {
                    top: 60,
                    right: 60,
                    bottom: 20,
                    left: 100
                },
                width = 350 - margin.left - margin.right,
                height = 250 - margin.top - margin.bottom;

            // Create the svg canvas 
            var svg = linechart3Selector
                .append("svg")
                .style("width", width + margin.left + margin.right + "px")
                .style("height", height + margin.top + margin.bottom + "px")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            var nestedDataByCountry = d3.nest()
                .key(function (d) {
                    return d.Country;
                })
                .entries(data)
            console.log(nestedDataByCountry)

            var xScale = d3.scaleLinear()
                .domain(
                    [
                        d3.min(data, d => d.Year),
                        d3.max(data, d => d.Year)
                    ]
                )
                .range([0, width]);

            var yScale = d3.scaleLinear()
                .domain(
                    [
                        0,
                        d3.max(data, d => d.Emission)
                    ]
                )
                .range([height, 0]);

            // color 
            var countryRange = nestedDataByCountry.map(d => d.key)

            var mappingColorByCountry = d3.scaleOrdinal()
                .domain(countryRange)
                .range(['blue', 'green', 'orange', 'red', 'purple'])

            //  Add the X Axis
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class", "x axis")
                .call(
                    d3.axisBottom(xScale).ticks(5)
                )

            // Add the Y Axis
            svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale)
            .ticks(5)
            .tickFormat(d3.formatPrefix(".0", 1e6)));
    

            

            // Add a label to the y axis
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - 70)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .attr("class", "y axis label")
                .style("fill", "darkgreen")
                .text(" EMISSION ")


            // Add line into SVG 
            var line = d3.line()
                .x(d => xScale(d.Year))
                .y(d => yScale(d.Emission));

            var glines = svg.append('g')

            glines.selectAll('.line-group')
                .data(nestedDataByCountry)
                .enter()
                .append('g')
                .append('path')
                .attr("fill", "none")
                .attr("stroke", function (d) {
                    return mappingColorByCountry(d.key)
                })
                .attr('class', function (d) {
                    return "line " + d.key
                })
                .attr('d', d => line(d.values))
                .style("stroke-width", "2")
/*
            // Add the CIRCLE on the lines
            svg.selectAll("myDots")
                .data(nestedDataByCountry)
                .enter()
                .append('g')
                .style("fill", "white")
                .attr("stroke", function (d) {
                    return mappingColorByCountry(d.key)
                })
                .style("stroke-width", "0.5")
                .selectAll("myPoints")
                .data(function (d) {
                    return d.values
                })
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d.Year))
                .attr("cy", d => yScale(d.Emission))
                .attr("r", 2) */


            // this the black vertical line to folow mouse
            var mouseG = svg.append("g")
                .attr("class", "mouse-over-effects");

            mouseG.append("path")
                .attr("class", "mouse-line")
                .style("stroke", "black")
                .style("stroke-dasharray", ("3, 3"))
                .style("stroke-width", "1.5px")
                .style("opacity", "0");

            var mousePerLine = mouseG.selectAll(".mouse-per-line")
                .data(nestedDataByCountry)
                .enter()
                .append("g")
                .attr("class", "mouse-per-line");

            mousePerLine.append("circle")
                .attr("r", 7)
                .style("stroke", function (d) {
                    return mappingColorByCountry(d.key);
                })
                .style("fill", "none")
                .style("stroke-width", "1px")
                .style("opacity", "0");

            mousePerLine.append("text").attr("transform", "translate(10,-5)");

            var tooltip = linechart3Selector.append("div")
                .attr('id', 'tooltip')
                .style('position', 'fixed')
                .style("background-color", "#D3D3D3")
                .style('padding', 5 + 'px')
                .style('display', 'none')

            mouseG.append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "none")
                .attr("pointer-events", "all")
                .on("mouseout", function () {
                    linechart3Selector.select(".mouse-line").style("opacity", "0");
                    linechart3Selector.selectAll(".mouse-per-line circle").style("opacity", "0");
                    linechart3Selector.selectAll(".mouse-per-line text").style("opacity", "0")
                    linechart3Selector.selectAll("#tooltip").style('display', 'none')
                })
                .on("mouseover", function () {
                    linechart3Selector.select(".mouse-line").style("opacity", "1");
                    linechart3Selector.selectAll(".mouse-per-line circle").style("opacity", "1");
                    linechart3Selector.selectAll(".mouse-per-line text").style("opacity", "1")
                    linechart3Selector.selectAll("#tooltip").style('display', 'block')
                })
                .on("mousemove", function () {

                    var mouse = d3.mouse(this);

                    if (mouse[0] >= width) {
                        mouseG.select("rect").attr("width", width + 30);
                        return;
                    }

                    linechart3Selector.selectAll(".mouse-per-line")
                        .attr("transform", function (d) {


                            var xYear = xScale.invert(mouse[0] - 10);
                            var bisect = d3.bisector(function (d) {
                                return d.Year;
                            }).right;
                            var idx = bisect(d.values, xYear);

                            let xCoordinate = (xScale(d.values[idx].Year)).toString();
                            let yCoordinate = (yScale(d.values[idx].Emission)).toString();

                            linechart3Selector.select(".mouse-line")
                                .attr("d", function () {
                                    var attr = "M" + xCoordinate + "," + height;
                                    attr += " " + xCoordinate + "," + 0;
                                    return attr;
                                });

                            d3.select(this)
                                .select("text")
                                .text(yScale.invert(yCoordinate).toFixed(0))
                                .attr("fill", function (d) {
                                    return mappingColorByCountry(d.key)
                                });

                            return "translate(" + xCoordinate + "," + yCoordinate + ")";
                        });


                    updateTooltipContent(mouse, nestedDataByCountry);
                })


            function updateTooltipContent(mouse, nest) {

                var sortingObj = []

                nest.map(d => {
                    var xDate = xScale.invert(mouse[0] - 10);
                    var bisect = d3.bisector(function (d) {
                        return d.Year;
                    }).right;
                    var idx = bisect(d.values, xDate);

                    sortingObj.push({
                        Country: d.values[idx].Country,
                        Emission: d.values[idx].Emission,
                        Year: d.values[idx].Year
                    })
                })

                if (sortingObj[0] == null) return;

                sortingObj.sort((x, y) => y.Emission - x.Emission);

                tooltip.html(
                        d => {
                            return '<div style="font-weight: bold;font-size: 17px; text-decoration: underline;">' +
                                "Year" +
                                ":" +
                                sortingObj[0].Year +
                                '</div>';
                        }
                    )
                    .style('left', d3.event.pageX + 50 + "px")
                    .style('top', d3.event.pageY - 50 + "px")
                    .style('display', 'block')

                    .selectAll()
                    .data(sortingObj).enter()
                    .append('div')
                    .style('color', d => {
                        return mappingColorByCountry(d.Country)
                    })
                    .style('font-size', 10)
                    .html(d => {
                        return d.Country + " : " + d.Emission;
                    })
            }
        }

    })