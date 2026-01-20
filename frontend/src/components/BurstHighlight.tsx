// Placeholder for BurstHighlight component
// Will highlight days with the highest message volume

"use client";

import { useMemo } from "react";
import * as d3 from "d3";

interface BurstHighlightProps {
  data: any[];
}

export default function BurstHighlight({ data }: BurstHighlightProps) {
  const burstData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group messages by day
    const dayGroups = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.timestamp.split("T")[0],
    );

    // Convert to array and sort by message count
    const bursts = Array.from(dayGroups, ([date, count]) => ({
      date,
      count,
    })).sort((a, b) => b.count - a.count);

    // Return top 10 busiest days
    return bursts.slice(0, 10);
  }, [data]);

  if (!burstData.length) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">No burst data available</p>
      </div>
    );
  }

  const maxCount = burstData[0].count;

  return (
    <div className="w-full">
      <div className="space-y-3">
        {burstData.map((burst, index) => {
          const percentage = (burst.count / maxCount) * 100;
          const formattedDate = new Date(burst.date).toLocaleDateString(
            "en-US",
            {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            },
          );

          return (
            <div key={burst.date} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-300 w-8">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formattedDate}
                    </div>
                    <div className="text-xs text-gray-500">
                      {burst.count} messages
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {burst.count}
                  </div>
                  <div className="text-xs text-gray-500">
                    {percentage.toFixed(0)}% of peak
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, 
                      ${index < 3 ? "#ef4444" : index < 6 ? "#f59e0b" : "#10b981"} 0%, 
                      ${index < 3 ? "#dc2626" : index < 6 ? "#d97706" : "#059669"} 100%)`,
                  }}
                >
                  {percentage > 15 && (
                    <span className="text-xs font-bold text-white">
                      {burst.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
        <p className="text-sm text-gray-700">
          🔥 <span className="font-semibold">Top 3 days</span> shown in red
          represent the most intense conversation periods. Days 4-6 in orange
          show high activity, while the rest indicate steady communication.
        </p>
      </div>
    </div>
  );
}
