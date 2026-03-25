# Railway.app Deployment Guide for Lulimi Lingo Backend

## Quick Start (5 minutes)

### Step 1: Prepare Your Repository

1. Open terminal in project root
2. Run: `git status` and ensure all changes are committed
3. Push to GitHub: `git push origin main`

### Step 2: Create Railway Account

1. Go to https://railway.app
2. Click "Start for free"
3. Sign in with GitHub (authorize Railway to access your repos)

### Step 3: Create New Project on Railway

1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. Choose your repo: `TheyloveShaka/Lulimi-Lingo`
4. Click "Deploy Now"

### Step 4: Configure Root Directory (Important!)

Since your backend is in `backend_node/`:

1. In Railway dashboard, go to Settings
2. Find "Root Directory"
3. Set it to: `backend_node`
4. Save

### Step 5: Add MongoDB

1. In Railway project, click "+ Add" button
2. Select "Add from Marketplace"
3. Search for "MongoDB"
4. Click to add MongoDB plugin
5. Railway will automatically expose:
   - `MONGODB_URL` environment variable
   - Connection string with proper formatting

### Step 6: Configure Environment Variables

1. In Railway dashboard, go to your service
2. Click "Variables" tab
3. Add your API keys:
   ```
   GEMINI_API_KEY=your-actual-gemini-api-key
   OPENAI_API_KEY=your-actual-openai-api-key (optional)
   ```
4. Save

### Step 7: Deploy

1. Railway will automatically deploy when you push to `main`
2. Watch the deployment logs in real-time
3. Once deployed, you'll get a live URL like: `https://lulimi-backend-production.up.railway.app`

## Production API Endpoints

After deployment, your API will be live at:

- `https://your-railway-url.up.railway.app/api/ai/lesson` - POST
- `https://your-railway-url.up.railway.app/api/ai/quiz` - POST
- `https://your-railway-url.up.railway.app/api/ai/practice` - POST
- `https://your-railway-url.up.railway.app/api/ai/chat` - POST
- `https://your-railway-url.up.railway.app/api/curriculum` - GET
- `https://your-railway-url.up.railway.app/api/auth/signup` - POST
- `https://your-railway-url.up.railway.app/api/auth/login` - POST

## Update Your Frontend

Once you have your Railway URL, update your frontend API calls in `frontend/src/services/`:

Change from:

```javascript
const API_URL = "http://localhost:5000";
```

To:

```javascript
const API_URL =
  process.env.VITE_API_URL || "https://your-railway-url.up.railway.app";
```

## Monitoring & Logs

1. Go to your Railway project
2. Click on the backend service
3. View "Logs" tab for real-time logs
4. View "Metrics" for performance monitoring

## Auto-Deployment

Railway automatically deploys whenever you push to `main` branch. No additional configuration needed!

## Troubleshooting

If deployment fails:

1. Check the logs in Railway dashboard
2. Verify MongoDB is running
3. Check environment variables are set correctly
4. Ensure `backend_node/package.json` exists
5. Run locally first to verify: `npm start`

## Estimated Costs

- Free tier includes: 5GB bandwidth, 100 hours/month runtime
- After free tier: ~$5-10/month for small projects
