var expect = require('expect.js');
var utils = require('./../utils');

describe('ffwd-utils/client', function() {
  var clientLib;

  it('does not blow', function() {
    expect(function() {
      clientLib = require('./../../client/scripts');
    }).not.to.throwError(utils.stackPutz);
  });

  it('has underscore and underscore.string', function() {
    expect(function() {
      clientLib = require('ffwd-utils');
    }).not.to.throwError(utils.stackPutz);

    expect(clientLib._).to.be.ok();

    expect(clientLib._.str).to.be.ok();
  });


  describe('atPath function', function() {
    var obj;
    // before(function() {
      obj = {foo: 'bar', test: {re:'test'}};
    // });


    it('takes an object as first argument', function() {
      expect(clientLib.atPath).to.throwError();
    });


    it('takes a string as second argument', function() {
      expect(function() {
        clientLib.atPath(obj);
      }).to.throwError();

      expect(function() {
        clientLib.atPath(obj, 'foo');
      }).not.to.throwError(utils.stackPutz);

      expect(clientLib.atPath(obj, 'foo')).to.be('bar');

      expect(clientLib.atPath(obj, 'test.re')).to.be('test');
    });

    it('can take a third argument to set a value', function() {
      var verif;
      expect(function() {
        clientLib.atPath(obj, 'f1.f2.f3', 'bar!');
      }).not.to.throwError(utils.stackPutz);

      expect(function() {
        verif = obj.f1.f2.f3;
      }).not.to.throwError(utils.stackPutz);

      expect(verif).to.be('bar!');
    });
  });
});
