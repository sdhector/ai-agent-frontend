#!/bin/bash
# WSL Android Build Environment Setup Script
# Run this script in WSL to set up Android build environment

set -e

echo "🚀 Setting up Android Build Environment in WSL..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Update system
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Step 2: Install base dependencies
echo -e "${YELLOW}Step 2: Installing base dependencies...${NC}"
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

# Verify Java
echo -e "${GREEN}✓ Java installed:${NC}"
java -version

# Step 3: Install Node.js
echo -e "${YELLOW}Step 3: Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Step 4: Create Android SDK directory
echo -e "${YELLOW}Step 4: Setting up Android SDK...${NC}"
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk

# Check if SDK tools already exist
if [ ! -d "cmdline-tools/latest" ]; then
    echo "Downloading Android SDK command line tools..."
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
    unzip -q commandlinetools-linux-11076708_latest.zip
    mkdir -p cmdline-tools/latest
    mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
    rm commandlinetools-linux-11076708_latest.zip
    echo -e "${GREEN}✓ Android SDK tools installed${NC}"
else
    echo "Android SDK tools already installed"
fi

# Step 5: Configure environment variables
echo -e "${YELLOW}Step 5: Configuring environment variables...${NC}"
BASHRC=~/.bashrc

# Check if already configured
if ! grep -q "ANDROID_HOME" "$BASHRC"; then
    echo "" >> "$BASHRC"
    echo "# Android SDK Configuration" >> "$BASHRC"
    echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> "$BASHRC"
    echo "export ANDROID_NDK_HOME=\$ANDROID_HOME/ndk/27.1.12297006" >> "$BASHRC"
    echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin" >> "$BASHRC"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$BASHRC"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> "$BASHRC"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> "$BASHRC"
    echo "export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64" >> "$BASHRC"
    echo "export PATH=\$PATH:\$JAVA_HOME/bin" >> "$BASHRC"
    echo -e "${GREEN}✓ Environment variables added to ~/.bashrc${NC}"
else
    echo "Environment variables already configured"
fi

# Load environment
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/27.1.12297006
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

# Step 6: Install Android SDK components
echo -e "${YELLOW}Step 6: Installing Android SDK components...${NC}"
echo "This may take several minutes..."

# Accept licenses
yes | sdkmanager --licenses > /dev/null 2>&1 || true

# Install required components
sdkmanager "platform-tools" \
    "platforms;android-36" \
    "build-tools;36.0.0" \
    "ndk;27.1.12297006"

echo -e "${GREEN}✓ Android SDK components installed${NC}"

# Step 7: Install EAS CLI
echo -e "${YELLOW}Step 7: Installing EAS CLI...${NC}"
if ! command -v eas &> /dev/null; then
    sudo npm install -g eas-cli
    echo -e "${GREEN}✓ EAS CLI installed${NC}"
else
    echo "EAS CLI already installed: $(eas --version)"
fi

# Step 8: Verify installation
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Verifying installation..."
echo ""

echo "Java:"
java -version
echo ""

echo "Node.js:"
node --version
npm --version
echo ""

echo "Android SDK:"
if [ -d "$ANDROID_HOME" ]; then
    echo "  ANDROID_HOME: $ANDROID_HOME"
    echo "  NDK: $ANDROID_NDK_HOME"
    sdkmanager --list_installed | grep -E "(platform-tools|platforms;android-36|build-tools;36.0.0|ndk;27.1.12297006)" || echo "  Components installed"
else
    echo "  ⚠️  ANDROID_HOME not set"
fi
echo ""

echo -e "${YELLOW}⚠️  Important:${NC}"
echo "1. Restart your WSL terminal or run: source ~/.bashrc"
echo "2. Navigate to your project: cd /mnt/d/projects/ai-agent-frontend"
echo "3. Install dependencies: npm install --legacy-peer-deps"
echo "4. Build APK: cd android && ./gradlew assembleRelease"
echo ""
echo "For detailed instructions, see: WSL_ANDROID_BUILD_SETUP.md"

