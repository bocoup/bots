export default function(message) {
  if (message.substring(0, 4) !== 'help') {
    return [
      "Sorry, I didn't understand that message. If you are making a submission, can you please prefix it with the word `record`? That will let me know what you were trying to do. I also undertand the message `help`, if you'd like to see more options.",
    ];
  }
  return false;
}
