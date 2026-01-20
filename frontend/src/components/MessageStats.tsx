"use client";

import { useMemo } from "react";
import * as d3 from "d3";

interface MessageStatsProps {
  data: any[];
}

export default function MessageStats({ data }: MessageStatsProps) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const bySender = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.sender_id,
    );

    const byPlatform = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.platform,
    );

    const byType = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.type,
    );

    const totalMessages = data.length;

    return {
      bySender: Array.from(bySender, ([key, value]) => ({
        name: key,
        value,
        percentage: ((value / totalMessages) * 100).toFixed(1),
      })),
      byPlatform: Array.from(byPlatform, ([key, value]) => ({
        name: key,
        value,
        percentage: ((value / totalMessages) * 100).toFixed(1),
      })),
      byType: Array.from(byType, ([key, value]) => ({
        name: key,
        value,
        percentage: ((value / totalMessages) * 100).toFixed(1),
      })),
      totalMessages,
    };
  }, [data]);

  if (!stats) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">No data to display</p>
      </div>
    );
  }

  const colors = {
    sender: ["#6366f1", "#ec4899"],
    platform: ["#f59e0b", "#10b981"],
    type: ["#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6", "#f97316"],
  };

  const getIcon = (type: string, name: string) => {
    if (type === "platform") {
      return name === "whatsapp" ? "💬" : "📷";
    }
    if (type === "type") {
      const icons: Record<string, string> = {
        text: "💬",
        image: "🖼️",
        video: "🎥",
        audio: "🎵",
        call: "📞",
      };
      return icons[name] || "📝";
    }
    return name === "You" ? "👤" : "👥";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* By Sender */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          By Sender
        </h3>
        <div className="space-y-4">
          {stats.bySender.map((item, i) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  {getIcon("sender", item.name)}
                  {item.name}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {item.value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: colors.sender[i % colors.sender.length],
                  }}
                >
                  <span className="text-[10px] font-bold text-white">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {item.value} messages • {item.percentage}% of total
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Platform */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-2xl">📱</span>
          By Platform
        </h3>
        <div className="space-y-4">
          {stats.byPlatform.map((item, i) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize flex items-center gap-2">
                  {getIcon("platform", item.name)}
                  {item.name}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {item.value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor:
                      colors.platform[i % colors.platform.length],
                  }}
                >
                  <span className="text-[10px] font-bold text-white">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {item.value} messages • {item.percentage}% of total
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Type */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          By Type
        </h3>
        <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
          {stats.byType.map((item, i) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize flex items-center gap-2">
                  {getIcon("type", item.name)}
                  {item.name}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {item.value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: colors.type[i % colors.type.length],
                  }}
                >
                  <span className="text-[10px] font-bold text-white">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {item.value} messages • {item.percentage}% of total
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
