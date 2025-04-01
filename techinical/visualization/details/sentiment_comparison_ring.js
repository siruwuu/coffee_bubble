// sentiment_comparison_ring.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function drawSentimentRing(containerSelector, dataPath, category) {
  const width = 700;
  const height = 700;
  const innerRadius = 180;
  const outerRadius = 280;

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const colorScale = d3.scaleOrdinal()
    .domain(["positive", "negative"])
    .range(["#2ecc71", "#e74c3c"]);

  const angleScale = d3.scaleBand()
    .range([0, 2 * Math.PI])
    .padding(0.05);

  const radiusScale = d3.scaleLinear()
    .domain([-1, 1])
    .range([innerRadius, outerRadius]);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "6px 12px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("max-width", "280px");

  d3.json(dataPath).then(data => {
    const filtered = data.filter(d => d.category === category);

    const keywords = [...new Set(filtered.map(d => d.keyword))];
    angleScale.domain(keywords);

    svg.selectAll("circle")
      .data(filtered)
      .join("circle")
      .attr("cx", d => {
        const a = angleScale(d.keyword) + angleScale.bandwidth() / 2;
        return Math.cos(a - Math.PI / 2) * radiusScale(d.sentiment);
      })
      .attr("cy", d => {
        const a = angleScale(d.keyword) + angleScale.bandwidth() / 2;
        return Math.sin(a - Math.PI / 2) * radiusScale(d.sentiment);
      })
      .attr("r", 5)
      .attr("fill", d => d.sentiment >= 0 ? colorScale("positive") : colorScale("negative"))
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(100).style("opacity", 1);
        tooltip.html(
          `<div style='font-size:14px; font-weight:bold; color:#333;'>${d.keyword}</div>
           <div style='margin-top:4px; font-size:13px;'>
             ${d.text.length > 300 ? d.text.slice(0, 280) + "..." : d.text}<br/>
             <a href='https://www.reddit.com${d.permalink}' target='_blank' style='color:#2980b9;'>🔗 View on Reddit</a>
           </div>`
        )
        .style("left", (event.pageX + 12) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    // keyword labels
    svg.selectAll("text")
      .data(keywords)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("x", d => Math.cos(angleScale(d) + angleScale.bandwidth() / 2 - Math.PI / 2) * (outerRadius + 20))
      .attr("y", d => Math.sin(angleScale(d) + angleScale.bandwidth() / 2 - Math.PI / 2) * (outerRadius + 20))
      .text(d => d)
      .style("font-size", "12px")
      .style("fill", "#333")
      .style("font-family", "sans-serif");
  });
}
