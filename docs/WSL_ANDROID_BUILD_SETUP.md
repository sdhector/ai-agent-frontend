# WSL Android Build Setup Guide

This guide will help you set up a Linux build environment in WSL to build Android APKs locally, avoiding EAS build limits.

## Prerequisites

✅ **WSL 2 with Ubuntu** (already installed)

---

## Step 1: Update WSL and Install Base Dependencies

Open WSL terminal and run:

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y \
    curl \
    git \
    unzip \
    openjdk-21-jdk \
    build-essential \
    libc6-dev \
    libstdc++6 \
    zlib1g-dev \
    libncurses5-dev \
    libncursesw5-dev \
    python3 \
    python3-pip

# Verify Java installation
java -version
# Should show: openjdk version "21.x.x"
```

---

## Step 2: Install Android SDK and NDK

### Option A: Using Android Studio Command Line Tools (Recommended)

```bash
# Create Android SDK directory
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk

# Download command line tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
rm commandlinetools-linux-11076708_latest.zip

# Set environment variables (add to ~/.bashrc)
echo '' >> ~/.bashrc
echo '# Android SDK' >> ~/.bashrc
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools/bin' >> ~/.bashrc

# Reload environment
source ~/.bashrc

# Accept licenses and install required packages
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"

# Verify installation
sdkmanager --list_installed
```

### Option B: Manual NDK Installation (if Option A fails)

```bash
# Download NDK directly
cd ~/Android/Sdk
wget https://dl.google.com/android/repository/android-ndk-r27c-linux.zip
unzip android-ndk-r27c-linux.zip
mv android-ndk-r27c android-ndk-r27.1.12297006
rm android-ndk-r27c-linux.zip
```

---

## Step 3: Install Node.js and npm

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install EAS CLI globally
sudo npm install -g eas-cli
```

---

## Step 4: Set Up Project in WSL

```bash
# Navigate to your project (WSL can access Windows drives at /mnt/)
cd /mnt/d/projects/ai-agent-frontend

# Install dependencies
npm install --legacy-peer-deps

# Verify worklets is installed
npm list react-native-worklets
```

---

## Step 5: Configure Build Environment

Create or update `~/.bashrc` with Android environment variables:

```bash
# Add to ~/.bashrc
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/27.1.12297006
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin
```

Reload: `source ~/.bashrc`

---

## Step 6: Generate Native Android Project

```bash
# From project root in WSL
cd /mnt/d/projects/ai-agent-frontend

# Clean and regenerate Android project
npx expo prebuild --platform android --clean
```

---

## Step 7: Build APK

```bash
# Navigate to android directory
cd android

# Build release APK
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Troubleshooting

### Issue: "sdkmanager: command not found"
**Solution**: Ensure `ANDROID_HOME` and PATH are set correctly, then reload:
```bash
source ~/.bashrc
```

### Issue: "NDK not found"
**Solution**: Verify NDK installation:
```bash
ls -la $ANDROID_HOME/ndk/
```

### Issue: "Java not found"
**Solution**: Verify Java installation and JAVA_HOME:
```bash
which java
echo $JAVA_HOME
```

### Issue: Permission denied on gradlew
**Solution**: Make gradlew executable:
```bash
chmod +x android/gradlew
```

### Issue: Build fails with C++ errors
**Solution**: Ensure NDK 27.1.12297006 is installed:
```bash
sdkmanager "ndk;27.1.12297006"
```

### Issue: Path too long errors
**Solution**: WSL handles long paths better than Windows, but if issues persist:
```bash
# Use shorter path in WSL
mkdir -p ~/projects
# Copy project to ~/projects/ai-agent-frontend
```

---

## Quick Build Script

Create `build-apk.sh` in project root:

```bash
#!/bin/bash
set -e

echo "🔧 Setting up environment..."
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/27.1.12297006
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🏗️  Regenerating native project..."
npx expo prebuild --platform android --clean

echo "🔨 Building APK..."
cd android
./gradlew assembleRelease

echo "✅ Build complete! APK location:"
echo "   android/app/build/outputs/apk/release/app-release.apk"
```

Make executable: `chmod +x build-apk.sh`

Run: `./build-apk.sh`

---

## Advantages of WSL Build

✅ **No EAS build limits** - Build as many times as needed  
✅ **Faster iteration** - No upload/download time  
✅ **Linux environment** - Avoids Windows-specific C++ linking issues  
✅ **Full control** - Debug build issues locally  
✅ **Cost savings** - Free local builds vs EAS quotas  

---

## Next Steps

1. Follow steps 1-7 above
2. Test build with `./gradlew assembleRelease`
3. Install APK on device: `adb install app/build/outputs/apk/release/app-release.apk`
4. Set up CI/CD (optional) - Use GitHub Actions with Ubuntu runner

---

## Notes

- **Performance**: WSL 2 has excellent performance, nearly native Linux speed
- **File Access**: Windows files are accessible at `/mnt/c/`, `/mnt/d/`, etc.
- **Git**: Can use Git from WSL or Windows (both work)
- **IDE**: You can continue using VS Code/Cursor on Windows, but build from WSL terminal




