// HeatmapClock component
// Displays a 24-hour heatmap showing conversation patterns

"use client";

import { useMemo } from "react";

interface HeatmapClockProps {
  data: any[];
}

export default function HeatmapClock({ data }: HeatmapClockProps) {
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
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...heatmapData.flat());
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getColor = (value: number) => {
    if (value === 0) return "#f3f4f6";
    const intensity = value / maxValue;
    if (intensity > 0.75) return "#dc2626";
    if (intensity > 0.5) return "#f59e0b";
    if (intensity > 0.25) return "#fbbf24";
    return "#bfdbfe";
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pt-6">
            {dayNames.map((day) => (
              <div
                key={day}
                className="h-10 flex items-center justify-end pr-2 text-xs font-medium text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex-1">
            {/* Hour labels */}
            <div className="flex gap-1 mb-1">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 text-center text-xs text-gray-600"
                >
                  {i % 3 === 0 ? i : ""}
                </div>
              ))}
            </div>

            {/* Grid cells */}
            <div className="space-y-1">
              {heatmapData.map((dayData, dayIndex) => (
                <div key={dayIndex} className="flex gap-1">
                  {dayData.map((count, hourIndex) => (
                    <div
                      key={hourIndex}
                      className="flex-1 h-10 rounded transition-all hover:ring-2 hover:ring-gray-400 cursor-pointer group relative"
                      style={{ backgroundColor: getColor(count) }}
                      title={`${dayNames[dayIndex]} ${hourIndex}:00 - ${count} messages`}
                    >
                      {count > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                          {count}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="text-xs text-gray-600">Less</span>
          <div className="flex gap-1">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: "#f3f4f6" }}
            />
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: "#bfdbfe" }}
            />
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: "#fbbf24" }}
            />
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: "#f59e0b" }}
            />
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: "#dc2626" }}
            />
          </div>
          <span className="text-xs text-gray-600">More</span>
        </div>
      </div>
    </div>
  );
}
