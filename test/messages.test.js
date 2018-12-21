const config = require("../config");
const { messages } = require("../messages");

const puppeteer = require("puppeteer");
let browser;
let page;
const lineBreakRegex = /(?:\r\n|\r|\n)/g;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false, // set it to true at your own risk and remember that the first time you need to authorize WhatsApp scanning the QR code
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
    if (config.TEST_SAFELY && lineBreakRegex.exec(message)) {
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

    (config.TEST_SAFELY ? test.skip : test)(
      `Sends the message`,
      async () => {
        expect(userExist).toBeTruthy();
        await page.keyboard.press("Enter");

        await page.evaluate(
          CHECK_DELAY => new Promise(resolve => setTimeout(resolve, CHECK_DELAY)),
          config.CHECK_DELAY
        );
      },
      5000
    );
  });

  afterAll(() => {
    if (unsentMessages.length) {
      console.log("All messages are beeen sent but the followings");
      console.log(unsentMessages);
    } else {
      console.log("All the messages are beeen sent 😊");
    }
  });
});
