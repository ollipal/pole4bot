const pole4info = require("./pole4info");
const db = require("./db");
const POLLING_FREQ_MS = 10000;

const startPolling = async (bot, browser) => {
  while (true) {
    try {
      const page = await pole4info.getPage(browser);
      // poll current week
      for (poll of await db.getPolls("current")) {
        console.log(`Polling ${poll}`);
        const status = await pole4info.getStatus(page, poll.command);
        console.log(status);
        bot.sendMessage(poll.user, status);
      }
    } catch (e) {
      console.warn(`Polling error: ${e}`);
    }
    await sleep(POLLING_FREQ_MS);
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  startPolling,
};
