const customColors = ['#1b1f3b', '#14532d', '#a35e1f', '#781c1c', '#4b0082', '#3b3b3b', '#5e3c58', '#2d3748'];

const width = 400, height = 300;
const margin = { top: 30, right: 40, bottom: 50, left: 60 };
const tooltip = d3.select("#tooltip");

d3.csv("data/a1-film.csv").then(data => {
  data.forEach(d => {
    d.popularity = +d["Popularity"] || 0;
    d.length = +d["Length"] || 0;
    d.subject = d["Subject"];
    d.year = +d["Year"] || 0;
    d.director = d["Director"];
    d.awards = d["Awards"];
  });

  // Subject Distribution - Bar Chart
  const subjectCounts = Array.from(d3.rollup(data, v => v.length, d => d.subject), ([subject, count]) => ({ subject, count }));
  const x1 = d3.scaleBand().domain(subjectCounts.map(d => d.subject)).range([margin.left, width - margin.right]).padding(0.2);
  const y1 = d3.scaleLinear().domain([0, d3.max(subjectCounts, d => d.count)]).nice().range([height - margin.bottom, margin.top]);
  const svg1 = d3.select("#genre-bar").append("svg")
  .call(svg => svg.append("text").attr("x", width/2).attr("y", 20).attr("text-anchor", "middle").style("font-size", "14px").text("Number of Films by Genre"))
  .call(svg => svg.append("text").attr("x", width/2).attr("y", height - 10).attr("text-anchor", "middle").text("Genre"))
  .call(svg => svg.append("text").attr("transform", "rotate(-90)").attr("x", -height/2).attr("y", 15).attr("text-anchor", "middle").text("Number of Films")).attr("width", width).attr("height", height);
  svg1.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x1)).selectAll("text").attr("transform", "rotate(-40)").style("text-anchor", "end").style("font-size", "10px");
  svg1.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y1));
  svg1.selectAll("rect").data(subjectCounts).enter().append("rect")
    .attr("x", d => x1(d.subject)).attr("y", d => y1(d.count)).attr("width", x1.bandwidth()).attr("height", d => y1(0) - y1(d.count)).attr("fill", d => d3.schemeTableau10[subjectCounts.findIndex(e => e.subject === d.subject) % 10]);

  // Subject Proportion - Pie Chart
  const svg2 = d3.select("#pie-chart").append("svg")
  .call(svg => svg.append("text").attr("x", width/2).attr("y", 20).attr("text-anchor", "middle").style("font-size", "14px").text("Proportion of Films by Genre")).attr("width", width).attr("height", height);
  const pieGroup = svg2.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
  const pie = d3.pie().value(d => d.count);
  const arc = d3.arc().innerRadius(0).outerRadius(100);
  const color = d3.scaleOrdinal(d3.schemeTableau10);
  const pieData = pie(subjectCounts);
  pieGroup.selectAll("path").data(pieData).enter().append("path")
    .attr("d", arc).attr("fill", (d, i) => color(i)).attr("stroke", "#fff").style("stroke-width", "1px");
  
// Add a separate legend to the right side
const legend = svg2.append("g")
  .attr("transform", `translate(${width - 85}, ${20})`);

legend.selectAll("rect")
  .data(pieData)
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("y", (d, i) => i * 15)
  .attr("width", 10)
  .attr("height", 10)
  .attr("fill", (d, i) => color(i));

