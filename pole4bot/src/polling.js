const pole4info = require("./pole4info");
const db = require("./db");
const POLLING_FREQ_MS = 10000;

const startPolling = async (bot, browser) => {
  while (true) {
    try {
      const page = await pole4info.getPage(browser);
      await pollWeek("current", page, bot);
    } catch (e) {
      console.warn(`Polling error: ${e}`);
    }
    await sleep(POLLING_FREQ_MS);
  }
};

const pollWeek = async (week, page, bot) => {
  for (poll of await db.getPolls(week)) {
    console.log(`Polling '${poll.command}'`);
    const status = await pole4info.getStatus(page, poll.command);
    console.log(status);
    if (poll.status !== status) {
      await db.updatePollStatus(week, poll, status);
      bot.sendMessage(poll.user, status);
    }
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  startPolling,
};
