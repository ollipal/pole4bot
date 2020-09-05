const pole4info = require("./pole4info");
const db = require("./db");
const POLLING_FREQ_MS = 10000;

const startPolling = async (bot, browser) => {
  while (true) {
    try {
      const polls = await db.getPolls();

      console.log("Polling this");
      let page = await pole4info.getPage(browser);
      await pollMultiple(page, bot, polls, "this");

      console.log("Polling next");
      page = await pole4info.getNextWeek(page);
      await pollMultiple(page, bot, polls, "next");

      console.log("Polling nextnext");
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
    const parsedCommand = pole4info.parseCommand(poll.command);
    if (parsedCommand.week !== undefined && parsedCommand.week !== week) {
      continue;
    }
    console.log(`\t${poll.command}`);
    const status = await pole4info.getStatus(page, poll.command);
    switch (week) {
      case "this":
        if (poll.shortStatusThis !== status.shortStatus) {
          if (parsedCommand.week !== undefined) {
            await db.updatePollStatus(poll, {
              shortStatusThis: status.shortStatus,
            });
          } else {
            await db.updatePollStatus(poll, {
              shortStatusThis: status.shortStatus,
              shortStatusNext: poll.shortStatusNext,
              shortStatusNextNext: poll.shortStatusNextNext,
            });
          }
          if (!status.longStatus.endsWith(pole4info.PAST_POSTFIX)) {
            bot.sendMessage(
              poll.user,
              `${poll.command} update:\n${status.longStatus}`
            );
          }
        }
        break;
      case "next":
        if (poll.shortStatusNext !== status.shortStatus) {
          if (parsedCommand.week !== undefined) {
            await db.updatePollStatus(poll, {
              shortStatusNext: status.shortStatus,
            });
          } else {
            await db.updatePollStatus(poll, {
              shortStatusThis: poll.shortStatusThis,
              shortStatusNext: status.shortStatus,
              shortStatusNextNext: poll.shortStatusNextNext,
            });
          }
          if (!status.longStatus.endsWith(pole4info.PAST_POSTFIX)) {
            bot.sendMessage(
              poll.user,
              `${poll.command} update:\n${status.longStatus}`
            );
          }
        }
        break;
      case "nextnext":
        if (poll.shortStatusNextNext !== status.shortStatus) {
          if (parsedCommand.week !== undefined) {
            await db.updatePollStatus(poll, {
              shortStatusNextNext: status.shortStatus,
            });
          } else {
            await db.updatePollStatus(poll, {
              shortStatusThis: poll.shortStatusThis,
              shortStatusNext: poll.shortStatusNext,
              shortStatusNextNext: status.shortStatus,
            });
          }
          if (!status.longStatus.endsWith(pole4info.PAST_POSTFIX)) {
            bot.sendMessage(
              poll.user,
              `${poll.command} update:\n${status.longStatus}`
            );
          }
        }
        break;
    }
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = {
  startPolling,
};
