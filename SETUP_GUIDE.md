# 🚀 Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (v16.0.0 or higher)

   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

---

## 📦 Installation Steps

### Step 1: Enable Script Execution (Windows PowerShell)

If you encounter execution policy errors, run this command in PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Step 2: Navigate to Project Directory

```powershell
cd "c:\Users\DELL\Desktop\LLAi project"
```

### Step 3: Install Dependencies

```powershell
npm install
```

This will install all required packages:

- react & react-dom (v18.2.0)
- react-router-dom (v6.20.0)
- framer-motion (v10.16.16)
- lucide-react (v0.294.0)
- react-circular-progressbar (v2.1.0)
- vite (v5.0.8)

**Installation time:** Approximately 2-3 minutes depending on your internet speed.

---

## 🎯 Running the Application

### Development Mode

Start the development server with hot reload:

```powershell
npm run dev
```

The application will automatically open in your browser at:

- **URL:** http://localhost:3000
- **Network URL:** Will be displayed in terminal (for mobile testing)

### What to Expect

- Vite dev server starts instantly
- Hot Module Replacement (HMR) enabled
- Changes reflect immediately in browser
- Console shows any errors or warnings

---

## 🏗️ Building for Production

### Create Production Build

```powershell
npm run build
```

This creates an optimized production build in the `dist/` folder:

- Minified JavaScript and CSS
- Optimized assets
- Tree-shaken code
- Ready for deployment

### Preview Production Build

```powershell
npm run preview
```

This serves the production build locally at http://localhost:4173

---

## 🔧 Troubleshooting

### Issue: "npm command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Cannot find module 'vite'"

**Solution:** Run `npm install` again

### Issue: "Port 3000 already in use"

**Solution:**

- Close other apps using port 3000
- Or modify `vite.config.js` to use a different port

### Issue: "Module parse failed"

**Solution:**

- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` folder
- Run `npm install` again

### Issue: PowerShell Execution Policy Error

**Solution:** Run as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📱 Testing on Mobile Devices

1. Start the dev server: `npm run dev`
2. Note the Network URL (e.g., http://192.168.1.5:3000)
3. Ensure mobile device is on the same WiFi network
4. Open the Network URL on your mobile browser

---

## 🎨 Development Tips

### Hot Reload

- Save any file to see changes instantly
- No need to refresh browser

### Component Development

- All components are in `src/components/`
- Use React DevTools for debugging

### Styling

- Global styles in `src/styles/global.css`
- Component-specific CSS alongside components
- CSS variables defined in `:root`

### Icons

- Import from `lucide-react`
- Example: `import { Home, User } from 'lucide-react'`

---

## 📂 File Structure After Installation

```
LLAi project/
├── node_modules/          # Dependencies (created after npm install)
├── dist/                  # Production build (created after npm run build)
├── docs/
│   └── SYLLABUS_STRUCTURE.md
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── package-lock.json      # Created after npm install
├── CHECKLIST.md
├── README.md
└── SETUP_GUIDE.md         # This file
```

---

## 🌐 Browser Compatibility

### Recommended Browsers

- ✅ Chrome (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Edge (v90+)

### Mobile Browsers

- ✅ Chrome Mobile
- ✅ Safari iOS
- ✅ Firefox Mobile
- ✅ Samsung Internet

---

## ⚡ Performance Optimization

### Development Mode

- Fast refresh enabled
- Source maps for debugging
- Detailed error messages

### Production Mode

- Code splitting
- Lazy loading
- Minification
- Asset optimization
- Tree shaking

---

## 🔐 Environment Variables

Currently, no environment variables are required. When adding backend integration:

1. Create `.env` file in root:

```env
VITE_API_URL=http://localhost:5000
VITE_AI_API_KEY=your_api_key_here
```

2. Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📝 Available Scripts

| Script            | Command                   | Description              |
| ----------------- | ------------------------- | ------------------------ |
| `npm run dev`     | Starts dev server         | Development with HMR     |
| `npm run build`   | Creates production build  | Optimized for deployment |
| `npm run preview` | Previews production build | Test before deploying    |

---

## 🚢 Deployment Options

### Vercel (Recommended)

1. Push code to GitHub
2. Import project on Vercel
3. Auto-deploys on git push

### Netlify

1. Drag & drop `dist/` folder
2. Or connect GitHub repo

### GitHub Pages

```powershell
npm run build
# Push dist/ folder to gh-pages branch
```

---

## 📚 Additional Resources

### Documentation

- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

### Project Files

- `README.md` - Project overview
- `CHECKLIST.md` - Development progress
- `SYLLABUS_STRUCTURE.md` - Curriculum data

---

## 💡 Quick Start Summary

```powershell
# 1. Enable scripts (if needed)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 2. Navigate to project
cd "c:\Users\DELL\Desktop\LLAi project"

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:3000
```

---

## ✅ Verification Checklist

After installation, verify:

- [ ] No errors during `npm install`
- [ ] Dev server starts without errors
- [ ] Browser opens automatically
- [ ] Landing page displays correctly
- [ ] Animations are smooth
- [ ] Signup form works
- [ ] Dashboard navigation works
- [ ] Level ladder displays
- [ ] Chatbot opens/closes
- [ ] Responsive on mobile

---

## 🆘 Getting Help

If you encounter issues:

1. **Check console errors** - Browser DevTools (F12)
2. **Check terminal output** - Look for error messages
3. **Clear cache** - Try incognito/private browsing
4. **Reinstall** - Delete `node_modules`, run `npm install`
5. **Check Node version** - Must be v16+

---

**Ready to learn? Run `npm run dev` and start your language journey! 🎓**
