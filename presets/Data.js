const { Module } = require('sdop');

module.exports = new Module({}, c => {
  var r = c.registry;
  r.put('Journal', 'sdop.web.Jrl', {
    file: './sdop_web.jrl'
  });
  return c;
});
