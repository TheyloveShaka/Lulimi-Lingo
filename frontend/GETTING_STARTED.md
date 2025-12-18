# 🚀 Getting Started - Your First Steps

Welcome to the Local Language Learning Web App! This guide will walk you through everything from installation to your first customization.

---

## 🎯 Step-by-Step Getting Started

### ✅ Step 1: Verify Prerequisites

Open PowerShell and check:

```powershell
# Check Node.js (should be 16.0.0 or higher)
node --version

# Check npm (should be 8.0.0 or higher)
npm --version
```

**Don't have Node.js?** Download from https://nodejs.org/

---

### ✅ Step 2: Navigate to Project

```powershell
cd "c:\Users\DELL\Desktop\LLAi project"
```

---

### ✅ Step 3: Enable Scripts (Windows Only)

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

### ✅ Step 4: Install Dependencies

```powershell
npm install
```

⏱️ **Wait time:** 2-3 minutes  
📦 **Downloads:** ~200MB of packages

**You'll see:**

```
added 234 packages, and audited 235 packages in 2m
```

---

### ✅ Step 5: Start Development Server

```powershell
npm run dev
```

**Expected output:**

```
VITE v5.0.8  ready in 347 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.5:3000/
➜  press h to show help
```

🎉 **Your browser should automatically open!**

---

### ✅ Step 6: Explore the App

#### Landing Page (http://localhost:3000)

1. **Hero Section** - Scroll to see animations
2. **Signup Form** - Try filling it out
3. **Info Sections** - Learn about features

#### Dashboard (after signup)

1. **Sidebar** - Click the arrow to collapse/expand
2. **Class Selector** - Choose S1, S2, S3, or S4
3. **Term Selector** - Pick Term 1, 2, or 3
4. **Week Nodes** - Click unlocked weeks (colored circles)
5. **Chatbot** - Click the floating button bottom-right

---

## 🎨 Your First Customization

### Change the App Colors

1. Open `src/styles/global.css`
2. Find the `:root` section
3. Modify these variables:

```css
:root {
  /* Try different colors! */
  --primary-500: #6366f1; /* Change this to #8b5cf6 for purple */
  --accent-green: #10b981; /* Change this to #14b8a6 for teal */
}
```

4. Save the file
5. See instant changes in the browser! ✨

---

### Change the Welcome Message

1. Open `src/pages/Dashboard.jsx`
2. Find this line (around line 32):

```jsx
<h1>Welcome back, Student! 🎉</h1>
```

3. Change it to:

```jsx
<h1>Welcome back, [Your Name]! 🎉</h1>
```

4. Save and see it update instantly!

---

### Add a New Week to S1 Term 1

1. Open `src/data/curriculumData.js`
2. Find the S1 → Term1 → weeks array
3. Add a new week after week 5:

```javascript
{
  id: 6,
  number: 6,
  title: 'Your Custom Topic',
  topics: [
    'Topic 1',
    'Topic 2',
    'Topic 3'
  ],
  learningObjectives: [
    'Learn something awesome',
    'Master this skill',
    'Understand this concept'
  ],
  keywords: ['custom', 'new', 'topic'],
  difficulty: 'beginner',
  estimatedHours: 3,
  progress: 0,
  locked: false  // Set to false so you can click it!
}
```

4. Save and check the dashboard - your new week appears!

---

## 📚 Essential Files to Know

### For Styling

- `src/styles/global.css` - Colors, fonts, animations
- Component `.css` files - Specific component styles

### For Content

- `src/data/curriculumData.js` - All learning content
- `docs/SYLLABUS_STRUCTURE.md` - Full curriculum reference

### For Components

- `src/components/dashboard/LevelLadder.jsx` - Main learning interface
- `src/components/landing/HeroSection.jsx` - Landing page hero
- `src/pages/Dashboard.jsx` - Dashboard layout

### For Understanding

- `README.md` - Project overview
- `PROJECT_SUMMARY.md` - Complete feature list
- `DESIGN_SYSTEM.md` - Visual design guide

---

## 🎯 Common Tasks

### Change Fonts

Edit `index.html`, line 9:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

Replace `Poppins` or `Quicksand` with your preferred Google Font.

Then update `src/styles/global.css`:

```css
--font-primary: "YourFont", sans-serif;
--font-secondary: "YourOtherFont", sans-serif;
```

---

### Add a New Menu Item to Sidebar

Edit `src/components/dashboard/Sidebar.jsx`, line 12:

```javascript
const menuItems = [
  { id: "home", label: "Home", icon: <Home size={22} /> },
  // ... existing items
  { id: "newitem", label: "New Feature", icon: <Star size={22} /> }, // Add this!
];
```

---

### Change Landing Page Headline

Edit `src/components/landing/HeroSection.jsx`, line 61:

```jsx
<h1 className="hero-title">
  Your New Headline Here
  <span className="gradient-text"> The Fun Way</span>
</h1>
```

---

## 🐛 Troubleshooting Your First Issues

### Issue: Port 3000 already in use

**Fix:**

```powershell
# Find what's using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or edit vite.config.js to use different port
```

---

### Issue: Changes not showing up

**Try:**

1. Save the file (Ctrl+S)
2. Check the terminal for errors
3. Hard refresh browser (Ctrl+Shift+R)
4. Restart dev server (Ctrl+C, then `npm run dev`)

---

### Issue: Module not found error

**Fix:**

