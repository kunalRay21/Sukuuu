"use client";

import { useMemo } from "react";
import { scaleTime, scaleLinear } from "d3-scale";
import { area, curveBasis } from "d3-shape";
import { stack } from "d3-shape";
import * as d3 from "d3";

interface StreamGraphProps {
  data: any[];
  width?: number;
  height?: number;
}

export default function StreamGraph({
  data,
  width = 1000,
  height = 400,
}: StreamGraphProps) {
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Group messages by date and sender
    const grouped = d3.rollup(
      data,
      (v) => v.length,
      (d) => d3.timeDay(new Date(d.timestamp)),
      (d) => d.sender_id,
    );

    // Convert to array format
    const dates = Array.from(grouped.keys()).sort(
      (a, b) => a.getTime() - b.getTime(),
    );
    const senders = Array.from(new Set(data.map((d) => d.sender_id)));

    const series = dates.map((date) => {
      const dayData: any = { date };
      senders.forEach((sender) => {
        dayData[sender] = grouped.get(date)?.get(sender) || 0;
      });
      return dayData;
    });

    // Stack the data
    const stackGenerator = stack()
      .keys(senders)
      .offset(d3.stackOffsetWiggle)
      .order(d3.stackOrderNone);

    const stackedData = stackGenerator(series as any);

    return { stackedData, dates, senders };
  }, [data]);

  if (!processedData || !data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">No data to visualize yet</p>
      </div>
    );
  }

  const { stackedData, dates } = processedData;

  // Scales
  const xScale = scaleTime()
    .domain([dates[0], dates[dates.length - 1]])
    .range([0, innerWidth]);

  const yScale = scaleLinear()
    .domain([
      d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0])) || 0,
      d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) || 0,
    ])
    .range([innerHeight, 0]);

  // Area generator
  const areaGenerator = area()
    .x((d: any) => xScale(d.data.date))
    .y0((d: any) => yScale(d[0]))
    .y1((d: any) => yScale(d[1]))
    .curve(curveBasis);

  const colors = ["#6366f1", "#ec4899"];

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Render the stream layers */}
          {stackedData.map((layer, i) => (
            <path
              key={i}
              d={areaGenerator(layer as any) || ""}
              fill={colors[i % colors.length]}
              fillOpacity={0.7}
              stroke="none"
            />
          ))}

          {/* X-axis */}
          <g transform={`translate(0,${innerHeight})`}>
            <line x1={0} x2={innerWidth} y1={0} y2={0} stroke="#ccc" />
            <text
              x={innerWidth / 2}
              y={25}
              textAnchor="middle"
              className="text-sm fill-gray-600"
            >
              Time
            </text>
          </g>

          {/* Y-axis label */}
          <text
            x={-innerHeight / 2}
            y={-25}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-sm fill-gray-600"
          >
            Message Volume
          </text>
        </g>
      </svg>
    </div>
  );
}
