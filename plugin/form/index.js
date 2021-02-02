const { Module } = require('sdop');

module.exports = new Module({}, c => {
  // Defined here
  var r = c.registry;

  r.put('Registrar', 'sdop.web.Form');

  return c;
});
