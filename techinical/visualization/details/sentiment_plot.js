import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const urlParams = new URLSearchParams(window.location.search);
const keyword = urlParams.get("keyword");

d3.select("#keyword-title").text(`Comments for: ${keyword}`);

d3.json("../data/comments_with_sentiment.json").then(data => {
  const filtered = data.filter(d => d.keyword === keyword);
  const width = 600;
  const height = 600;
  const radius = 250;

  const svg = d3.select("#sentiment-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2}, ${height/2})`);

  const angleScale = d3.scaleLinear()
    .domain([-1, 1])  // sentiment polarity
    .range([-Math.PI, Math.PI]);

  const rScale = d3.scaleLinear()
    .domain([0, 1])
    .range([50, radius]);

  svg.selectAll("circle.dot")
    .data(filtered)
    .join("circle")
    .attr("class", "dot")
    .attr("cx", d => rScale(Math.abs(d.sentiment)) * Math.cos(angleScale(d.sentiment)))
    .attr("cy", d => rScale(Math.abs(d.sentiment)) * Math.sin(angleScale(d.sentiment)))
    .attr("r", 6)
    .attr("fill", d => d.sentiment >= 0 ? "green" : "crimson")
    .attr("opacity", 0.8)
    .append("title")
    .text(d => d.text);
});
