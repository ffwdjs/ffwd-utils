var expect = require('expect.js');
function stackPutz(err) {
  console.warn((''+ err.stack).split(process.cwd()).join(''));
}



describe('the utilities toolbelt for FFWD', function() {
  var client, server;




  describe('for the client', function() {
    it('has underscore and underscore.string', function() {
      expect(function() {
        client = require('ffwd-utils');
      }).not.to.throwError(stackPutz);

      expect(client._).to.be.ok();

      expect(client._.str).to.be.ok();
    });


    describe('atPath function', function() {
      it('takes an object as first argument', function() {
        expect(client.atPath).to.throwError();
      });


      it('takes a string as second argument', function() {
        expect(function() {
          client.atPath({foo: 'bar'});
        }).to.throwError();

        expect(function() {
          client.atPath({foo: 'bar'}, 'foo');
        }).not.to.throwError(stackPutz);
      });
    });
  });



  it('provides server side specific tools', function() {
    expect(function() {
      server = require('ffwd-utils/server');
    }).not.to.throwError(stackPutz);
  });
});