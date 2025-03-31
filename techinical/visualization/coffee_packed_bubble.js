export function drawPackedBubble(containerSelector, dataPath) {
    const width = 800;
    const height = 600;
  
    const color = d3.scaleOrdinal(d3.schemeSet2);
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
  
      node.append("circle")
        .attr("r", d => d.r)
        .attr("fill", d => color(d.data.category))
        .on("mouseover", (event, d) => {
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
  
      node.append("text")
        .attr("class", "bubble-text")
        .text(d => d.data.name)
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "10px");
    });
  }
  