// 方法二：hover 展示固定位置的侧边简介信息
import rough from "https://cdn.jsdelivr.net/npm/roughjs@4.5.1/bundled/rough.esm.js";

export function drawPackedBubbleWithInfoBox(containerSelector, dataPath) {
  const width = 800;
  const height = 600;

  const morandiPalette = {
    flavor: ['#A9BDB1', '#B6C1AE', '#C3C8A9'],
    type:   ['#E6B7A9', '#EBC3B2', '#F1D1C3'],
    brew:   ['#A4B0BC', '#BAC5D1', '#CAD6DE'],
    origin: ['#D9B8A8', '#E5C9BA', '#F0D9CC']
  };

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const infoBox = d3.select(containerSelector)
    .append("div")
    .attr("id", "info-box")
    .style("position", "absolute")
    .style("top", "20px")
    .style("left", width + 40 + "px")
    .style("width", "260px")
    .style("background", "#fff")
    .style("padding", "12px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "8px")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
    .style("font-family", "sans-serif")
    .style("font-size", "14px")
    .style("display", "none")
    .style("pointer-events", "none");

  d3.json(dataPath).then(data => {
    const pack = d3.pack().size([width, height]).padding(4);
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
    pack(root);

    const colorMap = {};
    const counters = {};
    root.leaves().forEach(d => {
      const cat = d.data.category;
      counters[cat] = (counters[cat] || 0);
      const palette = morandiPalette[cat] || ["#ccc"];
      colorMap[d.data.name] = palette[counters[cat] % palette.length];
      counters[cat] += 1;

      d.originalX = d.x;
      d.originalY = d.y;
    });

    const node = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    const rc = rough.svg(svg.node());

    node.each(function (d) {
      const roughCircle = rc.circle(0, 0, 2 * d.r, {
        stroke: "black",
        fill: colorMap[d.data.name],
        fillStyle: "cross-hatch",
        fillWeight: 1.5,
        hachureAngle: 60,
        hachureGap: 4
      });
      d3.select(this).node().appendChild(roughCircle);
    });

    node.append("text")
      .text(d => d.data.name)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("font-size", d => Math.max(10, d.r / 3) + "px")
      .style("fill", "black")
      .style("font-family", "Comic Sans MS, sans-serif")
      .style("pointer-events", "none");

    node.on("mouseenter", function (event, d) {
      d3.select(this)
        .raise()
        .transition()
        .duration(400)
        .attr("transform", `translate(${width / 2}, ${height / 2}) scale(1.2)`);

      infoBox.style("display", "block");
      infoBox.html(`
        <div style="font-weight:bold; color:#c0392b; font-size:16px; margin-bottom:6px;">
          ${d.data.name}
        </div>
        <div style="color:#444; font-size:13px;">
          ${d.data.examples?.slice(0, 3).map(t => `• ${t}`).join("<br/><br/>") || "No info available."}
        </div>
      `);
    })
    .on("mouseleave", function (event, d) {
      d3.select(this)
        .transition()
        .duration(500)
        .attr("transform", `translate(${d.originalX}, ${d.originalY}) scale(1)`);

      infoBox.style("display", "none");
    });
  });
}
