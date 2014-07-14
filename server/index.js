'use strict';

var fs = require('fs');
var path = require('path');

var utils = module.exports = require('ffwd-utils');
// console.info('utils', utils);
var _ = utils._;

var fetch = utils.fetch = require('fetch').fetchUrl;


/**
 * To be used by FFWD projects to get the features of a project
 * @return {Object.<String,String>} name / path object
 */
utils.features = function(moduleName, check) {
  moduleName = moduleName || process.cwd();
  var type;
  var name;
  var depPath;
  var d;
  var depTypes  = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
    'bundleDependencies'
  ];
  
  function featureCheck(info) {
    return (info.keywords || []).indexOf('ffwdfeature') > -1 || info.name.indexOf('ffwd-') === 0;
  }

  check = check || featureCheck;
  var pkg = require(path.join(moduleName, 'package.json'));

  var deps = {};
  for (d in depTypes) {
    type = depTypes[d];

    if (!!pkg[depTypes[d]]) {
      var typeDeps = pkg[depTypes[d]];
      // console.info('wqdswedwedwedewd', moduleName, type, typeDeps);
  
      for (name in typeDeps) {
        try {
          depPath = require.resolve(path.join(name, 'package.json'));

          console.info('wqdswedwedwedewd', depPath);
     
          var info = require(depPath);
          info = info || {};
          info.depPath = depPath;

          if (check(info)) {
            deps[name] = path.dirname(depPath);
          }
        } catch (err) {

        }
      }
    }
  }

  return deps;
};



/**
 * Creates a list of minimatch compatible strings
 * @param  {String} wanted     a rule to be append to the path to moduleName
 * @param  {String} moduleName 
 * @return {Array}             an array with the minimatch rules
 */
utils.featuresFiles = function(wanted, moduleName) {
  wanted = wanted || '/{client/scripts,server}/**/*.js';
  var files = [];

  _.each(utils.features(moduleName), function(fPath, fName) {
    files.push(fPath + wanted);
  });

  return files;
};




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
      var name = file.split('.');
      var ext = name.pop();
      if (ext === 'js') {
        name = name.join('.');
        loaded[name] = require(path.join(dirPath, file));
      }
    }
  });

  return loaded;
};


utils.loadFeatures = function(features, config) {
  // console.trace('DEPRECATE: ffwd-utils/server.loadFeatures');
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