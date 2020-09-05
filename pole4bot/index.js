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
          case "/rm":
            await rm(bot, msg, browser);
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
  const command = msg.text.substr(msg.text.indexOf(" ") + 1);
  if (command === "/poll") {
    await polling.showPolls(bot, msg.from.id);
  } else {
    await polling.createPoll(command, msg.from.id, bot, browser);
  }
};

const rm = async (bot, msg, browser) => {
  const command = msg.text.substr(msg.text.indexOf(" ") + 1);
  if (command === "/rm") {
    bot.sendMessage(msg.chat.id, "No index was given");
  } else {
    const index = parseInt(command);
    await polling.removePoll(index, bot, msg.from.id);
  }
};

const reply = async (bot, msg, browser) => {
  const { reply } = await pole4info.getReplyAndStatuses(msg.text, browser);
  bot.sendMessage(msg.chat.id, reply);
};
