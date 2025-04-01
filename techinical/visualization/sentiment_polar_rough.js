// sentiment_polar_rough.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import rough from "https://cdn.jsdelivr.net/npm/roughjs@4.5.1/bundled/rough.esm.js";

export function drawSentimentPolarPlot(containerSelector, dataPath, targetType) {
  const width = 800;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = 160;  // 灰色圆圈半径
  const outerRadius = 350; // 最远点半径

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${centerX}, ${centerY})`);

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

    const minLen = d3.min(filtered, d => d.text.length);
    const maxLen = d3.max(filtered, d => d.text.length);

    const rScale = d3.scaleSqrt().domain([minLen, maxLen]).range([baseRadius + 20, outerRadius]);
    const colorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["crimson", "#aaa", "green"]);

    const rc = rough.svg(svg.node());

    // Draw open base circle (semi-transparent with gap)
    const arc = d3.arc()
      .innerRadius(baseRadius)
      .outerRadius(baseRadius)
      .startAngle(-Math.PI + 0.1)
      .endAngle(Math.PI - 0.1);

    svg.append("path")
      .attr("d", arc())
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 2");

    filtered.forEach(d => {
      const angle = d.sentiment * Math.PI; // [-π, π]
      const radius = rScale(d.text.length);
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      const baseX = baseRadius * Math.cos(angle);
      const baseY = baseRadius * Math.sin(angle);

      // Draw connecting line (gray)
      svg.append("line")
        .attr("x1", baseX)
        .attr("y1", baseY)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1.2)
        .attr("opacity", 0.8);

      const circle = rc.circle(0, 0, 12, {
        stroke: "black",
        fill: colorScale(d.sentiment),
        fillStyle: "solid",
        roughness: 1.2
      });

      const node = svg.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .style("cursor", "pointer")
        .on("mouseover", function (event) {
          tooltip.style("display", "block")
            .html(`
              <strong><a href="${d.url || d.post_url}" target="_blank" style="color:#0077cc;text-decoration:underline;">${d.title || d.post_title || "Untitled"}</a></strong><br/>
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
        .on("click", () => {
          window.open(d.url || d.post_url, "_blank");
        });

      node.node().appendChild(circle);
    });
  });
}
