'use strict'
var SlackClient = require('slack-client')
var queueTillDone = require('./queue-till-done')
var values = require('./values')

module.exports = function setup(config) {
  // Connect to all configured slacks, this is the real time web sockety thing
  values(config.slacks).forEach(function (slack) { connectToSlack(slack) })
}

function connectToSlack(slack) {
  slack.client = new SlackClient(slack.apikey, true, true)
  slack.whenReady = queueTillDone(function (done) {
    slack.client.once('open', done)
  })
  slack.channels = null
  slack.whenReady(function () {
    slack.channels = values(slack.client.channels).filter(isUsefulChannel).concat(values(slack.client.groups))
  })
  slack.client.on('error', function (er) {
    console.error(er)
  })
  slack.client.on('message', function (msg) { handleMessage(slack, msg) })
  slack.client.login()
}


function isUsefulChannel(chan) {
  return chan.is_member && !chan.is_archived && !chan.is_general
}

function handleMessage(slack, msg) {
  // there are supposed to be events fired when you join or leave a channel or group but they don't
  // fire for me, which means I have to watch the messages. =(
  if (msg.type === 'message' && msg.user === 'USLACKBOT' && /^You have been removed/.test(msg.text)) {
    handleKick(slack, msg)
  } else if (msg.subtype === 'channel_join' || msg.subtype === 'group_join') {
    handleJoin(slack, msg)
  }
}

// we try to add ourselves when we see any bot join, but since we check for dupliates
// that's not dangerous
function handleJoin(slack, msg) {
  var user = slack.client.getUserByID(msg.user)
  if (!user.is_bot) return
  var channel = slack.client.getChannelGroupOrDMByID(msg.channel);
  if (!slack.channels.some(function (ch) { ch.name === channel.name })) {
    slack.channels.push(channel)
  }
}

// this probably wouldn't work if the bot somehow has a different locale =/
function handleKick(slack, msg) {
  var matches = msg.text.match(/^You have been removed from the group (\S+) by/)
             || msg.text.match(/^You have been removed from #(\S+) by/)
  if (!matches) {
    console.error("Could not match ", msg)
    return
  }
  var name = matches[1]
  slack.channels = slack.channels.filter(function (chan) {
    return chan.name !== name
  })
}
