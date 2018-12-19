const puppeteer = require("puppeteer");
require("pptr-testing-library/extend");
let browser;
let page;

const config = {
  findInputTitle: "Cerca o inizia una nuova chat"
};

const messages = [
  {
    user: "Valentina Menaballi",
    message: `Ciao amore!!

anche oggi farai parte di alcuni test 😁`
  },
  {
    user: "Antonio Riva",
    message: `Riceverai un pò di messaggi automatici da parte mia Ravio, non ti preoccupare e ignora questi messaggi, poi ti spiegherò 😁`
  },
  {}
];

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    userDataDir: ".tmp"
    // executablePath: "/Applications/Google Chrome.app"
  });
  page = await browser.newPage();
});
afterAll(async () => {
  // await page.close();
  // await browser.close();
});

describe(`Whatsapp messages`, () => {
  test(`The user authorizes Whatsapp Web`, async () => {
    await page.goto(`https://web.whatsapp.com`);
    await page.waitForSelector(`input[title="${config.findInputTitle}"]`, { timeout: 0 });
  }, 60000);
  test(`First message`, async () => {
    const data = messages[0];
    const $document = await page.getDocument();
    const $input = await $document.getByTitle(config.findInputTitle);
    await page.type(`input[title="${config.findInputTitle}"]`, data.user);
  }, 600000);
});
