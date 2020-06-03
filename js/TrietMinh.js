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
    .defer(d3.csv, "data/emission data.csv")
    .defer(d3.csv, "data/countryContinent.csv")
    .defer(d3.json, "data/countries-hires.json")
    .await(function(error, emissionData, continentData, worldGeoJson) {
        if (error) throw error;
        console.log("emission Data", emissionData);
        console.log("continent Data", continentData);
        console.log("world geo", worldGeoJson);
        var years = emissionData.columns;
        years = years.slice(1);  //get rid of the first element "Country"
        console.log(years);


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

        for (var i = 0; i < emissionData.length; i++){
            var countryName = emissionData[i]["Country"];
            console.log("country name:", countryName)
        }

        // Merge json with emission data and continent data
        for (var idx = 0; idx < worldGeoJson.features.length; idx++){
            console.log("json country:", worldGeoJson.features[idx].properties["NAME_SORT"]);
            for (var j = 0; j < years.length; j++){
                worldGeoJson.features[idx].properties[years[j]] = 0;
                worldGeoJson.features[idx].properties["continent"] = "";
            }            
        };


        for (var i = 0; i < worldGeoJson.features.length; i++){
            var jsonCountryName = worldGeoJson.features[i].properties["NAME_SORT"];


            for (var j = 0; j < emissionData.length; j++){
                var countryName = emissionData[j]["Country"];
                
                if (countryName.includes(jsonCountryName)){
                    for (var k = 0; k < years.length; k++){
                        worldGeoJson.features[i].properties[ years[k] ] = parseFloat(emissionData[j][ years[k] ]);
                    }
                }

            }
        }
        console.log("After merging:", worldGeoJson.features);


        var svgGeoChart = d3.select("#interactiveMap").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("background", "#5c5c5c")
            .call(zoom)
            .append("g")

        
            
        var g = svgGeoChart.append("g")


        g.selectAll("path")
            .data(worldGeoJson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "grey")
            .attr("cursor", "pointer")


        
        g.selectAll("circle")
            .data(worldGeoJson.features)
            .enter()
            .append("circle")
            .attr("cx", d => path.centroid(d)[0])
            .attr("cy", d => path.centroid(d)[1])
            .attr("r", function(d){
                if (d.properties[ years[years.length - 2] ] == 0){
                    return 0;
                }
                return rScale(d.properties[ years[years.length - 2] ])
            })
            .attr("fill", "red")
            .attr("fill-opacity", 0.5)
            .append("title")
            .text(function(d) {
                return "Country: " + d.properties["NAME_SORT"] +
                    "\nCO2: " + numberWithCommas(d.properties[ years[years.length - 2]])
            });

        
        function updateBubble(year) {

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



        // ------------------TimeSlider------------------------- //
        //========//
          // Time test
        var dataTime = years.map(function(d) {
            return new Date(d, 10, 3);
        });
        var slider = d3Slider.sliderHorizontal()
            .domain(d3.extent(dataTime))
            .width(900)
            .tickFormat(d3.timeFormat('%Y'))
            .ticks(20)
            .default(dataTime[0])
            .on("onchange", val => {

                // Update related charts corresponding to the year in the slider
                var year = d3.timeFormat('%Y')(val);
                d3.select("p#value").text(year);
                // console.log(year);
            })


        svgSlider = d3.select("div#slider").append("svg")
            .attr("width", 1000)
            .attr("height", 100)
            .append("g")
            .attr("transform", "translate(30,30)")
            .call(slider);

        

    } )