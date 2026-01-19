"""
Communication Timeline Data Processor
Processes WhatsApp and Instagram exports into a unified timeline
"""

import pandas as pd
import json
import re
from pathlib import Path
from datetime import datetime
import pytz
from typing import List, Dict, Any
import orjson


class MessageProcessor:
    """Main class for processing messaging data from multiple platforms"""
    
    def __init__(self, config_dir: str = "../config", data_dir: str = "../data"):
        self.config_dir = Path(config_dir)
        self.data_dir = Path(data_dir)
        self.events: List[Dict[str, Any]] = []
        self.timezone_config = self._load_timezone_config()
        
    def _load_timezone_config(self) -> Dict:
        """Load timezone configuration"""
        config_path = self.config_dir / "timezone_config.json"
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def parse_whatsapp(self, file_path: str, person_a: str = "person_a", person_b: str = "person_b"):
        """
        Parse WhatsApp .txt export
        Expected format: [DD/MM/YYYY, HH:MM:SS] Sender: Message
        """
        file_path = Path(file_path)
        if not file_path.exists():
            print(f"File not found: {file_path}")
            return
        
        print(f"Parsing WhatsApp export: {file_path.name}")
        
        # WhatsApp message pattern (handles both [bracketed] and non-bracketed formats)
        pattern1 = r'\[(\d{1,2}/\d{1,2}/\d{2,4}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)'
        pattern2 = r'(\d{1,2}/\d{1,2}/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s([^:]+):\s(.+)'
        
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        current_message = None
        parsed_count = 0
        
        for line in lines:
            match = re.match(pattern1, line)
            if not match:
                match = re.match(pattern2, line)
            
            if match:
                # Save previous message if exists
                if current_message:
                    self.events.append(current_message)
                    parsed_count += 1
                
                date_str, time_str, sender, message = match.groups()
                
                # Parse datetime (adjust format based on your export)
                dt = None
                for date_fmt in ["%m/%d/%Y %H:%M:%S", "%d/%m/%Y %H:%M:%S", "%m/%d/%y %H:%M", "%d/%m/%y %H:%M"]:
                    try:
                        dt = datetime.strptime(f"{date_str} {time_str}", date_fmt)
                        break
                    except ValueError:
                        continue
                
                if dt is None:
                    continue
                
                # Determine sender ID
                sender_id = person_a if sender.strip() not in [person_b] else person_b
                
                # Determine message type
                msg_type = "text"
                media_count = 0
                call_duration = None
                
                if "<Media omitted>" in message or "image omitted" in message.lower():
                    msg_type = "image"
                    media_count = 1
                elif "audio omitted" in message.lower() or "voice message" in message.lower():
                    msg_type = "voice"
                elif "video omitted" in message.lower():
                    msg_type = "video"
                    media_count = 1
                elif "missed voice call" in message.lower() or "missed video call" in message.lower():
                    msg_type = "call"
                
                current_message = {
                    "timestamp": dt.isoformat(),
                    "sender_id": sender_id,
                    "platform": "whatsapp",
                    "type": msg_type,
                    "content": message,
                    "media_count": media_count,
                    "call_duration_seconds": call_duration
                }
            else:
                # Multi-line message continuation
                if current_message:
                    current_message["content"] += "\n" + line.strip()
        
        # Add last message
        if current_message:
            self.events.append(current_message)
            parsed_count += 1
        
        print(f"Parsed {parsed_count} messages from WhatsApp")
    
    def parse_instagram(self, json_path: str, person_a: str = "person_a", person_b: str = "person_b"):
        """
        Parse Instagram JSON export
        Expected location: messages/inbox/[conversation]/message_1.json
        """
        json_path = Path(json_path)
        if not json_path.exists():
            print(f"File not found: {json_path}")
            return
        
        print(f"Parsing Instagram export: {json_path.name}")
        
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        messages = data.get('messages', [])
        parsed_count = 0
        
        for msg in messages:
            # Instagram timestamps are in milliseconds
            timestamp = datetime.fromtimestamp(msg['timestamp_ms'] / 1000)
            
            sender_id = person_a if msg['sender_name'] == person_a else person_b
            
            # Determine message type
            msg_type = "text"
            content = msg.get('content', '')
            media_count = 0
            
            if 'photos' in msg:
                msg_type = "image"
                media_count = len(msg['photos'])
                content = f"[{media_count} photo(s)]"
            elif 'videos' in msg:
                msg_type = "video"
                media_count = len(msg['videos'])
                content = f"[{media_count} video(s)]"
            elif 'audio_files' in msg:
                msg_type = "voice"
                content = "[Voice message]"
            
            event = {
                "timestamp": timestamp.isoformat(),
                "sender_id": sender_id,
                "platform": "instagram",
                "type": msg_type,
                "content": content,
                "media_count": media_count,
                "call_duration_seconds": None
            }
            
            self.events.append(event)
            parsed_count += 1
        
        print(f"Parsed {parsed_count} messages from Instagram")
    
    def normalize_timezone(self):
        """Apply timezone adjustments based on config"""
        if not self.timezone_config:
            print("No timezone configuration found, skipping normalization")
            return
        
        print("Normalizing timezones...")
        
        df = pd.DataFrame(self.events)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Add local hour for each message
        df['hour_of_day_local'] = df['timestamp'].dt.hour
        
        # Update self.events with normalized data
        self.events = df.to_dict('records')
        
        print("Timezone normalization complete")
    
    def calculate_reply_latency(self):
        """Calculate reply times between messages"""
        print("Calculating reply latency...")
        
        df = pd.DataFrame(self.events)
        df = df.sort_values('timestamp')
        
        df['reply_latency_seconds'] = None
        
        for i in range(1, len(df)):
            # If sender changed, calculate latency
            if df.iloc[i]['sender_id'] != df.iloc[i-1]['sender_id']:
                time_diff = (pd.to_datetime(df.iloc[i]['timestamp']) - 
                           pd.to_datetime(df.iloc[i-1]['timestamp'])).total_seconds()
                df.at[df.index[i], 'reply_latency_seconds'] = time_diff
        
        self.events = df.to_dict('records')
        print("Reply latency calculation complete")
    
    def export_processed(self, output_dir: str = None):
        """Export processed data as JSON"""
        if output_dir is None:
            output_dir = self.data_dir / "processed"
        else:
            output_dir = Path(output_dir)
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Sort by timestamp
        df = pd.DataFrame(self.events)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Export full dataset
        full_output = output_dir / "all_messages.json"
        # Convert timestamps to ISO strings for JSON serialization
        df_export = df.copy()
        df_export['timestamp'] = df_export['timestamp'].dt.strftime('%Y-%m-%dT%H:%M:%S')
        with open(full_output, 'wb') as f:
            f.write(orjson.dumps(df_export.to_dict('records'), option=orjson.OPT_INDENT_2))
        
        print(f"Exported {len(df)} total events to {full_output}")
        
        # Export by year for frontend
        for year, group in df.groupby(df['timestamp'].dt.year):
            year_output = output_dir / f"data_{year}.json"
            group_export = group.copy()
            group_export['timestamp'] = group_export['timestamp'].dt.strftime('%Y-%m-%dT%H:%M:%S')
            with open(year_output, 'wb') as f:
                f.write(orjson.dumps(group_export.to_dict('records'), option=orjson.OPT_INDENT_2))
            print(f"Exported {len(group)} events for {year} to {year_output}")
    
    def export_summary_stats(self, output_dir: str = None):
        """Generate and export summary statistics"""
        if output_dir is None:
            output_dir = self.data_dir / "processed"
        else:
            output_dir = Path(output_dir)
        
        df = pd.DataFrame(self.events)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        stats = {
            "total_messages": len(df),
            "date_range": {
                "start": df['timestamp'].min().isoformat(),
                "end": df['timestamp'].max().isoformat()
            },
            "by_platform": df.groupby('platform').size().to_dict(),
            "by_sender": df.groupby('sender_id').size().to_dict(),
            "by_type": df.groupby('type').size().to_dict(),
            "messages_per_day": len(df) / (df['timestamp'].max() - df['timestamp'].min()).days,
        }
        
        stats_output = output_dir / "summary_stats.json"
        with open(stats_output, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2)
        
        print(f"\nSummary Statistics:")
        print(f"Total messages: {stats['total_messages']}")
        print(f"Date range: {stats['date_range']['start']} to {stats['date_range']['end']}")
        print(f"Average messages per day: {stats['messages_per_day']:.2f}")
        print(f"\nExported summary to {stats_output}")


