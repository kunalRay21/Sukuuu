"use client";

import { useMemo, useRef, useEffect } from "react";
import { VariableSizeList as List } from "react-window";
import { useAppStore } from "@/lib/store";
import { format } from "date-fns";
import clsx from "clsx";

interface MessageTimelineProps {
  // Props can be minimal now as data comes from store
}

export default function MessageTimeline() {
  const { messages, isPrivacyMode } = useAppStore();
  const listRef = useRef<List>(null);

  // Simple height estimator or fixed for now given complexity of dynamic parsing in one-shot
  // A real implementation would use a resize observer on row items
  const getItemSize = (index: number) => {
    const msg = messages[index];
    const length = msg.content?.length || 0;
    // Rough estimate: base 80px + lines
    return 80 + Math.ceil(length / 80) * 20 + (msg.media_count > 0 ? 40 : 0);
  };

  // Re-compute Row heights if width changes - complex without resize observer
  // We will assume a standard desktop width for estimation or just let it be loose.

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const message = messages[index];
    const isYou =
      message.sender_id === "You" || message.sender_id === "person_a"; // Adjust based on normalization

    return (
      <div style={style} className="px-4 py-2">
        <div
          className={clsx(
            "flex gap-3 p-4 rounded-lg transition-colors border-2",
            isYou ? "bg-blue-50 border-blue-100" : "bg-pink-50 border-pink-100",
            "hover:border-gray-300",
          )}
        >
          {/* Avatar / Icon */}
          <div className="flex-shrink-0">
            <div
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm",
                isYou ? "bg-blue-200" : "bg-pink-200",
                isPrivacyMode && "blur-md",
              )}
            >
              {message.platform === "whatsapp" ? "💬" : "📷"}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={clsx(
                  "font-semibold text-sm",
                  isYou ? "text-blue-800" : "text-pink-800",
                  isPrivacyMode && "blur-sm",
                )}
              >
                {message.sender_id}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Content */}
            <div
              className={clsx(
                "text-gray-800 text-sm whitespace-pre-wrap",
                isPrivacyMode && "blur-sm select-none",
              )}
            >
              {message.content}
            </div>

            {message.media_count > 0 && (
              <div className="mt-2 text-xs font-semibold text-gray-500">
                📎 {message.media_count} media attachment(s)
              </div>
            )}

            {message.reply_latency_seconds && (
              <div className="mt-1 text-xs text-gray-400">
                ⏱ {(message.reply_latency_seconds / 60).toFixed(1)} mins reply
                time
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!messages.length) {
    return (
      <div className="p-10 text-center text-gray-500">
        No messages found. Please upload data.
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div style={{ height: "100%", width: "100%" }}>
        <List
          ref={listRef}
          height={600}
          itemCount={messages.length}
          itemSize={getItemSize}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  );
}
