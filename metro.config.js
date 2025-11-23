const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Disable Expo Router detection - we're using React Navigation
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

// Exclude backend code if it exists in monorepo
config.resolver.blockList = [
  /backend\/.*/,
  /node_modules\/.*\/backend\/.*/
];

// Ensure font assets are properly handled
config.resolver.assetExts = config.resolver.assetExts || [];
if (!config.resolver.assetExts.includes('ttf')) {
  config.resolver.assetExts.push('ttf');
}
if (!config.resolver.assetExts.includes('otf')) {
  config.resolver.assetExts.push('otf');
}

module.exports = withNativeWind(config, { input: './global.css' });
