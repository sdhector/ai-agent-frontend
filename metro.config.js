const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude backend code if it exists in monorepo
config.resolver.blockList = [
  /backend\/.*/,
  /node_modules\/.*\/backend\/.*/
];

// Support for CSS (NativeWind)
config.resolver.sourceExts.push('css');

module.exports = config;
