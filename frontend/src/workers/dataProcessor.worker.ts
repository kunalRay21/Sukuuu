/* eslint-disable no-restricted-globals */

// Define types used in processing
export interface ChatMessageEvent {
  timestamp: string;
  sender_id: string;
  platform: "whatsapp" | "instagram";
  type: "text" | "image" | "video" | "voice" | "call";
  content: string;
  media_count: number;
  call_duration_seconds: number | null;
  hour_of_day_local?: number;
  reply_latency_seconds?: number | null;
}

// Re-export for backwards compatibility
export type MessageEvent = ChatMessageEvent;

self.onmessage = async (e: globalThis.MessageEvent) => {
  const { type, payload } = e.data as { type: string; payload: any };

  if (type === "PROCESS_FILES") {
    try {
      const { whatsappFiles, instagramFiles, personA, personB } = payload;
      let events: ChatMessageEvent[] = [];

      // Process WhatsApp Files
      for (const fileContent of whatsappFiles) {
        const parsed = parseWhatsApp(fileContent, personA, personB);
        events = events.concat(parsed);
      }

      // Process Instagram Files
      for (const fileContent of instagramFiles) {
        const parsed = parseInstagram(
          JSON.parse(fileContent),
          personA,
          personB,
        );
        events = events.concat(parsed);
      }

      // Sort by timestamp
      events.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      // Normalize Timezone (Add hour_of_day_local)
      events = events.map((event) => ({
        ...event,
        hour_of_day_local: new Date(event.timestamp).getHours(),
      }));

      // Calculate Reply Latency
      calculateReplyLatency(events);

      // Generate Summary Stats
      const stats = generateSummaryStats(events);

      // Send back results
      self.postMessage({ type: "SUCCESS", data: { events, stats } });
    } catch (error: any) {
      self.postMessage({ type: "ERROR", error: error.message });
    }
  }
};

function parseWhatsApp(
  text: string,
  personA: string,
  personB: string,
): MessageEvent[] {
  const events: MessageEvent[] = [];
  const lines = text.split("\n");

  // Regex patterns
  const pattern1 =
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)/;
  const pattern2 =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s([^:]+):\s(.+)/;

  let currentMessage: MessageEvent | null = null;

  for (const line of lines) {
    let match = line.match(pattern1);
    if (!match) match = line.match(pattern2);

    if (match) {
      if (currentMessage) {
        events.push(currentMessage);
      }

      const [_, dateStr, timeStr, sender, message] = match;

      // Parse Date
      // Supports DD/MM/YYYY or MM/DD/YYYY depending on locale...
      // This is tricky in JS without knowing the locale.
      // We will try standard parsing or assume DD/MM/YYYY as per python hint
      // Python code tried 4 formats.
      // We'll construct ISO string

      const parsedDate = parseDateString(dateStr, timeStr);
      if (!parsedDate) continue;

      const senderId = normalizeSender(sender, personA, personB);

      let msgType: MessageEvent["type"] = "text";
      let mediaCount = 0;
      let callDuration = null;

      const lowerMsg = message.toLowerCase();
      if (
        message.includes("<Media omitted>") ||
        lowerMsg.includes("image omitted")
      ) {
        msgType = "image";
        mediaCount = 1;
      } else if (
        lowerMsg.includes("audio omitted") ||
        lowerMsg.includes("voice message")
      ) {
        msgType = "voice";
      } else if (lowerMsg.includes("video omitted")) {
        msgType = "video";
        mediaCount = 1;
      } else if (
        lowerMsg.includes("missed voice call") ||
        lowerMsg.includes("missed video call")
      ) {
        msgType = "call";
      }

      currentMessage = {
        timestamp: parsedDate.toISOString(),
        sender_id: senderId,
        platform: "whatsapp",
        type: msgType,
        content: message.trim(),
        media_count: mediaCount,
        call_duration_seconds: callDuration,
      };
    } else {
      // Continuation
      if (currentMessage) {
        currentMessage.content += "\n" + line.trim();
      }
    }
  }

  if (currentMessage) events.push(currentMessage);
  return events;
}

