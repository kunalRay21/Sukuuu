"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import StreamGraph from "@/components/StreamGraph";
import DataUploader from "@/components/DataUploader";
import SettingsBar from "@/components/SettingsBar";
import { useAppStore } from "@/lib/store";
import MessageStats from "@/components/MessageStats";
import SnapshotMode, { HideInSnapshot } from "@/components/SnapshotMode";

export default function DashboardOverview() {
  const { messages, stats, dataLoaded, loadData } = useAppStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <SnapshotMode filename="dashboard-overview">
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-indigo-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <HideInSnapshot>
            <SettingsBar />
          </HideInSnapshot>

          {/* Header with narrative styling */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8"
          >
            <h1 className="font-serif text-5xl font-bold text-gray-900 mb-4">
              Dashboard Overview
            </h1>
            <p className="narrative-text text-gray-600 max-w-2xl mx-auto">
              A comprehensive view of our communication journey
            </p>

            {/* Link to full story experience */}
            {dataLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Link
                  href="/dashboard/story"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                  <span>✨</span>
                  <span>Experience the Full Story</span>
                  <span>→</span>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Main Content */}
          {!dataLoaded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="glass-card p-8 text-center max-w-2xl mx-auto">
                <div className="text-5xl mb-4">🔐</div>
                <h3 className="font-serif text-2xl font-semibold mb-4 text-gray-900">
                  Local & Private Processing
                </h3>
                <p className="narrative-text text-gray-600 mb-6">
                  Your data stays with you. Process your WhatsApp export and
                  Instagram data right here in the browser—nothing is sent to
                  any server.
                </p>
              </div>
              <DataUploader />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-8"
            >
              {/* Stats Cards with glassmorphism */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  className="glass-card p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                    Total Messages
                  </div>
                  <div className="font-serif text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mt-2">
                    {stats?.total_messages?.toLocaleString() ||
                      messages.length.toLocaleString()}
                  </div>
                </motion.div>

                <motion.div
                  className="glass-card p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                    Platforms
                  </div>
                  <div className="font-serif text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent mt-2">
                    {stats?.by_platform
                      ? Object.keys(stats.by_platform).length
                      : 0}
                  </div>
                </motion.div>

                <motion.div
                  className="glass-card p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                    Avg Messages/Day
                  </div>
                  <div className="font-serif text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mt-2">
                    {stats?.messages_per_day?.toFixed(1) || 0}
                  </div>
                </motion.div>
              </div>

              {/* Stream Graph with narrative container */}
              <div className="glass-card p-8">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-serif text-2xl font-semibold text-gray-900">
                    Message Flow Over Time
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                </div>
                <p className="narrative-text text-gray-600 mb-6 text-sm">
                  Watch how conversations ebb and flow like breathing—each wave
                  a moment of connection.
                </p>
                <StreamGraph data={messages} variant="organic" />
              </div>

              {/* Message Stats */}
              <div className="glass-card p-8">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-serif text-2xl font-semibold text-gray-900">
                    Conversation Statistics
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                </div>
                <MessageStats data={messages} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </SnapshotMode>
  );
}
