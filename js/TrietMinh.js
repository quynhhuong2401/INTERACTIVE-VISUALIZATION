/////////////////////////////////////////////////
/**@author: 
 * TODO: 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */
//////////////////////////////////////////////////


//===============================================//
// Prepare data
d3.queue()
    .defer(d3.csv, "https://raw.githubusercontent.com/quynhhuong2401/INTERACTIVE-VISUALIZATION/master/data/emission%20data.csv")
    .defer(d3.csv, "https://raw.githubusercontent.com/quynhhuong2401/INTERACTIVE-VISUALIZATION/master/data/countryContinent.csv")
    .defer(d3.json, "https://raw.githubusercontent.com/quynhhuong2401/INTERACTIVE-VISUALIZATION/master/data/countries-hires.json")
    .await(function(error, emissionData, continentData, worldGeoJson) {
        if (error) throw error;
        // console.log("emission Data", emissionData);
        // console.log("continent Data", continentData);
        // console.log("world geo", worldGeoJson);
        var years = emissionData.columns;
        years = years.slice(1);  //get rid of the first element "Country"
        // console.log(years);
        var updateYear = years[0];


     //------------------------Interactive Map------------------------//   
        const width = 960;
        const height = 500;

        var zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);
        var projection = d3.geoMercator()
        .scale(100)
        .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);

        
        var rScale = d3.scaleSqrt()
            .domain([
                0,
                d3.max(emissionData, d => parseFloat(d[years[years.length - 1]]))
            ])
            .range([1, 25]);


        // Thousands separator - print a number with comma in thousand
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } 
        // Tracking country name in emission data
        for (var i = 0; i < emissionData.length; i++){
            var countryName = emissionData[i]["Country"];
            // console.log("country name:", countryName)
        }

        // Merge json with emission data and continent data
        for (var idx = 0; idx < worldGeoJson.features.length; idx++){
            console.log("json country:", worldGeoJson.features[idx].properties["NAME_SORT"]);  //Tracking country name in json file
            for (var j = 0; j < years.length; j++){
                worldGeoJson.features[idx].properties[years[j]] = 0;
                worldGeoJson.features[idx].properties["continent"] = "Others";
            }            
        };


        for (var idx = 0; idx < worldGeoJson.features.length; idx++){
            var jsonCountryName = worldGeoJson.features[idx].properties["NAME_SORT"];
            var country3CodeJson = worldGeoJson.features[idx].properties["ADM0_A3"];

            for (var j = 0; j < emissionData.length; j++){
                var countryName = emissionData[j]["Country"];
                
                if (countryName.includes(jsonCountryName)){
                    for (var k = 0; k < years.length; k++){
                        worldGeoJson.features[idx].properties[ years[k] ] = parseFloat(emissionData[j][ years[k] ]);
                    }
                }
            }

            for (var j = 0; j < continentData.length; j++){
                var continent = continentData[j]["continent"];
                var country3Code = continentData[j]["code_3"];

                if ( country3Code === country3CodeJson){
                    worldGeoJson.features[idx].properties["continent"] = continent;
                }                   
            }
        }
        // Tracking data in json after merging
        // console.log("After merging:", worldGeoJson.features);
        /*
        for (var i = 0; i < worldGeoJson.features.length; i++){
            console.log("country:", worldGeoJson.features[i].properties["NAME_SORT"])
            console.log("3_code:", worldGeoJson.features[i].properties["ADM0_A3"])
            console.log("continent:", worldGeoJson.features[i].properties["continent"])
        }
        */


        var svgGeoChart = d3.select("#interactiveMap").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .style("border", "1px solid black")
            .call(zoom)
            .append("g")
       
        var g = svgGeoChart.append("g")

        g.selectAll("path")
            .data(worldGeoJson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "grey")

            
        g.selectAll("circle")
            .data(worldGeoJson.features)
            .enter()
            .append("circle")
            .attr("class", d => d.properties["continent"])
            .attr("cx", d => path.centroid(d)[0])
            .attr("cy", d => path.centroid(d)[1])
            .attr("r", function(d){
                if (d.properties[ years[0] ] == 0){
                    return 0;
                }
                return rScale(d.properties[ years[0] ])
            })
            .attr("fill", "red")
            .attr("fill-opacity", 0.5)
            .on("mouseover", function(d) {
                d3.select("#tooltip")
                    .html(  "Country: <strong>" + d.properties["NAME_SORT"] + "</strong><br>" +
                            "CO2: <strong>" + numberWithCommas(d.properties[updateYear]) + "</strong><br>"  )
                    .attr('style', 'left:' + (d3.event.clientX + 20) + 'px; top:' + (d3.event.clientY - 20) + 'px')
                    .style("font-family", "sans-serif")
    
                d3.select("#tooltip").classed("hidden", false);
                d3.select(this).attr("fill-opacity", 0.9);
            })
            .on("mouseout", function() {
                d3.select("#tooltip").classed("hidden", true);
                d3.select(this).attr("fill-opacity", 0.5);
            })
        
        

        function updateBubble(year) {
            svgGeoChart.selectAll("circle")
                .transition()
                .duration(100)
                .attr("r", function(d){
                    if (d.properties[year] == 0){
                        return 0;
                    }
                    return rScale(d.properties[year])
                })
        }



        // Zoom //
        //======//
        //FIXME: Sửa lỗi khi click zoom in, out không zoom tiếp mà trở về như cũ mới zoom 
        function zoomed() {
            svgGeoChart.attr("transform", d3.event.transform);
        }
        d3.select("#zoom_in").on("click", function() {
            zoom.scaleBy(svgGeoChart.transition().duration(750), 1.2);
        });
        d3.select("#zoom_out").on("click", function() {
            zoom.scaleBy(svgGeoChart, 1 / 1.3);
        });

        //--------------------Checkbox--------------------------//


        function updateCheckbox() {
            d3.selectAll(".checkbox").each(function(d){
                checkbox = d3.select(this)
                continentGroup = checkbox.property("value")
            

                if(checkbox.property("checked")){
                    // console.log("groupchecked", continentGroup)
                    svgGeoChart.selectAll("." + continentGroup).transition().duration(500)
                        .style("opacity", 1)
                        .style("fill-opacity", 0.5)
                        .attr("r", function(d){
                            if (d.properties[updateYear] == 0){
                                return 0;
                            }
                            return rScale(d.properties[updateYear])
                        })
                }
                else {
                    svgGeoChart.selectAll("." + continentGroup).transition().duration(500)
                        .style("opacity", 0)
                        .attr("r", 0)
                }
            })
        }

        d3.selectAll(".checkbox").on("change",updateCheckbox);
        updateCheckbox();


        //----------------------Racing Bar Chart-------------------//
        var margin = {top: 80, right: 0, bottom: 5, left: 0};

        var barChartHeight = 600 - margin.top - margin.bottom,
            barChartWidth = 960 - margin.left - margin.right,
            top_n = 15;
        var barPadding = (barChartHeight-(margin.bottom+margin.top))/(top_n*5);
        var svg = d3.select("body")
            .append("svg")
            .attr("width", 960)
            .attr("height", 600)
            .append("g")
        var title = svg.append("text")
            .attr("class", "title")
            .attr("y", 24)
            .html("Top countries with the largest CO2 emission from 1760 to 2017");

        var yearSlice = emissionData
            .sort((a,b) => b[updateYear] - a[updateYear])
            .slice(0, top_n);
        yearSlice.forEach((d,i) => d.rank = i);

        console.log("yearSlice", yearSlice);
        

        var x = d3.scaleLinear()
            .domain([
                0, 
                d3.max(yearSlice, d => parseFloat(d[updateYear]))
            ])
            .range([margin.left, 960 - margin.right - 115])
            
        var y = d3.scaleLinear()
            .domain([top_n, 0])
            .range([barChartHeight - margin.bottom, margin.top])

        console.log("y(0):", y(0) + "  y(1):" + y(1));
        var xAxis = d3.axisTop()
            .scale(x)
            .ticks(barChartWidth > 500 ? 4:2)
            .tickSize(-(barChartHeight-margin.top-margin.bottom))
            .tickFormat(d => d3.format(',')(d));

        svg.append("g")
            .attr("class", "axis xAxis")
            .attr("transform", `translate(0, ${margin.top})`)
            .call(xAxis)
            .selectAll('.tick line')
            .classed('origin', d => d == 0);
        svg.selectAll('rect.bar')
            .data(yearSlice, d => d["Country"])
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", margin.left + 1)
            .attr("width", d => x(d[updateYear])- margin.left)
            .attr("y", d => y(d.rank)+5)
            .attr("height", y(1)-y(0)-barPadding)

            
        svg.selectAll('text.label')
            .data(yearSlice, d => d["Country"])
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x(d[updateYear])-8)
            .attr("y", d => y(d.rank)+5+((y(1)-y(0))/2)+1)
            .style("text-anchor", "end")
            .style("fill", "white")
            .html(d => d["Country"]);

        svg.selectAll("text.valueLabel")
            .data(yearSlice, d => d["Country"])
            .enter()
            .append("text")
            .attr("class", "valueLabel")
            .attr("x", d => x(d[updateYear])+5)
            .attr("y", d => y(d.rank)+5+((y(1)-y(0))/2)+1)
            .text(d => d3.format(",.0f")(d[updateYear]));
      
        function updateBarChart(year){
            // Update x
            x.domain([
                0, 
                d3.max(yearSlice, d => parseFloat(d[year]))
            ])
            xAxis.scale(x)
            // Update data
            yearSlice =  emissionData
            .sort((a,b) => parseFloat(b[year]) - parseFloat(a[year]))
            .slice(0, top_n)
            yearSlice.forEach((d,i) => d.rank = i);
            // Update Axis
            svg.select(".xAxis")
            .transition()
            .duration(500)
            .ease(d3.easeLinear)
            .call(xAxis);
  
            
            var bars = svg.selectAll(".bar").data(yearSlice, d => d["Country"]);
            // Update bars
            bars
            .enter()
            .append("rect")
            .attr("class", d => `bar ${d["Country"].replace(/\s/g,'_')}`)
            .attr("x", margin.left + 1)
            .attr( "width", d => x(d[year]) - margin.left)
            .attr("y", d => y(top_n+1)+5)
            .attr("height", y(1)-y(0)-barPadding)
            .transition()
                .duration(500)
                .ease(d3.easeLinear)
                .attr("y", d => y(d.rank)+5);

            bars
            .transition()
                .duration(500)
                .ease(d3.easeLinear)
                .attr("width", d => x(d[year])-margin.left)
                .attr('y', d => y(d.rank)+5); 
            bars
            .exit()
            .transition()
            .duration(500)
                .ease(d3.easeLinear)
                .attr('width', d => x(d[year])-margin.left)
                .attr('y', d => y(top_n+1)+5)
                .remove();
                
            var labels = svg.selectAll('.label')
                .data(yearSlice, d => d["Country"]);
            // Update Country labels
            labels
                .enter()
                .append('text')
                .attr('class', 'label')
                .attr('x', d => x(d[year])-8)
                .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
                .style('text-anchor', 'end')
                .style("fill", "white")
                .html(d => d["Country"])    
                .transition()
                    .duration(500)
                    .ease(d3.easeLinear)
                    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

            labels
                .transition()
                .duration(500)
                    .ease(d3.easeLinear)
                    .attr('x', d => x(d[year])-8)
                    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
               
            labels
                .exit()
                .transition()
                .duration(500)
                    .ease(d3.easeLinear)
                    .attr('x', d => x(d[year])-8)
                    .attr('y', d => y(top_n+1)+5)
                    .remove();

            var valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d["Country"]);
            // Update CO2 value
            valueLabels
                .enter()
                .append('text')
                .attr('class', 'valueLabel')
                .attr('x', d => x(d[year])+5)
                .attr('y', d => y(top_n+1)+5)
                .text(d => d3.format(',.0f')(d[year]))
                .transition()
                .duration(500)
                    .ease(d3.easeLinear)
                    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
                         
            valueLabels
                .transition()
                .duration(500)
                    .ease(d3.easeLinear)
                    .attr('x', d => x(d[year])+5)
                    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
                    .text(d => d3.format(',.0f')(d[year]));
                                   
            valueLabels
                .exit()
                .transition()
                .duration(50)
                    .ease(d3.easeLinear)
                    .attr('x', d => x(d[year])+5)
                    .attr('y', d => y(top_n+1)+5)
                    .remove();
        }

        
  


        // ------------------TimeSlider------------------------- //
        //========//
          // Time test
        var dataTime = years.map(function(d) {
            return new Date(d, 10, 3);
        });
        var slider = d3Slider.sliderHorizontal()
            .domain(d3.extent(dataTime))
            .width(500)
            .tickFormat(d3.timeFormat('%Y'))
            .ticks(20)
            .default(dataTime[0])
            .on("onchange", val => {
                // Update related charts corresponding to the year in the slider
                var year = d3.timeFormat('%Y')(val);
                d3.select("p#value").text(year);
                // console.log(year);
                updateYear = year;
                updateCheckbox();
                updateBubble(updateYear);
                updateBarChart(updateYear);
                
            })


        svgSlider = d3.select("div#slider").append("svg")
            .attr("width", 1000)
            .attr("height", 100)
            .append("g")
            .attr("transform", "translate(30,30)")
            .call(slider);

        

    } )