import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export class Timeline {
    // construct vertical timeline
    constructor(element, data, options) {
        const defaultOptions = {
            margin: { top: 30, right: 30, bottom: 30, left: 30 },
            areaMargin: { left: 10 },
            width: 320,
            height: 640,
            dotRadius: 4,
            lineStroke: 1,
            color: "steelblue",
            strokeOpacity: 0.25,
            backgroundOpacity: 0.1,
            colorScheme: d3.schemeCategory10,
            textProp: 'name',
            title: '',
            axis: {
                y: { ticks: undefined },
                x: { ticks: undefined },
            },
        };
        this.options = { ...defaultOptions, ...options };
        this.element = element;
        this.data = data.map(item => ({ ...item, date: new Date(item.date) }));
    }

    // draw the vertical timeline
    drawVertical() {
        const { margin, width, height, dateDomain, dotRadius, lineStroke, color, strokeOpacity, backgroundOpacity, colorScheme, areaMargin, textProp, title } = this.options;

        const svg = d3.select(this.element).append("svg").attr("width", width).attr("height", height);
        
        const yDomain = d3.extent(this.data, (d) => d.date);
        yDomain[0] = dateDomain.min ? new Date(dateDomain.min) : yDomain[0];
        yDomain[1] = dateDomain.max ? new Date(dateDomain.max) : yDomain[1];

        const titleMargin = title ? margin.top * 1.5 : 0;
        
        // Get all unique group names
        const groups = [...new Set(this.data.map((d) => d.group))];
        const groupColor = d3.scaleOrdinal().domain(groups).range(colorScheme);

        // Set the x scale based on the groups
        const x = d3.scalePoint().domain(groups).range([margin.left, width - margin.right]).padding(0.5);
        const y = d3.scaleUtc().domain(yDomain).range([margin.top + titleMargin, height - margin.bottom]);

        // Add a rect for each group on the x axis
        svg
            .selectAll(".group-background")
            .data(groups)
            .join("rect")
            .attr("class", "group-background")
            .attr("x", (d) => x(d) - x.step() / 2)
            .attr("y", margin.top + titleMargin)
            .attr("width", x.step())
            .attr("height", height - margin.top - margin.bottom - titleMargin)
            .attr("fill", d => groupColor(d))
            .attr("fill-opacity", backgroundOpacity);

        svg
            .selectAll("line")
            .data(this.data)
            .join("line")
            .attr("x1", margin.left)
            .attr("y1", (d) => y(d.date))
            .attr("x2", (d) => x(d.group) - x.step() / 2 + areaMargin.left)
            .attr("y2", (d) => y(d.date))
            .attr("stroke", d => groupColor(d.group))
            .attr("stroke-opacity", strokeOpacity)
            .attr("stroke-width", lineStroke);

        const circles = svg
            .selectAll("circle")
            .data(this.data)
            .join("circle")
            .attr("cx", (d) => x(d.group) - x.step() / 2 + areaMargin.left)
            .attr("cy", (d) => y(d.date))
            .attr("r", dotRadius)
            .attr("fill", d => groupColor(d.group));

        const names = svg
            .selectAll("text")
            .data(this.data)
            .join("text")
            .attr("x", (d) => x(d.group) - x.step() / 2 + areaMargin.left)
            .attr("y", (d) => y(d.date))
            .attr("dx", "0.5em")
            .attr("dy", "0.35em")
            .text((d) => d[textProp])
            .attr("fill", color);

        // Add title
        if (title) {
            svg.append("text")
                .attr("class", "title")
                .attr("x", width / 2)
                .attr("y", margin.top)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text(title);
        }
        
        // add axis
        const yAxis = d3.axisLeft(y).tickFormat(d3.timeFormat(this.options.axis.y.format));
        if (this.options.axis.y.ticks) {
            yAxis.ticks(this.options.axis.y.ticks);
        }
        svg.append("g").attr("transform", `translate(${margin.left},0)`).call(yAxis);

        const xAxis = d3.axisTop(x);
        if (this.options.axis.x.ticks) {
            xAxis.ticks(this.options.axis.x.ticks);
        }
        svg.append("g").attr("transform", `translate(0,${margin.top + titleMargin})`).call(xAxis);
    
    }
}