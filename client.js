(function (root, factory) {
  /* global define: false, exports: false, require: false */
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['underscore', 'underscore.string'], factory);
  }
  else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('underscore'), require('underscore.string'));
  }
  else {
    // Browser globals (root is window)
    root.FFWD = root.FFWD || {};
    root.FFWD.utils = factory(root._, root._.string);
  }
}(this, function (_, _str) {
  'use strict';
  _.str = _.string || _.str || _str;
  var utils = {
    _: _
  };

  _.str.lcFirst = function(str) {
    return str[0].toLowerCase() + str.slice(1);
  };

  /**
   * Utility to get a value deep in a object.
   *
   * @param obj {Object}          - an object to dig in
   * @param varPath {string} - the path at which the value is searched
   * @returns {*}
   * @throws an error telling that the value can not be found at the specified path
   */
  utils.atPath = function(obj, varPath, separator) {
    'use strict';
    var paths = varPath.split(separator || '.')
      , current = obj
      , i;
    
    for (i = 0; i < paths.length; ++i) {
      if (typeof current[paths[i]] === 'undefined') {
        throw new Error('The path "'+ varPath +'" can not be accessed.');
      } else {
        current = current[paths[i]];
      }
    }

    return current;
  };

  _.mixin({
    atPath: utils.atPath
  });

  return utils;
}));