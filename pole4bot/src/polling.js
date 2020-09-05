const pole4info = require("./pole4info");
const db = require("./db");
const POLLING_FREQ_MS = 10000;

const startPolling = async (bot, browser) => {
  while (true) {
    try {
      console.log("Polling...");
      const polls = await db.getPolls();

      let page = await pole4info.getPage(browser);
      await pollMultiple(page, bot, polls, "this");

      page = await pole4info.getNextWeek(page);
      await pollMultiple(page, bot, polls, "next");

      page = await pole4info.getNextWeek(page);
      await pollMultiple(page, bot, polls, "nextnext");
    } catch (e) {
      console.warn(`Polling error: ${e}`);
    }
    await sleep(POLLING_FREQ_MS);
  }
};

const pollMultiple = async (page, bot, polls, week) => {
  for (poll of polls) {
    // skip if not the correct week
    const pollWeek = pole4info.parseCommand(poll.command).week;
    if (pollWeek !== undefined && pollWeek !== week) {
      continue;
    }
    const status = await pole4info.getStatus(page, poll.command);
    switch (week) {
      case "this":
        await updatePollAndSendMessageIfNeeded(
          poll.shortStatusThis,
          status,
          "shortStatusThis",
          poll,
          bot
        );
        break;
      case "next":
        await updatePollAndSendMessageIfNeeded(
          poll.shortStatusNext,
          status,
          "shortStatusNext",
          poll,
          bot
        );
        break;
      case "nextnext":
        await updatePollAndSendMessageIfNeeded(
          poll.shortStatusNextNext,
          status,
          "shortStatusNextNext",
          poll,
          bot
        );
        break;
    }
  }
};

const updatePollAndSendMessageIfNeeded = async (
  previousShortStatus,
  currentStatus,
  shortStatusName,
  poll,
  bot
) => {
  if (previousShortStatus !== currentStatus.shortStatus) {
    const newStatus = {};
    newStatus[shortStatusName] = currentStatus.shortStatus;
    console.log(`Updating '${poll.command}' status`);
    await db.updatePollStatus(poll, newStatus);
    if (!currentStatus.longStatus.endsWith(pole4info.PAST_POSTFIX)) {
      bot.sendMessage(
        poll.user,
        `${poll.command} update:\n${currentStatus.longStatus}`
      );
    }
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = {
  startPolling,
};
