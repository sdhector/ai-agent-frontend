#!/bin/bash
# Script to check Firebase Hosting logs

set -e

echo "📋 Checking Firebase Hosting Logs"
echo "=================================="
echo ""

cd "$(dirname "$0")/.."

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found"
    echo "   Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "🔐 Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1 || {
    echo "⚠️  Not authenticated with Firebase"
    echo "   Run: firebase login"
    exit 1
}

echo "✅ Authenticated"
echo ""

# Get project ID from .firebaserc
PROJECT_ID=$(node -e "console.log(require('./.firebaserc').projects.default)")

echo "📊 Project: $PROJECT_ID"
echo ""

# Get hosting site name from firebase.json
SITE_ID=$(node -e "console.log(require('./firebase.json').hosting.site)")

echo "🌐 Hosting Site: $SITE_ID"
echo ""

echo "📋 Recent deployment logs:"
echo "   (This will show the last 50 log entries)"
echo ""

# Check deployment history
firebase hosting:channel:list --project "$PROJECT_ID" 2>/dev/null || echo "⚠️  Could not fetch deployment history"

echo ""
echo "💡 To check more detailed logs:"
echo "   1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/hosting"
echo "   2. Check the 'Channels' or 'Deployments' section"
echo ""
echo "💡 To check browser errors:"
echo "   1. Open DevTools in your browser"
echo "   2. Go to Console tab"
echo "   3. Check for JavaScript errors"
echo "   4. Go to Network tab"
echo "   5. Check for failed resource loads (404, 500, etc.)"
echo ""

