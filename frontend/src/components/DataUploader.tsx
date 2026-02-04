"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { theme } from "@/config/theme";

export default function DataUploader() {
  const { processFiles, isProcessing } = useAppStore();
  const [whatsappFiles, setWhatsappFiles] = useState<FileList | null>(null);
  const [instagramFiles, setInstagramFiles] = useState<FileList | null>(null);

  const handleProcess = async () => {
    if (!whatsappFiles && !instagramFiles) return;

    await processFiles(
      whatsappFiles ? Array.from(whatsappFiles) : [],
      instagramFiles ? Array.from(instagramFiles) : [],
      "You", // Default, could be input
      "Partner", // Default
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Data</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp (.txt exports)
          </label>
          <input
            type="file"
            accept=".txt"
            multiple
            onChange={(e) => setWhatsappFiles(e.target.files)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram (message_1.json)
          </label>
          <input
            type="file"
            accept=".json"
            multiple
            onChange={(e) => setInstagramFiles(e.target.files)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={isProcessing || (!whatsappFiles && !instagramFiles)}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isProcessing ? "Processing..." : "Process Data Local"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Your data is processed locally in your browser and never sent to any
          server.
        </p>
      </div>
    </div>
  );
}
