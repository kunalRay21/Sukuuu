"use client";

import { ReactNode, useEffect, useState, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useAppStore } from "@/lib/store";

// Emotion color palette for background transitions
const emotionColors: Record<string, { from: string; to: string }> = {
  positive: { from: "#fdf2f8", to: "#fce7f3" }, // Warm pink gradient
  neutral: { from: "#f8fafc", to: "#f1f5f9" }, // Soft slate gradient
  negative: { from: "#fef2f2", to: "#fee2e2" }, // Muted red gradient
  excited: { from: "#fefce8", to: "#fef9c3" }, // Joyful yellow gradient
  nostalgic: { from: "#f5f3ff", to: "#ede9fe" }, // Soft purple gradient
  longing: { from: "#ecfeff", to: "#cffafe" }, // Distant cyan gradient
  love: { from: "#fff1f2", to: "#ffe4e6" }, // Deep rose gradient
};

interface Section {
  id: string;
  title: string;
  emotion?: string;
  content: ReactNode;
  dateRange?: { start: string; end: string };
}

interface ScrollytellingLayoutProps {
  sections: Section[];
  children?: ReactNode;
  isSnapshotMode?: boolean;
}

export default function ScrollytellingLayout({
  sections,
  children,
  isSnapshotMode = false,
}: ScrollytellingLayoutProps) {
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [activeSection, setActiveSection] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  // Handle scroll to detect active section
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollTop = containerRef.current.scrollTop;
      const viewportHeight = containerRef.current.clientHeight;
      const viewportCenter = scrollTop + viewportHeight / 2;

      // Find which section is most in view
      let closestSection = 0;
      let closestDistance = Infinity;

      sectionRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const containerRect = containerRef.current!.getBoundingClientRect();
        const sectionCenter =
          rect.top - containerRect.top + scrollTop + rect.height / 2;
        const distance = Math.abs(viewportCenter - sectionCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = index;
        }
      });

      if (closestSection !== activeSection) {
        setActiveSection(closestSection);
        const newEmotion = sections[closestSection]?.emotion || "neutral";
        setCurrentEmotion(newEmotion);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [activeSection, sections]);

  const currentColors = emotionColors[currentEmotion] || emotionColors.neutral;

  return (
    <motion.div
      ref={containerRef}
      className={`h-screen w-full overflow-y-auto overflow-x-hidden ${isSnapshotMode ? "snapshot-mode" : ""}`}
      animate={{
        background: `linear-gradient(180deg, ${currentColors.from} 0%, ${currentColors.to} 100%)`,
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {/* Progress indicator - hidden in snapshot mode */}
      {!isSnapshotMode && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 origin-left z-50"
          style={{ scaleX: scrollYProgress }}
        />
      )}

      {/* Navigation dots - hidden in snapshot mode */}
      {!isSnapshotMode && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => {
                sectionRefs.current[index]?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === index
                  ? "bg-gray-800 scale-125"
                  : "bg-gray-400 hover:bg-gray-600"
              }`}
              title={section.title}
            />
          ))}
        </div>
      )}

      {/* Sections */}
      <div className="relative">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            {/* Section header */}
            <motion.div
              className="text-center mb-12 max-w-4xl"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                {section.title}
              </h2>
              {section.dateRange && (
                <p className="font-mono text-sm text-gray-500 tracking-wider uppercase">
                  {section.dateRange.start} — {section.dateRange.end}
                </p>
              )}
            </motion.div>

            {/* Section content */}
            <motion.div
              className="w-full max-w-6xl"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {section.content}
            </motion.div>
          </motion.div>
        ))}

        {children}
      </div>

      {/* Emotional ambient particles */}
      <EmotionalParticles emotion={currentEmotion} />
    </motion.div>
  );
}

// Ambient floating particles based on emotion
function EmotionalParticles({ emotion }: { emotion: string }) {
  const particleCount =
    emotion === "love" ? 20 : emotion === "excited" ? 15 : 8;

  const particleColors: Record<string, string[]> = {
    positive: ["#f9a8d4", "#fbcfe8"],
    neutral: ["#cbd5e1", "#e2e8f0"],
    excited: ["#fcd34d", "#fde68a"],
    love: ["#fb7185", "#fda4af", "#f9a8d4"],
    nostalgic: ["#c4b5fd", "#ddd6fe"],
    longing: ["#67e8f9", "#a5f3fc"],
  };

  const colors = particleColors[emotion] || particleColors.neutral;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={`${emotion}-${i}`}
          className="absolute rounded-full opacity-30"
          style={{
            width: Math.random() * 20 + 10,
            height: Math.random() * 20 + 10,
            background: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: Math.random() * 4 + 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