legend.selectAll("text")
  .data(pieData)
  .enter()
  .append("text")
  .attr("x", 15)
  .attr("y", (d, i) => i * 15 + 9)
  .text(d => d.data.subject)
  .style("font-size", "10px")
  .attr("alignment-baseline", "middle");


  // Average Popularity by Year - Bar Chart
  const yearData = Array.from(d3.rollup(data, v => d3.mean(v, d => d.popularity), d => d.year), ([year, avg]) => ({ year, avg }));
  const x4 = d3.scaleBand().domain(yearData.map(d => d.year)).range([margin.left, width - margin.right]).padding(0.2);
  const y4 = d3.scaleLinear().domain([0, d3.max(yearData, d => d.avg)]).nice().range([height - margin.bottom, margin.top]);
  const svg4 = d3.select("#year-bar").append("svg")
  .call(svg => svg.append("text").attr("x", width/2).attr("y", 20).attr("text-anchor", "middle").style("font-size", "14px").text("Average Popularity by Year"))
  .call(svg => svg.append("text").attr("x", width/2).attr("y", height - 10).attr("text-anchor", "middle").text("Year"))
  .call(svg => svg.append("text").attr("transform", "rotate(-90)").attr("x", -height/2).attr("y", 15).attr("text-anchor", "middle").attr("dy", "-3.5em").style("font-size", "12px").text("Average Popularity")).attr("width", width).attr("height", height);
  svg4.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x4).tickValues(x4.domain().filter((d, i) => i % 5 === 0)).tickFormat(d3.format("d"))).selectAll("text").style("font-size", "9px").attr("transform", "rotate(-45)").style("text-anchor", "end");
  svg4.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y4));
  svg4.selectAll("rect").data(yearData).enter().append("rect")
    .attr("x", d => x4(d.year)).attr("y", d => y4(d.avg)).attr("width", x4.bandwidth()).attr("height", d => y4(0) - y4(d.avg)).attr("fill", d => d3.schemeTableau10[yearData.findIndex(e => e.year === d.year) % 10]);

  // Top 10 Directors - Horizontal Bar
  const topDirectors = Array.from(d3.rollup(data, v => v.length, d => d.director), ([director, count]) => ({ director, count }))
                            .sort((a, b) => d3.descending(a.count, b.count)).slice(0, 10);
  const x5 = d3.scaleLinear().domain([0, d3.max(topDirectors, d => d.count)]).range([margin.left, width - margin.right]);
  const y5 = d3.scaleBand().domain(topDirectors.map(d => d.director)).range([margin.top, height - margin.bottom]).padding(0.2);
  const svg5 = d3.select("#country-bar").append("svg")
  .call(svg => svg.append("text").attr("x", width/2).attr("y", 20).attr("text-anchor", "middle").style("font-size", "14px").text("Top 10 Directors by Film Count"))
  .call(svg => svg.append("text").attr("x", width/2).attr("y", height - 10).attr("text-anchor", "middle").text("Film Count"))
  .call(svg => svg.append("text").attr("transform", "rotate(-90)").attr("x", -height/2).attr("y", 15).attr("text-anchor", "middle").text("Director")).attr("width", width).attr("height", height);
  svg5.append("g").attr("transform", `translate(0,${margin.top})`).call(d3.axisLeft(y5)).selectAll("text").style("font-size", "10px");
  svg5.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x5)).selectAll("text").style("font-size", "10px");
  svg5.selectAll("rect").data(topDirectors).enter().append("rect")
    .attr("x", x5(0)).attr("y", d => y5(d.director)).attr("width", d => x5(d.count) - x5(0)).attr("height", y5.bandwidth()).attr("fill", d => d3.schemeSet2[topDirectors.findIndex(e => e.director === d.director) % 8]);

  // NEW: Awards Distribution
  const awardData = Array.from(d3.rollup(data, v => v.length, d => d.awards), ([awards, count]) => ({ awards, count }));
  const x6 = d3.scaleBand().domain(awardData.map(d => d.awards)).range([margin.left, width - margin.right]).padding(0.4);
  const y6 = d3.scaleLinear().domain([0, d3.max(awardData, d => d.count)]).nice().range([height - margin.bottom, margin.top]);
  const svg6 = d3.select("#scatter-plot").append("svg")
  .call(svg => svg.append("text").attr("x", width/2).attr("y", 20).attr("text-anchor", "middle").style("font-size", "14px").text("Film Count by Award Status"))
  .call(svg => svg.append("text").attr("x", width/2).attr("y", height - 10).attr("text-anchor", "middle").text("Awards"))
  .call(svg => svg.append("text").attr("transform", "rotate(-90)").attr("x", -height/2).attr("y", 15).attr("text-anchor", "middle").text("Film Count")).attr("width", width).attr("height", height);
  svg6.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x6));
  svg6.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y6));
  svg6.selectAll("rect").data(awardData).enter().append("rect")
    .attr("x", d => x6(d.awards)).attr("y", d => y6(d.count)).attr("width", x6.bandwidth()).attr("height", d => y6(0) - y6(d.count)).attr("fill", d => customColors[awardData.findIndex(e => e.awards === d.awards) % 8]);
});
