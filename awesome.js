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
  } else if(node.parent && node.parent.type === "ForStatement" && node.parent.body == node) {
    //this makes it a block statement in a blockstatement, MEH!
    node.update("{ __s(" + i + ");\n" + 
      node.source() + 
    "\n__e(" + i + "); }") 
    i++
  } 
  if(typeof node.__hackedI !== "undefined") {
    node.update("__(" + node.__hackedI + ", " + node.source() + ")") 
  }
  if(node.type == "BlockStatement") {
  }
})

i = 0
var htmlOutput = falafel(code, { loc: true }, function(node) {
  if(node.type == "Identifier") {
    var src = node.source()
    node.update('<span class="value" data-id="' + i + '">' + src + '</span>')
    i++
  }
  if(node.type == "ForStatement") {
    var src = node.source()
    node.update('<span class="block" data-iteration="0" data-id="' + i + '">' + src + '</span>')
    i++
  }
})


var values = {}                              
  , stack = [values]                          

function set(index, value) {          
  return last(stack)[index] = value
}                                     

function last(arr) {
  return arr[arr.length - 1]
}

function start(index) {                
  var l = last(stack)
  l[index] = l[index] || []
  l[index].push({})
  stack.push(last(l[index]))
}                                     

function end() {                
  stack.pop()                          
}                                     

(new Function("__, __s, __e", output))(set, start, end)

if(typeof $ != "undefined") {
  $(function() {
    $(".code").html(htmlOutput.toString().replace(/\n/g, "<br />"))
    $(".value").each(function(i, element) {
      var el = $(element)
        , blocks = el.parents(".block")
        , value
        , curr = values

      blocks.each(function(i, block) {
        block = $(block)
        var id = parseInt(block.attr("data-id"))
          , iteration = parseInt(block.attr("data-iteration"))
        curr = curr[id][iteration]
      })

      console.log(curr)
      value = JSON.stringify(curr[parseInt(el.attr("data-id"))]) 
      el.tooltip({ title: value })
    })
  })
} 
