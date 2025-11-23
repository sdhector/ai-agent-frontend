#!/bin/bash
set -e

# Set non-interactive mode
export DEBIAN_FRONTEND=noninteractive

echo "🚀 Starting Android Build Environment Setup in WSL Ubuntu"
echo "=========================================================="
echo ""

# Step 1: Update and install base dependencies
echo "📦 Step 1: Updating packages and installing base dependencies..."
sudo apt update
# Skip upgrade to save time - we'll just install what we need
# sudo apt upgrade -y

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

echo "✅ Base dependencies installed"
echo ""

# Verify Java installation
echo "☕ Verifying Java installation..."
java -version
echo ""

# Step 2: Install Android SDK and NDK
echo "📱 Step 2: Installing Android SDK and NDK..."
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk

# Download command line tools
echo "📥 Downloading Android command line tools..."
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q commandlinetools-linux-11076708_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
rm commandlinetools-linux-11076708_latest.zip

echo "✅ Android command line tools installed"
echo ""

# Set environment variables
echo "🔧 Step 3: Configuring environment variables..."
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
    echo '' >> ~/.bashrc
    echo '# Android SDK' >> ~/.bashrc
    echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
    echo 'export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/27.1.12297006' >> ~/.bashrc
    echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
    echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
    echo 'export PATH=$PATH:$ANDROID_HOME/tools' >> ~/.bashrc
    echo 'export PATH=$PATH:$ANDROID_HOME/tools/bin' >> ~/.bashrc
    echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> ~/.bashrc
    echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
    echo "✅ Environment variables added to ~/.bashrc"
else
    echo "⚠️  Environment variables already exist in ~/.bashrc"
fi

# Reload environment
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

echo ""

# Accept licenses and install required packages
echo "📜 Accepting Android licenses and installing SDK packages..."
# Accept all licenses non-interactively
yes | sdkmanager --licenses 2>&1 | grep -v "Warning:" || echo "Licenses accepted"

echo "📥 Installing Android SDK components (this may take a while)..."
# Use --sdk_root to avoid prompts
sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"

echo "✅ Android SDK and NDK installed"
echo ""

# Step 3: Install Node.js (if not already installed or wrong version)
echo "📦 Step 4: Checking Node.js installation..."
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
if [ "$NODE_VERSION" -lt "20" ]; then
    echo "📥 Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js $(node --version) is already installed"
fi

echo ""

# Install EAS CLI
echo "📦 Installing EAS CLI..."
sudo npm install -g eas-cli --yes

echo "✅ EAS CLI installed"
echo ""

# Verify installations
echo "🔍 Verifying installations..."
echo "Java: $(java -version 2>&1 | head -n 1)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "EAS CLI: $(eas --version 2>&1 | head -n 1 || echo 'installed')"
echo ""

# Step 4: Set up project
echo "📁 Step 5: Setting up project..."
PROJECT_PATH="/mnt/d/projects/ai-agent-frontend"
if [ -d "$PROJECT_PATH" ]; then
    cd "$PROJECT_PATH"
    echo "📦 Installing npm dependencies..."
    npm install --legacy-peer-deps
    echo "✅ Project dependencies installed"
else
    echo "⚠️  Project directory not found at $PROJECT_PATH"
    echo "   You can navigate there manually and run: npm install --legacy-peer-deps"
fi
echo ""

echo "=========================================================="
echo "✅ Setup Complete!"
echo ""
echo "📝 Next steps:"
echo "1. Reload your shell environment: source ~/.bashrc"
echo "2. Navigate to your project: cd /mnt/d/projects/ai-agent-frontend"
echo "3. Generate native Android project: npx expo prebuild --platform android --clean"
echo "4. Build APK: cd android && ./gradlew assembleRelease"
echo ""
echo "💡 Tip: You can also use the build-apk.sh script from the guide!"
echo "=========================================================="

