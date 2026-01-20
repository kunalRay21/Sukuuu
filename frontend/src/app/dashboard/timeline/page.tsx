"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MessageTimeline from "@/components/MessageTimeline";

export default function TimelinePage() {
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

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          Timeline
        </h1>
        <p className="text-gray-600 mt-2">
          A chronological journey through our conversations
        </p>
      </motion.div>

      {dataLoaded ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-8 border border-gray-200"
        >
          <MessageTimeline data={messageData} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-100 rounded-xl p-12 text-center"
        >
          <p className="text-gray-600">Loading timeline data...</p>
        </motion.div>
      )}
    </div>
  );
}
