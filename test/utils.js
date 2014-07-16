var testUtils = module.exports = require('chai');

testUtils.tmp = require('tmp');

testUtils.stackPutz = function(err) {
  console.warn((''+ err.stack).split(process.cwd()).join(''));
};