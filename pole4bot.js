import pkg from "node-telegram-bot-api";
import dotenv from "dotenv";
import { getBrowser, hasSpace } from "./puppeteer.js";
dotenv.config();
const TelegramBot = pkg;

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

bot.on("message", (msg) => {
  (async () => {
    const msgParts = msg.text.toString().split("/");
    if (msgParts.length !== 3) {
      bot.sendMessage(
        msg.chat.id,
        "Cannot parse message,\nusage: LOCATION/DAY/CLASS"
      );
      return;
    }
    const browser = await getBrowser();
    bot.sendMessage(
      msg.chat.id,
      await hasSpace(browser, msgParts[0], msgParts[1], msgParts[2])
    );
    await browser.close();
  })();
});
