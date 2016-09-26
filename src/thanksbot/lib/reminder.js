import {query} from '../../lib/db';

// thanks to all the bocoupers who helped create these messages. if i didn't
// ask you already, i will soon!
const messages = [
  `@laurapowell says, "Today is a great day to give thanks!"`,
  `@susan says, "Who's your fave Bocouper right now? I'd love to know why!"`,
  `@jorydotcom says, "Spread some love & cheer - share some news for all to hear!"`,
  `@jorydotcom says, "Have you thanked someone today? DO IT NOW!"`,
  `@iros says, "Who's great? YOU'RE Great! As is probably someone else who helped you today. Say thanks on Thanksbot!"`,
  `@mattsurabian says, "Must be nice to be an island, able to work totally by yourself being helped by nobody..."`,
  `@mattsurabian says, "Even rockstar ninjas have sensei maestros."`,
  `@peter says, "Don’t take your gratitude to the grave. Thank someone today!"`,
  `@jess asks, "Did someone help you out on a project yesterday? Want to thank them?"`,
  `@clairerocks says, "Hey! Has anyone made your day/week/month better? Thank them!"`,
  `@leo says, "Today is not Thanksgiving day, but you can still thank someone today and it would be amazing!"`,
  `@gnarf says, "We've come a long, long way together, though the hard times and the blues. https://youtu.be/ruAi4VBoBSM"`,
  `@vlandham says, "Be thankful for you being you, right here and now."`,
  `@z says, "To avoid becoming a human shaped Jade statue, doctors recommend that you thank someone every day."`,
  `@mike says, "You know who else wasn't very thankful? Benedict Arnold."`,
  `@isaacdurazo says, "Have you thanked Obama for your disgraces this morning? Good! Now make sure you thank a bocouper for being awesome to you. #thanksobama"`,
  `@ajpiano asks, "Has anything happened lately that made you think, 'Whoa, my coworkers are cool?' What was it?"`,
  `@yannick shares, "Feeling gratitude and not expressing it is like wrapping a present and not giving it." — William Arthur Ward`,
  `@yannick shares, "We hope that, when the insects take over the world, they will remember with gratitude how we took them along on all our picnics." — Bill Vaughan _Get your thanks in before that happens._`,
  `@wilto says, "All I want for my birthday-of-the-day is for you to thank a Bocouper that helped you out recently."`,
  `@wilto says, "You could thank a Bocouper, _or_ I could take your computer and do it for you. But you ain’t getting it back after."`,
  `@wilto says, "Hey, fun fact: the ASL sign for thanks is http://wil.to/thanks.gif. Also, second fun fact: Thanksbot is right here. Just sayin’."`,
  {
    toString: () => {
      const nickNames = [
        `Ol’ Thanksy McTouchdown`,
        `Original Thankah AKA Tha Crowd Pleasah`,
        `2Thanks2Grateful`,
        `DJ _Apré$hative_`,
        `Thanky McThankface`,
        `Thanks T.T. Showbiz`,
        `Professor Grazie Saltalamacchia`,
        `Takk Meansthanksinnorwegianswedishanddanish`,
      ];
      const name = nickNames[Math.floor(Math.random() * nickNames.length)];
      return `@wilto says, "'${name},' they used to call me—and if you send something to Thanksbot today, well, I’ll hand this title over to you."`;
    },
  },
  `@lorin says, "Every day, dozens of Bocoupers go unthanked. They sit at their keyboards, hardworking and unappreciated. For just 2 minutes' worth of effort, YOU can bring a smile to their faces. Use Thanksbot. Change a life."`,
  `@lorin says, "I PITY THE FOOL WHO DOESN'T USE THANKSBOT"`,
  `@bobholt says, "According to Mirriam-Webster, "thankfulness" is next to "thankless." Choose your side.`,
];

export default function(bot) {
  const dataStore = bot.slack.rtmClient.dataStore;
  // find eligible bocoupers
  return query('alertable_bocoupers').mapSeries(({slack}) => {
    // each person has a 10% chance of being alerted
    const selected = Math.random() <= 0.10;
    // look up the user in the slack realtime data store
    const user = dataStore.getUserByName(slack);
    // only continue if the user exists and we selected them
    if (!selected || !user) {
      return false;
    }
    // select a random message to send
    const message = [
      messages[(Math.floor(Math.random() * messages.length))].toString(),
    ];
    // find the direct message conversation with this user
    const dm = dataStore.getDMByName(slack);
    // if the user has no direct message with us yet, add some context
    // because the message will arrive via the `slackbot` user.
    if (!dm) {
      message.push('> Send `/dm thanksbot <your message here>`');
    }
    // give folks the opportunity to opt out of these reminders
    message.push('> To stop these reminders, send `/dm thanksbot leave me alone`');
    // log the last time we sent this so we can prevent sending too often
    return query('record_thanks_reminder', slack).then(() => {
      // send away!
      return bot.postMessage(dm.id || user.id, message);
    }).delay(2000);
  });
}
