#!/bin/bash

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

echo "=== SDK Installation Progress Monitor ==="
echo ""

# Check if process is running
PID=$(ps aux | grep "[s]dkmanager.*platform-tools" | awk '{print $2}' | head -1)
if [ -n "$PID" ]; then
    echo "✅ Installation process is RUNNING (PID: $PID)"
    echo "   Started at: $(ps -p $PID -o lstart= 2>/dev/null || echo 'unknown')"
    echo "   Runtime: $(ps -p $PID -o etime= 2>/dev/null || echo 'unknown')"
else
    echo "❌ No installation process found"
fi
echo ""

# Check what's been downloaded/installed so far
echo "📁 SDK Directory Contents:"
if [ -d "$ANDROID_HOME" ]; then
    echo "  Total size: $(du -sh $ANDROID_HOME 2>/dev/null | cut -f1)"
    echo ""
    echo "  Directories found:"
    ls -d $ANDROID_HOME/*/ 2>/dev/null | while read dir; do
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        name=$(basename "$dir")
        echo "    📦 $name ($size)"
    done
else
    echo "  SDK directory not found"
fi
echo ""

# Check for specific packages
echo "🔍 Checking for specific packages:"
[ -d "$ANDROID_HOME/platform-tools" ] && echo "  ✅ platform-tools" || echo "  ⏳ platform-tools (not yet)"
[ -d "$ANDROID_HOME/platforms/android-36" ] && echo "  ✅ platforms/android-36" || echo "  ⏳ platforms/android-36 (not yet)"
[ -d "$ANDROID_HOME/build-tools/36.0.0" ] && echo "  ✅ build-tools/36.0.0" || echo "  ⏳ build-tools/36.0.0 (not yet)"
[ -d "$ANDROID_HOME/ndk/27.1.12297006" ] && echo "  ✅ ndk/27.1.12297006" || echo "  ⏳ ndk/27.1.12297006 (not yet)"
echo ""

# Check network activity (if possible)
echo "🌐 Network activity:"
if command -v netstat >/dev/null 2>&1; then
    netstat -an 2>/dev/null | grep -E "ESTABLISHED|TIME_WAIT" | grep -v "127.0.0.1" | wc -l | xargs echo "  Active connections:"
else
    echo "  (netstat not available)"
fi
echo ""

echo "=== Progress Check Complete ==="
echo ""
echo "💡 To see live output, open WSL Ubuntu terminal and check the process there"
echo "   The process is running in terminal pts/3"

