#!/bin/bash
set -e

# Source environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

echo "📜 Accepting Android licenses..."
yes | sdkmanager --licenses 2>&1 | grep -v "Warning:" || echo "Licenses accepted"

echo ""
echo "📥 Installing Android SDK components (this may take 10-20 minutes)..."
sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"

echo ""
echo "✅ Android SDK and NDK installed successfully!"

