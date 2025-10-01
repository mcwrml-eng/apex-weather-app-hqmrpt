
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Ensure proper source extensions
  config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];

  // Add CSS to asset extensions
  config.resolver.assetExts = ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ttf', 'otf', 'woff', 'woff2', 'css'];

  // Custom resolver to handle CSS imports
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // If the module is a CSS file, return an empty module
    if (moduleName.endsWith('.css') || moduleName.endsWith('.module.css')) {
      return {
        filePath: path.resolve(__dirname, 'utils/empty.js'),
        type: 'sourceFile',
      };
    }

    // Otherwise, use the default resolver
    return context.resolveRequest(context, moduleName, platform);
  };

  return config;
})();
