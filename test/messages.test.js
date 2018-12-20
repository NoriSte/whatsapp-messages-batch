/*
funziona anche con contatti con i quali non si ha mai chattato
in caso di ritorni a capo il messaggio verrà splittato
*/

const TEST_SAFELY = true;

const puppeteer = require("puppeteer");
require("pptr-testing-library/extend");
let browser;
let page;

const config = {
  findInputTitle: "Cerca o inizia una nuova chat"
};

let messages = [
  [
    "Antonio Riva",
    `Riceverai un pò di messaggi automatici da parte mia Ravio, non ti preoccupare e ignora questi messaggi, poi ti spiegherò 😁`
  ],
  [
    "Valentina Menaballi",
    `[TEST] Ciao amore!!

anche oggi farai parte di alcuni test 😁`
  ]
];

const lineBreakRegex = /(?:\r\n|\r|\n)/g;
// to remove line breaks...
// messages = messages.map(([user, message]) => [user, message.replace(lineBreakRegex, " ")]);

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    userDataDir: ".tmp"
    // executablePath: "/Applications/Google Chrome.app"
  });
  page = await browser.newPage();
});
afterAll(async () => {
  // TODO: decomment them
  // await page.close();
  // await browser.close();
});

const clearInput = async selector =>
  page.evaluate(selector => (document.querySelector(selector).value = ""), selector);

describe(`Whatsapp messages`, () => {
  test(`You authorized Whatsapp Web`, async () => {
    await page.goto(`https://web.whatsapp.com`);
    await page.waitForSelector(`input[title="${config.findInputTitle}"]`, { timeout: 0 });
  }, 60000);
  describe.each(messages)("Message to %s", (user, message) => {
    test(`The user exists`, async () => {
      const findUserSel = `input[title="${config.findInputTitle}"]`;
      await page.focus(findUserSel);
      await clearInput(findUserSel);
      await page.type(findUserSel, user);
      const userListItemSel = `span[title="${user}"]`;
      await page.waitForSelector(userListItemSel, { timeout: 2000 });
      await page.click(userListItemSel);
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
    }, 5000);

    let testFun = test;
    if (TEST_SAFELY && lineBreakRegex.exec(message)) {
      test(`The message contains line breaks, a test against it will send part of the message itself`, () => {
        expect(true).toBe(true);
      });
      testFun = test.skip;
    }
    testFun(
      `The message can be written`,
      async () => {
        await page.keyboard.type(message);
      },
      5000
    );
  });
});
