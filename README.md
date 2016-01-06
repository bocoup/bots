# bots
> our slack bots

## Development Setup
1. `scp nest.bocoup.com:/mnt/secrets/bots.json ./`
2. `npm start`
3. Log into slack and send a direct message to your staging bot.

## Deployment
Commits to master automatically land in production. There is no staging
environment!

### robocoup

To add a new command for robocoup, create a file in `src/robocoup/commands`.
The name of the file will be the name of the command and will appear as an
option automatically for the `help` command.

A valid command must export a `handler` and `usage` property. The `handler` must
return a string, or a promise which resolves to a string. The result will be
sent to the user.

The `usage` property is a string that explains how to use the command. This will
be shown automatically in response to `help command`.

Here is example of a naïve command, `megaphone`:

```js
exports.usage = 'Repeat what you said, but louder.\n`Usage: megaphone [message]`';
exports.handler = function (user, message) {
  if (!message) {
    return 'Error: No message specified.';
  }
  return user.name+' said: *'+message.toUpperCase()+'*';
};
```

The staging bot for robocoup is `robocoup-staging` on Slack. At the time of this
writing things will explode quite spectacularly if multiple people try to dev
the same bot at the same time. Beware!
