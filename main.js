var falafel = require('falafel')

var code = "var x = 10; x = x - 1;"
  , i = 0

var output = falafel(code, { loc: true }, function(node) {
  if(node.type === "Identifier") {
    if(node.parent && node.parent.type === "AssignmentExpression" && node.parent.left === node) {
      node.parent.right.__hackedI = i
    } else if(node.parent && node.parent.type === "VariableDeclarator" && node.parent.id === node) {
      node.parent.init.__hackedI = i
    } else {
      node.update("__debugger.set(" + i + ", " + node.source() + ")")
    }
    i++
  }
  if(typeof node.__hackedI !== "undefined") {
    node.update("__debugger.set(" + node.__hackedI + ", " + node.source() + ")") 
  }
})

i = 0
var htmlOutput = falafel(code, { loc: true }, function(node) {
  if(node.type == "Identifier") {
    node.update('<span class="value" data-id="' + i + '">' + node.source() + '</span>')
    i++
  }
})

console.log(output.toString())
eval('var __debugger = { values: {}, set: function(index, value) { return this.values[index] = value } }; ' + output)
if(typeof $ != "undefined") {
  $(function() {
    $(".code").html(htmlOutput.toString())
    $(".value").each(function(i, element) {
      var el = $(element)
      el.tooltip({ title: __debugger.values[parseInt(el.attr("data-id"))]})
    })
  })
}
