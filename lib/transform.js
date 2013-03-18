var falafel = require('falafel')
  , esprima = require('esprima')
  , _ = require('underscore')

function Transform(code) {
  var i = 0
  function isAssignmentTarget(node) {
    var item = node
    if(node.type !== "Identifier" || !node.parent) return false

    if(node.parent.type === "AssignmentExpression" && 
       node.parent.left === node) {
      return node.parent
    }
    if(node.parent.property === node &&
       node.parent.parent.type === "AssignmentExpression") {
      return node.parent.parent
    }
    return false
  }

  function isCallTarget(node) {
    if(!node.parent || !node.parent.parent) return false

    if(node === node.parent.property && node.parent === node.parent.parent.callee) {
      return true
    }
  }

  var chunks = code.split('')

  function originalSource(node) {
    return chunks.slice(node.range[0], node.range[1]).join('')
  }

  var displayRanges = []
  /** 
   * Specifies which node's value is used to display the given 
   * range
   **/
  function assignDisplayRange(node, range) {
    if(typeof node.valueKey == "undefined") {
      node.valueKey = i++
    }
    displayRanges[node.valueKey] = displayRanges[node.valueKey] || []
    displayRanges[node.valueKey].push(range)
  }

  var blockRanges = []
  function assignBlockRange(node, range) {
    if(typeof node.blockKey == "undefined") {
      node.blockKey = i++
    }
    blockRanges[node.blockKey] = blockRanges[node.valueKey] || []
    blockRanges[node.blockKey].push(range)
  } 

  var output = falafel(code, { loc: true, comment: true }, function(node) {
    var blockId
      , assignmentStatement

    if(node.type === "Identifier") {
      if(isCallTarget(node)) {
        //nothing, we can't wrap these, or else the function binding gets all fuckd up
      } else if(assignmentStatement = isAssignmentTarget(node)) {
        if(assignmentStatement.operator === "=") {
          assignDisplayRange(assignmentStatement.right, node.range)
        } else {
          assignDisplayRange(assignmentStatement, node.range)
        }
      } else if(node.parent && node.parent.type === "VariableDeclarator" && node.parent.id === node) {
        if(node.parent.init) {
          assignDisplayRange(node.parent.init, node.range)
        }
      } else if(node.parent.type === "UpdateExpression") {
        assignDisplayRange(node.parent, node.range)
      } else if(node.parent && node.parent.type === "MemberExpression" && node.parent.property === node) {
        assignDisplayRange(node.parent, node.range)
      } else if(!node.parent || node.parent.key !== node && node.parent.type !== "FunctionExpression" && node.parent.type !== "FunctionDeclaration") {
        assignDisplayRange(node, node.range)
      }
    } else if(node.parent && node.parent.type === "ForStatement" && node.parent.test == node) {
      assignBlockRange(node, node.parent.range) 
      i++ 
    } else if(node.parent && node.parent.type === "ForStatement" && node.parent.update == node) {
      node.endRange = true
    } 

    if(typeof node.valueKey !== "undefined") {
      node.update("__(" + node.valueKey + ", " + node.source() + ")") 
    }

    if(node.endRange) {
      node.update("__e(" + node.source() + ")")
    }

    if(typeof node.blockKey !== "undefined") {
      node.update("__s(" + node.blockKey + ")," + node.source())
    }
  })

  this.output = output
}

Transform.prototype.executeCode = function() {
 
  var values = this.values = {}
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
}

Transform.prototype.generateHTML = function(values) {
  var htmlChunks = code.split('')
  _(values).each(function(value, index) {
    console.log()
  })
}
 
Transform.prototype.getCode = function() {
  return this.output.toString()
}

module.exports = Transform
