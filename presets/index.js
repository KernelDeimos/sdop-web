const { Module } = require('sdop');

var index = [
  './404',
]

module.exports = new Module({}, c => {
  for ( let _path of index ) c = require(_path)(c);
  return c;
});
