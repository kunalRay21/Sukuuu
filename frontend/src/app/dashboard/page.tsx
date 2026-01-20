"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StreamGraph from "@/components/StreamGraph";
import MessageStats from "@/components/MessageStats";

export default function DashboardOverview() {
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-2">
          A comprehensive view of our communication journey
        </p>
      </motion.div>

      {/* Stats Cards */}
      {dataLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-gray-500 font-medium">
              Total Messages
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {messageData.length.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-2">
              ↑ Active conversations
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-gray-500 font-medium">Platforms</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {new Set(messageData.map((m) => m.platform)).size}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              WhatsApp & Instagram
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-gray-500 font-medium">Time Span</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">90</div>
            <div className="text-sm text-gray-600 mt-2">Days tracked</div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      {!dataLoaded ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center"
        >
          <h3 className="text-2xl font-semibold mb-4 text-blue-900">
            Ready to See Your Story?
          </h3>
          <p className="text-gray-700 mb-6">
            To visualize your communication timeline, process your data first.
          </p>
          <ol className="text-left max-w-2xl mx-auto space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>
                Export your WhatsApp chat and place it in{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">data/raw/</code>
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>
                Run{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  python scripts/process_data.py
                </code>
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Refresh this page to see your visualization</span>
            </li>
          </ol>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-8"
        >
          {/* Stream Graph */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Message Flow Over Time
            </h2>
            <StreamGraph data={messageData} />
          </div>

          {/* Message Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Conversation Statistics
            </h2>
            <MessageStats data={messageData} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
