# QuoteFlow Pro - Vercel Deployment Guide

This guide will walk you through deploying QuoteFlow Pro to Vercel, a modern platform for static sites and serverless functions.

## 🚀 Prerequisites

- [Vercel Account](https://vercel.com/signup) (free tier available)
- [GitHub](https://github.com) or [GitLab](https://gitlab.com) account
- Node.js 16+ installed locally
- QuoteFlow Pro project ready for deployment

## 📋 Pre-Deployment Checklist

Before deploying, ensure your project:

- [ ] Builds successfully with `npm run build`
- [ ] All dependencies are in `package.json`
- [ ] `.gitignore` excludes build artifacts
- [ ] `vercel.json` is configured correctly
- [ ] Environment variables are documented

## 🌐 Vercel Deployment Steps

### 1. Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "feat: prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. **Visit [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import Git Repository**
   - Select your QuoteFlow Pro repository
   - Vercel will auto-detect it's a React project

### 3. Configure Project Settings

**Project Name**: `quoteflow-pro` (or your preferred name)

**Framework Preset**: Vercel should auto-detect as Vite

**Root Directory**: `./` (leave as default)

**Build Command**: `npm run build`

**Output Directory**: `build`

**Install Command**: `npm install`

### 4. Environment Variables (Optional)

If you have environment variables, add them in the Vercel dashboard:

```env
NODE_ENV=production
REACT_APP_API_URL=your_api_endpoint
```

### 5. Deploy

Click **"Deploy"** and wait for the build to complete.

## ⚙️ Vercel Configuration

The `vercel.json` file handles:

- **Build Configuration**: Specifies build output directory
- **Routing**: Handles SPA routing for React Router
- **Caching**: Optimizes static asset delivery
- **Headers**: Sets appropriate cache headers

### Key Routing Rules

```json
{
  "src": "/(.*)",
  "dest": "/index.html"
}
```

This ensures all routes redirect to `index.html`, enabling client-side routing.

## 🔄 Automatic Deployments

### Branch Deployments

- **Main Branch**: Production deployment
- **Feature Branches**: Preview deployments
- **Pull Requests**: Automatic preview URLs

### Deployment Triggers

- **Push to main**: Automatic production deployment
- **Pull Request**: Preview deployment with unique URL
- **Manual**: Trigger deployment from Vercel dashboard

## 📱 Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain

2. **DNS Configuration**
   - Add CNAME record pointing to Vercel
   - Vercel provides the exact CNAME value

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - HTTPS enabled by default

## 🧪 Testing Deployment

### 1. Verify Build Output

Check that all routes work correctly:

- `/login` - Authentication page
- `/user-dashboard` - User dashboard
- `/procurement-dashboard` - Admin dashboard
- `/quotation-comparison-table` - Quote comparison

### 2. Test Authentication

Use demo credentials:

**Admin**: `admin` / `admin123`
**User**: `user` / `user123`

### 3. Check Performance

- Run Lighthouse audit
- Verify Core Web Vitals
- Test on mobile devices

## 🔧 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check build locally first
npm run build

# Verify dependencies
npm install

# Check Node.js version
node --version
```

#### Routing Issues

- Ensure `vercel.json` has correct routing rules
- Verify React Router configuration
- Check for 404 errors on direct route access

#### Performance Issues

- Enable code splitting in Vite config
- Optimize bundle size with manual chunks
- Use Vercel's Edge Network for global performance

### Debug Commands

```bash
# Local build test
npm run build

# Preview build locally
npm run serve

# Check bundle size
npm run build -- --analyze
```

## 📊 Monitoring & Analytics

### Vercel Analytics

- **Performance Metrics**: Core Web Vitals
- **Real User Monitoring**: Actual user experience
- **Error Tracking**: JavaScript errors and performance issues

### Custom Analytics

Consider adding:

- **Google Analytics**: User behavior tracking
- **Sentry**: Error monitoring
- **Hotjar**: User session recordings

## 🔒 Security Considerations

### Environment Variables

- Never commit sensitive data to Git
- Use Vercel's environment variable system
- Rotate API keys regularly

### Content Security Policy

Add CSP headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

## 🚀 Post-Deployment

### 1. Performance Optimization

- Enable Vercel's Edge Network
- Configure CDN caching
- Monitor Core Web Vitals

### 2. SEO Setup

- Verify meta tags are working
- Check Open Graph tags
- Test social media sharing

### 3. User Testing

- Test on different devices
- Verify all user flows work
- Check accessibility features

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deployment)
- [Tailwind CSS Production](https://tailwindcss.com/docs/optimizing-for-production)

## 🎯 Next Steps

After successful deployment:

1. **Set up monitoring** and analytics
2. **Configure custom domain** if needed
3. **Set up CI/CD** for automated deployments
4. **Plan scaling strategy** for production use

---

**QuoteFlow Pro** is now ready for production deployment on Vercel! 🎉
