
const upstreamTransformer = require('@expo/metro-runtime/transformer');

module.exports.transform = async (props) => {
  // Handle CSS files
  if (props.filename.endsWith('.css') || props.filename.endsWith('.module.css')) {
    return upstreamTransformer.transform({
      ...props,
      src: 'module.exports = {};',
    });
  }

  return upstreamTransformer.transform(props);
};
