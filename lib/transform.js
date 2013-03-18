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

  var output = falafel(code, { loc: true, comment: true }, function(node) {
    var blockId
      , assignmentStatement

    if(node.type === "Identifier") {
      if(isCallTarget(node)) {
        //nothing, we can't wrap these, or else the function binding gets all fuckd up
      } else if(assignmentStatement = isAssignmentTarget(node)) {
        if(assignmentStatement.operator === "=") {
          assignmentStatement.right.__hackedI = i
        } else {
          assignmentStatement.__hackedI = i
        }
      } else if(node.parent && node.parent.type === "VariableDeclarator" && node.parent.id === node) {
        if(node.parent.init) {
          node.parent.init.__hackedI = i
        }
      } else if(node.parent.type === "UpdateExpression") {
        node.parent.__hackedI = i
      } else if(node.parent && node.parent.type === "MemberExpression" && node.parent.property === node) {
        node.parent.__hackedI = i
      } else if(!node.parent || node.parent.key !== node && node.parent.type !== "FunctionExpression" && node.parent.type !== "FunctionDeclaration") {
        node.update("__(" + i + ", " + node.source() + ")")
      }
      i++
    } else if(node.parent && node.parent.type === "ForStatement" && node.parent.test == node) {
      node.update("__s(" + i + ")," + node.source())
      i++ 
    } else if(node.parent && node.parent.type === "ForStatement" && node.parent.update == node) {
      node.update("__e(" + node.source() + ")") 
    } 
    if(typeof node.__hackedI !== "undefined") {
      node.update("__(" + node.__hackedI + ", " + node.source() + ")") 
    }
  })
  return output.toString()
}
