var utils = require('./../utils');
var expect = utils.expect;

describe('ffwd-utils/client', function() {
  var clientLib;

  it('does not blow', function() {
    expect(function() {
      clientLib = require('./../../client/scripts');
    }).to.not.throw(utils.stackPutz);
  });

  it('has underscore and underscore.string', function() {
    expect(function() {
      clientLib = require('ffwd-utils');
    }).to.not.throw(utils.stackPutz);

    expect(clientLib._).to.be.ok;

    expect(clientLib._.str).to.be.ok;
  });


  describe('atPath function', function() {
    var obj;
    // before(function() {
      obj = {foo: 'bar', test: {re:'test'}};
    // });


    it('takes an object as first argument', function() {
      expect(clientLib.atPath).to.throw();
    });


    it('takes a string as second argument', function() {
      expect(function() {
        clientLib.atPath(obj);
      }).to.throw();

      expect(function() {
        clientLib.atPath(obj, 'foo');
      }).to.not.throw(utils.stackPutz);

      expect(clientLib.atPath(obj, 'foo')).to.be.equal('bar');

      expect(clientLib.atPath(obj, 'test.re')).to.be.equal('test');
    });

    it('can take a third argument to set a value', function() {
      var verif;
      expect(function() {
        clientLib.atPath(obj, 'f1.f2.f3', 'bar!');
      }).to.not.throw(utils.stackPutz);

      expect(function() {
        verif = obj.f1.f2.f3;
      }).to.not.throw(utils.stackPutz);

      expect(verif).to.be.equal('bar!');
    });
  });
});