def main():
    """Main execution function"""
    print("=== Communication Timeline Data Processor ===\n")
    
    # Initialize processor
    processor = MessageProcessor(
        config_dir="../config",
        data_dir="../data"
    )
    
    # Parse data sources
    # TODO: Update these paths to your actual export files
    whatsapp_file = "../data/raw/whatsapp.txt"
    instagram_file = "../data/raw/instagram_message_1.json"
    
    # Parse WhatsApp (if file exists)
    if Path(whatsapp_file).exists():
        processor.parse_whatsapp(whatsapp_file, person_a="You", person_b="Partner")
    else:
        print(f"WhatsApp file not found: {whatsapp_file}")
        print("Place your WhatsApp export in data/raw/ folder\n")
    
    # Parse Instagram (if file exists)
    if Path(instagram_file).exists():
        processor.parse_instagram(instagram_file, person_a="You", person_b="Partner")
    else:
        print(f"Instagram file not found: {instagram_file}")
        print("Place your Instagram JSON export in data/raw/ folder\n")
    
    if not processor.events:
        print("\nNo data to process. Please add your exported data files.")
        return
    
    # Process data
    processor.normalize_timezone()
    processor.calculate_reply_latency()
    
    # Export results
    processor.export_processed()
    processor.export_summary_stats()
    
    print("\n✓ Processing complete!")


if __name__ == "__main__":
    main()
