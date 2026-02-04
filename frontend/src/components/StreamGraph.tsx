"use client";

import { useMemo, useState, memo, useRef, useEffect } from "react";
import { scaleTime, scaleLinear } from "d3-scale";
import { area, curveBasis, curveNatural, curveCatmullRom } from "d3-shape";
import { stack, stackOffsetWiggle, stackOrderNone } from "d3-shape";
import * as d3 from "d3";
import { ParentSize } from "@visx/responsive";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/config/theme";

interface StreamGraphProps {
  data: any[];
  variant?: "organic" | "heartbeat" | "minimal";
}

// Glassmorphism tooltip component
function GlassTooltip({
  x,
  y,
  content,
  visible,
}: {
  x: number;
  y: number;
  content: string;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-none z-20"
          style={{ left: x + 15, top: y - 15 }}
        >
          <div className="relative px-4 py-3 rounded-xl backdrop-blur-md bg-white/70 border border-white/50 shadow-lg">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent" />
            <pre className="relative font-mono text-xs text-gray-800 whitespace-pre-wrap">
              {content}
            </pre>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StreamGraphContent({
  data,
  width,
  height,
  variant = "organic",
}: StreamGraphProps & { width: number; height: number }) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const margin = { top: 30, right: 40, bottom: 60, left: 70 };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const uniqueDays = new Set(
      data.map((d) => new Date(d.timestamp).toDateString()),
    );
    const hasMultipleDays = uniqueDays.size > 1;

    if (hasMultipleDays) {
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
        .offset(stackOffsetWiggle)
        .order(stackOrderNone);

      const stackedData = stackGenerator(series as any);

      return { stackedData, dates, senders, isHourly: false };
    } else {
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
        .offset(stackOffsetWiggle)
        .order(stackOrderNone);

      const stackedData = stackGenerator(series as any);

      return { stackedData, dates: hours, senders, isHourly: true };
    }
  }, [data]);

  if (!processedData || !data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            💭
          </motion.div>
          <p className="font-serif text-gray-400 text-lg italic">
            Waiting for your story...
          </p>
        </div>
      </div>
    );
  }

  const { stackedData, dates, isHourly } = processedData;

  const xScale = scaleTime()
    .domain([dates[0], dates[dates.length - 1]])
    .range([0, innerWidth]);

  const yScale = scaleLinear()
    .domain([
      d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0])) || 0,
      d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) || 0,
    ])
    .range([innerHeight, 0]);

  // Organic, hand-drawn style curve - like soft heartbeats
  const curveType =
    variant === "heartbeat" ? curveCatmullRom.alpha(0.5) : curveBasis;

  const areaGenerator = area()
    .x((d: any) => xScale(d.data.date))
    .y0((d: any) => yScale(d[0]))
    .y1((d: any) => yScale(d[1]))
    .curve(curveType);

  // Soft, romantic color palette
  const organicColors = [
    { base: "#ec4899", light: "#fbcfe8", gradient: "pink" }, // Rose
    { base: "#6366f1", light: "#c7d2fe", gradient: "indigo" }, // Indigo
  ];

  const senderNames = processedData.senders;

  const handleMouseMove = (
    event: React.MouseEvent<SVGPathElement>,
    layerIndex: number,
    layer: any,
  ) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const mouseX = event.clientX - svgRect.left - margin.left;
    const date = xScale.invert(mouseX);
    const bisect = d3.bisector((d: any) => d.data.date).left;
    const index = bisect(layer, date);
    const dataPoint = layer[Math.min(index, layer.length - 1)];

    setHoveredLayer(layerIndex);

    if (dataPoint) {
      const bottom = Math.round(dataPoint[0]);
      const top = Math.round(dataPoint[1]);
      const value = top - bottom;
      const sender = senderNames[layerIndex];
      const dateStr = isHourly
        ? dataPoint.data.date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : dataPoint.data.date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

      setTooltip({
        x: event.clientX - svgRect.left,
        y: event.clientY - svgRect.top,
        content: `${sender}\n${value} message${value !== 1 ? "s" : ""}\n${dateStr}`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setHoveredLayer(null);
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Minimal legend with serif typography */}
      <div className="flex justify-center gap-8 mb-4">
        {senderNames.map((sender, i) => (
          <motion.div
            key={sender}
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${organicColors[i % 2].base}, ${organicColors[i % 2].light})`,
              }}
            />
            <span className="font-serif text-sm text-gray-700 tracking-wide">
              {sender}
            </span>
          </motion.div>
        ))}
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      >
        <defs>
          {/* Organic gradient definitions */}
          <linearGradient
            id="organicGradient1"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#f472b6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient
            id="organicGradient2"
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.6" />
          </linearGradient>

          {/* Soft glow filter for organic feel */}
          <filter id="organicGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Hand-drawn roughness filter */}
          <filter id="handDrawn" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Subtle background grid */}
          <g className="grid" opacity="0.3">
            {yScale.ticks(4).map((tick, i) => (
              <motion.line
                key={i}
                x1={0}
                x2={innerWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#e5e7eb"
                strokeDasharray="4,8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            ))}
          </g>

          {/* Organic stream layers */}
          {stackedData.map((layer, i) => (
            <motion.g key={i}>
              <motion.path
                d={areaGenerator(layer as any) || ""}
                fill={`url(#organicGradient${(i % 2) + 1})`}
                filter="url(#organicGlow)"
                style={{
                  mixBlendMode: "multiply",
                  cursor: "pointer",
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity:
                    hoveredLayer === null || hoveredLayer === i ? 1 : 0.4,
                  scale: 1,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                onMouseMove={(e) => handleMouseMove(e, i, layer)}
                onMouseLeave={handleMouseLeave}
              />
            </motion.g>
          ))}

          {/* Time axis with refined typography */}
          <g transform={`translate(0,${innerHeight + 15})`}>
            {xScale.ticks(isHourly ? 6 : 5).map((tick, i) => (
              <motion.text
                key={i}
                x={xScale(tick)}
                y={0}
                textAnchor="middle"
                className="font-mono text-xs fill-gray-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.5 }}
              >
                {isHourly
                  ? tick.getHours() + ":00"
                  : tick.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
              </motion.text>
            ))}
          </g>
        </g>
      </svg>

      {/* Glassmorphism tooltip */}
      <GlassTooltip
        x={tooltip?.x || 0}
        y={tooltip?.y || 0}
        content={tooltip?.content || ""}
        visible={!!tooltip}
      />
    </div>
  );
}

const StreamGraphDebounced = memo(StreamGraphContent);

export default function StreamGraph({
  data,
  variant = "organic",
}: StreamGraphProps) {
  return (
    <div
      className="relative rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/50 shadow-xl overflow-hidden"
      style={{ height: "450px", width: "100%" }}
    >
      <ParentSize>
        {({ width, height }: { width: number; height: number }) => (
          <StreamGraphDebounced
            width={width}
            height={height}
            data={data}
            variant={variant}
          />
        )}
      </ParentSize>
    </div>
  );
}
