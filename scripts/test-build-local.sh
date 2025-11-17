#!/bin/bash
# Script to test the build locally and compare with production

set -e

echo "🧪 Testing Build Locally"
echo "========================="
echo ""

cd "$(dirname "$0")/.."

# Step 1: Clean previous build
echo "🧹 Step 1: Cleaning previous build..."
rm -rf dist .expo
echo "✅ Cleaned"
echo ""

# Step 2: Set environment variables (matching production)
echo "🔧 Step 2: Setting environment variables..."
export EXPO_PUBLIC_API_URL="https://ai-agent-backend-tsgdvcezgq-uc.a.run.app"
export EXPO_PUBLIC_APP_NAME="AI Agent"
export EXPO_PUBLIC_APP_VERSION="1.0.0"
export EXPO_PUBLIC_ENV="production"
export NODE_ENV="production"

echo "   EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL"
echo "   EXPO_PUBLIC_ENV=$EXPO_PUBLIC_ENV"
echo "   NODE_ENV=$NODE_ENV"
echo "✅ Environment variables set"
echo ""

# Step 3: Build
echo "🔨 Step 3: Building for production..."
npx expo export --platform web --output-dir dist --clear --max-workers 4
echo "✅ Build completed"
echo ""

# Step 4: Run diagnostics
echo "🔍 Step 4: Running build diagnostics..."
node scripts/diagnose-build.js
echo ""

# Step 5: Start local server
echo "🚀 Step 5: Starting local server..."
echo ""
echo "   The app will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop the server"
echo ""
echo "   📝 Check the browser console for errors"
echo "   📝 Compare with production deployment"
echo ""

npx serve dist -p 3000

