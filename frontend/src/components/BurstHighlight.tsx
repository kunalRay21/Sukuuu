// Burst Highlights with Fireworks effect for high-velocity days

"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";

interface BurstHighlightProps {
  data: any[];
  highVelocityThreshold?: number; // messages per day to trigger fireworks
}

// Fireworks particle component
function FireworksEffect({
  x,
  y,
  color,
  onComplete,
}: {
  x: number;
  y: number;
  color: string;
  onComplete: () => void;
}) {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const angle = (i / 30) * Math.PI * 2;
      const velocity = 50 + Math.random() * 80;
      return {
        id: i,
        angle,
        velocity,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 0.1,
      };
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            boxShadow: `0 0 ${particle.size * 2}px ${color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(particle.angle) * particle.velocity,
            y: Math.sin(particle.angle) * particle.velocity + 30, // gravity
            opacity: [1, 1, 0],
            scale: [1, 0.5, 0],
          }}
          transition={{
            duration: 1,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Center burst */}
      <motion.div
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: color }}
        initial={{ width: 10, height: 10, opacity: 1 }}
        animate={{ width: 60, height: 60, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

export default function BurstHighlight({
  data,
  highVelocityThreshold = 50,
}: BurstHighlightProps) {
  const [activeFireworks, setActiveFireworks] = useState<
    Array<{ id: number; x: number; y: number; color: string }>
  >([]);
  const [hoveredBurst, setHoveredBurst] = useState<number | null>(null);

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
      isHighVelocity: count >= highVelocityThreshold,
    })).sort((a, b) => b.count - a.count);

    // Return top 10 busiest days
    return bursts.slice(0, 10);
  }, [data, highVelocityThreshold]);

  const triggerFireworks = useCallback(
    (index: number, e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const burst = burstData[index];
      if (!burst?.isHighVelocity) return;

      const colors = ["#f472b6", "#c084fc", "#60a5fa", "#34d399", "#fbbf24"];
      const id = Date.now();

      setActiveFireworks((prev) => [
        ...prev,
        {
          id,
          x,
          y,
          color: colors[Math.floor(Math.random() * colors.length)],
        },
      ]);
    },
    [burstData],
  );

  const removeFirework = useCallback((id: number) => {
    setActiveFireworks((prev) => prev.filter((f) => f.id !== id));
  }, []);

  if (!burstData.length) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            ✨
          </motion.div>
          <p className="font-serif text-gray-400 italic">
            Waiting for burst moments...
          </p>
        </div>
      </div>
    );
  }

  const maxCount = burstData[0].count;

  return (
    <div className="w-full relative rounded-2xl bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-sm border border-white/50 shadow-xl p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h3 className="font-serif text-2xl text-gray-800">Burst Moments</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent" />
        <span className="font-mono text-xs text-gray-400">
          {burstData.filter((b) => b.isHighVelocity).length} high-velocity days
        </span>
      </div>

      <div className="space-y-4 relative">
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

          const isHovered = hoveredBurst === index;
          const barColors = burst.isHighVelocity
            ? "from-pink-500 via-purple-500 to-indigo-500"
            : index < 5
              ? "from-orange-400 to-amber-500"
              : "from-emerald-400 to-teal-500";

          return (
            <motion.div
              key={burst.date}
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredBurst(index)}
              onMouseLeave={() => setHoveredBurst(null)}
              onClick={(e) => triggerFireworks(index, e)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <motion.span
                    className={`font-serif text-2xl ${burst.isHighVelocity ? "text-pink-500" : "text-gray-300"}`}
                    animate={burst.isHighVelocity ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    #{index + 1}
                  </motion.span>
                  <div>
                    <div className="font-serif text-sm text-gray-800">
                      {formattedDate}
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                      {burst.count} messages
                      {burst.isHighVelocity && (
                        <span className="ml-2 text-pink-500">
                          🔥 High Velocity
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <motion.div
                  className="font-mono text-lg font-bold text-gray-700"
                  animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                >
                  {burst.count}
                </motion.div>
              </div>

              {/* Progress bar with organic feel */}
              <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden relative">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${barColors} relative overflow-hidden`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                >
                  {/* Shimmer effect for high velocity */}
                  {burst.isHighVelocity && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}
                </motion.div>

                {/* Pulse effect on hover for high velocity */}
                {burst.isHighVelocity && isHovered && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-pink-400/20"
                    animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Click hint for high velocity days */}
              {burst.isHighVelocity && (
                <motion.p
                  className="font-mono text-[10px] text-pink-400 mt-1 text-right"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                >
                  Click for fireworks! ✨
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Fireworks overlay */}
      <AnimatePresence>
        {activeFireworks.map((fw) => (
          <FireworksEffect
            key={fw.id}
            x={fw.x}
            y={fw.y}
            color={fw.color}
            onComplete={() => removeFirework(fw.id)}
          />
        ))}
      </AnimatePresence>

      {/* Footer note */}
      <motion.div
        className="mt-8 p-4 rounded-xl bg-gradient-to-r from-pink-50/80 to-purple-50/80 backdrop-blur-sm border border-pink-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p className="font-serif text-sm text-gray-600 italic text-center">
          "Some days, the conversation just{" "}
          <span className="text-pink-500 font-medium">sparkles</span> brighter
          than others."
        </p>
      </motion.div>
    </div>
  );
}
