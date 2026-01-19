# Communication Timeline Visualization Project

A thoughtful data visualization project that transforms messaging history into a narrative journey of connection.

## Project Overview

This project analyzes and visualizes communication patterns from messaging platforms (WhatsApp, Instagram) to create a beautiful, personal narrative of relationships over time. The goal is to celebrate connection through data while maintaining emotional sensitivity and avoiding judgmental metrics.

### Key Principles

- **Non-judgmental**: Focus on patterns and rhythm, not performance metrics
- **Privacy-first**: Designed for personal use with built-in anonymization options
- **Archival quality**: Built as a static site that can last for decades
- **Narrative-driven**: Data serves the story, not the other way around

---

## I. The Data Layer: "The Quiet Foundation"

This phase is about rigor. The cleaner the data, the more gentle the final story will be.

### 1. Unified Schema & Normalization

**The Merge:** You need a single chronological timeline.

**Data Sources:**

- **WhatsApp**: Exports as `.txt` (Date, Time, Sender, Message)
  - Export via: Chat Settings > Export Chat
  - Format: `[DD/MM/YYYY, HH:MM:SS] Sender: Message`
- **Instagram**: Exports as JSON (part of the Meta data download)
  - Request via: Instagram Settings > Security > Download Data
  - File location: `messages/inbox/[conversation]/message_1.json`

**Canonical Event Schema (Python):**

```python
{
    "timestamp": "2023-01-15T14:30:00Z",  # UTC ISO format
    "sender_id": "person_a",
    "platform": "whatsapp",  # whatsapp | instagram
    "type": "text",  # text | image | voice | video_call | call
    "content": "message text",  # optional, can be redacted
    "reply_latency_seconds": 120,
    "media_count": 0,
    "call_duration_seconds": null
}
```

**The "Ghost" Data:** Don't discard non-text interactions.

- **Calls/Video Chats**: Treat these as "High-Bandwidth Connection" blocks. If a call lasted 2 hours, that is a solid block of presence, distinct from sporadic texting.
- **Media**: You don't need to show the photo, but knowing that a day was full of images rather than text suggests a specific type of sharing (experiences vs. thoughts).
- **Voice Messages**: Track duration—a 5-minute voice note is qualitatively different from a quick text.
- **Reactions/Likes**: These show passive presence and engagement without formal replies.

### 2. The Timezone Problem (Crucial)

Relationships move. If you traveled or moved, raw timestamps will lie to you.
**Solution:** You need a "Location/Timezone Context" mapping.

**timezone_config.json:**

