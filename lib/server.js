var express = require('express')
var app = express()

var browserExpress = require('browserify-express')

var opts = {
  entry: __dirname + '/main.js',
  watch: __dirname,
  mount: '/bundle.js',
  bundle_opts: { debug: true }
}

var bundle = browserExpress(opts)

app.use(bundle)
app.use(express.static(__dirname + "/.."))

app.listen(8080)
