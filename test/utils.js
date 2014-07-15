var testUtils = module.exports = require('chai');

testUtils.stackPutz = function(err) {
  console.warn((''+ err.stack).split(process.cwd()).join(''));
};