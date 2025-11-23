#!/bin/bash

echo "🔧 Fixing stuck sdkmanager processes and accepting licenses..."
echo ""

# Kill any stuck sdkmanager processes
echo "🛑 Killing stuck sdkmanager processes..."
pkill -f "sdkmanager.*--licenses" 2>/dev/null || echo "  No stuck processes found"
sleep 2

# Set up environment
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

# Accept licenses using a different approach
echo "📜 Accepting Android licenses (non-interactive)..."
# Create a licenses directory if it doesn't exist
mkdir -p ~/.android

# Accept licenses by creating the accepted file
# This is a workaround - normally sdkmanager would do this interactively
echo "24333f8a63b6825ea9c5514f83c2829b04d79eec" > ~/.android/repositories.cfg 2>/dev/null || true

# Try accepting licenses with echo instead of yes
echo "y" | sdkmanager --licenses 2>&1 | tail -20 || {
    echo "⚠️  License acceptance may need manual intervention"
    echo "   You can run this manually in WSL: sdkmanager --licenses"
}

echo ""
echo "✅ License process completed"
echo ""
echo "📥 Now installing SDK packages..."
sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"

echo ""
echo "✅ SDK installation complete!"

