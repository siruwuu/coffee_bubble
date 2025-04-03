import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function drawBlockTimeline(containerSelector, dataPath) {
  const width = 960;
  const height = 400;
  const blockSize = 12;
  const gap = 2;

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select(containerSelector)
    .append("div")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("font-size", "13px")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)")
    .style("pointer-events", "none")
    .style("display", "none");

  d3.json(dataPath).then(data => {
    const parseTime = d3.timeParse("%Y-%m-%d");
    data.forEach(d => d.parsedDate = parseTime(d.date));
    const keywords = Array.from(new Set(data.map(d => d.keyword))).sort();

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.parsedDate))
      .range([40, width - 40]);

    const rows = 12;
    const blocksPerRow = Math.ceil(data.length / rows);
    data.sort((a, b) => d3.ascending(a.parsedDate, b.parsedDate));

    data.forEach((d, i) => {
      d.row = i % rows;
      d.col = Math.floor(i / rows);
    });

    let selected = null;

    const update = () => {
      svg.selectAll("rect").remove();

      svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.parsedDate))
        .attr("y", d => d.row * (blockSize + gap) + 60)
        .attr("width", blockSize)
        .attr("height", blockSize)
        .attr("fill", d => {
          if (!selected) return "#ccc";
          return d.keyword === selected ? "#444" : "#eee";
        })
        .attr("cursor", "pointer")
        .on("mouseover", (event, d) => {
          tooltip
            .html(`<strong>${d.title || "Untitled"}</strong><br/>${d.text}`)
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY - 24 + "px")
            .style("display", "block");
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY - 24 + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"))
        .on("click", (_, d) => {
          if (d.url) window.open(d.url, "_blank");
        });

      // 清除旧 filter
      d3.select("#keyword-filter").remove();

      // 添加关键词 filter
      const filter = svg.append("g")
        .attr("id", "keyword-filter")
        .attr("transform", "translate(20, 20)");

      filter.append("text")
        .text("🔍 Filter by Keyword: ")
        .attr("font-size", 14);

      const links = filter.selectAll("text.keyword")
        .data(["All"].concat(keywords))
        .enter()
        .append("text")
        .attr("class", "keyword")
        .attr("x", (_, i) => i * 70 + 140)
        .attr("y", 0)
        .text(d => d)
        .attr("font-size", 13)
        .attr("text-decoration", d => d === selected ? "underline" : "none")
        .attr("fill", d => d === selected ? "black" : "#555")
        .style("cursor", "pointer")
        .on("click", (_, d) => {
          selected = d === "All" ? null : d;
          update();
        });
    };

    update();
  });
}
