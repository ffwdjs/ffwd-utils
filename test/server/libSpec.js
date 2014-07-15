// var expect = require('expect.js');
var expect = require('chai').expect;
var utils = require('./../utils');



describe('the utilities toolbelt for FFWD', function() {
  var clientLib, serverLib;




  describe('for the client', function() {
    it('has underscore and underscore.string', function() {
      expect(function() {
        clientLib = require('ffwd-utils');
      }).to.not.throw(utils.stackPutz);

      expect(clientLib._).to.be.ok;

      expect(clientLib._.str).to.be.ok;
    });
  });



  it('provides server side specific tools', function() {
    expect(function() {
      serverLib = require('ffwd-utils/server');
    }).to.not.throw(utils.stackPutz);
  });
});
