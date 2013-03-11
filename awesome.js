var code = $("#ohHi").html()
  , i = 0

var output = falafel(code, { loc: true }, function(node) {
  if(node.type === "Identifier") {
    if(node.parent && node.parent.type === "AssignmentExpression" && node.parent.left === node) {
      if(node.operator === "=") {
        node.parent.right.__hackedI = i
      } else {
        node.parent.__hackedI = i
      }
    } else if(node.parent && node.parent.type === "VariableDeclarator" && node.parent.id === node) {
      node.parent.init.__hackedI = i
    } else if(node.parent.type === "UpdateExpression") {
      node.parent.__hackedI = i
    } else {
      node.update("__(" + i + ", " + node.source() + ")")
    }
    i++
  } else {
    console.log(node.type)
  } 
  if(typeof node.__hackedI !== "undefined") {
    node.update("__(" + node.__hackedI + ", " + node.source() + ")") 
  }
})

i = 0
var htmlOutput = falafel(code, { loc: true }, function(node) {
  if(node.type == "Identifier") {
    var src = node.source()
    node.update('<span class="value" data-id="' + i + '">' + src + '</span>')
    i++
  }
})

eval('var __values = {}; __ = function(index, value) { return __values[index] = value }; ' + output)
if(typeof $ != "undefined") {
  $(function() {
    $(".code").html(htmlOutput.toString().replace(/\n/g, "<br />"))
    $(".value").each(function(i, element) {
      var el = $(element)
      el.tooltip({ title: __values[parseInt(el.attr("data-id"))].toString() || " "})
    })
  })
} 
