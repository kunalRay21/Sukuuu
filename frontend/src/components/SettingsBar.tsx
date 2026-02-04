"use client";

import { useAppStore } from "@/lib/store";
import { theme } from "@/config/theme";

export default function SettingsBar() {
  const { isPrivacyMode, setPrivacyMode, exportStaticHTML, dataLoaded } =
    useAppStore();

  if (!dataLoaded) return null;

  return (
    <div className="fixed bottom-4 right-4 flex gap-2 z-50">
      <button
        onClick={() => setPrivacyMode(!isPrivacyMode)}
        className={`px-4 py-2 rounded-full shadow-lg font-medium transition-all ${
          isPrivacyMode
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
        }`}
      >
        {isPrivacyMode ? "🙈 Privacy On" : "👁️ Privacy Off"}
      </button>

      <button
        onClick={exportStaticHTML}
        className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-full shadow-lg font-medium transition-all"
      >
        📥 Export HTML
      </button>
    </div>
  );
}
