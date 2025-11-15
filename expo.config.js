
module.exports = ({ config }) => {
  return {
    ...config,
    name: 'Grid Weather Pro',
    slug: 'grid-weather-pro',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/natively-dark.png',
    userInterfaceStyle: 'automatic',
    platforms: ['ios', 'android', 'web'],
    splash: {
      image: './assets/images/natively-dark.png',
      resizeMode: 'contain',
      backgroundColor: '#0EA5E9'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.gridweather.pro',
      buildNumber: '1',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/natively-dark.png',
        backgroundColor: '#0EA5E9'
      },
      package: 'com.gridweather.pro',
      versionCode: 1
    },
    web: {
      favicon: './assets/images/final_quest_240x240.png',
      bundler: 'metro'
    },
    plugins: [
      'expo-font',
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#0EA5E9'
        }
      ]
    ],
    scheme: 'gridweather',
    experiments: {
      typedRoutes: true
    }
  };
};
