const { SDOP } = require('sdop')

var c = SDOP.init();
var r = c.registry;

var main = async () => {
  require('../index')(c);
  console.log('ready');

  var r = c.registry;

  r.put('sdop.web.Router', 'com.example.Router', {
    // '/': 'com.example.Index'
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
