process.env.NTBA_FIX_319 = 1; //bug fix: https://github.com/yagop/node-telegram-bot-api/issues/319
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const pole4info = require("./src/pole4info");
const polling = require("./src/polling");

(async () => {
  const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true,
  });
  const browser = await pole4info.getBrowser();
  polling.startPolling(bot, browser, 253621152);

  bot.on("message", (msg) => {
    console.log(msg.chat.id);
    console.log(msg);
    (async () => {
      switch (msg.text.toString()) {
        case "/start":
          greet(bot, msg);
          break;
        case "/help":
          help(bot, msg);
          break;
        default:
          await reply(bot, msg, browser);
      }
    })();
  });
})();

const greet = (bot, msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to pole4bot!");
  help(bot, msg);
};

const help = (bot, msg) => {
  bot.sendMessage(
    msg.chat.id,
    `
usage: \`location/day/className\`
for example: \`Pasila/Keskiviikko/Poletech 3\`

\\(multiple identical classNames on the same day is not currently supported\\)`,
    { parse_mode: "MarkdownV2" }
  );
};

const reply = async (bot, msg, browser) => {
  try {
    bot.sendMessage(msg.chat.id, await pole4info.getStatus(browser, msg.text));
  } catch (e) {
    bot.sendMessage(msg.chat.id, e.toString());
    help(bot, msg);
  }
};
