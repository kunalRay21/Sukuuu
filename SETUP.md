# Communication Timeline Visualization

A thoughtful data visualization project that transforms messaging history into a narrative journey of connection.

## Quick Start

### 1. Set Up Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Export Your Data

**WhatsApp:**

1. Open the chat you want to export
2. Tap the three dots menu → More → Export Chat
3. Choose "Without Media" (or with if you want)
4. Save the `.txt` file to `data/raw/whatsapp_chat.txt`

**Instagram:**

1. Go to Instagram Settings → Security → Download Data
2. Request your data (takes 24-48 hours)
3. Download and extract the ZIP file
4. Find `messages/inbox/[conversation-name]/message_1.json`
5. Copy to `data/raw/instagram_messages.json`

### 3. Configure Timezones

Edit `config/timezone_config.json` with your location history:

```json
{
  "person_a": [
    {
      "start": "2021-06-01",
      "end": "2023-12-31",
      "timezone": "America/New_York"
    }
  ],
  "person_b": [
    { "start": "2021-06-01", "end": "2023-12-31", "timezone": "Europe/London" }
  ]
}
```

### 4. Process Your Data

```bash
cd scripts
python process_data.py
```

This will:

- Parse WhatsApp and Instagram exports
- Normalize timezones
- Calculate reply latencies
- Generate processed JSON files in `data/processed/`

### 5. Set Up Frontend

```bash
cd frontend
npm install
```

### 6. Copy Data to Frontend

Copy the processed files to the frontend's public directory:

```bash
# On Windows:
copy ..\data\processed\*.json public\data\

# On Mac/Linux:
cp ../data/processed/*.json public/data/
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your visualization!

## Building for Production

```bash
cd frontend
npm run build
```

This creates a static export in the `out/` directory that you can:

- Upload to any static host (GitHub Pages, Netlify, Vercel)
- Save to a USB drive as a personal archive
- Open directly in any browser

## Project Structure

```
/
├── config/                    # Configuration files
│   ├── annotations.json      # Personal annotations for the timeline
│   ├── timezone_config.json  # Timezone mapping
│   └── theme.ts              # Visual theme configuration
├── data/
│   ├── raw/                  # Original exports (gitignored)
│   └── processed/            # Processed JSON (gitignored)
├── scripts/
│   └── process_data.py       # Data processing pipeline
├── frontend/                 # Next.js application
│   ├── public/data/          # Processed data for visualization
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   ├── components/       # React components
│   │   └── lib/              # Utility functions
│   └── package.json
├── requirements.txt          # Python dependencies
└── README.md
```

## Adding Annotations

Edit `config/annotations.json` to add context to your timeline:

```json
[
  {
    "date": "2023-11-12",
    "type": "milestone",
    "text": "We moved into the new apartment",
    "emotion": "positive"
  }
]
```

Types: `milestone`, `context`, `memory`, `quote`
Emotions: `positive`, `neutral`, `negative`

## Privacy & Security

- All personal data is excluded from version control via `.gitignore`
- Raw and processed data stays local
- The static export contains only what you choose to include
- Built-in anonymization mode available (see Python script)

## Customization

### Colors

Edit `frontend/tailwind.config.js`:

```javascript
colors: {
  'person-a': '#6366f1',  // Your color
  'person-b': '#ec4899',  // Their color
  'accent': '#f59e0b',    // Highlight color
}
```

### Typography

Modify font choices in `frontend/src/app/globals.css`

## Troubleshooting

**"No data to visualize yet"**

- Make sure you've run `python scripts/process_data.py`
- Copy processed files to `frontend/public/data/`
- Refresh the browser

**WhatsApp parsing errors**

- Check the date format in your export (DD/MM/YYYY vs MM/DD/YYYY)
- Modify the regex in `process_data.py` line 43

**Module not found errors**

- Run `pip install -r requirements.txt` (Python)
- Run `npm install` in the frontend directory (Node.js)

## Next Steps

1. ✓ Process your data
2. ✓ View the basic timeline
3. Add more visualizations:
   - HeatmapClock (conversation patterns by hour)
   - BurstHighlight (highest activity days)
   - Platform handover visualization
4. Customize annotations with your memories
5. Build and archive your static site

## License

This is a personal project. The code structure is yours to use, but treat your data with care.

---

**Remember:** The goal is not to quantify love, but to see the quiet architecture of connection.
