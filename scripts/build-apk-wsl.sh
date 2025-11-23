#!/bin/bash
# Quick APK Build Script for WSL
# Run this from the project root in WSL

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔨 Building Android APK in WSL...${NC}"
echo ""

# Load Android environment
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/27.1.12297006
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

# Verify environment
if [ ! -d "$ANDROID_HOME" ]; then
    echo -e "${RED}❌ ANDROID_HOME not found. Run setup-wsl-android.sh first.${NC}"
    exit 1
fi

# Get project root (assumes script is in scripts/ directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}📦 Installing/updating dependencies...${NC}"
npm install --legacy-peer-deps

echo ""
echo -e "${YELLOW}🏗️  Regenerating native Android project...${NC}"
npx expo prebuild --platform android --clean

echo ""
echo -e "${YELLOW}🔨 Building release APK...${NC}"
cd android
chmod +x gradlew
./gradlew assembleRelease

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📱 APK Location: $PROJECT_ROOT/android/$APK_PATH"
    echo "📦 APK Size: $APK_SIZE"
    echo ""
    echo "To install on device:"
    echo "  adb install $APK_PATH"
else
    echo -e "${RED}❌ APK not found at expected location${NC}"
    exit 1
fi

