// Stolen from: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const width = 1900
const height = 500

let yearPicker = document.getElementById("yearPicker")
for (let i = 1955; i < 2100 + 1; i++) {
    yearPicker.options[yearPicker.options.length] = new Option(i, i)
}
yearPicker.selectedIndex = 2020 - 1955

// Can't use arrow function because of scope
yearPicker.onchange = function () {
    const selectedYear = parseInt(this.value)
    Promise.all([
        d3.json('world.geojson'),
        d3.csv('worldPopulation.csv')
    ]).then(([countries, population]) => {
        createMap(countries, population, selectedYear)
    })
}

Promise.all([
    d3.json('world.geojson'),
    d3.csv('worldPopulation.csv')
]).then(([countries, population]) => {
    createMap(countries, population, 2020)
})

function createMap(countries, population, currentYear) {
    d3.select("svg").selectAll("*").remove()

    let countriesOfYear = {}
    population.forEach(element => {
        const cYear = element["Time"]
        if (cYear == currentYear) {
            let nameOfCountry = element.Location
            // So the UN has official country names, which can be verbose sometimes (like Lao People's Democratic Republic = Laos)
            // And the geojson has different names for them, so here I swap out the UN names for the geojson ones so that all
            // countries get colored
            // This was pretty annoying to do
            switch (element.Location) {
                case "Russian Federation": nameOfCountry = "Russia"; break;
                case "Venezuela (Bolivarian Republic of)": nameOfCountry = "Venezuela"; break;
                case "Bolivia (Plurinational State of)": nameOfCountry = "Bolivia"; break;
                case "Falkland Islands (Malvinas)": nameOfCountry = "Falkland Islands"; break;
                case "Dem. People's Republic of Korea": nameOfCountry = "South Korea"; break;
                case "Republic of Korea": nameOfCountry = "North Korea"; break;
                case "China, Taiwan Province of China": nameOfCountry = "Taiwan"; break;
                case "Viet Nam": nameOfCountry = "Vietnam"; break;
                case "Lao People's Democratic Republic": nameOfCountry = "Laos"; break;
                case "Iran (Islamic Republic of)": nameOfCountry = "Iran"; break;
                case "Côte d'Ivoire": nameOfCountry = "Ivory Coast"; break;
                case "Czechia": nameOfCountry = "Czech Republic"; break;
                case "Republic of Moldova": nameOfCountry = "Moldova"; break;
                case "Syrian Arab Republic": nameOfCountry = "Syria"; break;
                // case "Republic of Congo": nameOfCountry = "Congo"; break;
            }
            countriesOfYear[nameOfCountry] = element;
        }
    })
    console.log(countries)
    console.log(countriesOfYear)
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

    const threshHolds = [10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000]
    const colors = ["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]

    const widthOfLegendBox = 20
    d3.select("svg")
        .selectAll("rect")
        .data(threshHolds)
        .enter()
        .append("rect")
        .attr("x", 1000)
        .attr("y", (d, i) => 50 + (i * (widthOfLegendBox + 10)))
        .attr("width", widthOfLegendBox)
        .attr("height", widthOfLegendBox)
        .style("fill", (d, i) => colors[i])

    d3.select("svg")
        .selectAll("text")
        .data(threshHolds)
        .enter()
        .append("text")
        .attr("x", 1000 + 30)
        .attr("y", (d, i) => 50 + (widthOfLegendBox / 2) + (i * (widthOfLegendBox + 10)))
        .attr("dy", ".35em")
        .text((d) => numberWithCommas(d));

    // d3.select("svg")
    // .selectAll("text")
    // .data(threshHolds)
    // .append("text")
    // .attr("font-size", "300px")
    // .text("fooo")
    // .attr("fill", "red")
    // .attr("x", 1000)
    // .attr("y", (d, i) => 50 + (i * 30))

    // const colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]
    const colorScale = d3.scaleThreshold()
        .domain(threshHolds)
        .range(colors);

    var proj = d3.geoMercator()
    // .scale(130)
    // .translate([1920 / 2, 1200 / 1.5]);

    var gpath = d3.geoPath()
        .projection(proj);

    d3.select('svg')
        .selectAll('path')
        // Get rid of Antartica and French Artic islands
        .data(countries.features.filter((c) => c.id !== "ATA" && c.id !== "ATF"))
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