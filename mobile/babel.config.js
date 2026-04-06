module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
        },
      ],
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@store': './src/store',
            '@api': './src/api',
            '@utils': './src/utils',
            '@theme': './src/theme',
            '@hooks': './src/hooks',
            '@constants': './src/constants',
          },
        },
      ],
    ],
  };
};
