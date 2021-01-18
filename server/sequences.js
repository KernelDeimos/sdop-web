const { Module } = require('sdop');
Route = require('route-parser');
var http = require('http');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('Sequence', 'sdop.web.RequestHandler', [
    {
      name: 'RouterFromConfig',
      fn: c => {
        var router = r.get('sdop.web.Router', c.config.router);
        return router(c);
      }
    },
    {
      name: 'Page404FromConnfig',
      fn: c => {
        if ( c.request.handled ) return c;
        console.log(r.get('sdop.web.Handler', c.config.handler404));
        r.get('sdop.web.Handler', c.config.handler404)(c);
        return c;
      }
    },
    {
      name: 'ResponseEnd',
      fn: c => {
        c.request.res.end();
        return c;
      }
    }
  ]);

  r.put('Sequence', 'sdop.web.ServerBoot', [
    {
      name: 'server.create',
      fn: c => {
        var server = http.createServer((req, res) => {
          var seq = r.get('sdop.web.ConfigRunnable', c.config.requestHandler);
          var rc = {
            ...c,
            request: { req: req, res: res, handled: false },
          };
          seq(rc, c.config);
        });

        return {
          ...c,
          httpServer: server,
        };
      }
    },
    {
      name: 'server.launch',
      fn: c => {
        c.httpServer.listen(c.config.port);
        return c;
      }
    }
  ])

  return c;
});
