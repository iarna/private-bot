#!/usr/bin/env node
'use strict'
var path = require('path')

var values = require('./values')
var Config = require('./config')
var slackSetup = require('./slacks')
var webSetup = require('./webs')

var confFile = new Config(path.resolve(process.cwd(),'privatebot-conf.json'))

var bot
try {
  bot = confFile.load()
} catch (ex) {
  if (ex.code === 'ENOENT') {
    bot = confFile.init()
  } else {
    throw ex
  }
}

slackSetup(bot)
webSetup(confFile, bot)

var next = function allSetup () {
  console.log("Listening on port "+bot.port)
  console.log("  /addslack")
  Object.keys(bot.slacks).forEach(function (botkey) {
    console.log("  /privatebot/" + botkey + " (" + bot.slacks[botkey].name + ")")
  })
}

values(bot.slacks).forEach(function (slack) { var last = next; next = function () { slack.whenReady(last) } })

bot.connected(next)

