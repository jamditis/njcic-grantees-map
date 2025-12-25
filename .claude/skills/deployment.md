---
name: deployment
description: Server deployment, caching, and CI/CD for the NJCIC map
---

# Deployment Skill

## When to Activate

Use when:
- Deploying changes to production
- Debugging caching issues
- Modifying GitHub Actions workflow
- Troubleshooting sync failures
- Updating server configuration

## Architecture

```
GitHub Repo
    ↓ (push)
Nestify Server (WordPress)
    └── /public_html/map/
        ├── index.html
        ├── js/app.js
        ├── data/grantees.json
        ├── sync.php (Airtable PAT here)
        └── .htaccess

GitHub Actions (daily 7am ET)
    ↓ (curl)
sync.php → Airtable API → grantees.json
```

## Server Configuration

**Host**: Nestify (WordPress hosting)
**URL**: https://njcivicinfo.org/map/
**Path**: `/public_html/map/`
**Sync**: `https://njcivicinfo.org/map/sync.php?key=[SECRET]`

### Deployment via FTP

```bash
# Connect to Nestify via FTP client (FileZilla, etc.)
# Host: provided by Nestify
# Navigate to: /public_html/map/

# Upload modified files:
# - index.html
# - js/app.js
# - .htaccess

# NEVER commit sync.php to git (contains Airtable PAT)
```

### After deployment

1. Clear CDN cache if available
2. Hard refresh browser: Ctrl+Shift+R
3. Test sync URL manually
4. Verify grantees.json timestamp updated

## Caching Strategy

### .htaccess configuration
```apache
# HTML: No cache (always fresh)
<FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
</FilesMatch>

# JSON: 5 minutes (cache-busting in app.js overrides)
<FilesMatch "\.(json)$">
    Header set Cache-Control "max-age=300"
</FilesMatch>

# JS/CSS: 1 year (versioned via URL params)
<FilesMatch "\.(js|css)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>

# Service Worker: No cache
<FilesMatch "sw\.js$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
</FilesMatch>
```

### Cache-busting patterns

**For JSON data** (app.js):
```javascript
const cacheBust = new Date().getTime();
fetch(`data/grantees.json?v=${cacheBust}`);
```

**For JS updates** (index.html):
```html
<script src="js/app.js?v=2.1.0"></script>
<!-- Increment version after JS changes -->
```

## GitHub Actions

### Workflow file
`.github/workflows/sync-airtable.yml`:
```yaml
name: Sync Airtable Data

on:
  schedule:
    - cron: '0 12 * * *'  # 12:00 UTC = 7:00 AM ET
  workflow_dispatch:      # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger sync
        run: |
          response=$(curl -s -w "\n%{http_code}" "${{ secrets.SYNC_URL }}")
          http_code=$(echo "$response" | tail -n1)
          if [ "$http_code" != "200" ]; then
            echo "Sync failed: HTTP $http_code"
            exit 1
          fi
          echo "Sync successful"
```

### Secrets

Repository Settings → Secrets → Actions:
- `SYNC_URL`: Full sync URL with secret key

### Manual trigger

1. Go to Repository → Actions
2. Click "Sync Airtable Data"
3. Click "Run workflow"
4. Select branch (main)
5. Click "Run workflow"

## Security Headers

```apache
# .htaccess security
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

## Troubleshooting

### "Sync URL returns 500"

1. **Check Airtable PAT**:
   - Log into Airtable → Account → API
   - Regenerate Personal Access Token if expired
   - Update sync.php on server

2. **Check server logs**:
   - Nestify dashboard → Error Logs
   - Look for PHP errors

3. **Test sync locally**:
   ```bash
   export AIRTABLE_PAT="pat..."
   npm run sync
   ```

### "Changes not appearing"

1. **Check sync ran**:
   - GitHub Actions → Recent runs
   - Verify last run succeeded

2. **Check grantees.json**:
   ```bash
   curl -I "https://njcivicinfo.org/map/data/grantees.json"
   # Check Last-Modified header
   ```

3. **Clear browser cache**:
   - Ctrl+Shift+R (hard refresh)
   - Or DevTools → Network → Disable cache

4. **CDN cache**:
   - May take up to 5 minutes
   - Use `?v=timestamp` parameter

### "GitHub Actions failing"

1. **Check secrets**:
   - Settings → Secrets → Actions
   - Verify SYNC_URL is set

2. **Check workflow syntax**:
   - Actions → Failed run → View logs
   - Look for YAML errors

3. **Manual test**:
   ```bash
   curl -s "https://njcivicinfo.org/map/sync.php?key=[KEY]"
   ```

### "Service Worker serving stale content"

1. **Update SW version**:
   ```javascript
   // sw.js
   const CACHE_NAME = 'njcic-map-v3';  // Increment version
   ```

2. **Clear SW cache**:
   - DevTools → Application → Service Workers → Unregister
   - Or: Clear Site Data

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (serves on localhost:8080)
npm start

# Test sync locally
export AIRTABLE_PAT="pat..."
npm run sync

# Verify output
cat data/grantees.json | head -50
```

## Deployment Checklist

- [ ] Test changes locally
- [ ] Increment app.js version in index.html if JS changed
- [ ] Upload files via FTP
- [ ] Trigger sync if data structure changed
- [ ] Hard refresh and test live site
- [ ] Check mobile view
- [ ] Verify filters work
- [ ] Test keyboard navigation

## Key Files

- `.github/workflows/sync-airtable.yml:1` - CI/CD config
- `.htaccess:1` - Server caching/security rules
- `sw.js:1` - Service worker for offline
- `package.json:1` - npm scripts

---
*Last updated: December 2025 | Applies to: deployment and CI/CD*