function parseInstagram(
  data: any,
  personA: string,
  personB: string,
): MessageEvent[] {
  const events: MessageEvent[] = [];
  const messages = data.messages || [];

  for (const msg of messages) {
    const timestamp = new Date(msg.timestamp_ms);
    const senderId = msg.sender_name === personA ? personA : personB; // Logic relies on exact name match or fallback

    let msgType: MessageEvent["type"] = "text";
    let content = msg.content || "";
    let mediaCount = 0;

    if (msg.photos) {
      msgType = "image";
      mediaCount = msg.photos.length;
      content = `[${mediaCount} photo(s)]`;
    } else if (msg.videos) {
      msgType = "video";
      mediaCount = msg.videos.length;
      content = `[${mediaCount} video(s)]`;
    } else if (msg.audio_files) {
      msgType = "voice";
      content = "[Voice message]";
    }

    events.push({
      timestamp: timestamp.toISOString(),
      sender_id: senderId,
      platform: "instagram",
      type: msgType,
      content: content,
      media_count: mediaCount,
      call_duration_seconds: null,
    });
  }
  return events;
}

function parseDateString(dateStr: string, timeStr: string): Date | null {
  // Try format MM/DD/YYYY or DD/MM/YYYY
  // We'll replace slashes with dashes maybe?
  // Let's assume the Python script logic: it tried multiple formats.
  // In JS `new Date("MM/DD/YYYY HH:MM:SS")` works.

  // Clean clean possible hidden chars
  const d = dateStr.trim();
  const t = timeStr.trim();

  let date = new Date(`${d} ${t}`);
  if (!isNaN(date.getTime())) return date;

  // Try swapping pairs if first attempt failed (DD/MM vs MM/DD)
  const parts = d.split("/");
  if (parts.length === 3) {
    // Swap first two
    const swapped = `${parts[1]}/${parts[0]}/${parts[2]}`;
    date = new Date(`${swapped} ${t}`);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

function normalizeSender(
  sender: string,
  personA: string,
  personB: string,
): string {
  // If sender matches personB closely, return personB, else personA (or vice versa logic from python)
  // Python logic: sender_id = person_a if sender.strip() not in [person_b] else person_b
  // This implies if it's NOT person_b, it is person_a.

  const s = sender.trim();
  if (s === personB) return personB;
  return personA; // Default to personA if not B?
  // Wait, if I am importing 'You' and 'Partner', the names in file might be 'John Doe' vs 'Jane'.
  // We need to map file names to 'You'/'Partner'.
  // For now we accept what's passed.
}

function calculateReplyLatency(events: MessageEvent[]) {
  for (let i = 1; i < events.length; i++) {
    if (events[i].sender_id !== events[i - 1].sender_id) {
      const diff =
        (new Date(events[i].timestamp).getTime() -
          new Date(events[i - 1].timestamp).getTime()) /
        1000;
      events[i].reply_latency_seconds = diff;
    }
  }
}

function generateSummaryStats(events: MessageEvent[]) {
  const total = events.length;
  if (total === 0) return {};

  const timestamps = events.map((e) => new Date(e.timestamp).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  const days = (maxTime - minTime) / (1000 * 60 * 60 * 24);

  // Group bys
  const byPlatform: Record<string, number> = {};
  const bySender: Record<string, number> = {};
  const byType: Record<string, number> = {};

  events.forEach((e) => {
    byPlatform[e.platform] = (byPlatform[e.platform] || 0) + 1;
    bySender[e.sender_id] = (bySender[e.sender_id] || 0) + 1;
    byType[e.type] = (byType[e.type] || 0) + 1;
  });

  return {
    total_messages: total,
    date_range: {
      start: new Date(minTime).toISOString(),
      end: new Date(maxTime).toISOString(),
    },
    by_platform: byPlatform,
    by_sender: bySender,
    by_type: byType,
    messages_per_day: days > 0 ? total / days : 0,
  };
}
