const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Exclude backend code if it exists in monorepo
config.resolver.blockList = [
  /backend\/.*/,
  /node_modules\/.*\/backend\/.*/
];

module.exports = withNativeWind(config, { input: './global.css' });
