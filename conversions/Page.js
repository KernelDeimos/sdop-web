const { Module } = require('sdop');
const { Sequence } = require('nicepattern');
const dedent = require('dedent-js');

var markdownpkg = require('@cenguidanos/node-markdown-parser');
var markdown = new markdownpkg.Markdown();
var pug = require('pug');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('Convert', 'sdop.text.Markdown', 'sdop.text.HTML', c => {
    var body = markdown.toHTML(c.value.text);
    c.value = { text: body };
    return c;
  });

  r.put('Convert', 'sdop.text.Markdown', 'sdop.web.PageMeta', c => {
    var data = markdown.toJSON(c.value.text);
    var title = data.toc[0].text;
    c.value = {
      title: title
    };
    return c;
  })

  r.put(
    'Reduce',
    ['sdop.text.HTML', 'sdop.web.PageMeta'],
    'sdop.web.PageHTML',
    c => {
      var html = c.value[0];
      var meta = c.value[1];
      if ( meta.layout ) {
        var pugText = r.get('sdop.web.Pug', meta.layout);
        var cssText = r.get('sdop.text.CSS', meta.layout);
        if ( ! pugText ) throw new Error(`layout not found for: ${meta.layout}`);
        var text = pug.render(pugText.text, {
          ...meta,
          body: html.text,
          css: cssText ? cssText.text : '',
          c: c,
          r: r,
        });
        c.value = { text: text };
        return c;
      }
      c.value = c.value[0]; // TODO
      return c;
    }
  )

  r.put('Convert', 'sdop.web.PageHTML', 'sdop.web.Handler', c => {
    var entry = c.value;

    // Get default middleware if one exists
    var defaultMW = r.get('Middleware', 'sdop.web.config.DefaultMiddleware');
    var rh = new Sequence([
      {
        name: 'PageHTML',
        fn: c => {
          var nr = c.request;
          nr.res.setHeader('Content-type', 'text/html; charset=utf-8');
          nr.res.write(entry.text, 'utf8');
          return c;
        }
      }
    ]);
    if ( defaultMW ) {
      rh = defaultMW.apply(rh);
    }
    c.value = rh;
    return c;
  });

  r.put('Convert', 'sdop.web.Controller', 'sdop.web.Handler', c => {
    var entry = c.value;

    // Get default middleware if one exists
    var defaultMW = r.get('Middleware', 'sdop.web.config.DefaultMiddleware');
    var rh = new Sequence([
      {
        name: 'Controller',
        fn: c.value,
      }
    ]);
    if ( defaultMW ) {
      rh = defaultMW.apply(rh);
    }
    c.value = rh;
    return c;
  });

  r.put(
    'Reduce',
    ['sdop.web.Pug', 'sdop.web.PageMeta'],
    'sdop.web.Handler',
    c => {
      var pugml = c.value[0];
      var meta = c.value[1];

      var defaultMW = r.get('Middleware', 'sdop.web.config.DefaultMiddleware');
      var rh = new Sequence([
        {
          name: 'PageRender',
          fn: c => {
            var state = { c: c, r: r };
            c.value = pug.render(pugml.text, { ...state });
            if ( meta.layout ) {
              var pugText = r.get('sdop.web.Pug', meta.layout);
              var cssText = r.get('sdop.text.CSS', meta.layout);
              if ( ! pugText ) throw new Error(`layout not found for: ${meta.layout}`);
              c.value = pug.render(pugText.text, {
                ...state,
                ...meta,
                body: c.value,
                css: cssText ? cssText.text : '',
              });
            }
            return c;
          }
        },
        {
          name: 'PageHTML',
          fn: c => {
            var nr = c.request;
            nr.res.setHeader('Content-type', 'text/html; charset=utf-8');
            nr.res.write(c.value, 'utf8');
            return c;
          }
        }
      ]);
      if ( defaultMW ) {
        rh = defaultMW.apply(rh);
      }
      c.value = rh;

      return c;
    }
  )

  return c;
});
