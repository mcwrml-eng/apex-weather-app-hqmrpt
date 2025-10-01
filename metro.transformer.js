
const upstreamTransformer = require('@expo/metro-config/build/transformer');

module.exports.transform = async (props) => {
  // Handle CSS files by returning empty module
  if (props.filename.endsWith('.css') || props.filename.endsWith('.module.css')) {
    return upstreamTransformer.transform({
      ...props,
      src: 'module.exports = {};',
    });
  }

  return upstreamTransformer.transform(props);
};
