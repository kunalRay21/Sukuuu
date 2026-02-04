"use client";

import { ReactNode, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";

interface SnapshotModeProps {
  children: ReactNode;
  filename?: string;
}

export default function SnapshotMode({
  children,
  filename = "data-story-snapshot",
}: SnapshotModeProps) {
  const [isSnapshotMode, setIsSnapshotMode] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const enterSnapshotMode = useCallback(() => {
    setIsSnapshotMode(true);
    // Add class to body for global snapshot styling
    document.body.classList.add("snapshot-mode-active");
  }, []);

  const exitSnapshotMode = useCallback(() => {
    setIsSnapshotMode(false);
    document.body.classList.remove("snapshot-mode-active");
  }, []);

  const captureSnapshot = useCallback(async () => {
    if (!contentRef.current) return;

    setIsCapturing(true);

    try {
      // Wait for any animations to settle
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: null,
        scale: 2, // Higher resolution for print
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${filename}-${new Date().toISOString().split("T")[0]}.png`;
          link.click();
          URL.revokeObjectURL(url);
        },
        "image/png",
        1.0,
      );
    } catch (error) {
      console.error("Failed to capture snapshot:", error);
    } finally {
      setIsCapturing(false);
    }
  }, [filename]);

  return (
    <div className="relative">
      {/* Snapshot mode toggle button */}
      <AnimatePresence>
        {!isSnapshotMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={enterSnapshotMode}
            className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full glass-card flex items-center gap-2 text-sm font-mono text-gray-600 hover:text-gray-900 transition-colors hide-in-snapshot"
            title="Enter Snapshot Mode for print-ready export"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Snapshot</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Snapshot mode controls */}
      <AnimatePresence>
        {isSnapshotMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4"
          >
            <div className="glass-card px-6 py-3 flex items-center gap-4">
              <span className="font-mono text-xs text-gray-500">
                Snapshot Mode
              </span>

              <button
                onClick={captureSnapshot}
                disabled={isCapturing}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-500 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {isCapturing ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Capturing...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export PNG
                  </>
                )}
              </button>

              <button
                onClick={exitSnapshotMode}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Exit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content wrapper */}
      <div
        ref={contentRef}
        className={`transition-all duration-500 ${isSnapshotMode ? "snapshot-mode" : ""}`}
      >
        {children}
      </div>

      {/* Snapshot mode overlay hint */}
      <AnimatePresence>
        {isSnapshotMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-40"
          >
            {/* Subtle vignette for print aesthetics */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility component to mark elements that should be hidden in snapshot mode
export function HideInSnapshot({ children }: { children: ReactNode }) {
  return <div className="hide-in-snapshot">{children}</div>;
}

// Utility component to mark elements that should only appear in snapshot mode
export function ShowInSnapshot({ children }: { children: ReactNode }) {
  return <div className="hidden snapshot-mode:block">{children}</div>;
}
