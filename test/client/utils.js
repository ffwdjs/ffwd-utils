(function (root, factory) {
  /* global define: false, exports: false, require: false */
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['chai', 'chai-spies'], factory);
  }
  else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('chai'), require('chai-spies'));
  }
  else {
    // // Browser globals (root is window)
    // root.FFWD = root.FFWD || {};
    // root.FFWD.utils = factory(root.chai, root._.string);
  }
}(this, function (chai, chaiSpies) {
  'use strict';
  var testUtils = chai;

  testUtils.use(chaiSpies);

  testUtils.stackPutz = function(err) {
    console.warn((''+ err.stack).split(process.cwd()).join(''));
  };

  testUtils.toNiceJSON = function(obj) {
    return JSON.stringify(obj, null, 2);
  };

  testUtils.wrapTry = function(fn) {
    console.info('try', fn);
    try {
      fn();
    }
    catch(err) {
      console.info(err.stack);
      throw err;
    }
  };

  return testUtils;
}));
