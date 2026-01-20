"use client";

import { useMemo, useState } from "react";
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
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);

  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Check if we have multiple days
    const uniqueDays = new Set(
      data.map((d) => new Date(d.timestamp).toDateString()),
    );
    const hasMultipleDays = uniqueDays.size > 1;

    if (hasMultipleDays) {
      // Original logic for multiple days
      const grouped = d3.rollup(
        data,
        (v) => v.length,
        (d) => d3.timeDay(new Date(d.timestamp)),
        (d) => d.sender_id,
      );

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

      const stackGenerator = stack()
        .keys(senders)
        .offset(d3.stackOffsetWiggle)
        .order(d3.stackOrderNone);

      const stackedData = stackGenerator(series as any);

      return { stackedData, dates, senders, isHourly: false };
    } else {
      // For single day, create hourly breakdown
      const grouped = d3.rollup(
        data,
        (v) => v.length,
        (d) => d3.timeHour(new Date(d.timestamp)),
        (d) => d.sender_id,
      );

      const hours = Array.from(grouped.keys()).sort(
        (a, b) => a.getTime() - b.getTime(),
      );
      const senders = Array.from(new Set(data.map((d) => d.sender_id)));

      const series = hours.map((hour) => {
        const hourData: any = { date: hour };
        senders.forEach((sender) => {
          hourData[sender] = grouped.get(hour)?.get(sender) || 0;
        });
        return hourData;
      });

      const stackGenerator = stack()
        .keys(senders)
        .offset(d3.stackOffsetWiggle)
        .order(d3.stackOrderNone);

      const stackedData = stackGenerator(series as any);

      return { stackedData, dates: hours, senders, isHourly: true };
    }
  }, [data]);

  if (!processedData || !data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">No data to visualize yet</p>
      </div>
    );
  }

  const { stackedData, dates, isHourly } = processedData;

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
  const senderNames = processedData.senders;

  const handleMouseMove = (
    event: React.MouseEvent<SVGPathElement>,
    layerIndex: number,
    layer: any,
  ) => {
    // Get SVG bounding box for coordinate calculations
    const svgRect =
      event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!svgRect) return;

    // STEP 1: Convert mouse X position to date/time value
    // Calculate mouse position relative to the graph area (excluding margins)
    const mouseX = event.clientX - svgRect.left - margin.left;

    // Use xScale.invert() to convert pixel position back to the date domain
    // This gives us the date/time the user is hovering over
    const date = xScale.invert(mouseX);

    // STEP 2: Find the closest data point to the hovered date
    // D3's bisector helps find the insertion point in the sorted array
    // This efficiently locates the data point nearest to the hovered date
    const bisect = d3.bisector((d: any) => d.data.date).left;
    const index = bisect(layer, date);
    const dataPoint = layer[Math.min(index, layer.length - 1)];

    if (dataPoint) {
      // STEP 3: Calculate the message count for this specific sender
      // In D3's stacked layout:
      // - dataPoint[0] = bottom edge of this layer (cumulative count up to previous sender)
      // - dataPoint[1] = top edge of this layer (cumulative count including this sender)
      // - dataPoint[1] - dataPoint[0] = height of this layer = THIS SENDER'S message count
      //
      // Example: If "You" sent 10 msgs and "Partner" sent 8 msgs on a day:
      //   Layer 0 (You): [0, 10] → 10 - 0 = 10 messages
      //   Layer 1 (Partner): [10, 18] → 18 - 10 = 8 messages
      //
      // IMPORTANT: D3's wiggle offset creates floating point values for smooth curves.
      // We round EACH value before subtraction to ensure integer message counts.
      const bottom = Math.round(dataPoint[0]);
      const top = Math.round(dataPoint[1]);
      const value = top - bottom;

      // STEP 4: Get the sender name from the layer index
      const sender = senderNames[layerIndex];

      // STEP 5: Format the date/time for display
      const dateStr = isHourly
        ? dataPoint.data.date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : dataPoint.data.date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

      // STEP 6: Display the tooltip with calculated information
      setTooltip({
        x: event.clientX - svgRect.left,
        y: event.clientY - svgRect.top,
        content: `${sender}: ${value} message${value !== 1 ? "s" : ""}\n${dateStr}`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex justify-center gap-6 mb-4">
        {senderNames.map((sender, i) => (
          <div key={sender} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-sm font-medium text-gray-700">{sender}</span>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          📊 This stream graph shows message volume over time.
          <span className="font-medium"> Hover over the graph</span> to see
          detailed information.
          {isHourly
            ? " Showing hourly breakdown for the selected day."
            : " Each curve represents message flow across days."}
        </p>
      </div>

      {/* Graph Container */}
      <div className="w-full overflow-x-auto bg-white rounded-lg border border-gray-200 p-4 relative">
        <svg width={width} height={height} className="mx-auto">
          <defs>
            {/* Gradients with center blending */}
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.9" />
              <stop offset="40%" stopColor={colors[0]} stopOpacity="0.6" />
              <stop offset="50%" stopColor={colors[0]} stopOpacity="0.3" />
              <stop offset="60%" stopColor={colors[0]} stopOpacity="0.5" />
              <stop offset="100%" stopColor={colors[0]} stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[1]} stopOpacity="0.7" />
              <stop offset="40%" stopColor={colors[1]} stopOpacity="0.5" />
              <stop offset="50%" stopColor={colors[1]} stopOpacity="0.3" />
              <stop offset="60%" stopColor={colors[1]} stopOpacity="0.6" />
              <stop offset="100%" stopColor={colors[1]} stopOpacity="0.9" />
            </linearGradient>

            {/* Radial gradient for center glow effect */}
            <radialGradient id="centerGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#f0f0f0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* Blur filter for softer edges */}
            <filter id="soften">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
            </filter>
          </defs>

          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Grid lines */}
            <g className="grid">
              {yScale.ticks(5).map((tick, i) => (
                <g key={i}>
                  <line
                    x1={0}
                    x2={innerWidth}
                    y1={yScale(tick)}
                    y2={yScale(tick)}
                    stroke="#e5e7eb"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={-10}
                    y={yScale(tick)}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    className="text-xs fill-gray-500"
                  >
                    {tick}
                  </text>
                </g>
              ))}
            </g>

            {/* Render the stream layers with blend modes */}
            {stackedData.map((layer, i) => (
              <g key={i}>
                {/* Main stream path with soft filter */}
                <path
                  d={areaGenerator(layer as any) || ""}
                  fill={`url(#gradient${(i % 2) + 1})`}
                  stroke="none"
                  filter="url(#soften)"
                  className="cursor-pointer transition-opacity"
                  style={{ mixBlendMode: "multiply" }}
                  onMouseMove={(e) => handleMouseMove(e, i, layer)}
                  onMouseLeave={handleMouseLeave}
                />
                {/* Subtle outline for definition */}
                <path
                  d={areaGenerator(layer as any) || ""}
                  fill="none"
                  stroke={colors[i % colors.length]}
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                  className="pointer-events-none"
                />
              </g>
            ))}

            {/* Center overlay for smooth blending */}
            <rect
              x={0}
              y={innerHeight * 0.4}
              width={innerWidth}
              height={innerHeight * 0.2}
              fill="url(#centerGlow)"
              className="pointer-events-none"
              style={{ mixBlendMode: "overlay" }}
            />

            {/* X-axis */}
            <g transform={`translate(0,${innerHeight})`}>
              <line
                x1={0}
                x2={innerWidth}
                y1={0}
                y2={0}
                stroke="#9ca3af"
                strokeWidth="2"
              />
              {xScale.ticks(isHourly ? 6 : 5).map((tick, i) => (
                <g key={i}>
                  <line
                    x1={xScale(tick)}
                    x2={xScale(tick)}
                    y1={0}
                    y2={5}
                    stroke="#9ca3af"
                    strokeWidth="2"
                  />
                  <text
                    x={xScale(tick)}
                    y={20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {isHourly
                      ? tick.toLocaleTimeString("en-US", { hour: "2-digit" })
                      : tick.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                  </text>
                </g>
              ))}
              <text
                x={innerWidth / 2}
                y={40}
                textAnchor="middle"
                className="text-sm fill-gray-700 font-medium"
              >
                {isHourly ? "Time of Day" : "Date"}
              </text>
            </g>

            {/* Y-axis label */}
            <text
              x={-innerHeight / 2}
              y={-40}
              transform="rotate(-90)"
              textAnchor="middle"
              className="text-sm fill-gray-700 font-medium"
            >
              Number of Messages
            </text>
          </g>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg pointer-events-none z-10"
            style={{
              left: `${tooltip.x + 10}px`,
              top: `${tooltip.y - 10}px`,
            }}
          >
            {tooltip.content.split("\n").map((line, i) => (
              <div key={i} className={i === 0 ? "font-bold" : ""}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Total Messages</div>
          <div className="text-xl font-bold text-gray-900">{data.length}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Time Period</div>
          <div className="text-xl font-bold text-gray-900">
            {isHourly ? "24 Hours" : `${dates.length} Days`}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">
            Avg per {isHourly ? "Hour" : "Day"}
          </div>
          <div className="text-xl font-bold text-gray-900">
            {(data.length / dates.length).toFixed(1)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">
            Peak {isHourly ? "Hour" : "Day"}
          </div>
          <div className="text-xl font-bold text-gray-900">
            {Math.max(...stackedData[0].map((d: any) => d[1] - d[0]))}
          </div>
        </div>
      </div>
    </div>
  );
}
