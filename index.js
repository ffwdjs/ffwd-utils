'use strict';

var fs = require('fs');
var path = require('path');

var utils = module.exports = require('./client');
// console.info('utils', utils);
var _ = utils._;

var fetch = utils.fetch = require('fetch').fetchUrl;

/**
 * Modules loading utility
 */
utils.loadDirectory = function(dirPath, exclude) {
  var loaded = {};

  _.each(fs.readdirSync(dirPath), function(file) {
    if (file !== 'index.js' && file[0] !== '_') {
      var name = file.split('.').slice(0, -1).join('.');
      loaded[name] = require(path.join(dirPath, file));
    }
  });

  return loaded;
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