# Dashboard Structure

The application has been transformed into a multi-page dashboard with a sidebar navigation.

## Pages

### 📊 Overview (`/dashboard`)

- Quick stats cards (Total Messages, Platforms, Time Span)
- Stream Graph visualization showing message flow over time
- Conversation statistics breakdown

### 📅 Timeline (`/dashboard/timeline`)

- Chronological view of all messages
- Interactive timeline visualization
- Message history and patterns

### 📈 Statistics (`/dashboard/statistics`)

- Detailed breakdown by sender, platform, and type
- Colorful stat cards showing key metrics
- Message distribution analysis

### ⏰ Activity Patterns (`/dashboard/patterns`)

- Peak hour and most active day insights
- 24-hour heatmap visualization
- Hourly distribution charts

### 🔥 Highlights (`/dashboard/highlights`)

- Busiest day tracking
- Longest conversation streak
- Media sharing statistics
- Conversation bursts visualization
- Fun facts and milestones

### ⚙️ Settings (`/dashboard/settings`)

- Data management instructions
- Import new data guidelines
- Display preferences
- About information

## Features

✨ **Responsive Sidebar Navigation**

- Clean, modern design with gradient background
- Active page highlighting
- Icon-based navigation menu
- Footer with quick stats

🎨 **Modern UI/UX**

- Gradient cards and backgrounds
- Smooth animations with Framer Motion
- Glass-morphism effects
- Responsive grid layouts

📱 **Fully Responsive**

- Works on desktop, tablet, and mobile
- Adaptive layouts for all screen sizes

## Running the Dashboard

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3001` (or 3000 if available)

## Data Requirements

The dashboard requires processed JSON data in `/frontend/public/data/`:

- `all_messages.json` - All message data
- `summary_stats.json` - Statistical summary

Generate this data by running:

```bash
python scripts/process_data.py
# or for sample data
python scripts/add_sample_data.py
```

## Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Heroicons** - Icon library
- **D3 & Visx** - Data visualizations
