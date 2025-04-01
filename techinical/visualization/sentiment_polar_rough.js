// sentiment_polar_rough.js
import rough from "https://cdn.jsdelivr.net/npm/roughjs@4.5.1/bundled/rough.esm.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function drawSentimentPolarPlot(containerSelector, dataPath, targetType) {
  const width = 800;
  const height = 800;
  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const centerX = width / 2;
  const centerY = height / 2;
  const rc = rough.svg(svg.node());

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
    .style("max-width", "240px")
    .style("display", "none");

  d3.json(dataPath).then(data => {
    const filtered = data.filter(d => d.category === targetType);

    const sentimentExtent = d3.extent(filtered, d => d.sentiment);
    const lengthExtent = d3.extent(filtered, d => d.text.length);

    const angleScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([-Math.PI, Math.PI]);

    const rScale = d3.scaleLinear()
      .domain(lengthExtent)
      .range([120, 360]);

    filtered.forEach(d => {
      const angle = angleScale(d.sentiment);
      const radius = rScale(d.text.length);
      d.x = centerX + radius * Math.cos(angle);
      d.y = centerY + radius * Math.sin(angle);
    });

    filtered.forEach(d => {
      const roughCircle = rc.circle(d.x, d.y, 12, {
        stroke: "black",
        fill: d.sentiment >= 0 ? "green" : "crimson",
        fillStyle: "cross-hatch",
        fillWeight: 1.5,
        hachureAngle: 60,
        hachureGap: 4
      });
      svg.node().appendChild(roughCircle);
    });

    svg.selectAll(".dot")
      .data(filtered)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 6)
      .attr("opacity", 0)
      .on("mouseover", function (event, d) {
        tooltip.style("display", "block")
          .html(`
            <strong><a href="${d.url || d.post_url}" target="_blank" style="color:#0077cc;text-decoration:underline;">
              ${d.title || d.post_title || "Untitled"}
            </a></strong><br/>
            <div>${d.text}</div>
          `)
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mousemove", function (event) {
        tooltip.style("left", (event.pageX + 12) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseleave", function () {
        tooltip.style("display", "none");
      })
      .on("click", function (event, d) {
        const url = d.url || d.post_url;
        if (url) window.open(url, "_blank");
      });

    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 360)
      .attr("fill", "none")
      .attr("stroke", "#ddd");

    svg.append("text")
      .attr("x", centerX - 300)
      .attr("y", centerY - 10)
      .text("Negative")
      .attr("text-anchor", "start")
      .style("font-size", "14px")
      .style("fill", "crimson");

    svg.append("text")
      .attr("x", centerX + 300)
      .attr("y", centerY - 10)
      .text("Positive")
      .attr("text-anchor", "end")
      .style("font-size", "14px")
      .style("fill", "green");
  });
}