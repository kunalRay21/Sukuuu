"use client";

import { useMemo, useState } from "react";

interface MessageTimelineProps {
  data: any[];
  limit?: number;
}

export default function MessageTimeline({
  data,
  limit = 50,
}: MessageTimelineProps) {
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [displayLimit, setDisplayLimit] = useState(20);

  const recentMessages = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, Math.min(limit, displayLimit));
  }, [data, limit, displayLimit]);

  if (!recentMessages.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">No messages to display</p>
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "whatsapp":
        return "💬";
      case "instagram":
        return "📷";
      default:
        return "💭";
    }
  };

  const getPlatformName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "video":
        return "🎥";
      case "audio":
        return "🎵";
      case "call":
        return "📞";
      default:
        return "💬";
    }
  };

  const getTypeName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatLatency = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Message History
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({recentMessages.length} of {data.length} messages)
          </span>
        </h3>
        <div className="text-xs text-gray-500">
          Click any message to view details
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {recentMessages.map((message, index) => {
          const isExpanded = expandedMessage === index;
          const isYou = message.sender_id === "You";

          return (
            <div
              key={index}
              className={`group relative transition-all duration-200 ${
                isExpanded ? "ring-2 ring-blue-400" : ""
              }`}
            >
              <div
                onClick={() => setExpandedMessage(isExpanded ? null : index)}
                className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                {/* Platform Icon */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isYou ? "bg-blue-100" : "bg-purple-100"
                    }`}
                    title={getPlatformName(message.platform)}
                  >
                    {getPlatformIcon(message.platform)}
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`font-semibold text-sm ${
                        isYou ? "text-blue-700" : "text-purple-700"
                      }`}
                    >
                      {message.sender_id}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">
                      {formatTime(message.timestamp)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full">
                      {getTypeIcon(message.type)} {getTypeName(message.type)}
                    </span>
                    {message.media_count > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                        📎 {message.media_count} media
                      </span>
                    )}
                  </div>

                  {/* Message Text */}
                  <p
                    className={`text-sm text-gray-700 ${
                      isExpanded
                        ? "whitespace-pre-wrap break-words"
                        : "truncate"
                    }`}
                  >
                    {message.content ||
                      `[${getTypeName(message.type)} message]`}
                  </p>

                  {/* Reply Latency */}
                  {message.reply_latency_seconds && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      ⏱️ Reply time:{" "}
                      {formatLatency(message.reply_latency_seconds)}
                    </p>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Full timestamp:</span>
                          <div className="font-medium text-gray-700">
                            {formatFullTime(message.timestamp)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Platform:</span>
                          <div className="font-medium text-gray-700">
                            {getPlatformName(message.platform)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Message type:</span>
                          <div className="font-medium text-gray-700">
                            {getTypeName(message.type)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Hour of day:</span>
                          <div className="font-medium text-gray-700">
                            {message.hour_of_day_local}:00
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expand indicator */}
                <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600">
                  {isExpanded ? "▲" : "▼"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {displayLimit < data.length && (
        <div className="mt-4 text-center">
          <button
            onClick={() =>
              setDisplayLimit((prev) => Math.min(prev + 20, data.length))
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load More ({data.length - displayLimit} remaining)
          </button>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
