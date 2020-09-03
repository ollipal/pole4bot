const pole4info = require("./pole4info");
let polls = [];

const startPolling = async (bot, browser, chatID) => {
  while (true) {
    try {
      bot.sendMessage(chatID, await pole4info.getStatus(browser, "asdf"));
    } catch (e) {
      bot.sendMessage(chatID, e.toString());
    }
    await sleep(30000);
  }
};

const addToPolling = () => {};

const getPollingStatus = () => {};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  startPolling,
};
