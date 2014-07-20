(function() {
  'use strict';
  var allTestFiles = [
    // 'chai',
    // 'chai-spies',
    'test-utils'
  ];
  var TEST_REGEXP = /(spec|test)\.js$/i;

  var pathToModule = function(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
  };

  Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
      // Normalize paths to RequireJS module names.
      allTestFiles.push(pathToModule(file));
    }
  });

  var config = {
    paths: {
      'underscore':         'node_modules/underscore/underscore',
      'underscore.string':  'node_modules/underscore.string/lib/underscore.string',
      'ffwd-utils':         'client/scripts/index',

      'chai':               'node_modules/chai/chai',
      'chai-spies':         'node_modules/chai-spies/chai-spies',
      'test-utils':         'test/client/utils'
    },

    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base',

    // urlArgs: ''+ (new Date()).getTime(),

    // dynamically load all test files
    deps: allTestFiles,

    shim: {
      'chai-spies': ['chai'],
      'test-utils': ['chai-spies']
    },

    // we have to kickoff jasmine, as it is asynchronous
    callback: function() {
      /* jshint debug: true */
      // debugger;
      /* jshint debug: false */
      window.__karma__.start();
    }
  };

  // console.info('karma, requirejs configuration', config);

  require.config(config);
}());
