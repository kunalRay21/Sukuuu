"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import ScrollytellingLayout from "@/components/ScrollytellingLayout";
import StreamGraph from "@/components/StreamGraph";
import HeatmapClock from "@/components/HeatmapClock";
import TetherView from "@/components/TetherView";
import BurstHighlight from "@/components/BurstHighlight";
import DataUploader from "@/components/DataUploader";
import SnapshotMode from "@/components/SnapshotMode";

export default function DataStoryPage() {
  const { messages, stats, dataLoaded, loadData } = useAppStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate sections based on data
  const sections = useMemo(() => {
    if (!dataLoaded || messages.length === 0) return [];

    // Calculate some narrative insights
    const totalMessages = messages.length;
    const dateRange = {
      start:
        messages.length > 0
          ? new Date(messages[0].timestamp).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "",
      end:
        messages.length > 0
          ? new Date(
              messages[messages.length - 1].timestamp,
            ).toLocaleDateString("en-US", { month: "long", year: "numeric" })
          : "",
    };

    return [
      // Opening section
      {
        id: "intro",
        title: "Our Story in Messages",
        emotion: "love",
        dateRange: { start: dateRange.start, end: dateRange.end },
        content: (
          <div className="text-center max-w-2xl mx-auto">
            <motion.p
              className="narrative-text text-gray-700 mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Every conversation leaves a trace. Over{" "}
              <span className="font-semibold text-pink-600">
                {totalMessages.toLocaleString()}
              </span>{" "}
              messages weave together the fabric of a relationship—each one a
              small heartbeat, a moment of connection across time and space.
            </motion.p>
            <motion.div
              className="inline-block"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-gray-400 text-sm font-mono">
                ↓ scroll to explore ↓
              </span>
            </motion.div>
          </div>
        ),
      },

      // Stream graph section - the rhythm of conversation
      {
        id: "rhythm",
        title: "The Rhythm of Us",
        emotion: "positive",
        content: (
          <div className="space-y-6">
            <p className="narrative-text text-gray-600 text-center max-w-2xl mx-auto mb-8">
              Like breathing, conversations have their own rhythm. Watch how the
              ebb and flow of messages creates an organic pattern— soft peaks of
              intense connection, gentle valleys of comfortable silence.
            </p>
            <StreamGraph data={messages} variant="organic" />
          </div>
        ),
      },

      // Heatmap section - patterns of presence
      {
        id: "patterns",
        title: "Patterns of Presence",
        emotion: "nostalgic",
        content: (
          <div className="space-y-6">
            <p className="narrative-text text-gray-600 text-center max-w-2xl mx-auto mb-8">
              When do we reach for each other? These patterns reveal the quiet
              rituals of connection—morning greetings, late-night confessions,
              weekend conversations that stretch into hours.
            </p>
            <HeatmapClock data={messages} />
          </div>
        ),
      },

      // Tether view - distance and connection
      {
        id: "tether",
        title: "Across the Distance",
        emotion: "longing",
        content: (
          <div className="space-y-6">
            <p className="narrative-text text-gray-600 text-center max-w-2xl mx-auto mb-8">
              Sometimes love means sending small lights across the dark— each
              message a gentle ping that says "I'm here, thinking of you."
            </p>
            <TetherView
              messages={messages}
              isLongDistance={true}
              timezoneGap={8}
            />
          </div>
        ),
      },

      // Burst highlights - moments of intensity
      {
        id: "bursts",
        title: "Moments That Sparkle",
        emotion: "excited",
        content: (
          <div className="space-y-6">
            <p className="narrative-text text-gray-600 text-center max-w-2xl mx-auto mb-8">
              Some days, the conversation just bursts with life. These are the
              days we couldn't stop talking, when every thought demanded to be
              shared.
            </p>
            <BurstHighlight data={messages} highVelocityThreshold={50} />
          </div>
        ),
      },

      // Closing section
      {
        id: "epilogue",
        title: "The Story Continues...",
        emotion: "love",
        content: (
          <div className="text-center max-w-2xl mx-auto py-12">
            <motion.p
              className="narrative-quote text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              "In the end, it's not the number of messages that matters— it's
              the spaces between them where understanding grows."
            </motion.p>
            <div className="flex justify-center gap-4 text-5xl">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              >
                💕
              </motion.span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                ✨
              </motion.span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              >
                💕
              </motion.span>
            </div>
          </div>
        ),
      },
    ];
  }, [dataLoaded, messages]);

  // Show upload state if no data
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-indigo-50 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl font-bold text-gray-900 mb-4">
              Your Data Story
            </h1>
            <p className="narrative-text text-gray-600">
              Transform your conversations into a beautiful, narrative-driven
              experience. Your data stays private—everything is processed
              locally.
            </p>
          </div>
          <div className="glass-card p-8">
            <DataUploader />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <SnapshotMode filename="our-data-story">
      <ScrollytellingLayout sections={sections}>
        {/* Footer watermark for snapshots */}
        <div className="py-8 text-center text-gray-400 font-mono text-xs">
          Generated with love • {new Date().toLocaleDateString()}
        </div>
      </ScrollytellingLayout>
    </SnapshotMode>
  );
}
