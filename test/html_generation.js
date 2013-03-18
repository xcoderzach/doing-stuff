var Transform = require("../lib/transform")
  , expect = require("expect.js")

function transformHtml(code) {
  var t = new Transform(code)
  t.executeCode()
  return t.getHtml()
}

describe("transform", function() {
  
})
