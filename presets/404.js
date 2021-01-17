const { Module } = require('sdop');
const dedent = require('dedent-js');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('sdop.text.Markdown', 'sdop.web.404', dedent`
    # A 404 Error

    Ah, classic 404. This means the url you typed is either invalid or
    outdated.

    ## What you can try
    - Find a similar page on the website and see if the url format changed
    - Check for typing errors in the URL
    - If page was removed on purpose, you can check archive.org
  `)

  return c;
});
