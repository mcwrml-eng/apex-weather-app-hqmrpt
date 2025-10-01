
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxRuntime: 'automatic',
          // Use classic runtime for better compatibility with React 19
          jsxImportSource: 'react',
        }
      ]
    ],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@': './',
          },
        },
      ],
    ],
  };
};
