var testUtils = module.exports = {};

testUtils.stackPutz = function(err) {
  console.warn((''+ err.stack).split(process.cwd()).join(''));
};