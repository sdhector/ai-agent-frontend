#!/bin/bash

PID=$(ps aux | grep "[s]dkmanager.*platform-tools" | awk '{print $2}' | head -1)

if [ -z "$PID" ]; then
    echo "❌ No installation process found"
    exit 1
fi

echo "=== Checking Process $PID ==="
echo ""

# Check process status
echo "📊 Process Status:"
ps -p $PID -o pid,stat,etime,cmd 2>/dev/null || echo "  Process not found"
echo ""

# Check if it's waiting for input (T state)
STATE=$(ps -p $PID -o stat= 2>/dev/null)
if [ "$STATE" = "T" ]; then
    echo "⚠️  WARNING: Process is STOPPED (waiting for input?)"
elif [[ "$STATE" == *"S"* ]] || [[ "$STATE" == *"R"* ]]; then
    echo "✅ Process is RUNNING"
else
    echo "ℹ️  Process state: $STATE"
fi
echo ""

# Check what files the process has open
echo "📂 Process file descriptors:"
ls -l /proc/$PID/fd/ 2>/dev/null | head -10 || echo "  Cannot access"
echo ""

# Check for any log files
echo "📝 Checking for log files:"
find ~/Android/Sdk -name "*.log" -o -name "*error*" 2>/dev/null | head -5 || echo "  No log files found"
echo ""

# Try to see if we can get any output
echo "💡 To see live output:"
echo "   1. Open WSL Ubuntu terminal: wsl -d Ubuntu"
echo "   2. The process is attached to terminal pts/3"
echo "   3. You may need to check that terminal or restart the installation"
echo ""

