import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function drawSentimentPolarPlot(containerSelector, dataPath, targetCategory) {
  const width = 800;
  const height = 800;
  const radius = Math.min(width, height) / 2 - 60;

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const tooltip = d3.select(containerSelector)
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "10px")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
    .style("pointer-events", "none")
    .style("font-size", "13px")
    .style("max-width", "260px")
    .style("display", "none");

  d3.json(dataPath).then(data => {
    const filtered = data.filter(d => d.category === targetCategory);

    const angleScale = d3.scaleLinear().domain([-1, 1]).range([-Math.PI, Math.PI]);
    const rScale = d3.scaleLinear().domain([0, 1]).range([100, radius]);

    svg.selectAll("circle")
      .data(filtered)
      .join("circle")
      .attr("cx", d => {
        const angle = angleScale(d.sentiment);
        return rScale(Math.abs(d.sentiment)) * Math.cos(angle);
      })
      .attr("cy", d => {
        const angle = angleScale(d.sentiment);
        return rScale(Math.abs(d.sentiment)) * Math.sin(angle);
      })
      .attr("r", 6)
      .attr("fill", d => d.sentiment >= 0 ? "green" : "crimson")
      .attr("opacity", 0.85)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        tooltip.style("display", "block")
          .html(`
            <strong><a href="${d.url || d.post_url}" target="_blank" style="color:#0077cc;text-decoration:underline;">
              ${d.title || d.post_title || "Untitled"}
            </a></strong><br/>
            <div style="margin-top:4px;">${d.text}</div>
          `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseleave", function () {
        tooltip.style("display", "none");
      })
      .on("click", function (event, d) {
        const url = d.url || d.post_url;
        if (url) window.open(url, "_blank");
      });

    // Optional guide ring
    svg.append("circle")
      .attr("r", radius)
      .attr("stroke", "#ddd")
      .attr("fill", "none");

    // Optional axis line
    svg.append("line")
      .attr("x1", -radius)
      .attr("x2", radius)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "4 2");

    svg.append("text")
      .attr("x", -radius + 10)
      .attr("y", -10)
      .text("Negative")
      .style("fill", "crimson")
      .style("font-size", "14px");

    svg.append("text")
      .attr("x", radius - 10)
      .attr("y", -10)
      .text("Positive")
      .style("fill", "green")
      .style("text-anchor", "end")
      .style("font-size", "14px");
  });
}
