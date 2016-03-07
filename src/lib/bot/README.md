# bot

## Classes

* `Bot` - TBD - An abstraction around all the actions a bot will perform (TBD)
  * This instance will maintain a per-user (or per-whatever) cache of
    `Conversation` instances.
  * This instance will have an bot-specific `postMessage` method for sending
    messages, that will also be passed into `Dialog` instances for allowing them
    to send messages.
  * The `postMessage` function should be able to flatten deeply-nested arrays
    of strings, and filter out `false`, `undefined` and `null` values, then
    join on newline to generate a message.
  * This instance will route messages not handled by the conversation system
    to the appropriate registered `Command` instance.
* `Conversation` - An abstraction around a conversation, typically with a single
  user.
  * Incoming messages will be sent to the existing, not "done", `Dialog`
    instance's response handler, otherwise to a callback registered in the
    `Bot` instance.
  * If the `Dialog` instance response handler or callback returns a `Dialog`
    instance, it will be stored in the conversation, and used to handle the next
    incomning message.
* `Dialog` - An abstraction around a question and eventual response.
  * When a question is asked, the dialog is considered "not done," even if the
    same dialog had already been used and been marked "done."
  * If a dialog times out, it is considered "done."
  * When a dialog handles a response (via conversation) it is considered "done."
  * A dialog may be reused. As long as a new question is asked, and the dialog
    is returned to the conversation, it will await a response.
* `Command` - TBD - Handle a command.
  * May have a description.
  * May have any number of `SubCommand` instances.
  * May return a `String` or `Array` message (to be sent, via the bot, to the
    `postMessage` method, or a `Dialog` instance, to be handled by the bot's
    `Conversation` instance.
* `SubCommand` - TBD - Handle a sub-command.
  * May have a description.
  * May have usage information.
  * May return a `String` or `Array` message (to be sent, via the bot, to the
    `postMessage` method, or a `Dialog` instance, to be handled by the bot's
    `Conversation` instance.