````json
{
  "person_a": [
    {"start": "2021-06-01", "end": "2021-08-31", "timezone": "Europe/Paris"},
    {"start": "2021-09-01", "end": "2022-12-31", "timezone": "America/New_York"}
  ],
  "person_b": [
### 1. The "Heartbeat" (Frequency)

**The Visualization:** Instead of a bar chart showing who sent more messages (which feels competitive), use a **stacked stream graph** (ThemeRiver visualization).

**Implementation:**
- Library: D3.js `d3.shape.stack()` or VisX `<AreaStack>`
- Aggregate messages by day or week
- Color palette: Soft, complementary colors (not competitive red vs blue)
- Smooth interpolation: Use `d3.curveBasis` for gentle curves

**Data Processing:**
```python
# Group by date and sender
daily_counts = df.groupby([df['timestamp'].dt.date, 'sender_id']).size()
````

###

**Conversion Strategy:**

1. Convert all data to "Local Shared Time"
2. If in different timezones, map to "Sender's Local Time" to see if they were staying up late to talk to you
3. Add a derived field: `hour_of_day_local` for pattern analysis

**The Visual:** A radial 24-hour clock or a linear heatmap.

**Implementation Options:**

1. **Radial Clock**: Polar coordinates with D3.js for aesthetic appeal
2. **Calendar Heatmap**: Similar to GitHub contribution graph (day × hour)
3. **Horizon Chart**: Shows volume across 24 hours with layered bands

**The Insight:** Highlight the shift in habits.

- **Phase 1**: 2 AM bursts (The "New Love" phase)
- **Phase 2**: 9 AM - 5 PM scattered texts (The "Work Life" phase)
- **Phase 3**: 8 PM - 10 PM consistent blocks (The "Domestic" phase)

This shows how your relationship adapted to the reality of your schedules.
**Reframing Speed:** Do not calculate "Average Reply Time." It's stressful.

**The Concept:** Measure "Return Rate" in categories:

- **Immediate**: < 2 mins (Synchronous conversation)
- **Active**: 2-30 mins (Engaged but doing other things)
- **Casual**: 30 mins - 6 hours (Normal life rhythm)
- **The Pause**: > 6 hours (Life happening—work, sleep)
- **The Long Arc**: > 24 hours (But they always came back)

**The Insight:** Visualize the resilience of the conversation. Show that after a 12-hour gap (work, sleep), the line always picks back up. The beauty is in the resumption.

**Visualization:**

- Sankey diagram showing conversation flows and pauses
- Ribbon chart showing how conversations stretch and contract

### 4. The "Platform Handover" shift in habits.

Phase 1: 2 AM bursts (The "New Love" phase).

Phase 2: 9 AM - 5 PM scattered texts (The "Work Life" phase).

Phase 3: 8 PM - 10 PM consistent blocks (The "Domestic" phase).

This shows how your relationship adapted to the reality of your schedules.

3. The "Elasticity" (Reply Latency)

Reframing Speed: Do not calculate "Average Reply Time." It’s stressful.

The Concept: Measure "Return Rate."

Immediate: < 2 mins (Synchronous conversation).

The Pause: > 6 hours (Life happening).

**Visual:** A subtle background color shift in the timeline showing the dominant platform for that month.

**Additional Metrics:**

- Platform preference by time of day
- Content type distribution per platform (text vs media)
- Migration patterns (when did you switch from one platform to another?)

---

## 4. The "Platform Handover"

### 1. The Scroll Architecture

**No Dashboards:** Do not show all charts at once.

**Linear Journey:** The user scrolls down through time.

**Structure:**

- **Section 1**: The Beginning (Data is sparse, tentative)
- **Section 2**: The Deepening (Data density increases)
- **Section 3**: The Conflict/Distance (Data might thin out—context is key here)
- **Section 4**: The Return (Recovery and strengthening)
- **Section 5**: The Present (Where you are now)

**Technical Implementation:**

````jsx
// Use Intersection Observer API or libraries
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

function ChapterSection({ data, annotation }) {
  const { ref, inView } = useInView({ threshold: 0.3 });
**Technical:** A `annotations.json` or Markdown file where you map date ranges to text.

**annotations.json:**
```json
[
  {
    "date": "2023-11-12",
    "type": "milestone",
    "text": "We moved into the new apartment. The wifi wasn't set up, hence the silence.",
    "emotion": "neutral"
  },
  {
**Example Prompt:** "On this Tuesday, we sent 400 messages. This was the day we planned the road trip."

**Implementation:**
```python
# Find burst days
**Core Libraries:**
- **Pandas**: For handling the time-series data
- **pytz/zoneinfo**: For timezone conversions
- **json/orjson**: Fast JSON processing
- **python-dateutil**: Flexible date parsing

**Processing Pipeline:**
```python
import pandas as pd
import json
from pathlib import Path

class MessageProcessor:
    def __init__(self):
        self.events = []

    def parse_whatsapp(self, file_path):
        # Parse WhatsApp .txt export
        pass

    def parse_instagram(self, json_path):
        # Parse Instagram JSON
        pass

    def normalize_timezone(self, timezone_config):
        # Apply timezone adjustments
        pass

    def export_chunks(self, output_dir, chunk_by='year'):
        # Export data in yearly chunks for fast loading
        df = pd.DataFrame(self.events)
**Recommended Tech Stack:**

**Framework:**
```bash
npx create-next-app@latest relationship-timeline --typescript --tailwind
````

**Visualization Libraries:**

- **VisX** (by Airbnb): React-based, low-level D3 alternative
  ```bash
  npm install @visx/scale @visx/shape @visx/axis @visx/gradient
  ```
- **D3.js**: For custom, artistic shapes (stream graphs, force-directed layouts)
  ```bash
  npm install d3 @types/d3
  ```
- **Recharts**: For simpler charts (bar, line) if needed
  ```bash
  npm install recharts
  ```

**Animation:**

- **Framer Motion**: For scroll animations and transitions
  ```bash
  npm install framer-motion
  ```

**Color Palettes:**

- Use soft, non-confrontational colors
- Recommended: Tailwind's neutral + custom accent colors
- Tools: coolors.co, color.adobe.com

**Static Site Generation (SSG):** Build the site once. The output is just HTML/JS/JSON.

**Next.js Configuration:**

````typescript
// next.config.js
module.exports = {**"The Tether."** When one person is traveling or distant, visualize the messages not as a stream, but as "pings." Show that even when the physical distance was maxed out, the digital signal remained. A single message sent at 3 AM across timezones can be visually represented as a bright, glowing point in a dark field—a lighthouse.

**Implementation Ideas:**
- **Particle system**: Each message is a small light particle traveling across distance
- **Sound**: Optional subtle chime when hovering over 3 AM messages
- **Distance visualization**: Map view showing physical distance during travel periods

**Code Concept:**
```javascript
// Detect long-distance messages
const distanceMessages = messages.filter(msg => {
  const timeDiff = Math.abs(getTimezoneOffset(msg.sender, msg.receiver));
  const isLateNight = msg.hour < 6 || msg.hour > 23;
  return timeDiff > 6 && isLateNight;
});

// Render as special glowing points
````

---

## VI. Implementation Roadmap

### Phase 1: Data Foundation (Week 1-2)

- [ ] Export WhatsApp and Instagram data
- [ ] Create timezone configuration
- [ ] Build Python processing pipeline
- [ ] Generate canonical event JSON
- [ ] Validate data quality

### Phase 2: Metrics & Analysis (Week 2-3)

- [ ] Calculate all metric categories
- [ ] Identify burst days and silence periods
- [ ] Create aggregated datasets (daily, weekly, monthly)
- [ ] Build annotation framework
- [ ] Export processed data for frontend

### Phase 3: Frontend Foundation (Week 3-4)

- [ ] Set up Next.js project with TypeScript
- [ ] Install visualization libraries
- [ ] Create basic layout and scroll structure
- [ ] Implement data loading system
- [ ] Set up theme and typography

### Phase 4: Visualizations (Week 4-6)

- [ ] Build Stream Graph (Heartbeat)
- [ ] Create Heatmap Clock (Sync)
- [ ] Implement Reply Latency visualization
- [ ] Add Platform Handover timeline
- [ ] Create Burst Highlights feature
- [ ] Build "The Tether" silence visualization

### Phase 5: Narrative Layer (Week 6-7)

- [ ] Integrate annotation system
- [ ] Add scroll animations with Framer Motion
- [ ] Implement progressive loading
- [ ] Add transitions between sections
- [ ] Polish typography and spacing

### Phase 6: Polish & Archive (Week 7-8)

- [ ] Implement anonymization mode
- [ ] Optimize performance and bundle size
- [ ] Test static export
- [ ] Add print stylesheet (for physical archive)
- [ ] Write personal reflections
- [ ] Final build and archive

---

## VII. Privacy & Ethical Considerations

### Data Security

- **Never commit raw data to version control**
  - Add to `.gitignore`: `/data/raw/*`, `/data/processed/*`
- Store original exports in encrypted drive
- Use environment variables for sensitive identifiers

### Consent

- If this involves another person's data, discuss the project with them
- Offer anonymization for any sharing
- Consider creating a "shared view" vs "personal reflection" mode

### Emotional Safety

- This project will surface difficult periods
- Build in "pause points" where you can stop if it becomes overwhelming
- Consider adding a "gratitude log" section to balance hard memories

---

## VIII. Future Enhancements

### Advanced Features

- **Sentiment Analysis**: Use NLP to detect emotional tone shifts (requires message content)
- **Topic Modeling**: Cluster conversations by themes
- **Voice Analysis**: Transcribe and analyze voice messages
- **Photo Timeline**: Integrate media thumbnails (privacy-safe)
- **Comparative Years**: "This year vs last year" view
- **Prediction Mode**: Playful "future projection" based on patterns

### Interactive Elements

- **Search**: Find specific date ranges or events
- **Filter**: Toggle platforms, message types
- **Export**: Generate PDF report or video walkthrough
- **Music**: Option to add background soundtrack
- **Collaborative Annotations**: If shared, both people can add memories

---

## IX. Resources & Inspiration

### Similar Projects

- [Dear Data](http://www.dear-data.com/) by Giorgia Lupi & Stefanie Posavec
- [A Year in Data](https://yearindata.com/) - personal analytics
- Nicholas Felton's Annual Reports

### Visualization Galleries

- [Observable](https://observablehq.com/) - D3.js examples
- [VisX Gallery](https://airbnb.io/visx/gallery)
- [Data Viz Project](https://datavizproject.com/)

### Reading

- _The Visual Display of Quantitative Information_ by Edward Tufte
- _Observational Aesthetics_ by Giorgia Lupi
- _Data Feminism_ by Catherine D'Ignazio & Lauren Klein

---

## X. Getting Started

### Prerequisites

```bash
# Python 3.9+
python --version

# Node.js 18+
node --version
```

### Quick Start

```bash
# 1. Clone or create project directory
mkdir relationship-timeline && cd relationship-timeline

# 2. Set up Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install pandas pytz orjson python-dateutil

# 3. Create Next.js app
npx create-next-app@latest frontend --typescript --tailwind --app

# 4. Install visualization libraries
cd frontend
npm install @visx/scale @visx/shape @visx/axis framer-motion d3

# 5. Export your data and start processing!
```

### First Steps

1. Export WhatsApp chat (Settings > More > Export Chat)
2. Request Instagram data download (takes 24-48 hours)
3. Create `timezone_config.json` with your location history
4. Run the Python processor
5. Build your first visualization

---

## License & Usage

This is a deeply personal project. The code structure and approach are yours to use, but the data and narrative belong to you and your relationships. Treat them with care.

---

**Remember:** The goal is not to quantify love, but to see the quiet architecture of connection. The data is just the scaffold; the story is yours to tell
output: 'export', // Static export
images: {
unoptimized: true // For static export
}


````

**Build Command:**
```bash
npm run build
# Output: /out directory with static files
````

**Benefits:**

- Can be hosted on GitHub Pages, Netlify, or any static host (free)
- Can be put on a USB drive and work in 50 years (as long as browsers exist)
- It is a self-contained artifact
- No server costs, no maintenance

**Deployment Options:**

1. **GitHub Pages**: Free, version-controlled
2. **Vercel**: Zero-config deployment
3. **Local Archive**: Burn to USB/external drive with index.html

---

## - **Sans-serif** for data labels (e.g., Inter, Work Sans)

**Project Structure:**

```
/project-root
├── /data
│   ├── /raw              # Original exports
│   ├── /processed        # Cleaned JSON files
│   └── annotations.json
├── /scripts
│   └── process_data.py   # Python processing script
├── /public
│   └── /data             # Yearly JSON chunks
├── /src
│   ├── /components
│   │   ├── StreamGraph.tsx
│   │   ├── HeatmapClock.tsx
│   │   ├── BurstHighlight.tsx
│   │   └── ScrollSection.tsx
│   ├── /lib
│   │   └── dataLoader.ts
│   └── /app
│       └── page.tsx
└── /config
    ├── timezone_config.json
    └── theme.ts
```

###

**Anonymization (Optional):** If you ever want to share a screenshot, have a "Redact" mode that blurs specific timestamps or names.

```python
def anonymize_data(df, mode='full'):
    if mode == 'full':
        df['sender_id'] = df['sender_id'].map({'person_a': 'Person A', 'person_b': 'Person B'})
        df['content'] = '[REDACTED]'
    return df
```

### # Analyze: time distribution, topic shifts, media usage

```

**Visualization Ideas:**
- **Fireworks effect**: Particles bursting from the timeline
- **Zoom in**: Expand that day into hour-by-hour detail
- **Word cloud**: Most common words/topics for that day (if analyzing content)

---

## IV. Technical Stack & Longevity

###     "emotion": "positive"
  }
]
```

**UI Integration:** As you scroll past the data visualization for Nov 2023, the text gently fades in, overlaying the chart or sitting beside it. The data explains what happened; the text explains why.

**Annotation Types:**

- **milestone**: Major life events
- **context**: Explaining patterns
- **memory**: Personal reflections
- **quote**: Special messages (anonymized if needed)

### transition={{ duration: 0.8 }}

    >
      {/* Visualization here */}
    </motion.section>

);
}

```

###
Section 1: The Beginning (Data is sparse, tentative).

Section 2: The Deepening (Data density increases).

Section 3: The Conflict/Distance (Data might thin out—context is key here).

2. The Annotation System (The "Soul")

Technical: A content.json or Markdown file where you map date ranges to text.

{ "date": "2023-11-12", "type": "marker", "text": "We moved into the new apartment. The wifi wasn't set up, hence the silence." }

UI Integration: As you scroll past the data visualization for Nov 2023, the text gently fades in, overlaying the chart or sitting beside it. The data explains what happened; the text explains why.

3. The "Burst" Highlights

Identify the top 5 "highest velocity" days in your history (most messages exchanged).

Create special visual "chapters" for these.

Prompt: "On this Tuesday, we sent 400 messages. This was the day we planned the road trip."

IV. Technical Stack & Longevity
1. The Backend (Python)

Pandas: For handling the time-series data.

Export: Process everything into a compressed JSON or distinct chunks (by year) so the frontend loads fast.

Anonymization (Optional): If you ever want to share a screenshot, have a "Redact" mode that blurs specific timestamps or names.

2. The Frontend (Next.js + Vis)

Libraries:

VisX (by Airbnb) or D3.js: These are lower-level than Recharts. They allow you to create custom, artistic shapes (like soft blobs or stream graphs) rather than corporate-looking bars.

Framer Motion: For the scroll animations. The data should "grow" as you scroll into view.

3. Storage as Archive

This shouldn't depend on a database server that costs money.

Static Site Generation (SSG): Build the site once. The output is just HTML/JS/JSON. You can put this on a USB drive, and it will work in 50 years (as long as browsers exist). It is a self-contained artifact.

V. A Final "Feature" Idea: The Silence
One of the most powerful things data can show is presence during absence.

Consider a visualization called "The Tether." When one person is traveling or distant, visualize the messages not as a stream, but as "pings." Show that even when the physical distance was maxed out, the digital signal remained. A single message sent at 3 AM across timezones can be visually represented as a bright, glowing point in a dark field—a lighthouse.
```
