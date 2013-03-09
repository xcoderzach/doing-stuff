var falafel = require('falafel')

var code = "var x = 10;     x = (20); x = x - 1;"
  , i = 0

var output = falafel(code, { loc: true }, function(node) {
  htmlOutput += node.source()
  if(node.type == "VariableDeclarator") {
    node.init.update("__debugger.set(" + i + ", " + node.init.source() + ")")
    i++
  }
  if(node.type == "AssignmentExpression") {
    node.right.update("__debugger.set(" + i + ", " + node.right.source() + ")")
    i++
  }
})

i = 0
var htmlOutput = falafel(code, { loc: true }, function(node) {
  htmlOutput += node.source()
  if(node.type == "VariableDeclarator") {
    node.id.update('<span class="value" data-id="' + i + '">' + node.id.source() + '</span>')
    i++
  }
  if(node.type == "AssignmentExpression") {
    node.left.update('<span class="value" data-id="' + i + '">' + node.left.source() + '</span>')
    i++
  }
})

eval('var __debugger = { values: {}, set: function(index, value) { return this.values[index] = value } }; ' + output)
if(typeof $ != "undefined") {
  $(function() {
    $(".code").html(htmlOutput.toString().replace(/ /g, "&nbsp;"))
    $(".value").each(function(i, element) {
      var el = $(element)
      el.tooltip({ title: __debugger.values[parseInt(el.attr("data-id"))]})
    })
  })
}
