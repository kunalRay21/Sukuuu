"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  trail: { x: number; y: number }[];
}

interface TetherViewProps {
  messages: any[];
  isLongDistance?: boolean;
  timezoneGap?: number; // hours difference
}

export default function TetherView({
  messages,
  isLongDistance = true,
  timezoneGap = 8,
}: TetherViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [activeParticles, setActiveParticles] = useState<Particle[]>([]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Generate particles from recent messages
  const particles = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    const recentMessages = messages.slice(-50); // Last 50 messages
    const { width, height } = dimensions;

    const leftZone = { x: width * 0.15, y: height * 0.5 };
    const rightZone = { x: width * 0.85, y: height * 0.5 };

    return recentMessages.map((msg, i) => {
      const isFromLeft =
        msg.sender_id === "You" || msg.sender_id === "person_a";
      const startZone = isFromLeft ? leftZone : rightZone;
      const endZone = isFromLeft ? rightZone : leftZone;

      // Add some randomness to positions
      const startX = startZone.x + (Math.random() - 0.5) * 60;
      const startY = startZone.y + (Math.random() - 0.5) * 150;
      const endX = endZone.x + (Math.random() - 0.5) * 60;
      const endY = endZone.y + (Math.random() - 0.5) * 150;

      return {
        id: i,
        x: startX,
        y: startY,
        targetX: endX,
        targetY: endY,
        size: Math.random() * 4 + 3,
        color: isFromLeft ? "#ec4899" : "#6366f1",
        delay: (i % 10) * 0.3,
        duration: 3 + Math.random() * 2,
        trail: [],
      };
    });
  }, [messages, dimensions]);

  // Animate particles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const batch = particles.slice(0, 8).map((p) => ({
        ...p,
        id: Date.now() + p.id,
        delay: Math.random() * 2,
      }));
      setActiveParticles(batch);
    }, 5000);

    // Initial batch
    if (particles.length > 0) {
      setActiveParticles(particles.slice(0, 8));
    }

    return () => clearInterval(interval);
  }, [particles]);

  if (!messages || messages.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl">
        <p className="font-serif text-gray-400 italic">
          No messages to visualize...
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-2xl overflow-hidden"
    >
      {/* Starfield background */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Timezone indicators */}
      <div className="absolute top-6 left-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/30 to-pink-600/10 backdrop-blur-sm flex items-center justify-center mb-2 border border-pink-400/30">
            <span className="text-2xl">🌙</span>
          </div>
          <p className="font-mono text-xs text-pink-300/80">Your Time</p>
        </motion.div>
      </div>

      <div className="absolute top-6 right-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 backdrop-blur-sm flex items-center justify-center mb-2 border border-indigo-400/30">
            <span className="text-2xl">☀️</span>
          </div>
          <p className="font-mono text-xs text-indigo-300/80">
            +{timezoneGap}h Away
          </p>
        </motion.div>
      </div>

      {/* Connection line (tether) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="tetherGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main tether line */}
        <motion.path
          d={`M ${dimensions.width * 0.15} ${dimensions.height * 0.5} 
              Q ${dimensions.width * 0.5} ${dimensions.height * 0.3} 
              ${dimensions.width * 0.85} ${dimensions.height * 0.5}`}
          stroke="url(#tetherGradient)"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>

      {/* Animated particles */}
      <AnimatePresence>
        {activeParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 6}px ${particle.color}40`,
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: particle.targetX,
              y: particle.targetY,
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.3],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Trail effects */}
      {activeParticles.map((particle) => (
        <motion.div
          key={`trail-${particle.id}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: particle.size * 0.5,
            height: particle.size * 20,
            background: `linear-gradient(to bottom, ${particle.color}40, transparent)`,
            transformOrigin: "top center",
          }}
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 0,
            rotate:
              Math.atan2(
                particle.targetY - particle.y,
                particle.targetX - particle.x,
              ) *
                (180 / Math.PI) +
              90,
          }}
          animate={{
            x: [
              particle.x,
              (particle.x + particle.targetX) / 2,
              particle.targetX,
            ],
            y: [
              particle.y,
              (particle.y + particle.targetY) / 2 - 30,
              particle.targetY,
            ],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay + 0.1,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Center message count */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="backdrop-blur-md bg-white/5 rounded-2xl px-8 py-6 border border-white/10">
          <p className="font-mono text-5xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
            {messages.length}
          </p>
          <p className="font-serif text-sm text-gray-400 mt-2 italic">
            messages across the distance
          </p>
        </div>
      </motion.div>

      {/* Poetic caption */}
      <motion.p
        className="absolute bottom-6 left-1/2 -translate-x-1/2 font-serif text-sm text-gray-400/80 italic text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        "Even when oceans apart, every message is a small light traveling
        through the dark."
      </motion.p>
    </div>
  );
}
