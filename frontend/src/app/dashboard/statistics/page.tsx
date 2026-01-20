"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MessageStats from "@/components/MessageStats";

export default function StatisticsPage() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageData, setMessageData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [messagesRes, statsRes] = await Promise.all([
        fetch("/data/all_messages.json"),
        fetch("/data/summary_stats.json"),
      ]);

      if (messagesRes.ok) {
        const messages = await messagesRes.json();
        setMessageData(messages);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      setDataLoaded(true);
    } catch (error) {
      console.log("Data not yet available.");
    }
  };

  const calculateAdditionalStats = () => {
    if (!messageData.length) return null;

    const textMessages = messageData.filter((m) => m.type === "text");
    const mediaMessages = messageData.filter((m) => m.media_count > 0);
    const yourMessages = messageData.filter((m) => m.sender_id === "You");
    const partnerMessages = messageData.filter(
      (m) => m.sender_id === "Partner",
    );

    return {
      textMessages: textMessages.length,
      mediaMessages: mediaMessages.length,
      yourMessages: yourMessages.length,
      partnerMessages: partnerMessages.length,
      avgMessagesPerDay: (messageData.length / 90).toFixed(1),
    };
  };

  const additionalStats = calculateAdditionalStats();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          Statistics
        </h1>
        <p className="text-gray-600 mt-2">
          Detailed breakdown of our communication patterns
        </p>
      </motion.div>

      {dataLoaded && additionalStats && (
        <>
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 font-medium">
                Your Messages
              </div>
              <div className="text-3xl font-bold mt-2">
                {additionalStats.yourMessages}
              </div>
              <div className="text-sm opacity-75 mt-2">
                {(
                  (additionalStats.yourMessages / messageData.length) *
                  100
                ).toFixed(1)}
                % of total
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 font-medium">
                Partner's Messages
              </div>
              <div className="text-3xl font-bold mt-2">
                {additionalStats.partnerMessages}
              </div>
              <div className="text-sm opacity-75 mt-2">
                {(
                  (additionalStats.partnerMessages / messageData.length) *
                  100
                ).toFixed(1)}
                % of total
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 font-medium">
                Text Messages
              </div>
              <div className="text-3xl font-bold mt-2">
                {additionalStats.textMessages}
              </div>
              <div className="text-sm opacity-75 mt-2">
                {(
                  (additionalStats.textMessages / messageData.length) *
                  100
                ).toFixed(1)}
                % of total
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 font-medium">Media Shared</div>
              <div className="text-3xl font-bold mt-2">
                {additionalStats.mediaMessages}
              </div>
              <div className="text-sm opacity-75 mt-2">
                Photos, Videos & Audio
              </div>
            </div>
          </motion.div>

          {/* Detailed Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Detailed Breakdown
            </h2>
            <MessageStats data={messageData} />
          </motion.div>

          {/* Summary Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-8 border border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Summary Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    By Platform
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(stats.by_platform).map(
                      ([platform, count]: [string, any]) => (
                        <div
                          key={platform}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-600 capitalize">
                            {platform}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {count}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    By Message Type
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(stats.by_type).map(
                      ([type, count]: [string, any]) => (
                        <div
                          key={type}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-600 capitalize">
                            {type}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {count}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    Average messages per day
                  </span>
                  <span className="font-semibold text-gray-900 text-xl">
                    {additionalStats.avgMessagesPerDay}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {!dataLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-100 rounded-xl p-12 text-center"
        >
          <p className="text-gray-600">Loading statistics...</p>
        </motion.div>
      )}
    </div>
  );
}
