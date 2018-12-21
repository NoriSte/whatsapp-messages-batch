# whatsapp-messages-batch

# Write your messages in advance and batch 'em all

Before starting:

- open `messages.js`
- you can test my script before really make it sending messages, set `config.js`#TEST_SAFELY to true
- open `config.js` and set the `findInputTitle` string, it's the content of the "Search or start a new chat input field"
  ![Alt text](input.jpg?raw=true "Input field")

# FAQ

## Why did you create it?

Because I love to send Xmas greetings but on Dec 25th I can't spend an hour writing and sending them.

## ... So?

So I write all the messages in advance and on Dec 25th I launch this script.

## How it works?

It uses [Puppeteer](https://github.com/GoogleChrome/puppeteer) to open up the WhatsApp web UI and write/send the messages for you.

## Nice, should I already chatted with the desired contact?

No, it works also with contacts you never chatted with.

## Does it support multiline messages?

Yes, every line will be sent as a saperate message.

## Does it support emojis?

Obviously...

## Does it work for groups too?

Yep

## Can I test your script before sending all the messages?

Yep, open `config.js` and set `TEST_SAFELY` to `true`

## What happens if mystiped the name of a contact?

Nothing happens, the script needs to match exactly the contact name, otherwise it does nothing.

## And how can I fix it?

Don't worry, every unsent message is console.logged

## What can I set?

Look at the `config.js` file

## How can I set the messages to send?

Look at the `messages.js` file
