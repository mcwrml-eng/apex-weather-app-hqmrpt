
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper source extensions
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];

// Ensure proper asset extensions
config.resolver.assetExts = ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ttf', 'otf', 'woff', 'woff2', 'css'];

// Add custom resolver to handle CSS module imports gracefully
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // If trying to import a CSS file, return an empty module
  if (moduleName.endsWith('.css') || moduleName.endsWith('.module.css')) {
    return {
      type: 'empty',
    };
  }
  
  // Otherwise use default resolution
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
