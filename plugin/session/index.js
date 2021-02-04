const { Module } = require('sdop');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('sdop.web.Jrl', 'sdop.web.session.Session');

  r.put('Middleware', 'sdop.web.session.Middleware', {
    preFunc: c => {
      var nr = c.request;
      var sessionid = (arry => arry.length > 0 ? arry[0] : '')(
        nr.req.headers.cookie && nr.req.headers.cookie.split(';')
          .map(v => v.trim().split('='))
          .filter(v => v[0] == 'sessionid')
          .map(v => v[1]));
      console.log('initial session id', sessionid);
      var session;

      if ( sessionid ) {
        session = r.get('sdop.web.session.Session', sessionid);
      }

      if ( ! session ) {
        sessionid = r.get('Function', 'sdop.uuid.gen4')();
        session = {
          id: sessionid,
          modified_: true,
        };
        r.put('sdop.web.session.Session', sessionid, session);
        nr.res.setHeader('Set-Cookie', `sessionid=${sessionid}`);
      } else {
        session.modified_ = false;
      }

      // Set up session update tracking
      c.session_ = session;
      c.session = new Proxy(session, {
        set: function (o, p, v) {
          o.modified_ = true;
          return o[p] = v;
        }
      })

      return c;
    },
    postFunc: c => {
      if ( c.session_ && c.session_.modified_ ) {
        r.put('sdop.web.session.Session', c.session_.id, c.session_);
      }
      return c;
    },
  });
  return c;
});
