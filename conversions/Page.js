const { Module } = require('sdop');
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
      c.value = c.value[0]; // TODO
      return c;
    }
  )

  r.put('Convert', 'sdop.web.PageHTML', 'sdop.web.Handler', c => {
    var entry = c.value;
    c.value = c => {
      var nr = c.request;
      nr.res.setHeader('Content-type', 'text/html; charset=utf-8');
      nr.res.write(entry.text, 'utf8');
      return c;
    };
    return c;
  });

  return c;
});
