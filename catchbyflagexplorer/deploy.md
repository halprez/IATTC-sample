# 🚀 GitHub Pages Deployment Guide

This guide will help you deploy the IATTC Tuna Catch Data Explorer to GitHub Pages for free hosting.

## 📋 Prerequisites

- GitHub account
- Your IATTC catch data in JSON format
- Basic familiarity with Git/GitHub

## 🎯 Quick Deployment (5 minutes)

### Method 1: Fork and Upload (Easiest)

1. **Fork this repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOURUSERNAME/iattc-tuna-explorer.git
   cd iattc-tuna-explorer
   ```

3. **Add your data file**:
   ```bash
   mkdir -p data
   # Copy your JSON file to data/CatchByFlagGear2013-2023.json
   cp /path/to/your/data.json data/CatchByFlagGear2013-2023.json
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add IATTC catch data"
   git push origin main
   ```

5. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** tab
   - Scroll to **Pages** section
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

6. **Access your app**:
   - Your app will be available at: `https://YOURUSERNAME.github.io/iattc-tuna-explorer`
   - It may take 5-10 minutes for the first deployment

### Method 2: Create New Repository

1. **Create a new repository** on GitHub
2. **Clone this project** files to your computer
3. **Initialize your repository**:
   ```bash
   git init
   git remote add origin https://github.com/YOURUSERNAME/YOUR-REPO-NAME.git
   ```

4. **Add your data and deploy** (follow steps 3-6 from Method 1)

## 📁 File Structure for Deployment

Ensure your repository has this structure:

```
your-repository/
├── index.html              # ✅ Required
├── styles.css              # ✅ Required  
├── README.md               # ✅ Recommended
├── DEPLOYMENT.md           # ✅ This guide
├── data/                   # ✅ Required
│   └── CatchByFlagGear2013-2023.json  # ✅ Your data file
└── js/                     # ✅ Required
    ├── app.js              # ✅ Required
    ├── dataService.js      # ✅ Required
    ├── chartRenderer.js    # ✅ Required
    ├── filterManager.js    # ✅ Required
    └── tableManager.js     # ✅ Required
```

## 🔧 Configuration for GitHub Pages

### 1. Update Data Path (if needed)

If your data file has a different name, update `js/dataService.js`:

```javascript
// Line ~45 in dataService.js
async loadData(filepath = 'data/YOUR-ACTUAL-FILENAME.json') {
```

### 2. Custom Domain (Optional)

To use a custom domain:

1. **Add CNAME file** to repository root:
   ```
   your-domain.com
   ```

2. **Configure DNS** with your domain provider:
   - Add CNAME record pointing to `YOURUSERNAME.github.io`

3. **Update GitHub Pages settings**:
   - Go to repository Settings > Pages
   - Enter your custom domain
   - Enable "Enforce HTTPS"

### 3. SEO Optimization (Optional)

Add to `<head>` section in `index.html`:

```html
<meta name="description" content="Interactive IATTC tuna catch data explorer">
<meta name="keywords" content="tuna, fisheries, IATTC, conservation, data visualization">
<meta property="og:title" content="IATTC Tuna Catch Data Explorer">
<meta property="og:description" content="Explore tuna catch data from 2013-2023">
<meta property="og:url" content="https://YOURUSERNAME.github.io/iattc-tuna-explorer">
```

## 🛠️ Automation Scripts

### Setup Script (setup.sh)

```bash
#!/bin/bash
# Quick setup script for IATTC Tuna Explorer

echo "🐟 Setting up IATTC Tuna Catch Data Explorer..."

# Create data directory
mkdir -p data

# Check if data file exists
if [ ! -f "data/CatchByFlagGear2013-2023.json" ]; then
    echo "⚠️  Please add your data file to data/CatchByFlagGear2013-2023.json"
    echo "   You can use the sample file as a template."
    cp "data/CatchByFlagGear2013-2023_sample.json" "data/CatchByFlagGear2013-2023.json"
fi

# Test if Python is available for local server
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found. You can run: python3 -m http.server 8000"
elif command -v python &> /dev/null; then
    echo "✅ Python found. You can run: python -m http.server 8000"
fi

# Test if Node.js is available
if command -v node &> /dev/null; then
    echo "✅ Node.js found. You can install live-server: npm install -g live-server"
fi

echo "🎉 Setup complete! Add your data file and start a local server to test."
```

