const { Module } = require('sdop');

var index = [
  './TextTypes',
]

module.exports = new Module({}, c => {
  // External files
  for ( let _path of index ) c = require(_path)(c);

  // Defined here
  var r = c.registry;
  r.put('Registrar', 'sdop.web.Handler');
  r.put('Registrar', 'sdop.web.Controller');
  r.put('Registrar', 'sdop.web.ConfigSpec');
  r.put('Registrar', 'sdop.web.ConfigRunnable');

  r.put('Registrar', 'sdop.web.PageMeta');
  r.put('Registrar', 'sdop.web.PageHTML');

  return c;
});
