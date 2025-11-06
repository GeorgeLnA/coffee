# Deployment Checklist

Use this checklist to ensure all your local changes are pushed to production before deploying.

## Quick Verification Steps

### 1. Check Current Status
```bash
git status
```
✅ Should show: "nothing to commit, working tree clean"

### 2. Verify Branch
```bash
git branch
```
✅ Should be on `1.3` (production branch)

### 3. Check for Unpushed Commits
```bash
git log origin/1.3..HEAD --oneline
```
✅ Should show: (empty - no output)

### 4. Verify Everything is Pushed
```bash
git status -sb
```
✅ Should show: "Your branch is up to date with 'origin/1.3'"

## Automated Verification

### Windows (PowerShell)
```powershell
.\sync-to-production.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

## Manual Sync Process

If you have uncommitted changes:

1. **Stage all changes:**
   ```bash
   git add -A
   ```

2. **Commit with descriptive message:**
   ```bash
   git commit -m "Description of your changes"
   ```

3. **Push to production branch:**
   ```bash
   git push origin 1.3
   ```

## Important Notes

- **Production branch:** `1.3` (this is what Netlify deploys from)
- **Development branch:** `1.3` (same branch for simplicity)
- **Main branch:** `main` (backup/archive)

## After Pushing

1. Check Netlify dashboard for deployment status
2. Wait for build to complete (usually 2-5 minutes)
3. Clear browser cache or hard refresh (Ctrl+F5) to see changes
4. Verify changes on production domain

## Common Issues

### Changes not showing on domain?
- ✅ Check Netlify deployment logs
- ✅ Verify branch is `1.3` in Netlify settings
- ✅ Clear browser cache
- ✅ Check if build completed successfully

### Uncommitted changes?
- ✅ Run `git add -A` then `git commit -m "message"`
- ✅ Then `git push origin 1.3`

### Unpushed commits?
- ✅ Run `git push origin 1.3`

