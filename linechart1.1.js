var lan1 = "https://raw.githubusercontent.com/quynhhuong2401/INTERACTIVE-VISUALIZATION/master/data/lan1.csv";
var lan2 = "https://raw.githubusercontent.com/quynhhuong2401/INTERACTIVE-VISUALIZATION/master/data/lan2.csv";
var lan3 = "https://raw.githubusercontent.com/quynhhuong2401/INTERACTIVE-VISUALIZATION/master/data/lan3.csv"
var rowConverter = function(d) {
    return {
        
        Emission: parseInt(d.Emission),
        Country: d["Country"],
        Year: parseInt(d.Year)
    };
}
var line1 = lineChart(lan1, '#linechart1');
var line2 = lineChart(lan2, '#linechart2');
var line3 = lineChart(lan3, '#linechart3');


function lineChart(data, id) {
d3.csv(data,rowConverter,  function (error, data) {
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

        var linechart1Selector = d3.select('id');

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





 

    }})};
