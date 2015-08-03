'use strict'
var fs = require('fs')
var crypto = require('crypto')
var uuid = require('uuid')

var Config = module.exports = function (filename) {
  this.filename = filename
}
Config.prototype = {}

Config.prototype.load = function () {
  return JSON.parse(fs.readFileSync(this.filename))
}

Config.prototype.init = function () {
  return this.save({
    "controlkey": new crypto.Hash('sha256').update(uuid()).digest().toString('hex'),
    "port": "8999",
    "slacks": {}
  })
}

Config.prototype.save = function (conf) {
  fs.writeFileSync(this.filename, JSON.stringify(conf, null, '  '))
  return conf
}

