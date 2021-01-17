const { Module } = require('../constructs/Module');
Route = require('route-parser');

module.exports = new Module(c => {
  var r = c.registry;

  r.put('sdop.web.ConfigSpec', 'sdop.web.RequestHandler', {
    router: { required: true },
  });
  r.put('sdop.web.ConfigSpec', 'sdop.web.ServerBoot', {
    port: { required: true },
    handler: { value: 'sdop.web.RequestHandler' }
  });

  r.put('Sequence', 'sdop.web.RequestHandler', [
    {
      name: 'RouterFromContext',
      fn: c => {
        var r = c.get('registry');
        var router = r.get('sdop.web.Router', c.config.router);
        return router(c);
      }
    },
    {
      name: 'Page404FromContext',
      fn: c => {
        if ( c.get('request').handled ) return c;
        var r = c.get('registry');
        r.get('com.ericdube.Handler', c.config.page404)(c);
        return c;
      }
    },
    {
      name: 'ResponseEnd',
      fn: c => {
        c.get('request').res.end();
        return c;
      }
    }
  ]);

  r.put('Sequence', 'sdop.web.ServerBoot', [
    {
      name: 'server.create',
      fn: c => {
        var server = http.createServer((req, res) => {
          var seq = r.get('Sequence', 'sdop.web.RequestHandler');
          var rc = c.sub({
            request: { req: req, res: res, handled: false },
          });
          seq(Promise.resolve(rc));
        });

        return c.sub({
          httpServer: server,
        });
      }
    },
    {
      name: 'server.launch',
      fn: c => {
        c.httpServer.listen(c.config.port));
        return c;
      }
    }
  ])
});
