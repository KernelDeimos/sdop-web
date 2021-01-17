const { Module } = require('sdop');
Route = require('route-parser');

module.exports = new Module({}, c => {
  var r = c.registry;

  // TODO: Can DRY textPut by adding 'Config' registrar, but BinaryRegistrar
  //       should be developed first.
  var textPut = c => {
    if ( typeof c.value == 'string' ) {
      c.value = { text: c.value };
    }
    else if ( (typeof c.value != 'object') || Array.isArray(c.value) ) {
      throw new Error('not supported');
    }
    return c;
  };

  var textConfig = () => ({ put: textPut });

  // Preprocessors
  r.put('Registrar', 'sdop.web.Pug', textConfig());
  r.put('Registrar', 'sdop.web.Sass', textConfig());

  return c;
});
