#!/bin/bash

echo "=== Checking Android SDK Setup Status ==="
echo ""

# Check if sdkmanager processes are running
echo "📊 Running sdkmanager processes:"
ps aux | grep -E 'sdkmanager|java.*SdkManager' | grep -v grep || echo "  None found"
echo ""

# Check SDK directory structure
echo "📁 Android SDK directory structure:"
ls -la ~/Android/Sdk/ 2>/dev/null | head -15 || echo "  SDK directory not found"
echo ""

# Check if command line tools are installed
echo "🔧 Command line tools:"
if [ -d ~/Android/Sdk/cmdline-tools/latest/bin ]; then
    echo "  ✅ Command line tools installed"
    ls ~/Android/Sdk/cmdline-tools/latest/bin/ | head -5
else
    echo "  ❌ Command line tools not found"
fi
echo ""

# Check environment variables
echo "🌍 Environment variables:"
echo "  ANDROID_HOME: ${ANDROID_HOME:-not set}"
echo "  JAVA_HOME: ${JAVA_HOME:-not set}"
echo ""

# Check if sdkmanager is accessible
echo "🔍 sdkmanager location:"
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
which sdkmanager 2>/dev/null && echo "  ✅ sdkmanager found" || echo "  ❌ sdkmanager not in PATH"
echo ""

# Check installed packages
echo "📦 Installed SDK packages:"
if [ -f ~/Android/Sdk/cmdline-tools/latest/bin/sdkmanager ]; then
    export ANDROID_HOME=$HOME/Android/Sdk
    export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
    sdkmanager --list_installed 2>/dev/null | head -20 || echo "  Could not list installed packages"
else
    echo "  sdkmanager not available"
fi
echo ""

echo "=== Status Check Complete ==="

