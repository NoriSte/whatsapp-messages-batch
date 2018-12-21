/*
funziona anche con contatti con i quali non si ha mai chattato
in caso di ritorni a capo il messaggio verrà splittato
si può usarlo in modalità safe
è per italiano
funziona anche per i gruppi
logga quelli non inviati
*/

const TEST_SAFELY = false;
const CHECK_DELAY = 1500;

const puppeteer = require("puppeteer");
require("pptr-testing-library/extend");
let browser;
let page;

const config = {
  findInputTitle: "Cerca o inizia una nuova chat"
};

let messages = [
  ["Clark Kent", `Happy Xmas!! 🎄`],
  ["Matteo Miccoli", `😇`],
  ["James Bond", `No one is going to know your phone number, don't worry!`],
  [
    "Soccer group",
    `Wishes to you all!
    Are you busy tonight?
    Match+beer??`
  ]
];

const lineBreakRegex = /(?:\r\n|\r|\n)/g;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    userDataDir: ".tmp"
  });
  page = await browser.newPage();
});
afterAll(async () => {
  await page.close();
  await browser.close();
});

const clearInput = async selector =>
  page.evaluate(selector => (document.querySelector(selector).value = ""), selector);

describe(`Whatsapp messages`, () => {
  const unsentMessages = [];

  test(`You authorized Whatsapp Web`, async () => {
    await page.goto(`https://web.whatsapp.com`);
    await page.waitForSelector(`input[title="${config.findInputTitle}"]`, { timeout: 0 });
  }, 60000);
  afterAll(() => {
    if (unsentMessages.length) {
      console.log("All messages are beeen sent but the followings");
      console.log(unsentMessages);
    } else {
      console.log("All the messages are beeen sent 😊");
    }
  });

  describe.each(messages)("Message to %s", (user, message) => {
    let userExist = false;

    test(`The user exists`, async () => {
      // we first need to select the correct user
      const findUserSel = `input[title="${config.findInputTitle}"]`;
      await page.focus(findUserSel);
      // the input will be cleared before searching
      await clearInput(findUserSel);
      await page.type(findUserSel, user, { delay: 0 });
      // both already-chatted and never-chatted users will be found
      const userListItemSel = `span[title="${user}"]`;
      unsentMessages.push([user, message]);
      await page.waitForSelector(userListItemSel, { timeout: 3000 });
      unsentMessages.pop();
      userExist = true;

      // clicks it to open the corresponding chat
      await page.click(userListItemSel);

      // a delay to let the chat user panel load
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
    }, 10000);

    // every line break corresponds to a "ENTER" key press so a multiline message can't be tested without sending it
    let testFun = test;
    if (TEST_SAFELY && lineBreakRegex.exec(message)) {
      test(`The message contains line breaks, a test against it will send part of the message itself so the next test will be skipped`, () => {});
      testFun = test.skip;
    }

    testFun(
      `Writes the message`,
      async () => {
        expect(userExist).toBeTruthy();
        await page.keyboard.type(message, { delay: 0 });
      },
      30000
    );

    (TEST_SAFELY ? test.skip : test)(
      `Sends the message`,
      async () => {
        expect(userExist).toBeTruthy();
        await page.keyboard.press("Enter");

        await page.evaluate(
          CHECK_DELAY => new Promise(resolve => setTimeout(resolve, CHECK_DELAY)),
          CHECK_DELAY
        );
      },
      5000
    );
  });
});
