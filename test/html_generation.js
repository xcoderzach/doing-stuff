var Transform = require("../lib/transform")
  , expect = require("expect.js")

function transformHtml(code) {
  var t = new Transform(code)
  t.executeCode()
  return t.getHTML()
}

describe("transform", function() {
  it("should html", function() {
    var html = transformHtml("var x, y = 10; x = y + 5")
    console.log(html)
    html = transformHtml("for(var i = 0 ; i < 10 ; i++) { console.log(i) }")
    console.log(html)
  })
})