```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

---

### Issue: Blank white page

**Check:**

1. Terminal for errors
2. Browser console (F12) for errors
3. Make sure `npm run dev` is running

---

## 📖 Learning Path

### Day 1: Familiarize

1. ✅ Install and run the app
2. ✅ Explore all pages
3. ✅ Read README.md
4. ✅ Try one customization

### Day 2: Understand Structure

1. ✅ Read PROJECT_SUMMARY.md
2. ✅ Explore file structure
3. ✅ Open key components in VS Code
4. ✅ Make 2-3 small changes

### Day 3: Deep Dive

1. ✅ Read DESIGN_SYSTEM.md
2. ✅ Study curriculumData.js
3. ✅ Modify existing components
4. ✅ Add new content

### Week 1: Customize

1. ✅ Change color scheme
2. ✅ Add custom content
3. ✅ Modify layouts
4. ✅ Create new pages

### Month 1: Extend

1. ✅ Plan backend integration
2. ✅ Design database schema
3. ✅ Set up API endpoints
4. ✅ Connect frontend to backend

---

## 🎓 Recommended Reading Order

### For Beginners

1. This file (`GETTING_STARTED.md`)
2. `README.md`
3. `SETUP_GUIDE.md` (troubleshooting section)
4. `DESIGN_SYSTEM.md` (to understand colors/fonts)

### For Developers

1. `PROJECT_SUMMARY.md`
2. `FILE_INDEX.md`
3. `curriculumData.js`
4. Component source files

### For Designers

1. `DESIGN_SYSTEM.md`
2. `global.css`
3. Component CSS files
4. Component JSX files (to see structure)

---

## 🛠️ Development Workflow

### Standard Flow

```
1. Start dev server (npm run dev)
2. Open VS Code
3. Make changes to files
4. Save (Ctrl+S)
5. Check browser (auto-refreshes)
6. Check terminal for errors
7. Repeat steps 3-6
```

### Before Closing

```
1. Save all files
2. Stop dev server (Ctrl+C)
3. Commit changes (if using Git)
```

---

## 🎨 Quick Customization Reference

### Change Primary Color

**File:** `src/styles/global.css`  
**Line:** ~7  
**Variable:** `--primary-500`

### Change Page Title

**File:** `index.html`  
**Line:** ~6  
**Element:** `<title>`

### Add Week to Curriculum

**File:** `src/data/curriculumData.js`  
**Section:** Find class → term → weeks array  
**Action:** Add new week object

### Modify Sidebar Menu

**File:** `src/components/dashboard/Sidebar.jsx`  
**Line:** ~12  
**Array:** `menuItems`

### Change Welcome Message

**File:** `src/pages/Dashboard.jsx`  
**Line:** ~32  
**Element:** `<h1>` tag

---

## 📊 Success Checklist

After following this guide, you should be able to:

- [x] Install and run the app
- [x] Navigate all pages
- [x] Understand file structure
- [x] Make basic customizations
- [x] Change colors and fonts
- [x] Add new content
- [x] Fix common issues
- [x] Use hot reload effectively
- [x] Read documentation efficiently
- [x] Plan next steps

---

## 🚀 Next Steps

### Immediate

1. ✅ Complete this getting started guide
2. Explore every feature in the app
3. Read PROJECT_SUMMARY.md
4. Make your first customization

### Short Term (This Week)

1. Customize colors to your preference
2. Add 2-3 custom curriculum weeks
3. Modify landing page text
4. Understand component structure

### Medium Term (This Month)

1. Plan backend architecture
2. Design database schema
3. Set up API structure
4. Research AI integration options

### Long Term

1. Complete backend development
2. Integrate AI for lesson generation
3. Add audio/video features
4. Deploy to production

---

## 💡 Pro Tips

### Tip 1: Use Hot Reload

Save files often - changes appear instantly without refreshing!

### Tip 2: Keep Dev Server Running

Leave `npm run dev` running while you work. Only restart if errors occur.

### Tip 3: Use Browser DevTools

Press F12 to see console errors, inspect elements, and debug.

### Tip 4: Read Terminal Output

The terminal shows helpful errors and warnings - don't ignore them!

### Tip 5: Make Small Changes

Test one change at a time. Easier to debug if something breaks.

### Tip 6: Use VS Code Extensions

Install extensions for React, CSS, and Prettier for better development experience.

---

## 🎯 Your First Goal

**Challenge:** Personalize the app in 5 ways

1. [ ] Change the primary color
2. [ ] Modify the welcome message
3. [ ] Add a custom week to S1
4. [ ] Change the app title in browser tab
5. [ ] Modify a landing page headline

**Time:** 15-20 minutes  
**Difficulty:** Beginner  
**Reward:** You'll understand the basics! 🎉

---

## 📞 Need Help?

### Check These First

1. `SETUP_GUIDE.md` - Troubleshooting section
2. `COMMANDS.md` - Command reference
3. Terminal output - Error messages
4. Browser console (F12) - Runtime errors

### Common Questions

**Q: How do I stop the server?**  
A: Press `Ctrl+C` in the terminal

**Q: How do I restart after making changes?**  
A: Just save the file - hot reload handles it!

**Q: Where do I add new content?**  
A: `src/data/curriculumData.js`

**Q: How do I change colors?**  
A: `src/styles/global.css` - `:root` section

**Q: Can I use this offline?**  
A: Not yet - PWA support is planned for future

---

## 🎉 Congratulations!

You're now ready to start exploring and customizing your Local Language Learning App!

**Remember:**

- 💾 Save often
- 🧪 Experiment freely
- 📚 Read the docs
- 🐛 Debug patiently
- 🎨 Have fun!

---

**Happy Coding! 🚀**

---

**Next Recommended Reading:**

- `PROJECT_SUMMARY.md` - Complete overview
- `DESIGN_SYSTEM.md` - Visual design guide
- `docs/SYLLABUS_STRUCTURE.md` - Curriculum details
