import { create } from "zustand";
import { get, set } from "idb-keyval";

// Types
import { MessageEvent } from "../workers/dataProcessor.worker";

interface AppState {
  messages: MessageEvent[];
  stats: any;
  isProcessing: boolean;
  isPrivacyMode: boolean;
  dataLoaded: boolean;

  // Actions
  setPrivacyMode: (isPrivacy: boolean) => void;
  loadData: () => Promise<void>;
  processFiles: (
    whatsappFiles: File[],
    instagramFiles: File[],
    personA: string,
    personB: string,
  ) => Promise<void>;
  exportStaticHTML: () => void;
}

export const useAppStore = create<AppState>((setState, getState) => ({
  messages: [],
  stats: null,
  isProcessing: false,
  isPrivacyMode: false,
  dataLoaded: false,

  setPrivacyMode: (isPrivacy) => setState({ isPrivacyMode: isPrivacy }),

  loadData: async () => {
    // Try loading from IDB
    try {
      const storedMessages = await get("messages");
      const storedStats = await get("stats");

      if (storedMessages && storedStats) {
        setState({
          messages: storedMessages,
          stats: storedStats,
          dataLoaded: true,
        });
      }
    } catch (e) {
      console.error("Failed to load from IDB", e);
    }
  },

  processFiles: async (whatsappFiles, instagramFiles, personA, personB) => {
    setState({ isProcessing: true });

    // Read files as text/json strings
    const readText = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

    try {
      const waContents = await Promise.all(whatsappFiles.map(readText));
      const igContents = await Promise.all(instagramFiles.map(readText));

      const worker = new Worker(
        new URL("../workers/dataProcessor.worker.ts", import.meta.url),
      );

      worker.postMessage({
        type: "PROCESS_FILES",
        payload: {
          whatsappFiles: waContents,
          instagramFiles: igContents,
          personA,
          personB,
        },
      });

      worker.onmessage = async (e) => {
        const { type, data, error } = e.data;
        if (type === "SUCCESS") {
          // Save to IDB
          await set("messages", data.events);
          await set("stats", data.stats);

          setState({
            messages: data.events,
            stats: data.stats,
            dataLoaded: true,
            isProcessing: false,
          });
          worker.terminate();
        } else if (type === "ERROR") {
          console.error("Worker Error:", error);
          setState({ isProcessing: false });
          worker.terminate();
          alert("Error processing files: " + error);
        }
      };
    } catch (err) {
      console.error(err);
      setState({ isProcessing: false });
    }
  },

  exportStaticHTML: () => {
    const { messages, stats } = getState();
    if (!messages.length) return;

    // Create a minimal self-contained HTML
    // We embedded the data into a global variable
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat History Archive</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9fafb; }
        .message { padding: 10px; margin: 5px 0; border-radius: 8px; background: white; border: 1px solid #e5e7eb; }
        .message.you { border-left: 4px solid #3b82f6; }
        .meta { font-size: 0.8em; color: #6b7280; }
        h1 { color: #111827; }
        .stats { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <h1>Chat History Archive</h1>
    <div class="stats">
        <p><strong>Total Messages:</strong> ${stats.total_messages}</p>
        <p><strong>Date Range:</strong> ${stats.date_range.start} to ${stats.date_range.end}</p>
    </div>
    <div id="container">
        <!-- JS will render rows here if needed, or we server-side render them now -->
        ${messages
          .slice(0, 5000)
          .map(
            (m) =>
              '<div class="message ' +
              (m.sender_id === "You" ? "you" : "") +
              '">' +
              '<div class="meta">' +
              m.sender_id +
              " • " +
              m.timestamp +
              "</div>" +
              '<div class="content">' +
              m.content +
              "</div>" +
              "</div>",
          )
          .join("")}
        ${messages.length > 5000 ? "<p>... and " + (messages.length - 5000) + " more messages (truncated for static export size)</p>" : ""}
    </div>
    <script>
        window.CHAT_DATA = ${JSON.stringify({ messages, stats })};
        console.log("Full data available in window.CHAT_DATA");
    </script>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));
