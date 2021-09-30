const CracoAlias = require('craco-alias');
const { addBeforeLoader, loaderByName } = require('@craco/craco');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const yamlLoader = {
        test: /\.ya?ml$/,
        use: 'js-yaml-loader'
      };
      addBeforeLoader(webpackConfig, loaderByName('file-loader'), yamlLoader);

      return webpackConfig;
    }
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: './src',
        tsConfigPath: './tsconfig.extend.json'
      }
    }
  ]
};
