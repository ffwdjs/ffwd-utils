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
    before(function(done) {
      done();
    });


    it('is a function', function() {
      expect(serverLib.repositories).to.be.a('function');
    });


    it('is async if the last argument is a function', function(done) {
      serverLib.repositories(function(err, files) {
        expect(err).to.not.be.ok;
        expect(files).to.be.an('array');

        console.info(files);
        done();
      });
    });
  });
});
