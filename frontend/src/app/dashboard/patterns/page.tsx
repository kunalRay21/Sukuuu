"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeatmapClock from "@/components/HeatmapClock";

export default function PatternsPage() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageData, setMessageData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/data/all_messages.json");
      if (response.ok) {
        const data = await response.json();
        setMessageData(data);
        setDataLoaded(true);
      }
    } catch (error) {
      console.log("Data not yet available.");
    }
  };

  const analyzePatterns = () => {
    if (!messageData.length) return null;

    // Hour distribution
    const hourCounts: Record<number, number> = {};
    messageData.forEach((msg) => {
      const hour = msg.hour_of_day_local;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts).reduce((a, b) =>
      (a[1] as number) > (b[1] as number) ? a : b,
    ) as [string, number];

    // Day of week (simplified - using modulo)
    const dayPattern = messageData.reduce(
      (acc, msg) => {
        const date = new Date(msg.timestamp);
        const day = date.getDay();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const mostActiveDay = Object.entries(dayPattern).reduce((a, b) =>
      (a[1] as number) > (b[1] as number) ? a : b,
    ) as [string, number];

    return {
      peakHour: `${peakHour[0]}:00`,
      peakHourCount: peakHour[1],
      mostActiveDay: dayNames[parseInt(mostActiveDay[0])],
      mostActiveDayCount: mostActiveDay[1],
      hourCounts,
    };
  };

  const patterns = analyzePatterns();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          Activity Patterns
        </h1>
        <p className="text-gray-600 mt-2">
          When and how we communicate throughout the day
        </p>
      </motion.div>

      {dataLoaded && patterns && (
        <>
          {/* Pattern Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 font-medium">Peak Hour</div>
              <div className="text-4xl font-bold mt-2">{patterns.peakHour}</div>
              <div className="text-sm opacity-75 mt-2">
                {patterns.peakHourCount} messages during this hour
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 font-medium">
                Most Active Day
              </div>
              <div className="text-4xl font-bold mt-2">
                {patterns.mostActiveDay}
              </div>
              <div className="text-sm opacity-75 mt-2">
                {patterns.mostActiveDayCount} messages on this day
              </div>
            </div>
          </motion.div>

          {/* Heatmap */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Message Heatmap
            </h2>
            <p className="text-gray-600 mb-6">
              Visualization of when messages are sent throughout the day and
              week
            </p>
            <HeatmapClock data={messageData} />
          </motion.div>

          {/* Hourly Breakdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Hourly Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 24 }, (_, i) => {
                const count = patterns.hourCounts[i] || 0;
                const maxCount = Math.max(
                  ...Object.values(patterns.hourCounts),
                );
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={i} className="text-center">
                    <div className="mb-2">
                      <div className="h-24 bg-gray-100 rounded-lg overflow-hidden flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                          style={{ height: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      {i}:00
                    </div>
                    <div className="text-xs text-gray-500">{count}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}

      {!dataLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-100 rounded-xl p-12 text-center"
        >
          <p className="text-gray-600">Loading activity patterns...</p>
        </motion.div>
      )}
    </div>
  );
}
