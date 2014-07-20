describe('ffwd-utils/client', function() {
  'use strict';
  var expect;
  var clientLib;
  var utils;
  before(function() {
    utils = require('test-utils');
    expect = utils.expect;
  });


  it('does not blow', function(done) {
    require(['ffwd-utils'], function(loaded) {
      clientLib = loaded;
      done();
    }, done);
  });


  it('has underscore and underscore.string', function() {
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

  describe('weightened function', function() {
    it('sorts objects based on a "weight" property', function() {
      var sorted, keys;
      var obj = {
        a: {
          name: 'a',
          weight: 1
        },
        b: {
          name: 'b'
        },
        c: {
          name: 'c',
          weight: -1
        }
      };

      expect(function() {
        sorted = clientLib.weightened(obj);
        keys = Object.keys(sorted);
      }).to.not.throw();


      expect(sorted).to.be.an('object');
      expect(sorted.a).to.be.an('object');
      expect(sorted.b).to.be.an('object');
      expect(sorted.c).to.be.an('object');


      expect(keys.indexOf('a')).to.equal(2);
      expect(keys.indexOf('b')).to.equal(1);
      expect(keys.indexOf('c')).to.equal(0);
    });
  });
});
