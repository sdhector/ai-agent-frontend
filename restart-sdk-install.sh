#!/bin/bash
set -e

echo "🛑 Stopping current installation..."
pkill -f "sdkmanager.*platform-tools" 2>/dev/null || echo "  No process to stop"
sleep 2

# Set up environment
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

echo ""
echo "📥 Starting SDK installation with visible output..."
echo "   Log file: ~/sdk-install.log"
echo ""

# Install with output to both terminal and log file
sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006" 2>&1 | tee ~/sdk-install.log

echo ""
echo "✅ Installation complete! Check ~/sdk-install.log for details"

