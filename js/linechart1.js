var rowConverter = function (d) {
    return {
        Emission: parseInt(d.Emission),
        Country: d["Country"],
        Year: parseInt(d.Year)
    }
}


d3.csv("https://raw.githubusercontent.com/quynhhuong2401/INTERACTIVE-VISUALIZATION/master/data/lan1.csv",
    rowConverter,
    function (error, data) {
        if (error) {
            console.log(error);
        } else {
            console.log(data)

            // Set the margins
            var margin = {
                    top: 60,
                    right: 100,
                    bottom: 20,
                    left: 100
                },
                width = 600 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            var linechart1Selector = d3.select('#linechart1');

            // Create the svg canvas 
            var svg = linechart1Selector
                .append("svg")
                .style("width", width + margin.left + margin.right + "px")
                .style("height", height + margin.top + margin.bottom + "px")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", "svg");

            //NEST : group data by country
            var nest = d3.nest()
                .key(function (d) {
                    return d.Country;
                })
                .entries(data)
            console.log(nest)

            // Set the ranges
            var x = d3.scaleLinear()
                .domain([d3.min(data, function (d) {
                        return d.Year;
                    }),
                    d3.max(data, function (d) {
                        return d.Year;
                    })
                ])
                .range([0, width]);
            var y = d3.scaleLinear()
                .domain([0, d3.max(data, function (d) {
                    return d.Emission;
                })])
                .range([height, 0]);
            // color 
            var res = nest.map(function (d) {
                return d.key
            })
            console.log(nest)
            var color = d3.scaleOrdinal()
                .domain(res)
                .range(['blue', 'green', 'orange', 'red', 'purple'])

            //  Add the X Axis
            var xaxis = svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class", "x axis")
                .call(d3.axisBottom(x)
                    .ticks(5))


            // Add the Y Axis
            var yaxis = svg.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d3.formatPrefix(".0", 1e6)));
        

                


            // Add a label to the y axis
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - 60)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(" EMISSION ")
                .attr("class", "y axis label")
                .style("fill", "darkgreen")


            // Add line into SVG 
            var line = d3.line()
                .x(d => x(d.Year))
                .y(d => y(d.Emission));

            let glines = svg.append('g')

            glines.selectAll('.line-group')
                .data(nest)
                .enter()
                .append('g')
                .append('path')
                .attr("fill", "none")
                .attr("stroke", function (d) {
                    return color(d.key)
                })
                .attr('class', function (d) {
                    return "line " + d.key
                })
                .attr('d', d => line(d.values))
                .style("stroke-width", "2")

/*
            // Add the CIRCLE on the lines
            svg
                .selectAll("myDots")
                .data(nest)
                .enter()
                .append('g')
                .style("fill", "white")
                .attr("stroke", function (d) {
                    return color(d.key)
                })
                .style("stroke-width", "0.5")
                .selectAll("myPoints")
                .data(function (d) {
                    return d.values
                })
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return x(d.Year)
                })
                .attr("cy", function (d) {
                    return y(d.Emission)
                })
                .attr("r", 2)
                .attr('class', function (d) {
                    return "circle " + d.key
                })

*/

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
                .data(nest)
                .enter()
                .append("g")
                .attr("class", "mouse-per-line");

            mousePerLine.append("circle")
                .attr("r", 7)
                .style("stroke", function (d) {
                    return color(d.key);
                })
                .style("fill", "none")
                .style("stroke-width", "1px")
                .style("opacity", "0");

            mousePerLine.append("text").attr("transform", "translate(10,-5)");




            var tooltip = linechart1Selector.append("div")
                .attr('id', 'tooltip')
                .style('position', 'absolute')
                .style("background-color", "#D3D3D3")
                .style('padding', 5 + 'px')
                .style('display', 'none')

            mouseG.append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "none")
                .attr("pointer-events", "all")
                .on("mouseout", function () {
                    linechart1Selector.select(".mouse-line").style("opacity", "0");
                    linechart1Selector.selectAll(".mouse-per-line circle").style("opacity", "0");
                    linechart1Selector.selectAll(".mouse-per-line text").style("opacity", "0")
                    linechart1Selector.selectAll("#tooltip").style('display', 'none')
                })
                .on("mouseover", function () {
                    linechart1Selector.select(".mouse-line").style("opacity", "1");
                    linechart1Selector.selectAll(".mouse-per-line circle").style("opacity", "1");
                    linechart1Selector.selectAll(".mouse-per-line text").style("opacity", "1")
                    linechart1Selector.selectAll("#tooltip").style('display', 'block')
                })
                .on("mousemove", function () {

                    let mouse = d3.mouse(this);

                    if (mouse[0] >= width) {
                        mouseG.select("rect").attr("width", width + 30);
                        return;
                    }

                    linechart1Selector.selectAll(".mouse-per-line")
                        .attr("transform", function (d) {

                            let xDate = x.invert(mouse[0] - 5);
                            let bisect = d3.bisector(function (d) {
                                return d.Year;
                            }).right;
                            let idx = bisect(d.values, xDate);


                            let xCoordinate = (x(d.values[idx].Year)).toString();
                            let yCoordinate = (y(d.values[idx].Emission)).toString();

                            linechart1Selector.select(".mouse-line")
                                .attr("d", function () {
                                    let data = "M" + xCoordinate + "," + height;
                                    data += " " + xCoordinate + "," + 0;
                                    return data;
                                });

                            d3.select(this)
                                .select("text")
                                .text(y.invert(yCoordinate).toFixed(0))
                                .attr("fill", function (d) {
                                    return color(d.key)
                                });

                            return "translate(" + xCoordinate + "," + yCoordinate + ")";
                        });


                    updateTooltipContent(mouse, nest);
                })


            function updateTooltipContent(mouse, nest) {

                var sortingObj = []

                nest.map(d => {
                    var xDate = x.invert(mouse[0] - 5);
                    var bisect = d3.bisector(function (d) {
                        return d.Year;
                    }).right;
                    var idx = bisect(d.values, xDate);

                    sortingObj.push({
                        country: d.values[idx].Country,
                        Emission: d.values[idx].Emission,
                        Year: d.values[idx].Year
                    })
                })

                if (sortingObj[0] == null) return;


                sortingObj.sort((x, y) => y.Emission - x.Emission);

                tooltip.html(d => {
                        return "Year" + ":" + sortingObj[0].Year;
                    })
                    .style('left', d3.event.pageX + 50 + "px")
                    .style('top', d3.event.pageY - 50 + "px")
                    .style('display', 'block')
                    .style('font-size', 12)
                    .selectAll()
                    .data(sortingObj).enter()
                    .append('div')
                    .style('color', d => {
                        return color(d.country)
                    })
                    .style('font-size', 10)
                    .html(d => {
                        return d.country + " : " + d.Emission;
                    })
            }
        }

    });