const { Module } = require('sdop');
const { Sequence } = require('nicepattern');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('Registrar', 'sdop.web.View');
  r.put('Registrar', 'sdop.web.HTMLGenerator');

  r.put('Data', 'sdop.web.View.defaultStyle', {
    display: 'inline-block',
    margin: 0,
    padding: 0,
  });

  r.put('Data', 'sdop.web.View.noStyleTags', [
    'html', 'head',
    'title',
    'style', 'script',
  ]);

  r.put('sdop.web.View', 'sdop.web.View.defaultLayout', {
    unboxed: true,
    i: [
      { literal: '<!DOCTYPE html>' },
      { t: 'html',
        i: [
          { t: 'head',
            i: [
              { t: 'title', i: [ a => a.dot('title') ] },
              { t: 'style', i: [ a => a.dot('css') ] }
            ]
          },
          { t: 'body',
            i: [ {
              view: a => a.dot('view'),
              value: a => a.dot('value')
            } ]
          } ] } ]
  });

  r.put('Function', 'sdop.web.View.processView', (c, view) => {
    var newView = { ...view };
    delete newView['mixins'];

    var mix = {
      style: {},
    };
    if ( view.mixins ) for ( let mixinId of view.mixins ) {
      let v = r.get('sdop.web.View', mixinId);
      if ( v.style ) mix.style = { ...mix.style, ...v.style };
    }
    // DRY: { ...a, ...b } pattern can be separated
    if ( Object.keys(mix.style).length > 0 )
      newView.style = { ...mix.style, ...view.style };
    return newView;
  });

  r.put('Function', 'sdop.web.View.writeHTML', (c, view) => {
    var self = r.get('Function', 'sdop.web.View.writeHTML');

    // Expression views - have precedence over all other processing
    // DRY: This kind of expression support may be useful elsewhere
    if ( typeof view === 'function' ) {
      var lang = r.get('DSL', 'GeneralPurposeLanguage').toLibrary(c);
      var fn = view(lang);
      return fn(c).value;
    }
    if ( typeof view === 'string' ) {
      return view;
    }

    view = r.get('Function', 'sdop.web.View.processView')(c, view);

    if ( view.literal ) {
      return view.literal;
    }

    // TODO: process control keywords here
    if ( view.each ) {
      var tmpl = '';
      var lang = r.get('DSL', 'GeneralPurposeLanguage').toLibrary(c);
      var fn = view.each(lang);
      var data = fn(c).value;
      var viewWithoutEach = { ...view };
      delete viewWithoutEach['each'];
      for ( let val of data ) {
        // TODO: self(c.$sub({ value: data }), viewWithoutEach);
        console.log('val_', val);
        tmpl += self({ ...c, value: val }, viewWithoutEach);
      }
      return tmpl;
    }

    if ( view.view ) {
      var v = view.view;
      if ( typeof v == 'function' ) {
        var lang = r.get('DSL', 'GeneralPurposeLanguage').toLibrary(c);
        var fn = v(lang);
        v = fn(c).value;
      }

      if ( typeof v == 'object' ) {
        return self(c, v);
      }
    }

    console.log('view name', view.name);

    var prefix = c.prefix || 'sdop-web-View_';
    var className = prefix + view.name.replace(/\./g, '-');

    var tmpl = '';
    var defers = [];
    if ( ! view.unboxed ) {
      var tagName = 'div';
      var attrs = view.attrs || {};

      attrs.class = className + ( attrs.class ? ` ${attrs.class}` : '' );
      if ( view.t ) {
        let parts = view.t.split('.');
        tagName = parts[0];
        if ( parts.length > 1 )
          attrs.class += ' ' + parts.slice(1).join(' ');
      }
      if ( r.get('Data', 'sdop.web.View.noStyleTags').includes(tagName) ) {
        delete attrs['class'];
      } else if ( view.classes ) {
        attrs.class =
          attrs.class += ' ' + view.classes.join(' ');
      }

      let styleStr = '';
      if ( view.style ) for ( let k in view.style ) {
        // Function values must be placed in an HTML attribute; skip them here
        if ( typeof view.style[k] !== 'function' ) continue;
        var lang = r.get('DSL', 'GeneralPurposeLanguage').toLibrary(c);
        var fn = view.style[k](lang);
        var data = fn(c).value;
        styleStr += `${k}: ${data}; `;
      }

      if ( styleStr ) attrs.style = styleStr;
      if ( view.a ) attrs = { ...attrs, ...view.a };
      defers.push(() => { tmpl += `</${tagName}>` })
      tmpl += `<${tagName}${ attrs
        ? ' ' + Object.keys(attrs).map(
          k => `${k}=${JSON.stringify(attrs[k])}`
        ).join(' ')
        : '' }>`;
    }

    if ( view.i ) for ( let i = 0 ; i < view.i.length; i++ ) {
      let v = view.i[i];
      if ( ! v.name ) v.name = `c${i}`;
      tmpl += self({ ...c, prefix: className + '_' }, v);
    }

    defers.reverse().forEach(fn => fn());

    return tmpl;
  })

  r.put('Function', 'sdop.web.View.writeCSS', (c, view) => {
    var self = r.get('Function', 'sdop.web.View.writeCSS');
    var prefix = c.prefix || 'sdop-web-View_';

    view = r.get('Function', 'sdop.web.View.processView')(c, view);

    console.log('aaa', view.view)

    if ( view.view ) {
      var v = view.view;
      if ( typeof v == 'function' ) {
        var lang = r.get('DSL', 'GeneralPurposeLanguage').toLibrary(c);
        var fn = v(lang);
        v = fn(c).value;
      }

      if ( typeof v == 'object' ) {
        return self(c, v);
      }
    }

    var className = prefix + view.name.replace(/\./g, '-');

    var defers = [];
    var tmpl = `.${className} {\n`;
    defers.push(() => { tmpl += '}\n'; })

    var style = r.get('Data', 'sdop.web.View.defaultStyle');
    style = { ...style, ...view.style };
    for ( let k in style ) {
      // Function values must be placed in an HTML attribute; skip them here
      if ( typeof style[k] !== 'string' ) continue;
      tmpl += `  ${k}: ${style[k]};\n`;
    }

    defers.reverse().forEach(fn => fn());

    if ( view.i ) for ( let i = 0 ; i < view.i.length; i++ ) {
      let v = view.i[i];
      if ( typeof v != 'object' ) continue;
      if ( ! v.name ) v.name = `c${i}`;
      tmpl += self({ ...c, prefix: className + '_' }, v);
    }

    return tmpl;
  })

  // r.put('Convert', 'sdop.web.View', 'sdop.web.HTMLGenerator', c => {
  //   var view = c.value;
  //   view.name = c.name;
  //   c.value = c => r.get('Function', 'sdop.web.View.writeHTML')(c, view);
  //   return c;
  // })

  r.put('Convert', 'sdop.web.View', 'sdop.web.HTMLGenerator', c => {
    var layout = r.get('sdop.web.View', 'sdop.web.View.defaultLayout');
    layout.name = 'sdop-web-Layout';

    var view = c.value;
    view.name = c.name;

    let css = r.get('Function', 'sdop.web.View.writeCSS')({
      ...c,
      value: {
        view: view
      }
    }, layout);

    c.value = c => r.get('Function', 'sdop.web.View.writeHTML')({
      ...c,
      value: {
        title: 'Test Generation',
        css: '\n' + css,
        view: view
      }
    }, layout);
    // c.value = c => r.get('Function', 'sdop.web.View.writeHTML')(c, view);
    return c;
  })

  r.put('Convert', 'sdop.web.HTMLGenerator', 'sdop.web.Handler', c => {
    var generate = c.value;

    // Get default middleware if one exists
    var defaultMW = r.get('Middleware', 'sdop.web.config.DefaultMiddleware');
    var rh = new Sequence([
      {
        name: 'PageHTML',
        fn: c => {
          var nr = c.request;
          nr.res.setHeader('Content-type', 'text/html; charset=utf-8');
          nr.res.write(generate(c), 'utf8');
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

  return c;
});
