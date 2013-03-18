var transform = require("../lib/transform")
  , expect = require("expect.js")

describe("transform", function() {
  it("it should transform an assignment expression", function() {
    var code = "var x = 10"
    var expected = "var x = __(0, 10)"
    expect(transform(code)).to.be(expected)
  })
})
