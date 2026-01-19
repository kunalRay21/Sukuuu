"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ScrollSection from "@/components/ScrollSection";
import StreamGraph from "@/components/StreamGraph";

export default function Home() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageData, setMessageData] = useState<any[]>([]);

  useEffect(() => {
    // Load data when component mounts
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Try to load the most recent year's data
      const response = await fetch("/data/all_messages.json");
      if (response.ok) {
        const data = await response.json();
        setMessageData(data);
        setDataLoaded(true);
      } else {
        console.log("No data found yet. Please process your messages first.");
      }
    } catch (error) {
      console.log("Data not yet available. Run the Python processor first.");
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-4xl"
        >
          <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 text-gray-900">
            Our Story in Data
          </h1>
          <p className="narrative-text text-gray-600 mb-8">
            A journey through time, told through the rhythm of our
            conversations.
            {!dataLoaded &&
              " Scroll down to begin, or process your data to see your story."}
          </p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-gray-400 text-4xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* Introduction */}
      <ScrollSection>
        <div className="max-w-3xl mx-auto px-4 py-20">
          <h2 className="section-title">The Beginning</h2>
          <p className="narrative-text text-gray-700">
            Every connection starts somewhere. This visualization captures the
            quiet architecture of our relationship—not to quantify love, but to
            see the patterns of presence, the rhythm of conversation, and the
            resilience of connection across time and distance.
          </p>
        </div>
      </ScrollSection>

      {/* Data Status or Visualization */}
      {!dataLoaded ? (
        <ScrollSection>
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-4 text-blue-900">
                Ready to See Your Story?
              </h3>
              <p className="text-gray-700 mb-6">
                To visualize your communication timeline, follow these steps:
              </p>
              <ol className="text-left max-w-2xl mx-auto space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>
                    Export your WhatsApp chat (Settings → Export Chat) and place
                    it in{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      data/raw/
                    </code>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>
                    Request your Instagram data download and place the JSON in{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      data/raw/
                    </code>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>
                    Run{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      python scripts/process_data.py
                    </code>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span>
                    Copy the processed JSON files to{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      frontend/public/data/
                    </code>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">5.</span>
                  <span>Refresh this page to see your visualizations</span>
                </li>
              </ol>
            </div>
          </div>
        </ScrollSection>
      ) : (
        <>
          {/* The Heartbeat Section */}
          <ScrollSection>
            <div className="max-w-6xl mx-auto px-4 py-20">
              <h2 className="section-title text-center mb-12">The Heartbeat</h2>
              <p className="narrative-text text-center text-gray-600 mb-16 max-w-3xl mx-auto">
                Like a river flowing through time, our conversation expands and
                contracts, adapts to the seasons of life, but never stops
                flowing.
              </p>
              <StreamGraph data={messageData} />
            </div>
          </ScrollSection>

          {/* More sections will be added here */}
          <ScrollSection>
            <div className="max-w-3xl mx-auto px-4 py-20">
              <h2 className="section-title">More Coming Soon...</h2>
              <p className="narrative-text text-gray-700">
                Additional visualizations will appear here as you build them:
                The Sync (time heatmaps), Reply Latency, Platform Handover, and
                special Burst Highlights.
              </p>
            </div>
          </ScrollSection>
        </>
      )}

      {/* Footer */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="narrative-text text-gray-500">
            The goal is not to quantify love, but to see the quiet architecture
            of connection.
          </p>
        </div>
      </section>
    </main>
  );
}
