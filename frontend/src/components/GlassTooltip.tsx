"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlassTooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  blur?: boolean;
}

export default function GlassTooltip({
  content,
  children,
  position = "top",
  blur = true,
}: GlassTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const positionStyles = {
    top: {
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginBottom: "8px",
    },
    bottom: {
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginTop: "8px",
    },
    left: {
      right: "100%",
      top: "50%",
      transform: "translateY(-50%)",
      marginRight: "8px",
    },
    right: {
      left: "100%",
      top: "50%",
      transform: "translateY(-50%)",
      marginLeft: "8px",
    },
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: position === "top" ? 5 : -5,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === "top" ? 5 : -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 pointer-events-none"
            style={positionStyles[position]}
          >
            <div className="glass-tooltip px-4 py-3 min-w-max max-w-xs">
              {blur ? (
                <div className="filter blur-[0.5px] hover:blur-none transition-all duration-300">
                  {content}
                </div>
              ) : (
                content
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Specialized message preview tooltip
interface MessagePreviewTooltipProps {
  message: {
    content: string;
    sender_id: string;
    timestamp: string;
  };
  children: ReactNode;
}

export function MessagePreviewTooltip({
  message,
  children,
}: MessagePreviewTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedTime = new Date(message.timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Truncate long messages
  const truncatedContent =
    message.content.length > 150
      ? message.content.slice(0, 150) + "..."
      : message.content;

  return (
    <div
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50"
          >
            <div className="relative max-w-sm">
              {/* Glassmorphism container */}
              <div className="glass-tooltip px-5 py-4 rounded-2xl">
                {/* Frosted overlay gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200/50">
                    <span
                      className={`font-mono text-xs font-medium ${
                        message.sender_id === "You" ||
                        message.sender_id === "person_a"
                          ? "text-pink-500"
                          : "text-indigo-500"
                      }`}
                    >
                      {message.sender_id}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">
                      {formattedTime}
                    </span>
                  </div>

                  {/* Message content with blur effect */}
                  <p className="font-serif text-sm text-gray-700 leading-relaxed blur-[1px] hover:blur-none transition-all duration-500">
                    {truncatedContent}
                  </p>

                  {/* Privacy hint */}
                  <p className="mt-2 font-mono text-[9px] text-gray-400 text-center">
                    hover to reveal
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45 glass-tooltip" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
