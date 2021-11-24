const CracoAlias = require('craco-alias');
const purgecss = require('@fullhuman/postcss-purgecss');
const { addBeforeLoader, loaderByName } = require('@craco/craco');

module.exports = {
  // webpack: {
  //   configure: (webpackConfig) => {
  //     const yamlLoader = {
  //       test: /\.ya?ml$/,
  //       use: 'js-yaml-loader'
  //     };
  //     addBeforeLoader(webpackConfig, loaderByName('file-loader'), yamlLoader);

  //     return webpackConfig;
  //   }
  // },
  style: {
    postcss: {
      plugins: [
        purgecss({
          content: ['./src/**/*.html', './src/**/*.tsx', './src/**/*.ts']
        })
      ]
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
