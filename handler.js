const { Module } = require('sdop');

module.exports = new Module(c => {
  var r = c.registry;
  r.put('Registrar', 'sdop.web.Handler');
  r.put('sdop.web.Handler', 'sdop.web.StaticFiles', c => {
    return c;
  })
});
