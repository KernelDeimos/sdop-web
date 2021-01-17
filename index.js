const { Module } = require('sdop');

module.exports = new Module({
  documentation: `
    SDOP Web registers components for web programming.
  `
}, c => {
  var r = c.registry;

  console.log('Loading definitions...');
  c = require('./definitions/index')(c);
  console.log('Loading server data...');
  c = require('./server/index')(c);
  console.log('Loading presets...');
  c = require('./presets/index')(c);
  console.log('Loading conversions...');
  c = require('./conversions/index')(c);

  return c;
});
