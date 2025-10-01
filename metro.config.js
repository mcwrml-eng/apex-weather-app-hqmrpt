
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure proper source extensions including CSS
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs', 'css'];

// Ensure proper asset extensions
config.resolver.assetExts = ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ttf', 'otf', 'woff', 'woff2'];

// Use custom transformer for CSS handling
config.transformer = {
  ...config.transformer,
  babelTransformerPath: path.resolve(__dirname, 'metro.transformer.js'),
};

// Ensure node_modules are properly resolved
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Watch for changes in all folders
config.watchFolders = [__dirname];

module.exports = config;
