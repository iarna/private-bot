'use strict'
module.exports = function values(obj) {
  return Object.keys(obj).map(function (id) { return obj[id] })
}

