'use strict';

var fs = require('fs');
var path = require('path');

var utils = module.exports = require('ffwd-utils');
// console.info('utils', utils);
var _ = utils._;

var fetch = utils.fetch = require('fetch').fetchUrl;

/**
 * Loads the modules located in a directory with a file name
 * who does not starts with "_" and is not "index.js"
 *
 * @param {string} dirPath is the path of the directory
 * @return {object<string,*>} an object with the loaded modules and their name as object key
 */
utils.loadDirectory = function(dirPath) {
  var loaded = {};

  _.each(fs.readdirSync(dirPath), function(file) {
    if (file !== 'index.js' && file[0] !== '_') {
      var name = file.split('.').slice(0, -1).join('.');
      loaded[name] = require(path.join(dirPath, file));
    }
  });

  return loaded;
};


utils.loadFeatures = function(features, config) {
  config = config || {};
  var subject = config.subject || {};

  _.each(features, function(feature, name) {
    var conf = _.clone(config[name] || {});
    var callback = feature;

    if (!_.isFunction(callback)) {
      _.extend(conf, feature);
      callback = require(name +'/server');
    }
    
    subject[name.split('ffwd-').pop()] = callback(conf, subject);
  });

  return subject;
};

/**
 * Utility to get the content of the online JSON schema
 * or its locally cached version.
 *
 * @param {string} cachedPath  - The path where the cached version should be
 * @param {miscCallback} done  - The callback handling the 
 */
utils.fetchOrRead = function(cachePath, done) {
  fs.readFile(cachePath, 'utf8', function(err, data) {
    if (err) {
      return fetch('http://schema.rdfs.org/all.json', function(err, meta, body){
        if (err) {
          return done(err);
        }

        fs.writeFile(cachePath, body, 'utf8', function(err) {
          if (err) {
            return done(err);
          }
          utils.fetchOrRead(cachePath, done);
        });
      });
    }

    var json;
    try {
      json = JSON.parse(data.toString());      
    }
    catch (err) {
      return done(err);
    }
    done(null, json);
  });
};