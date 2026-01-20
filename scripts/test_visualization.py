#!/usr/bin/env python3
"""
Test script to verify data loading and basic functionality
"""

import json
import os

def test_data_loading():
    """Test that data files exist and are valid JSON"""
    data_dir = "../frontend/public/data"

    files_to_check = [
        "all_messages.json",
        "summary_stats.json"
    ]

    for filename in files_to_check:
        filepath = os.path.join(data_dir, filename)
        if not os.path.exists(filepath):
            print(f"❌ {filename} not found")
            return False

        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            print(f"✅ {filename} loaded successfully ({len(data) if isinstance(data, list) else 'object'} items)")
        except Exception as e:
            print(f"❌ {filename} failed to load: {e}")
            return False

    return True

def test_data_structure():
    """Test that data has expected structure"""
    with open("../frontend/public/data/all_messages.json", 'r') as f:
        messages = json.load(f)

    if not messages:
        print("❌ No messages found")
        return False

    # Check first message structure
    msg = messages[0]
    required_fields = ['timestamp', 'sender_id', 'platform', 'type', 'content']

    for field in required_fields:
        if field not in msg:
            print(f"❌ Missing field: {field}")
            return False

    print("✅ Data structure is valid")
    return True

def test_date_range():
    """Test that we have messages across multiple days"""
    with open("../frontend/public/data/all_messages.json", 'r') as f:
        messages = json.load(f)

    dates = set()
    for msg in messages:
        date = msg['timestamp'].split('T')[0]
        dates.add(date)

    print(f"✅ Messages span {len(dates)} different days: {sorted(list(dates))[:5]}{'...' if len(dates) > 5 else ''}")
    return len(dates) > 1

if __name__ == "__main__":
    print("🧪 Testing data processing and visualization setup...\n")

    success = True
    success &= test_data_loading()
    success &= test_data_structure()
    success &= test_date_range()

    if success:
        print("\n🎉 All tests passed! Your visualization should be working.")
        print("Visit http://localhost:3001 to see your story in data!")
    else:
        print("\n❌ Some tests failed. Check the errors above.")