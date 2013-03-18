var falafel = require('falafel')
var esprima = require('esprima')
var transform = require('./transform')

var sourceFn = function() {
  var code = "console.log('asdf')"// "(" + sourceFn.toString() +"())"
    , i = 0

  var output = transform(code)

  var htmlOutput = falafel(code, { loc: true }, function(node) {
    if(node.type == "Identifier") {
      var src = node.source()
      node.update('<span class="value" data-id="' + i++ + '">' + src + '</span>')
    }
    if(node.parent && node.parent.type === "ForStatement" && node.parent.test === node) {
      node.parent.__hackedI = i++
    }
    if(typeof node.__hackedI !== "undefined") {
       var src = node.body.source()
      node.body.update('<span class="block" id="block' + node.__hackedI + '" data-iteration="0" data-id="' + node.__hackedI + '">' + 
        src + 
      '</span>')
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

  function end(identity) {
    stack.pop()                          
    return identity
  }                                     
  esprima.parse(output.toString())

  ;(new Function("__, __s, __e", output.toString()))(set, start, end)

  if(typeof $ != "undefined") {
    $(function() {

      function getValueObjectForElement(el) {
        var blocks = el.parents(".block")
          , curr = values

        blocks.each(function(i, block) {
          block = $(block)
          var id = parseInt(block.attr("data-id"))
            , iteration = parseInt(block.attr("data-iteration"))
          curr = curr[id][iteration]
        })
        return curr
      }

      $(".code").html(htmlOutput.toString().replace(/\n/g, "<br />"))
      $(".value").each(function(i, element) {
        var el = $(element)
          , blocks = el.parents(".block")
        
        function updateValues() {
          var value
            , curr = getValueObjectForElement(el)

          value = JSON.stringify(curr[parseInt(el.attr("data-id"))]) 
          el.tooltip('destroy').tooltip({ title: value })
        }
        updateValues()
        blocks.on("changeIteration", updateValues)
      })
      $(".block").each(function(i, block) {
        block = $(block)
        var val = getValueObjectForElement(block)
        var iterations = val[block.attr("data-id")]
        var element = '<select class="iterationChooser">'
        for(var i = 0 ; i < iterations.length ; i++) {
          element += '<option value = "' + i + '">' + i + '</option>'
        }    
        element += '</select>' 

        var select = $(element)
        select.on("change", function() {
          block.attr("data-iteration", $(this).val())
          block.trigger("changeIteration")
        })

        block.popover({ html: true, content: select }).popover("show")

        block.data("popover").$tip.css("left", "300px")
      })
    })
  } 
}
sourceFn() 
