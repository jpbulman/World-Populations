// adapted for d3.v5 from d3js in action

Promise.all([
    d3.json('world.geojson'),
    d3.csv('worldPopulation.csv')
]).then(([countries, population]) => {
    createMap(countries, population)
})

function createMap(countries, population) {
    const currentYear = 2010
    let countriesOfYear = {}
    population.forEach(element => {
        const cYear = element["Time"]
        if (cYear == currentYear) {
            let nameOfCountry = element.Location
            switch (element.Location) {
                case "Russian Federation": nameOfCountry = "Russia"; break;
                case "Venezuela (Bolivarian Republic of)": nameOfCountry = "Venezuela"; break;
                case "Bolivia (Plurinational State of)": nameOfCountry = "Bolivia"; break;
                case "Falkland Islands (Malvinas)": nameOfCountry = "Falkland Islands"; break;
            }
            countriesOfYear[nameOfCountry] = element;
        }
    })

    let smallestPopulation = parseFloat(countriesOfYear[Object.keys(countriesOfYear)[0]].PopTotal)
    let largestPopulation = parseFloat(countriesOfYear[Object.keys(countriesOfYear)[0]].PopTotal)
    countries.features.forEach(currentCountry => {
        if (currentCountry.properties.name in countriesOfYear) {
            const population = parseFloat(countriesOfYear[currentCountry.properties.name].PopTotal)
            if (population < smallestPopulation)
                smallestPopulation = population

            if (population > largestPopulation)
                largestPopulation = population
        }
    })

    console.log(smallestPopulation, largestPopulation)
    const numColors = 9
    const colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]
    const colorScale = d3.scaleThreshold()
        .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
        .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);

    var proj = d3.geoMercator()
    // .scale(130)
    // .translate([1920 / 2, 1200 / 1.5]);

    var gpath = d3.geoPath()
        .projection(proj);

    d3.select('svg')
        .selectAll('path')
        .data(countries.features.filter((c) => c.id !== "ATA"))
        .enter()
        .append('path')
        .attr('d', gpath)
        .attr('stroke-width', 1)
        .attr('stroke', '#252525')
        .attr('fill', (d) => {
            if (d.properties.name in countriesOfYear) {
                // CSV data is in thousands
                return colorScale(parseFloat(countriesOfYear[d.properties.name].PopTotal) * 1000)
            } else {
                return "red"
            }
        });

    // FOR MORE ON THIS, SEE ARTICLE THINKING WITH JOINS
    // d3.select('svg')
    //   .selectAll('circle')
    //   .data(cities)
    //   .enter()
    //   .append('circle')
    //   .attr('r', 3)
    //   .attr('cx', d => proj([d.x, d.y])[0])
    //   .attr('cy', d => proj([d.x, d.y])[1])
    //   .attr('stroke-width', 1)
    //   .attr('stroke', '#4F442B')
    //   .attr('fill', '#FCBC34')
    //   .on('mouseover', function (d) {
    //     d3.select('#info').text(d.label);
    //   })

    // var mapZoom = d3.zoom()
    //   .on('zoom', zoomed);

    // var zoomSettings = d3.zoomIdentity
    //   .translate(250, 250)
    //   .scale(120);

    // d3.select('svg')
    //   .call(mapZoom)
    //   .call(mapZoom.transform, zoomSettings);

    // function zoomed() {
    //   var e = d3.event;

    //   proj
    //     .translate([e.transform.x, e.transform.y])
    //     .scale(e.transform.k);

    //   d3.selectAll('path')
    //     .attr('d', gpath);

    //   d3.selectAll('circle')
    //     .attr('cx', d => proj([d.x, d.y])[0])
    //     .attr('cy', d => proj([d.x, d.y])[1]);
    // }
}
