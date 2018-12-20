/*
funziona anche con contatti con i quali non si ha mai chattato
in caso di ritorni a capo il messaggio verrà splittato
si può usarlo in modalità safe
è per italiano
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
  ["Antonio Riva", `Buon Natale caro! 🎄`],
  [
    "Valentina Menaballi",
    `Buon Natale!!
    Ti piacciono questi auguri inviati in automatico??
    😊😇🎄`
  ],
  ["Steve Jobs", "🙁"],
  ["Matteo Miccoli", `Ormai di sarai abituato a ricevere messaggi di test 😁`]
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
  test(`You authorized Whatsapp Web`, async () => {
    await page.goto(`https://web.whatsapp.com`);
    await page.waitForSelector(`input[title="${config.findInputTitle}"]`, { timeout: 0 });
  }, 60000);
  describe.each(messages)("Message to %s", (user, message) => {
    let userExist = false;
    test(`The user exists`, async () => {
      // we first need to select the correct user
      const findUserSel = `input[title="${config.findInputTitle}"]`;
      await page.focus(findUserSel);
      // the input will be cleared before searching
      await clearInput(findUserSel);
      await page.type(findUserSel, user);
      // both already-chatted and never-chatted users will be found
      const userListItemSel = `span[title="${user}"]`;
      await page.waitForSelector(userListItemSel, { timeout: 2000 });
      userExist = true;
      // clicks it to open the corresponding chat
      await page.click(userListItemSel);

      // a delay to let the chat user panel load
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
    }, 5000);

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
        await page.keyboard.type(message);
      },
      5000
    );

    (TEST_SAFELY ? test.skip : test)(
      `Sends the message`,
      async () => {
        expect(userExist).toBeTruthy();
        await page.keyboard.press("Enter");
      },
      5000
    );
  });
});
