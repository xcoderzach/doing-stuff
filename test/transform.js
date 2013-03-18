var transform = require("../lib/transform")
  , expect = require("expect.js")

describe("transform", function() {

  it("it should transform an variable declaration", function() {
    var code = "var x = 10"
    var expected = "var x = __(0, 10)"
    expect(transform(code)).to.be(expected)
  })

  it("it should transform an assignment expression", function() {
    var code = "x = 10"
    var expected = "x = __(0, 10)"
    expect(transform(code)).to.be(expected)
  })
   
  it("it should transform an assignment expression", function() {
    var code = "x = y"
    var expected = "x = __(0, y)"
    expect(transform(code)).to.be(expected)
  })

  it("it should transform a for loop", function() {
    var code = "for(i = 0; i < 10; i++) { x }"
    var expected = "for(i = __(0, 0); __s(2),__(1, i) < 10; __e(__(4, i++))) { __(5, x) }"
    expect(transform(code)).to.be(expected)
    }) 
   
})
