const { Module } = require('sdop');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('sdop.web.ConfigSpec', 'sdop.web.RequestHandler', {
    router: { required: true },
    handler404: { value: 'sdop.web.404' }
  });
  r.put('sdop.web.ConfigSpec', 'sdop.web.ServerBoot', {
    port: { required: true },
    requestHandler: { value: 'sdop.web.RequestHandler' }
  });

  return c;
});
