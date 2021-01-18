const { SDOP } = require('sdop')
const dedent = require('dedent-js');

var c = SDOP.init();
var r = c.registry;

var main = async () => {
  require('../index')(c);
  console.log('ready');

  var r = c.registry;

  r.put('sdop.web.Router', 'com.example.Router', {
    // '/': 'com.example.Index'
  });

  r.put('sdop.web.Pug', 'com.example.Layout', dedent`
    doctype html
    html
      head
        title #{title}
      body
        h1 Example Website
        | !{body}

  `);

  r.put('sdop.web.PageMeta', 'sdop.web.404', {
    title: 'Oh no! Sadness!',
    layout: 'com.example.Layout',
  });

  var boot = r.get('sdop.web.ConfigRunnable', 'sdop.web.ServerBoot');
  boot(c, {
    port: 3030,
    router: 'com.example.Router',
  });

  // r.put('com.example.Router', 'com.example.RH', {
  //   '/': 'com.example.Index',
  // })
};

main();
