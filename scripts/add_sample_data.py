#!/usr/bin/env python3
"""
Add sample data across multiple days to demonstrate the stream graph
"""

import json
from datetime import datetime, timedelta

# Load existing data
with open('../frontend/public/data/all_messages.json', 'r') as f:
    data = json.load(f)

# Create additional sample messages across different days
base_date = datetime(2023, 8, 13)
additional_messages = []

# Add messages for previous days (expanded from 5 to 60 days)
for days_back in range(1, 61):  # 60 days of historical data
    date = base_date - timedelta(days=days_back)

    # Add 5-15 messages per day with variety
    import random
    num_messages = random.randint(5, 15)
    
    for msg_idx in range(num_messages):
        hour = random.randint(8, 23)
        minute = random.randint(0, 59)
        sender = "You" if msg_idx % 2 == 0 else "Partner"
        platform = random.choice(["whatsapp", "whatsapp", "instagram"])
        msg_type = random.choice(["text", "text", "text", "image", "video", "audio"])
        
        content = f"Message {msg_idx} from {days_back} days ago"
        if msg_type == "image":
            content = f"[Photo shared] {content}"
        elif msg_type == "video":
            content = f"[Video shared] {content}"
        elif msg_type == "audio":
            content = f"[Audio message] {content}"
        
        message = {
            "timestamp": f"{date.strftime('%Y-%m-%d')}T{hour:02d}:{minute:02d}:00",
            "sender_id": sender,
            "platform": platform,
            "type": msg_type,
            "content": content,
            "media_count": 1 if msg_type in ["image", "video"] else 0,
            "call_duration_seconds": None,
            "hour_of_day_local": hour,
            "reply_latency_seconds": random.uniform(60, 3600) if msg_idx > 0 else None
        }
        additional_messages.append(message)

# Add messages for future days (expanded from 3 to 30 days)
for days_forward in range(1, 31):  # 30 days of future data
    date = base_date + timedelta(days=days_forward)

    num_messages = random.randint(5, 15)
    
    for msg_idx in range(num_messages):
        hour = random.randint(8, 23)
        minute = random.randint(0, 59)
        sender = "You" if msg_idx % 2 == 0 else "Partner"
        platform = random.choice(["whatsapp", "whatsapp", "instagram"])
        msg_type = random.choice(["text", "text", "text", "image", "video", "audio"])
        
        content = f"Message {msg_idx} from {days_forward} days later"
        if msg_type == "image":
            content = f"[Photo shared] {content}"
        elif msg_type == "video":
            content = f"[Video shared] {content}"
        elif msg_type == "audio":
            content = f"[Audio message] {content}"
        
        message = {
            "timestamp": f"{date.strftime('%Y-%m-%d')}T{hour:02d}:{minute:02d}:00",
            "sender_id": sender,
            "platform": platform,
            "type": msg_type,
            "content": content,
            "media_count": 1 if msg_type in ["image", "video"] else 0,
            "call_duration_seconds": None,
            "hour_of_day_local": hour,
            "reply_latency_seconds": random.uniform(60, 3600) if msg_idx > 0 else None
        }
        additional_messages.append(message)

# Combine and sort
all_messages = data + additional_messages
all_messages.sort(key=lambda x: x['timestamp'])

# Save updated data
with open('../frontend/public/data/all_messages.json', 'w') as f:
    json.dump(all_messages, f, indent=2)

# Update summary stats
stats = {
    "total_messages": len(all_messages),
    "date_range": {
        "start": min(m['timestamp'] for m in all_messages),
        "end": max(m['timestamp'] for m in all_messages)
    },
    "by_platform": {},
    "by_sender": {},
    "by_type": {},
    "messages_per_day": len(all_messages) / 90  # 60 days back + 30 days forward
}

# Calculate stats
from collections import Counter
stats["by_platform"] = dict(Counter(m['platform'] for m in all_messages))
stats["by_sender"] = dict(Counter(m['sender_id'] for m in all_messages))
stats["by_type"] = dict(Counter(m['type'] for m in all_messages))

with open('../frontend/public/data/summary_stats.json', 'w') as f:
    json.dump(stats, f, indent=2)

print(f"Added {len(additional_messages)} sample messages across multiple days")
print(f"Total messages now: {len(all_messages)}")
print("Updated data files for better visualization!")