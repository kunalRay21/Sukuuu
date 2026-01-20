"use client";

import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Configure your dashboard preferences and data
        </p>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-8 border border-gray-200"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Data Management
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Import New Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Process new messages from WhatsApp or Instagram exports
            </p>
            <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
              <li>
                Place your exported chat file in{" "}
                <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                  data/raw/
                </code>
              </li>
              <li>
                Run{" "}
                <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                  python scripts/process_data.py
                </code>
              </li>
              <li>Refresh the dashboard to see updated data</li>
            </ol>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Add Sample Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Generate additional dummy data for testing visualizations
            </p>
            <code className="bg-gray-200 px-2 py-1 rounded text-xs block">
              python scripts/add_sample_data.py
            </code>
          </div>
        </div>
      </motion.div>

      {/* Display Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-8 border border-gray-200"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Display Preferences
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Theme</h3>
              <p className="text-sm text-gray-600">
                Currently using light theme
              </p>
            </div>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              Light Mode
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Animations</h3>
              <p className="text-sm text-gray-600">
                Enable smooth transitions and effects
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Enabled
            </button>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-8 text-white"
      >
        <h2 className="text-2xl font-semibold mb-4">About This Dashboard</h2>
        <p className="text-gray-300 mb-4">
          This dashboard visualizes communication patterns and relationships
          through data-driven storytelling. Built with Next.js, React, and
          Tailwind CSS.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Version</div>
            <div className="font-medium">1.0.0</div>
          </div>
          <div>
            <div className="text-gray-400">Last Updated</div>
            <div className="font-medium">January 2026</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
