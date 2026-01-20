"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BurstHighlight from "@/components/BurstHighlight";

export default function HighlightsPage() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageData, setMessageData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/data/all_messages.json");
      if (response.ok) {
        const data = await response.json();
        setMessageData(data);
        setDataLoaded(true);
      }
    } catch (error) {
      console.log("Data not yet available.");
    }
  };

  const findHighlights = () => {
    if (!messageData.length) return null;

    // Find busiest day
    const dayGroups: Record<string, number> = {};
    messageData.forEach((msg) => {
      const day = msg.timestamp.split("T")[0];
      dayGroups[day] = (dayGroups[day] || 0) + 1;
    });

    const busiestDay = Object.entries(dayGroups).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    );

    // Find longest conversation streak
    const dates = [
      ...new Set(messageData.map((m) => m.timestamp.split("T")[0])),
    ].sort();
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffDays = Math.floor(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    // Media highlights
    const mediaMessages = messageData.filter((m) => m.media_count > 0);
    const photoCount = messageData.filter((m) => m.type === "image").length;
    const videoCount = messageData.filter((m) => m.type === "video").length;

    return {
      busiestDay: {
        date: busiestDay[0],
        count: busiestDay[1],
      },
      conversationStreak: maxStreak,
      totalMedia: mediaMessages.length,
      photos: photoCount,
      videos: videoCount,
    };
  };

  const highlights = findHighlights();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          Highlights
        </h1>
        <p className="text-gray-600 mt-2">
          Special moments and milestones in our journey
        </p>
      </motion.div>

      {dataLoaded && highlights && (
        <>
          {/* Highlight Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 font-medium">Busiest Day</div>
              <div className="text-2xl font-bold mt-2">
                {new Date(highlights.busiestDay.date).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </div>
              <div className="text-sm opacity-75 mt-2">
                {highlights.busiestDay.count} messages exchanged
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-xl shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 font-medium">
                Longest Streak
              </div>
              <div className="text-4xl font-bold mt-2">
                {highlights.conversationStreak}
              </div>
              <div className="text-sm opacity-75 mt-2">
                Consecutive days of conversation
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 font-medium">Media Shared</div>
              <div className="text-4xl font-bold mt-2">
                {highlights.totalMedia}
              </div>
              <div className="text-sm opacity-75 mt-2">
                Photos, videos & more
              </div>
            </div>
          </motion.div>

          {/* Burst Visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Conversation Bursts
            </h2>
            <p className="text-gray-600 mb-6">
              Periods of intense communication activity
            </p>
            <BurstHighlight data={messageData} />
          </motion.div>

          {/* Media Breakdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Media Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-3xl font-bold text-blue-900">
                  {highlights.photos}
                </div>
                <div className="text-sm text-blue-700 mt-1">Photos</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-4xl mb-2">🎥</div>
                <div className="text-3xl font-bold text-purple-900">
                  {highlights.videos}
                </div>
                <div className="text-sm text-purple-700 mt-1">Videos</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-4xl mb-2">🎵</div>
                <div className="text-3xl font-bold text-green-900">
                  {messageData.filter((m) => m.type === "audio").length}
                </div>
                <div className="text-sm text-green-700 mt-1">Audio</div>
              </div>
            </div>
          </motion.div>

          {/* Fun Facts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white"
          >
            <h2 className="text-2xl font-semibold mb-6">Did You Know?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <p className="text-sm opacity-90">
                  You've exchanged an average of{" "}
                  <span className="font-bold text-lg">
                    {(messageData.length / 90).toFixed(1)}
                  </span>{" "}
                  messages per day
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <p className="text-sm opacity-90">
                  That's approximately{" "}
                  <span className="font-bold text-lg">
                    {(messageData.length / 90 / 24).toFixed(2)}
                  </span>{" "}
                  messages per hour!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {!dataLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-100 rounded-xl p-12 text-center"
        >
          <p className="text-gray-600">Loading highlights...</p>
        </motion.div>
      )}
    </div>
  );
}
