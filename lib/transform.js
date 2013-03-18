var falafel = require('falafel')

module.exports = function(code) {
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

  var displayRanges = {}
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
      node.update("__s(" + i + ")," + node.source())
      i++ 
    } else if(node.parent && node.parent.type === "ForStatement" && node.parent.update == node) {
      node.update("__e(" + node.source() + ")") 
    } 
    if(typeof node.valueKey !== "undefined") {
      node.update("__(" + node.valueKey + ", " + node.source() + ")") 
    }
  })
  return output.toString()
}