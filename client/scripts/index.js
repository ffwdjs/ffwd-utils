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
  _.str.ucFirst = function(str) {
    return str[0].toUpperCase() + str.slice(1);
  };

  _.mixin(_.str);

  /**
   * Utility to get a value deep in a object.
   *
   * @param {Object} obj          - an object to dig in
   * @param {string} varPath      - the path at which the value is searched
   * @param {*} newValue          - new value at the path, will not throw errors if not undefined
   * @param {*} newValue          - new value at the path, will not throw errors if not undefined
   * @returns {*}
   * @throws an error telling that the value can not be found at the specified path
   */
  utils.atPath = function(obj, varPath, newValue, splitter) {
    var paths = varPath.split(splitter || utils.atPath.splitter || '.'), current = obj, i, val, name, set, setNow;
    if (varPath.slice(-7) === '.active') {
      console.info('obj', obj);
    }

    if (!varPath) {
      throw new Error('Missing argument, `obj` and `path` are required.');
    }

    for (i = 0; i < paths.length; ++i) {
      name = paths[i];
      val = current[name];
      setNow = paths.length - i === 1;
      // if (varPath.slice(-7) === '.active') {
      //   console.info('active', varPath, val, setNow);
      // }

      if (_.isUndefined(val)) {
        if (set) {
          throw new Error('The path "'+ varPath +'" can not be accessed.');
        }

        if (setNow) {
          current[name] = newValue;
          return obj;
        }

        current[name] = val || {};
        current = current[name];
      }
      else {
        current = val;
      }
    }

    return set ? obj : current;
  };

  utils.weightened = function(obj) {
    var copy = [];
    var returned = {};

    _.each(obj, function(o, k) {
      copy.push({
        weight: (10000000 + (o.weight || 0)),
        key: k
      });
    });


    var vals = copy.sort(function(a, b) {
      return a.weight - b.weight;
    });
    var keys = _.pluck(vals, 'key');

    _.each(keys, function(k) {
      returned[k] = obj[k];
    });

    return returned;
  };

  _.mixin({
    weightened: utils.weightened,
    atPath: utils.atPath
  });

  return utils;
}));
