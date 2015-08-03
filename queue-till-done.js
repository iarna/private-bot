'use strict'
module.exports = function queueTillDone(todo) {
  var done = false
  var queued = []
  todo(function () { 
    done = true
    queued.forEach(function (cb) { cb() })
  })
  return function (cb) {
    if (done) return process.nextTick(cb)
    queued.push(cb)
  }
}
