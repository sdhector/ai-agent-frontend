#!/bin/bash
# PWA Deployment Script for AI Assistant Frontend
# This script builds and deploys the PWA to Firebase Hosting

set -e  # Exit on error

echo "🚀 AI Assistant PWA Deployment Script"
echo "======================================"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found"
    echo "Please create .env.production with your production configuration"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not installed"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if Firebase project is configured
if grep -q "your-firebase-project-id" .firebaserc; then
    echo "❌ Error: Firebase project not configured"
    echo "Please update .firebaserc with your Firebase project ID"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🧹 Step 2: Cleaning previous build..."
rm -rf dist

echo ""
echo "🔨 Step 3: Building PWA for production..."
# Load production environment variables
export $(cat .env.production | grep -v '^#' | xargs)
npx expo export:web

echo ""
echo "📊 Step 4: Analyzing build..."
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo "Build size:"
    du -sh dist
    echo ""
    echo "Build contents:"
    ls -lh dist
else
    echo "❌ Error: Build directory not found"
    exit 1
fi

echo ""
echo "🔐 Step 5: Authenticating with Firebase..."
firebase login:ci --no-localhost || firebase login

echo ""
echo "🚀 Step 6: Deploying to Firebase Hosting..."
firebase deploy --only hosting:ai-agent

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "Your PWA is now live at:"
firebase hosting:channel:list | grep -A 1 "live" || echo "Check your Firebase console for the URL"
echo ""
echo "🔍 Next steps:"
echo "1. Visit your PWA and test all functionality"
echo "2. Run Lighthouse audit: npm run audit"
echo "3. Monitor Firebase Console for analytics"
echo ""
