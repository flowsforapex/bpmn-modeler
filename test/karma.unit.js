var path = require('path');

// var collectTranslations = process.env.COLLECT_TRANSLATIONS;

var browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

process.env.CHROME_BIN = require('puppeteer').executablePath();

var basePath = '../';

var absoluteBasePath = path.resolve(path.join(__dirname, basePath));

var suite = 'test/testBundle.js';

module.exports = function (karma) {
  var config = {
    basePath,

    frameworks: ['mocha', 'sinon-chai', 'webpack'],

    files: [suite],

    preprocessors: {
      [suite]: ['webpack', 'env'],
    },

    reporters: ['progress'],

    browsers,

    browserNoActivityTimeout: 30000,

    singleRun: true,
    autoWatch: false,
    failOnEmptyTestSuite: false,

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.bpmnlintrc$/,
            use: [
              {
                loader: 'bpmnlint-loader',
              },
            ],
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.ttf$/,
            use: ['file-loader'],
          },
        ],
      },
      resolve: {
        mainFields: ['dev:module', 'module', 'main'],
        modules: ['node_modules', absoluteBasePath],
        // fallback: {
        //   util: require.resolve('util/'),
        // },
        fallback: { util: false },
      },
      devtool: 'eval-source-map',
    },
  };

  config.plugins = [].concat(
    config.plugins || ['karma-*'],
    require('./translation-reporter')
  );
  config.reporters = [].concat(config.reporters || [], 'translation-reporter');
  config.envPreprocessor = [].concat(
    config.envPreprocessor || [],
    'COLLECT_TRANSLATIONS'
  );

  karma.set(config);
};
