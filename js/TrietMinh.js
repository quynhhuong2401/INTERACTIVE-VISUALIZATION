

d3.queue()
    .defer(d3.csv, "data/emission data.csv")
    .await(function(error, emissionData) {
        if (error) throw error;
        console.log(emissionData);
    } )