// 方法三：不展示 tooltip，使用动画表达 Hover 效果（呼吸/弹跳） + 点击跳转到评论页面
import rough from "https://cdn.jsdelivr.net/npm/roughjs@4.5.1/bundled/rough.esm.js";

export function drawPackedBubbleAnimated(containerSelector, dataPath) {
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

    node.on("mouseover", function (event, d) {
      d3.select(this)
        .raise()
        .transition()
        .duration(300)
        .attr("transform", `translate(${d.originalX}, ${d.originalY - 10}) scale(1.15)`);

      d3.select(this).select("text")
        .transition()
        .duration(300)
        .style("font-size", Math.max(10, d.r / 2.2) + "px")
        .style("font-weight", "bold");
    })
    .on("mouseout", function (event, d) {
      d3.select(this)
        .transition()
        .duration(300)
        .attr("transform", `translate(${d.originalX}, ${d.originalY}) scale(1)`);

      d3.select(this).select("text")
        .transition()
        .duration(300)
        .style("font-size", Math.max(10, d.r / 3) + "px")
        .style("font-weight", "normal");
    })
      .on("click", function (event, d) {
        const category = encodeURIComponent(d.data.category);
        window.location.href = `details/viewer_by_category.html?category=${category}`;
      });
  }); 
}