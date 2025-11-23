#!/bin/bash

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

echo "=== SDK Installation Status ==="
echo ""

# Check if installation is still running
echo "📊 Current sdkmanager processes:"
ps aux | grep -E 'sdkmanager|SdkManager' | grep -v grep || echo "  No installation processes running"
echo ""

# Check installed packages
echo "📦 Installed SDK packages:"
sdkmanager --list_installed 2>&1 | grep -E "platform-tools|platforms;android|build-tools|ndk" | head -10 || echo "  Checking..."
echo ""

# Check directory structure
echo "📁 SDK directories:"
ls -d ~/Android/Sdk/*/ 2>/dev/null | head -10 || echo "  No packages installed yet"
echo ""

echo "=== Status Check Complete ==="

