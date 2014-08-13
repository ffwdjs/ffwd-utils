'use strict';

var fs = require('fs');
var path = require('path');

var utils = module.exports = require('ffwd-utils');
var _ = utils._;

var fetch = utils.fetch = require('fetch').fetchUrl;

var glob = utils.glob = require('glob');
utils.async = require('async');
utils.multiline = require('multiline');

utils.debug = require('debug');
var debug = utils.debug('ffwd-utils');

/**
 * NOOP callback for connect/express requests
 * does nothing.. obviously
 */
utils.noopNext = function(req, res, next) {
  // debug('noop callback for %s', req.url);
  if (next) { next(); }
};




/**
 * find repositories of a project
 * @param  {string} [dir] a base directory (or module name)
 * @param  {string} [done] a base directory (or module name)
 * @return {array}     an array of paths to the directories haviing a repository
 */
utils.repositories = function(dir) {
  var globbing = (_.isString(dir) ? dir +'/' : '');
  globbing = globbing +'node_modules/*/.git';

  function stripGit(str) {
    // return str.split('/').slice(-2)[0];
    return str.split('/.git').shift();
  }

  var done = arguments[arguments.length - 1];
  if (_.isFunction(done)) {
    return glob(globbing, {}, function(err, files) {
      if (err) { return done(err); }
      done(null, _.map(files, stripGit));
    });
  }

  return _.map(glob.sync(globbing, {}), stripGit);
};

utils.readJSON = function(filepath) {
  return JSON.parse(fs.readFileSync(filepath), {encoding: 'utf8'});
};


/**
 * To be used by FFWD projects to get the features of a project
 * @return {Object.<String,String>} name / path object
 */
utils.features = function(moduleName, check) {
  moduleName = moduleName || '';
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
  var pkgPath = path.join(moduleName, 'package.json');
  debug('Features package.json path %s', pkgPath);
  var pkg = utils.readJSON(pkgPath);

  var deps = {};
  for (d in depTypes) {
    type = depTypes[d];

    if (!!pkg[depTypes[d]]) {
      var typeDeps = pkg[depTypes[d]];

      for (name in typeDeps) {
        try {
          depPath = require.resolve(path.join(process.cwd(), 'node_modules', name, 'package.json'));

          var info = utils.readJSON(depPath);
          info = info || {};
          info.depPath = depPath;

          if (check(info)) {
            deps[name] = path.dirname(depPath);
          }
        } catch (err) {
          debug('could not load informations about %s, %s, %s', moduleName, depPath, err.stack);
        }
      }
    }
  }

  return deps;
};




/**
 * Creates a list of minimatch compatible strings
 * @param  {String} wanted     a rule to be append to the path to moduleName
 * @param  {Boolean} globbed   to return globbed results instead of rules
 * @param  {String} moduleName
 * @return {Array}             an array with the minimatch rules
 */
utils.featuresFiles = function(wanted, globbed, moduleName) {
  wanted = wanted || '{client/scripts,server}/**/*.js';
  var files = [];
  debug('utils.featuresFiles', wanted);
  _.each(utils.features(moduleName), function(fPath) {
    var add = [fPath +'/'+ wanted];
    if (globbed) {
      add = utils.glob.sync(fPath +'/'+ wanted);
    }
    files = files.concat(add);
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
  debug('load features %s', Object.keys(features).join(', '));
  config = config || {};
  var subject = config.subject || {};

  _.each(features, function(feature, name) {
    var conf = _.extend({
      // features: features,
      app: config.app
    }, config[name] || {});

    var callback = feature;

    debug('type of %s feature is function? %s', name, _.isFunction(feature));
    // when the feature is not a function,
    // we assume the name of the feature can be used to require and
    // the feature to be a configuration object
    if (!_.isFunction(callback)) {
      _.extend(conf, feature);

      callback = require(name +'/server');
    }

    subject[name.split('ffwd-').pop()] = callback(conf, subject);
  });

  return subject;
};


/**
 * Creates a connect / express callback for requests.
 *
 * @param  {(Function|Function[]|String|String[])}  steps  defines
 * @param  {Express.Application} app                who has not yet started listening
 * @return {Express.requestCallback} who fill execute the steps in one after the other
 */
utils.requestCbBuilder = function(steps, app) {
  debug('building request callback for steps:\n  - %s', steps.join('\n  - '));

  return function(req, res, next) {

    if(_.isFunction(steps)) {
      return steps(req, res, next);
    }
    else if (_.isString(steps)) {
      return (utils.atPath(app.features, steps) || utils.noopNext)(req, res, next);
    }

    debug('running steps %s', steps.join(', '));

    utils.async.series(_.map(steps, function(step, num) {
      if (!_.isFunction(step) && !!step) {
        try {
          step = (utils.atPath(app.features, step) || utils.noopNext);
          debug('-- process step %s', steps[num]);
        }
        catch(err) {
          debug('-- step %s not found error (%s)', steps[num], err.message);
        }
      }

      step = _.isFunction(step) ? step : utils.noopNext;
      return function(cb) {
        // debug('-- next step callback %s', typeof cb);
        step(req, res, cb);
      };
    }), next);
  };
};





/**
 * Utility to get the content of the online JSON schema
 * or its locally cached version.
 *
 * @param {Object|String} config  - A configuration object or a URL
 * @param {String} config.url     - the URL of the content to be fetched
 * @param {Bool} [json]           - set to true, to parse the JSON data,
 *                                  true by default if config.url ends with '.json'
 * @param {String} [config.cache] - a path where the cached file will be stored
 *                                  by default, a name based on the config.url
 * @param {miscCallback} done     - a callback to treat the file
 */
utils.fetchOrRead = function(config, done) {
  if (_.isString(config)) {
    config = {
      url: config
    };
  }

  _.defaults(config, {
    cache: '.fetched-'+ _.slugify(config.url),
    json: config.url.split('.').pop() === 'json'
  });

  fs.readFile(config.cache, 'utf8', function(err, data) {
    if (err) {
      return fetch(config.url, function(err, meta, body){
        if (err) {
          return done(err);
        }

        fs.writeFile(config.cache, body, {
          // encoding: 'utf8'
        }, function(err) {
          if (err) {
            return done(err);
          }
          utils.fetchOrRead(config, done);
        });
      });
    }

    if (!config.json) {
      return data.toString();
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



/**
 * Reads the JSON definition of schema.org
 * @param  {Function} done [description]
 */
utils.fetchSchema = function(done) {
  utils.fetchOrRead('http://schema.rdfs.org/all.json', done);
};


utils.readFeed = function(config, done) {
  var data = {
    _links: {
      self: {
        href: config.url
      }
    },
    _embedded:{
      items: []
    },
    fetched: new Date()
  };

  _.extend(data, config.data);

  utils.fetch(data._links.self.href, function() {
    data.parsedIn = ((new Date()).getTime() - data.fetched.getTime());
    done(null, data);
  });
};
