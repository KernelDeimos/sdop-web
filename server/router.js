const { Module } = require('sdop');
Route = require('route-parser');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('Registrar', 'sdop.web.Router', {
    put: c => {
      var entry = c.value;
      var o; o = (c) => {
        var nr = c.request;
        for ( let router of o.routers ) {
          let matchResult = router.match(nr.req.url)
          if ( matchResult ) {
            nr.handled = true;
            return router.handle(c.sub({ params: matchResult }));
          }
        }
        return c;
      }
      o.routers = [];
      for ( let route in entry ) {
        let parser = new Route(route);
        var router = {};
        router.match = url => parser.match(url);
        router.handle = c => {
          return r.get('sdop.web.Handler', entry[route])(c);
        };
        o.routers.push(router);

      }
      c.value = o;
      return c;
    }
  });

  return c;
});
