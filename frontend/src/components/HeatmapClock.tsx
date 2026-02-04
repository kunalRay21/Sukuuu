"use client";

import { useMemo, memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParentSize } from "@visx/responsive";
import { theme } from "@/config/theme";

interface HeatmapClockProps {
  data: any[];
  variant?: "radial" | "grid";
}

// Glassmorphism tooltip
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className="fixed pointer-events-none z-50"
          style={{ left: x + 10, top: y - 10 }}
        >
          <div className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/80 border border-white/60 shadow-lg">
            <p className="font-mono text-xs text-gray-700">{content}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeatmapClockContent({ data, variant = "radial" }: HeatmapClockProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    day: number;
    hour: number;
  } | null>(null);

  const heatmapData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Create a 7x24 grid (days x hours)
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    data.forEach((msg) => {
      const date = new Date(msg.timestamp);
      const day = date.getDay();
      const hour = date.getHours();
      grid[day][hour]++;
    });

    return grid;
  }, [data]);

  if (!heatmapData.length) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-5xl mb-4"
          >
            🕐
          </motion.div>
          <p className="font-serif text-gray-400 italic">No patterns yet...</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...heatmapData.flat());
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Organic color scale - soft blobs feel
  const getColor = (value: number, isHovered: boolean) => {
    if (value === 0)
      return isHovered
        ? "rgba(241, 245, 249, 0.8)"
        : "rgba(241, 245, 249, 0.4)";
    const intensity = value / maxValue;

    // Warm gradient from soft pink to deep rose
    if (intensity > 0.8) return isHovered ? "#be185d" : "#db2777";
    if (intensity > 0.6) return isHovered ? "#db2777" : "#ec4899";
    if (intensity > 0.4) return isHovered ? "#ec4899" : "#f472b6";
    if (intensity > 0.2) return isHovered ? "#f472b6" : "#f9a8d4";
    return isHovered ? "#f9a8d4" : "#fce7f3";
  };

  const handleCellHover = (day: number, hour: number, e: React.MouseEvent) => {
    const count = heatmapData[day][hour];
    setHoveredCell({ day, hour });
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      content: `${dayNames[day]} ${hour}:00 • ${count} messages`,
    });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
    setTooltip(null);
  };

  return (
    <div className="w-full relative">
      <div className="overflow-x-auto">
        <div className="min-w-[700px] p-6">
          {/* Refined header */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-serif text-lg text-gray-700">
              Activity Rhythm
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>

          <div className="flex gap-2">
            {/* Day labels - vertical */}
            <div className="flex flex-col gap-1 pt-8 pr-3">
              {dayNames.map((day, i) => (
                <motion.div
                  key={day}
                  className="h-8 flex items-center justify-end font-mono text-xs text-gray-500"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {day}
                </motion.div>
              ))}
            </div>

            {/* Heatmap grid with organic styling */}
            <div className="flex-1">
              {/* Hour labels */}
              <div className="flex gap-1 mb-2 pl-1">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center font-mono text-[10px] text-gray-400"
                  >
                    {i % 4 === 0 ? `${i}` : ""}
                  </div>
                ))}
              </div>

              {/* Grid cells - soft blobs */}
              <div className="space-y-1">
                {heatmapData.map((dayData, dayIndex) => (
                  <motion.div
                    key={dayIndex}
                    className="flex gap-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIndex * 0.05 }}
                  >
                    {dayData.map((count, hourIndex) => {
                      const isHovered =
                        hoveredCell?.day === dayIndex &&
                        hoveredCell?.hour === hourIndex;
                      return (
                        <motion.div
                          key={hourIndex}
                          className="flex-1 h-8 rounded-lg cursor-pointer relative overflow-hidden"
                          style={{
                            backgroundColor: getColor(count, isHovered),
                            boxShadow:
                              count > 0
                                ? `0 2px 8px ${getColor(count, false)}40`
                                : "none",
                          }}
                          onMouseEnter={(e) =>
                            handleCellHover(dayIndex, hourIndex, e)
                          }
                          onMouseLeave={handleCellLeave}
                          whileHover={{ scale: 1.15, zIndex: 10 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                        >
                          {/* Organic glow effect for high-activity cells */}
                          {count > maxValue * 0.5 && (
                            <motion.div
                              className="absolute inset-0 rounded-lg"
                              animate={{
                                boxShadow: [
                                  `inset 0 0 10px ${getColor(count, false)}80`,
                                  `inset 0 0 20px ${getColor(count, false)}40`,
                                  `inset 0 0 10px ${getColor(count, false)}80`,
                                ],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}

                          {/* Value indicator */}
                          <AnimatePresence>
                            {isHovered && count > 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <span className="font-mono text-[10px] font-bold text-white drop-shadow-md">
                                  {count}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <span className="font-mono text-xs text-gray-400">Less</span>
                <div className="flex gap-1">
                  {["#fce7f3", "#f9a8d4", "#f472b6", "#ec4899", "#db2777"].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="w-6 h-4 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                </div>
                <span className="font-mono text-xs text-gray-400">More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <GlassTooltip
        x={tooltip?.x || 0}
        y={tooltip?.y || 0}
        content={tooltip?.content || ""}
        visible={!!tooltip}
      />
    </div>
  );
}

const HeatmapClock = memo(HeatmapClockContent);

export default function HeatmapClockWrapper({
  data,
  variant,
}: HeatmapClockProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-sm border border-white/50 shadow-xl overflow-hidden">
      <HeatmapClock data={data} variant={variant} />
    </div>
  );
}
