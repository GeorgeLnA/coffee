#!/bin/bash
# Quick script to verify all changes are committed and pushed

echo "=== Deployment Verification ==="
echo ""

# Check current branch
echo "Current branch:"
git branch --show-current
echo ""

# Check for uncommitted changes
echo "Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  WARNING: You have uncommitted changes!"
    git status --short
    echo ""
else
    echo "✅ No uncommitted changes"
    echo ""
fi

# Check for unpushed commits
echo "Checking for unpushed commits..."
UNPUSHED=$(git log origin/1.3..HEAD --oneline)
if [ -n "$UNPUSHED" ]; then
    echo "⚠️  WARNING: You have unpushed commits!"
    echo "$UNPUSHED"
    echo ""
else
    echo "✅ All commits are pushed"
    echo ""
fi

# Show recent commits
echo "Recent commits (last 5):"
git log --oneline -5
echo ""

# Check if branch is tracking remote
echo "Remote tracking status:"
git status -sb
echo ""

echo "=== Verification Complete ==="
if [ -z "$(git status --porcelain)" ] && [ -z "$(git log origin/1.3..HEAD --oneline)" ]; then
    echo "✅ Everything is synced and ready for deployment!"
else
    echo "⚠️  Please commit and push your changes before deploying"
fi

