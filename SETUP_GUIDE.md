# 🚀 Setup Guide for New Team Members

This guide will help you get the eBay REN dashboard running on your local machine in under 10 minutes.

## ✅ What You Need

Before starting, make sure you have:
- [ ] Python 3.9 or higher installed ([Download](https://www.python.org/downloads/))
- [ ] Node.js 18 or higher installed ([Download](https://nodejs.org/))
- [ ] Git installed ([Download](https://git-scm.com/))
- [ ] A terminal/command prompt open

**Check your versions:**
```bash
python3 --version   # Should be 3.9+
node --version      # Should be v18+
npm --version       # Should be 8+
git --version       # Any recent version
```

## 📥 Step 1: Clone the Repository

```bash
# Clone the project
git clone https://github.com/YOUR_USERNAME/ebay-ren-v3.git

# Navigate into it
cd ebay-ren-v3
```

## 🔧 Step 2: Start the Backend

```bash
# Go to the backend folder
cd backend

# Install Python packages
pip3 install flask flask-cors pandas requests python-dotenv sqlalchemy psycopg2-binary

# Start the server
python3 app.py
```

✅ **Success!** You should see:
```
 * Running on http://127.0.0.1:5000
 * Database initialized at ebay_ren.db
```

**Keep this terminal window open!**

## 🎨 Step 3: Start the Frontend

Open a **NEW terminal window** (keep the backend running), then:

```bash
# Navigate to the project
cd ebay-ren-v3/frontend

# Install Node packages (this takes 2-3 minutes)
npm install

# Start the dev server
npm run dev
```

✅ **Success!** You should see:
```
   ▲ Next.js 16.2.3
   - Local:        http://localhost:3000
```

## 🌐 Step 4: Open the Dashboard

Open your browser and go to:
```
http://localhost:3000
```

You should see the eBay REN dashboard with the colorful eBay logo and M0 priority boxes!

## 📊 Step 5: Upload Data

The dashboard starts empty. To add roadmap data:

1. **Click "Upload CSV"** in the top right
2. **Select a CSV file** (ask your team for the latest roadmap CSV)
3. **Choose planning cycle** (e.g., "H2 2026")
4. **Click Upload**

The dashboard will refresh and show the roadmap timeline!

## 🎉 You're Done!

The dashboard is now running locally. Here's what you can do:

### Navigate the Dashboard
- **Home Page** (`/`) - Grid view of all M0 priorities
- **Timeline View** (`/timeline`) - Full roadmap timeline with quarters
- Click any M0 box on the home page to filter to that priority

### Use Filters
- **M0 Priorities** - Filter by team
- **Markets** - Filter by geography (Big 3, Remaining Big 4, Global)
- **Planning Cycle** - Switch between H1/H2 or quarterly cycles
- **Roadmap Changes** - Show only New/Deferred/Accelerated items

### View Launch Details
- **Hover** over any launch card to see details
- **Click** to open the full modal with complete information

## 🛑 Stopping the Servers

When you're done:

1. **Backend Terminal:** Press `Ctrl+C`
2. **Frontend Terminal:** Press `Ctrl+C`

## 🔄 Restarting Later

To restart the dashboard:

**Terminal 1 - Backend:**
```bash
cd ebay-ren-v3/backend
python3 app.py
```

**Terminal 2 - Frontend:**
```bash
cd ebay-ren-v3/frontend
npm run dev
```

**Browser:**
```
http://localhost:3000
```

## ❓ Common Issues

### "Command not found: python3"
- **Windows:** Use `python` instead of `python3`
- **Mac/Linux:** Install Python from python.org

### "Port 5000 already in use"
Something else is using port 5000. Fix:
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
```

### "Port 3000 already in use"
Something else is using port 3000. Fix:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

### Frontend shows "Loading..." forever
- Check that backend is running (http://localhost:5000/api/health should work)
- Make sure both servers started without errors

### No data showing on dashboard
- You need to upload a CSV file first!
- Ask your team for the latest roadmap CSV file

## 📞 Need Help?

- Check the main [README.md](README.md) for full documentation
- Ask in the team Slack channel
- Contact the Product Operations team

---

**Happy roadmap viewing! 🎯**
