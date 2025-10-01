
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper source extensions
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];

// Ensure proper asset extensions
config.resolver.assetExts = ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ttf', 'otf', 'woff', 'woff2'];

module.exports = config;
