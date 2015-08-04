private-bot
-----------

A simple slackbot to make managing public private channels easier.  That is,
when you want to use private channels for their "history doesn't show up
every time you search, randos can't read your history" but you want to make
knowing about and joining them easier.

Also a bonus, no one needs to know any of the members of a channel until
they join the channel.

### As an end user

To see a list of private channels you can join:

```
/private
```
```
slackbot [xx:xx] Only you can see this message
Private channels available:
 🔒test – starter test group
To request membership in a group, use /private join [channel-name]
```


To request membership:

```
/private join test
```
```
slackbot [xx:xx] Only you can see this message
We've requested that someone currently in #test send you an invitation.
If no one is active at the moment this may take some time, please be patient.
```

And over in the private channel, members will see:

```
privatebot BOT [xx:xx]
Please kindly invite @user to the this channel.
```

### As a slack admin

To install:

```
npm install -g slack-private-chan-bot
```

To run:

```
private-chan-bot
```

The first time you run it a `privatebot-conf.json` will be created to hold
between-runs configuration.  The default port it runs on is `8999`– if you'd
like something different, stop the server, edit the config, and start it
back up.

First you'll need to create a new bot account on your slack instance:

https://my.slack.com/services/new/bot

Pick whatever name you like– I used `privatebot`.  It will generate an "API
token" that starts with `xoxb-` – copy this and run the following:

```
add-private-chan-bot "Name of your Slack" "xoxb-API-token"
```

You should see your server process print out something like:

> /privatebot/e34731fe-3cef-7a3c-ad5f-be748349ea3a (Name of your Slack)

You should also see the bot login on your slack instance.

Next you need to setup your slash command:

https://my.slack.com/services/new/slash-commands

Add one named `/private` with a URL like:

`http://your.host.name:8999/privatebot/e34731fe-3cef-7a3c-ad5f-be748349ea3a`

And that's it, you're done setting up now.  Invite the bot to any channels
you want in the public listing.

