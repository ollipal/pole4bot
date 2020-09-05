//bug fix: https://github.com/yagop/node-telegram-bot-api/issues/319
process.env.NTBA_FIX_319 = 1;

const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const pole4info = require("./src/pole4info");
const polling = require("./src/polling");
const db = require("./src/db");

(async () => {
  const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true,
  });
  const browser = await pole4info.getBrowser();
  polling.startPolling(bot, browser);

  bot.on("message", (msg) => {
    (async () => {
      await addUserIfNew(msg);
      try {
        const command = msg.text.split(" ")[0];
        switch (command) {
          case "/start":
            await start(bot, msg);
            break;
          case "/help":
            help(bot, msg);
            break;
          case "/poll":
            await poll(bot, msg, browser);
            break;
          default:
            await reply(bot, msg, browser);
        }
      } catch (e) {
        console.log(e);
        bot.sendMessage(msg.chat.id, e);
        help(bot, msg);
      }
    })();
  });
})();

const addUserIfNew = async (msg) => {
  if (!(await db.getUser(msg.from.id))) {
    console.log(`Creating new user ${msg.from.username}`);
    await db.createUser(
      msg.from.id,
      `${msg.from.first_name} ${msg.from.last_name}`,
      msg.from.username
    );
  }
};

const start = async (bot, msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to pole4bot!");
  help(bot, msg);
};

const help = (bot, msg) => {
  bot.sendMessage(
    msg.chat.id,
    `usage: \`location/day/className\`\nfor example: \`Pasila/Keskiviikko/Poletech 3\``,
    { parse_mode: "MarkdownV2" }
  );
};

const poll = async (bot, msg, browser) => {
  const command = msg.text.split(" ")[1];
  const status = await pole4info.getStatus(
    await pole4info.getPage(browser),
    command
  );
  await db.createPoll(msg.from.id, command, status);
  bot.sendMessage(msg.chat.id, `Polling started for '${command}':\n${status}`);
};

const reply = async (bot, msg, browser) => {
  let page = await pole4info.getPage(browser);
  const statusThisWeek = await pole4info.getStatus(page, msg.text);
  page = await pole4info.getNextWeek(page);
  const statusNextWeek = await pole4info.getStatus(page, msg.text);
  page = await pole4info.getNextWeek(page);
  const statusNextNextWeek = await pole4info.getStatus(page, msg.text);

  bot.sendMessage(
    msg.chat.id,
    `${statusThisWeek}\n\n${statusNextWeek}\n\n${statusNextNextWeek}`
  );
};
