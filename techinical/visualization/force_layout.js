// Force-layout version of packed bubble chart
// File: coffee_bubble_force_layout.js

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function drawForceBubble(containerSelector, dataPath) {
  const width = 800;
  const height = 600;

  const color = d3.scaleOrdinal(d3.schemeSet3);

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "6px 12px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("pointer-events", "none");

  d3.json(dataPath).then(data => {
    const nodes = [];

    data.children.forEach(categoryGroup => {
      const category = categoryGroup.name;
      categoryGroup.children.forEach(d => {
        d.category = category;
        nodes.push({
          id: d.name,
          radius: Math.sqrt(d.value) * 4,
          value: d.value,
          category: d.category,
          sentiment: d.avg_sentiment
        });
      });
    });

    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(5))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => d.radius + 2))
      .force("x", d3.forceX().x(d => {
        const offsets = { flavor: 200, type: 600, brew: 200, origin: 600 };
        return offsets[d.category] || width / 2;
      }).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .on("tick", ticked);

    const node = svg.selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => color(d.category))
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(100).style("opacity", 1);
        tooltip.html(`<strong>${d.id}</strong><br/>
                      Category: ${d.category}<br/>
                      Comments: ${d.value}<br/>
                      Avg Sentiment: ${d.sentiment}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    const labels = svg.selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.id)
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("pointer-events", "none");

    function ticked() {
      node.attr("cx", d => d.x)
          .attr("cy", d => d.y);

      labels.attr("x", d => d.x)
            .attr("y", d => d.y);
    }
  });
}