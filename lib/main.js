var falafel = require('falafel')
var esprima = require('esprima')
var transform = require('./transform')

var code = "console.log('asdf')"// "(" + sourceFn.toString() +"())"

var output = transform(code)
