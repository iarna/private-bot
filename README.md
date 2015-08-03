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
/listprivate
```

To request membership:

```
/joinprivate #channel
```

Join's aren't automatic– bots can't invite people to channels– but the folks
in the channel will be notified that you'd like to join.

### As a slack admin

To run:

```
npm start
```

Or:

```
node index.js
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
./addslack "Name of your Slack" "xoxb-API-token"
```

You should see your server process print out something like:

  /privatebot/e34731fe-3cef-7a3c-ad5f-be748349ea3a (Name of your Slack)

You should also see the bot login on your slack instance.

Next you need to setup your slash commands:

https://winterflower.slack.com/services/new/slash-commands

We'll be making two, `/listprivate` and `/joinprivate`

They should both have the same URL, which should be something like this:

`http://your.host.name:8999/privatebot/e34731fe-3cef-7a3c-ad5f-be748349ea3a`

For a description I entered `List private channels` and `Join a private channel`
respectively, with `[#channelname]` as the usage hint for the
latter.

And that's it, you're done setting up now.  Invite the bot to any channels
you want in the public listing.

