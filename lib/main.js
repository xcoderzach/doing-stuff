var falafel = require('falafel')
var esprima = require('esprima')
var transform = require('./transform')

var code = "console.log('asdf')"// "(" + sourceFn.toString() +"())"
  , i = 0

var output = transform(code)
