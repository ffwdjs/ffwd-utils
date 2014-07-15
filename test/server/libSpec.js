var utils = require('./../utils');
var expect = utils.expect;



describe('the utilities toolbelt for FFWD', function() {
  var clientLib, serverLib;


  it('provides server side specific tools', function() {
    expect(function() {
      serverLib = require('ffwd-utils/server');
    }).to.not.throw(utils.stackPutz);
  });


  describe('repositories', function() {

  });


  describe('features related', function() {

  });
});
