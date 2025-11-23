#!/bin/bash

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

echo "⏳ Waiting for SDK installation to complete..."
echo ""

while true; do
    # Check if installation process is still running
    if ps aux | grep -q "[s]dkmanager.*platform-tools"; then
        echo -n "."
        sleep 5
    else
        echo ""
        echo "✅ Installation process completed!"
        echo ""
        echo "📦 Checking installed packages..."
        sdkmanager --list_installed 2>&1 | grep -E "platform-tools|platforms;android|build-tools|ndk" || echo "  Packages may still be installing..."
        echo ""
        echo "📁 Checking SDK directories..."
        ls -d ~/Android/Sdk/*/ 2>/dev/null | grep -v cmdline-tools || echo "  Directories not found yet"
        break
    fi
done

echo ""
echo "=== Installation Check Complete ==="

