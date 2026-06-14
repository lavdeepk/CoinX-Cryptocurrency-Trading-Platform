# Vercel Deployment Guide

## Prerequisites
- Vercel account connected to your GitHub repository
- Backend API deployed and accessible

## Deployment Steps

### 1. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`

### 2. Set Environment Variables
**This is critical for the app to work in production:**

In the Vercel Dashboard, go to **Settings → Environment Variables** and add:

```
VITE_API_BASE_URL=https://e-commerce-server-production-0873.up.railway.app
```

Or replace with your actual backend API URL.

### 3. Configure Build Settings
Vercel should auto-detect from `vercel.json`:
- **Build Command**: `cd Frontend-React && npm install && npm run build`
- **Output Directory**: `Frontend-React/dist`
- **Install Command**: (default)

### 4. Deploy
Push to your main branch (or selected deploy branch from settings):
```bash
git push origin main
```

Vercel will automatically build and deploy your changes.

## Troubleshooting

### Landing page shows blank/not loading
1. **Check Environment Variables**: Ensure `VITE_API_BASE_URL` is set in Vercel dashboard
2. **Check Build Output**: Review deployment logs in Vercel dashboard for build errors
3. **API Connection**: Verify your backend URL is correct and the API is running
4. **Clear Cache**: Try a deployment with "Redeploy" (without cache) in Vercel dashboard

### API requests failing
- Ensure backend CORS headers allow requests from your Vercel domain
- Verify `VITE_API_BASE_URL` environment variable is set correctly
- Check network tab in browser dev tools for failed requests

### Routing issues
- The `vercel.json` includes a rewrite rule for SPA routing to `index.html`
- All routes should be handled by React Router

## Redeploying with Cache Clear
If you've made changes and need to force a rebuild:
1. Go to Deployment in Vercel dashboard
2. Click the 3-dot menu on the latest deployment
3. Select "Redeploy"
4. Choose "Yes" to skip the git cache

## Local Testing Before Deployment
```bash
cd Frontend-React
npm install
npm run build
npm run preview
```

This will preview the production build locally at `http://localhost:4173`