### Deploy Script (deploy.sh)

```bash
#!/bin/bash
# Deployment script for GitHub Pages

echo "🚀 Deploying IATTC Tuna Explorer to GitHub Pages..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please run 'git init' first."
    exit 1
fi

# Check if data file exists
if [ ! -f "data/CatchByFlagGear2013-2023.json" ]; then
    echo "❌ Data file not found. Please add your data to data/CatchByFlagGear2013-2023.json"
    exit 1
fi

# Add all files
git add .

# Commit with timestamp
git commit -m "Deploy IATTC Tuna Explorer - $(date)"

# Push to main branch
git push origin main

echo "✅ Deployment initiated! Check your GitHub Pages URL in a few minutes."
echo "   URL: https://$(git config remote.origin.url | sed 's/.*github.com[:\/]//' | sed 's/.git$//' | sed 's/^.*\///' | sed 's/^/$(git config user.name | tr '[:upper:]' '[:lower:]').github.io\//')"
```

## 🔍 Testing Your Deployment

### Pre-deployment Testing

```bash
# Test locally first
python3 -m http.server 8000
# Open http://localhost:8000

# Check for JavaScript errors in browser console
# Verify all charts load correctly
# Test filtering functionality
# Try data export feature
```

### Post-deployment Verification

1. **Check GitHub Pages URL** works
2. **Verify all functionality**:
   - [ ] Charts render correctly
   - [ ] Filters work properly
   - [ ] Data table displays
   - [ ] Export functionality works
   - [ ] Responsive design on mobile

3. **Performance Check**:
   - [ ] Page loads quickly (< 3 seconds)
   - [ ] Charts render smoothly
   - [ ] No console errors

## 🐛 Common Issues & Solutions

### Issue: "Failed to load data"
**Solution**: 
- Ensure data file path is correct
- Check JSON syntax validity
- Verify file is committed to repository

### Issue: Charts not displaying
**Solution**:
- Check browser console for errors
- Ensure Chart.js CDN is accessible
- Test on different browsers

### Issue: GitHub Pages not updating
**Solution**:
- Wait 5-10 minutes for propagation
- Check Actions tab for build status
- Clear browser cache
- Verify branch settings in Pages configuration

### Issue: HTTPS errors
**Solution**:
- Enable "Enforce HTTPS" in Pages settings
- Ensure all resources use HTTPS URLs
- Check mixed content warnings

## 📊 Performance Optimization

### Data File Size
- Keep JSON file under 10MB for optimal loading
- Consider data aggregation for very large datasets
- Use browser compression (GitHub Pages handles this automatically)

### Loading Speed
- All external dependencies load from CDN
- Images and assets are optimized
- CSS and JS are minified for production

### Caching
- GitHub Pages automatically handles caching
- Use versioning for major updates
- Clear browser cache after deployments

## 🔄 Updating Your Deployment

### Data Updates
```bash
# 1. Replace data file
cp /path/to/new/data.json data/CatchByFlagGear2013-2023.json

# 2. Test locally
python3 -m http.server 8000

# 3. Deploy
git add data/
git commit -m "Update data for $(date +%Y-%m)"
git push origin main
```

### Code Updates
```bash
# 1. Make your changes
# 2. Test thoroughly
# 3. Commit and push
git add .
git commit -m "Update feature: description"
git push origin main
```

## 📈 Analytics (Optional)

Add Google Analytics to track usage:

```html
<!-- Add to <head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎉 Success! Your App is Live

Once deployed, share your IATTC Tuna Catch Data Explorer:

- **URL**: `https://YOURUSERNAME.github.io/repository-name`
- **Share**: Send to colleagues, researchers, conservation groups
- **Contribute**: Consider contributing improvements back to the community

---

**Need help?** Open an issue in the GitHub repository or check the main README.md for troubleshooting guidance.