const npath = require('path');
const fs = require('fs');
const mime = require('mime-types');

const { Module } = require('sdop');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('sdop.web.Handler', 'sdop.web.static.StaticFileHandler', c => {
    var path = c.config && c.config.path;
    if ( ! path ) path = npath.join(process.cwd(), 'public');

    var params = c.params;
    var nr = c.request;
    var requestedFile = npath.normalize(params.path);
    if ( requestedFile.startsWith('.') ) {
      nr.handled = false;
      return c;
    }

    var filePath = npath.join(path, requestedFile);
    var data = fs.readFileSync(filePath);
    return new Promise((rslv, rjct) => {
      fs.readFile(filePath, (err, data) => {
        if ( err ) {
          nr.handled = false;
          rslv(c);
          return;
        }
        var contentType = mime.lookup(filePath);
        if ( contentType.startsWith('text/') ) contentType += '; charset=utf-8';
        nr.res.setHeader('Content-type', contentType);
        nr.res.write(data, 'utf8');
        rslv(c);
      });
    });
  })
});
