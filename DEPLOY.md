# 🚀 Deploy IPO Analyzer - Live & Shareable

## Quick Deploy Options

### Option 1: Netlify (Recommended - Easiest)

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://www.netlify.com)
   - Sign up/login (free)
   - Drag and drop the `dist` folder
   - OR connect your GitHub repo
   - Your app will be live in seconds!

3. **Custom Domain (Optional):**
   - Netlify provides a free subdomain: `your-app.netlify.app`
   - You can add a custom domain in settings

### Option 2: Vercel (Also Easy)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Your app will be live!

3. **Or use Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Import your project
   - Auto-deploys on every push

### Option 3: GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to repo Settings > Pages
   - Select `gh-pages` branch
   - Your app: `https://username.github.io/repo-name`

### Option 4: Render

1. Go to [render.com](https://render.com)
2. New Static Site
3. Connect your repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy!

---

## For Production Mode (With Backend)

If you want live data, you need to deploy both frontend and backend:

### Backend Deployment

**Option A: Render (Free)**
1. New Web Service
2. Connect repo
3. Root directory: `server`
4. Build: `npm install`
5. Start: `npm start`
6. Get your backend URL

**Option B: Railway**
1. Go to [railway.app](https://railway.app)
2. New Project > Deploy from GitHub
3. Select `server` folder
4. Add environment variables
5. Deploy!

**Option C: Heroku**
1. Install Heroku CLI
2. `cd server`
3. `heroku create your-app-name`
4. `git push heroku main`
5. Set environment variables in dashboard

### Frontend Configuration

After backend is deployed, update frontend:

1. **Create `.env.production`:**
   ```
   VITE_APP_MODE=production
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Deploy frontend** using any method above

---

## Share Your App

### Get Shareable Link

After deployment, you'll get a URL like:
- Netlify: `https://your-app.netlify.app`
- Vercel: `https://your-app.vercel.app`
- GitHub Pages: `https://username.github.io/repo-name`

### Share Options

1. **Direct Link:** Share the URL
2. **QR Code:** Generate QR code for the URL
3. **Embed:** Use iframe to embed in websites
4. **Social Media:** Share on LinkedIn, Twitter, etc.

---

## Build for Production

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Preview the build
npm run preview
```

The built files will be in the `dist` folder.

---

## Environment Variables for Production

### Frontend (.env.production)
```
VITE_APP_MODE=production
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### Backend (server/.env)
```
PORT=3000
ANTHROPIC_API_KEY=your-key-here (optional)
```

---

## Troubleshooting

### Build Fails
- Check Node.js version (v16+)
- Run `npm install` first
- Check for TypeScript/ESLint errors

### App Doesn't Load
- Check browser console for errors
- Verify all assets are loading
- Check CORS settings if using backend

### Routing Issues
- Ensure `netlify.toml` or `vercel.json` has redirect rules
- All routes should redirect to `index.html`

---

## Quick Deploy Commands

```bash
# Build
npm run build

# Deploy to Netlify (if using CLI)
npx netlify deploy --prod --dir=dist

# Deploy to Vercel
vercel --prod
```

---

## Free Hosting Comparison

| Platform | Free Tier | Ease | Best For |
|----------|-----------|------|----------|
| Netlify | ✅ Yes | ⭐⭐⭐⭐⭐ | Static sites |
| Vercel | ✅ Yes | ⭐⭐⭐⭐⭐ | React apps |
| GitHub Pages | ✅ Yes | ⭐⭐⭐⭐ | Open source |
| Render | ✅ Yes | ⭐⭐⭐⭐ | Full stack |
| Railway | ✅ Yes | ⭐⭐⭐⭐ | Backend |

---

## Next Steps

1. ✅ Fix JSX errors (done)
2. ✅ Build the app: `npm run build`
3. ✅ Choose a hosting platform
4. ✅ Deploy and share!

Your app is ready to go live! 🚀

