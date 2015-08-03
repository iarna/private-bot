'use strict'
var restify = require('restify');
var uuid = require('uuid')
var queueTillDone = require('./queue-till-done')
var connectToSlack = require('./slacks.js').connectToSlack

var commands = {
  '/listprivate': listprivate,
  '/joinprivate': joinprivate,
  'DEFAULT': unknown
}

module.exports = function setup (confFile, config) {
  // NOW, we setup the web half of this
  var server = restify.createServer();
  server.use(restify.gzipResponse());
  server.use(restify.bodyParser());
  config.connected = queueTillDone(function (done) {
    server.listen(config.port, done)
  })

  // this just holds some state about who we've heard from before to help
  // protect against spoofing
  var teams = {}

  server.post('/addslack', addSlack(confFile, config))
  server.post('/privatebot/:botkey', privatebot(teams, config))
}

function addSlack(confFile, config) {
  return function (req, res, next) {
    if (req.params.controlkey !== config.controlkey) {
      res.send(401, {result: 'error', msg: 'invalid control key'})
      return next()
    }
    var botkey = req.params.botkey
    if (!botkey) botkey = uuid()
    if (config.slacks[botkey]) {
      res.send(403, {result: 'error', msg: 'that slack is already configured'})
      return next()
    }
    var slack = {
      name: req.params.name,
      apikey: req.params.apikey
    }
    var toSave = confFile.load()
    toSave.slacks[botkey] = slack
    confFile.save(toSave)

    connectToSlack(config.slacks[botkey] = slack)
    console.log('Added new route:')
    console.log('  /privatebot/'+botkey + ' ('+slack.name+')')

    res.send(200, {result: 'ok', botkey: botkey, name: slack.name})
    next()
  }
}

function privatebot(teams, config) {
  return function(req, res, next) {
    res.contentType = 'text/plain'
    var team = teams[req.params.team_id]
    if (!req.params.team_id || !req.params.team_domain || !req.params.command || !req.params.token) {
      res.send(406, 'missing basic slack params')
      return next()
    }
    var slack = config.slacks[req.params.botkey]
    if (!slack) {
      res.send(401, 'missing or invalid private bot apikey')
      return next()
    }
    if (!team) {
      team = teams[req.params.team_id] = {
        tokens: {},
        domain: req.params.team_domain,
        botkey: req.params.botkey
      }
    }
    if (!team.tokens[req.params.command]) {
      team.tokens[req.params.command] = req.params.token
    }
    if (team.tokens[req.params.command] !== req.params.token) {
      res.send(401,'Invalid token')
      return next()
    }
    var cmd = commands[req.params.command] || commands.DEFAULT
    cmd(slack, team, req, res, next)
  }
}

function unknown(slack, team, req, res, next) {
  console.error('Unknown command')
  res.send(404,'Unknown command')
  next()
}

function channelListing (ch) {
  var desc = (ch.purpose && ch.purpose.value) || (ch.topic && ch.topic.value)
  return '  ' + (ch.is_group ? ':lock:' : '#') + ch.name + ' – ' + desc
}

function listprivate(slack, team, req, res, next) {
  slack.whenReady(function () {
    var channelList = slack.channels.length
                    ? slack.channels.map(channelListing).join('\n')
                    : '  None.\nInvite privatebot to your private channel to let it do invites.'
    res.send('Private channels available:\n' + channelList)
    next()
  })
}

function joinprivate(slack, team, req, res, next) {
  slack.whenReady(function () {
    var channel = req.params.text
    var matches = slack.channels.filter(function (ch) { return ch.name === channel || '#' + ch.name === channel })
    if (!matches.length) {
      res.send('Unknown channel: ' + channel + '\nTry /listprivate to see the full private channel list.')
      return next()
    }
    var matched = matches[0]
    var name = '#' + matched.name
    res.send("We've requested that someone currently in " + name + " send you an invitation. If no one is active at the moment this may take some time, please be patient.")
    matched.send('Please kindly invite <@'+req.params.user_id+'|'+req.params.user_name+'> to this channel.')
    next()
  })
}
