"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import MessageTimeline from "@/components/MessageTimeline";
import { useAppStore } from "@/lib/store";
import SettingsBar from "@/components/SettingsBar";

export default function TimelinePage() {
  const { dataLoaded, loadData } = useAppStore();

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 relative">
      <SettingsBar />

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
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
        >
          {/* MessageTimeline now reads from store internaly, but we can pass props if needed. 
              The refactored MessageTimeline uses useAppStore() directly. */}
          <MessageTimeline />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-100 rounded-xl p-12 text-center"
        >
          <p className="text-gray-600">
            No data loaded. Please go to Dashboard to upload files.
          </p>
        </motion.div>
      )}
    </div>
  );
}
