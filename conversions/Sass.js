const { Module } = require('sdop');
const sass = require('sass');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('Convert', 'sdop.web.Sass', 'sdop.text.CSS', c => {
    c.value = { text: sass.renderSync({
      data: c.value.text,
      indentedSyntax: true
    }).css };
    return c;
  });

  return c;
});
