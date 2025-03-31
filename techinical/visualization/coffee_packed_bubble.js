import rough from "https://cdn.jsdelivr.net/npm/roughjs@4.5.1/bundled/rough.esm.js";

export function drawPackedBubble(containerSelector, dataPath) {
  const width = 800;
  const height = 600;

  const morandiPalette = {
    flavor: ['#F28CA6', '#E6B2BA', '#FFE3E3', '#FF8A8A','#F7B5CA','#EDDFE0'], // pink
    type:   ['#F39E60', '#FFE6A9',  '#FFD09B', '#FFB38E'],  //orange
    brew:   ['#C5D3E8', '#BAC5D1', '#CAD6DE','#D4F6FF'], //blue
    origin: ['#95D2B3', '#CADABF', '#ACE1AF','#BFF6C3']
  };


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
    const pack = d3.pack().size([width, height]).padding(4);
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
    pack(root);

    // ✅ 分配颜色
    const colorMap = {};
    const counters = {};
    root.leaves().forEach(d => {
      const cat = d.data.category;
      counters[cat] = (counters[cat] || 0);
      const palette = morandiPalette[cat] || ["#ccc"];
      colorMap[d.data.name] = palette[counters[cat] % palette.length];
      counters[cat] += 1;
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

    node.on("mouseover", (event, d) => {
        tooltip.transition().duration(100).style("opacity", 1);
        tooltip.html(`<strong>${d.data.name}</strong><br/>
                      Category: ${d.data.category}<br/>
                      Comments: ${d.data.value}<br/>
                      Avg Sentiment: ${d.data.avg_sentiment}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });
  });
}
