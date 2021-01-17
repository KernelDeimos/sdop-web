const { Module } = require('sdop');

module.exports = new Module({}, c => {
  var r = c.registry;
  r.put('Reduce',
    ['Sequence', 'sdop.web.ConfigSpec'],
    'sdop.web.ConfigRunnable',
    c => {
      var seq = c.value[0];
      var conf = c.value[1];
      c.value = (c, config) => {
        config = config || {};
        for ( k in conf ) {
          if ( ! config[k] && conf[k].required ) {
            throw new Error(`missing required config: ${k}`);
          }
          config[k] = config[k] || conf[k]['value'];
        }
        c = { ...c, config: config };
        return seq(c);
      };
      return c;
    }
  );

  return c;
});
