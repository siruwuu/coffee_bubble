// coffee_packed_bubble.js
import rough from "https://cdn.jsdelivr.net/npm/roughjs@4.5.1/bundled/rough.esm.js";

export function drawPackedBubble(containerSelector, dataPath) {
  const width = 800;
  const height = 600;

  const color = d3.scaleOrdinal(d3.schemeTableau10); 

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
    const root = d3.hierarchy(data).sum(d => d.value);
    pack(root);

    const node = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

      const rc = rough.svg(svg.node());

      node.each(function (d) {
        const roughCircle = rc.circle(0, 0, 2 * d.r, {
          stroke: "black",
          fill: color(d.data.category),
          fillStyle: "cross-hatch",   // ✅ 改为交叉线填充
          fillWeight: 1.5,            // ✅ 粗一些的线条
          hachureAngle: 60,           // ✅ 更倾斜的角度
          hachureGap: 4               // ✅ 更紧密的纹理
        });
        d3.select(this).node().appendChild(roughCircle);
      });
      

    node.append("text")
      .text(d => d.data.name)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("font-size", d => Math.max(10, d.r / 3) + "px")  // 自动调整大小
      .style("fill", "black")
      .style("font-family", "Comic Sans MS, sans-serif")
      .style("pointer-events", "none");
  
  


    // 悬停提示
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
