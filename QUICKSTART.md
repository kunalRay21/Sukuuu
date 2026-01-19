# Quick Reference Guide

## 🚀 Getting Started (5 Steps)

1. **Install Python dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Export and add your data**
   - WhatsApp → `data/raw/whatsapp_chat.txt`
   - Instagram → `data/raw/instagram_messages.json`

3. **Process the data**

   ```bash
   cd scripts
   python process_data.py
   ```

4. **Set up frontend**

   ```bash
   cd frontend
   npm install
   copy ..\data\processed\*.json public\data\
   ```

5. **Run the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## 📁 Key Files to Edit

| File                          | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `config/timezone_config.json` | Your location history for timezone accuracy          |
| `config/annotations.json`     | Add personal notes and memories                      |
| `scripts/process_data.py`     | Customize data processing (line 43 for date formats) |
| `frontend/tailwind.config.js` | Change colors and styling                            |
| `frontend/src/app/page.tsx`   | Main page layout and sections                        |

## 🎨 Customization

**Change colors:**

```javascript
// frontend/tailwind.config.js
colors: {
  'person-a': '#6366f1',  // Your color
  'person-b': '#ec4899',  // Their color
}
```

**Add annotations:**

```json
// config/annotations.json
{
  "date": "2023-01-15",
  "type": "milestone",
  "text": "First day we met"
}
```

## 🔧 Useful Commands

```bash
# Python
python scripts/process_data.py          # Process data
pip freeze > requirements.txt           # Update dependencies

# Frontend
npm run dev                             # Development server
npm run build                           # Production build
npm run export                          # Static export
```

## 📊 Data Files Generated

After processing, you'll find in `data/processed/`:

- `all_messages.json` - Complete dataset
- `data_2023.json` - Year-specific chunks
- `summary_stats.json` - Statistics overview

## 🐛 Common Issues

**"No module named pandas"**
→ `pip install -r requirements.txt`

**"Cannot find module 'next'"**
→ `cd frontend && npm install`

**"No data to visualize yet"**
→ Run processor and copy files to `frontend/public/data/`

**Date parsing errors**
→ Check WhatsApp format in `process_data.py` line 43

## 📦 Building for Archive

```bash
cd frontend
npm run build
```

The `out/` folder contains a self-contained static site that works without a server - perfect for archiving on a USB drive.

## 🔐 Privacy Notes

- All data processing happens locally
- Nothing is uploaded anywhere
- `.gitignore` protects your personal data
- Delete raw exports after processing if desired

## 📖 Full Documentation

See `SETUP.md` for detailed instructions
See `Readme.md` for complete project overview

---

**Status Check:**

- [ ] Python dependencies installed
- [ ] Data exported and placed in `data/raw/`
- [ ] Timezone config updated
- [ ] Data processed successfully
- [ ] Frontend dependencies installed
- [ ] Data copied to `frontend/public/data/`
- [ ] Dev server running
- [ ] Visualizations appearing

**Next:** Add personal annotations and build additional visualizations!
