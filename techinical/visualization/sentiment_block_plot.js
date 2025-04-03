export function drawSentimentBlockPlot(containerSelector, dataPath) {
  const width = 900;
  const height = 400;
  const margin = { top: 50, right: 40, bottom: 50, left: 40 };
  const blockSize = 12;
  const maxPerBin = 10;

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.json(dataPath).then(data => {
    // 构建 bin 分组
    const nested = d3.groups(data, d => d.sentiment_bin);
    nested.sort((a, b) => d3.ascending(a[0], b[0]));

    const bins = nested.map(d => d[0]);
    const xScale = d3.scaleBand()
      .domain(bins)
      .range([margin.left, width - margin.right])
      .paddingInner(0.2);

    const allBlocks = nested.flatMap(([bin, comments]) =>
      comments.map((c, i) => ({
        ...c,
        x: xScale(bin),
        y: height - margin.bottom - (i + 1) * (blockSize + 1),
        opacity: 1
      }))
    );

    // 绘制 block 方块
    svg.selectAll("rect")
      .data(allBlocks)
      .enter()
      .append("rect")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("width", blockSize)
      .attr("height", blockSize)
      .attr("fill", "#333")
      .attr("opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#ff8a65");

        const tooltip = d3.select("#hover-info");
        tooltip.style("display", "block")
          .html(`
            <div><b>Keyword:</b> ${d.keyword}</div>
            <div><b>Sentiment:</b> ${d.sentiment_bin}</div>
            <div style="margin-top:5px;">${d.text.slice(0, 180)}...</div>
            <div><a href="${d.url}" target="_blank">🔗 View Post</a></div>
          `)
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#333");
        d3.select("#hover-info").style("display", "none");
      });

    // 添加 x 轴
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d.toFixed(1));

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom + 10})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "12px");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text("Sentiment-Based Block Timeline");
  });
}
