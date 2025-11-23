#!/bin/bash

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

echo "=== Checking SDK Installation Status ==="
echo ""

# Check if process is running
if ps aux | grep -q "[s]dkmanager.*platform-tools"; then
    echo "✅ Installation process is still running"
    exit 0
fi

echo "❌ No installation process found"
echo ""

# Check what's installed
echo "📦 Currently installed packages:"
sdkmanager --list_installed 2>&1 | grep -E "platform-tools|platforms|build-tools|ndk" || echo "  None found"
echo ""

# Check SDK directory
echo "📁 SDK directory contents:"
ls -la $ANDROID_HOME/ 2>/dev/null | grep -v "^total" || echo "  Empty or not found"
echo ""

# Check if we need to accept licenses first
echo "📜 Checking license status..."
if [ ! -f ~/.android/repositories.cfg ]; then
    echo "⚠️  Licenses may not be accepted"
    echo "   Attempting to accept licenses..."
    echo "y" | sdkmanager --licenses > /dev/null 2>&1 || {
        echo "   ⚠️  License acceptance may need manual intervention"
        echo "   Run manually: sdkmanager --licenses"
    }
fi
echo ""

# Now try to install
echo "📥 Starting SDK package installation..."
echo "   This will install: platform-tools, platforms;android-36, build-tools;36.0.0, ndk;27.1.12297006"
echo "   Output will be saved to: ~/sdk-install.log"
echo ""

sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006" 2>&1 | tee ~/sdk-install.log

INSTALL_EXIT=$?

echo ""
if [ $INSTALL_EXIT -eq 0 ]; then
    echo "✅ Installation completed successfully!"
    echo ""
    echo "📦 Installed packages:"
    sdkmanager --list_installed 2>&1 | grep -E "platform-tools|platforms|build-tools|ndk"
else
    echo "❌ Installation failed with exit code: $INSTALL_EXIT"
    echo "   Check ~/sdk-install.log for details"
fi

