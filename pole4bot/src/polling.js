const pole4info = require("./pole4info");
const db = require("./db");
const POLLING_FREQ_MS = 1000 * 60 * 5;

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
      if (process.env.ADMIN) {
        bot.sendMessage(process.env.ADMIN, `ADMIN: Polling error: ${e}`);
      } else {
        console.log("ADMIN not set on .env, check the README");
      }
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

const showPolls = async (bot, user) => {
  const polls = await db.getPolls();
  let i = 1;
  let reply = "Polls:\n";
  for (poll of polls) {
    if (poll.user !== user) {
      continue;
    }
    reply += `\n[${i}] ${poll.command}:\n`;
    if (poll.shortStatusThis !== "-") {
      reply += `this: ${poll.shortStatusThis}\n`;
    }
    if (poll.shortStatusNext !== "-") {
      reply += `next: ${poll.shortStatusNext}\n`;
    }
    if (poll.shortStatusNextNext !== "-") {
      reply += `nextnext: ${poll.shortStatusNextNext}\n`;
    }
    i++;
  }
  if (reply === "Polls:\n") {
    reply = "No active polls";
  }
  bot.sendMessage(user, reply);
};

const createPoll = async (command, user, bot, browser) => {
  const { reply, statuses } = await pole4info.getReplyAndStatuses(
    command,
    browser
  );
  await db.createPoll(user, command, statuses);
  bot.sendMessage(user, `Polling started for '${command}':\n${reply}`);
};

const removePoll = async (index, bot, user) => {
  const polls = await db.getPolls();
  let i = 1;
  let id = undefined;
  for (poll of polls) {
    if (poll.user !== user) {
      continue;
    }
    if (i === index) {
      id = poll.id;
      break;
    }
    i++;
  }
  if (id === undefined) {
    bot.sendMessage(user, `Poll [${index}] not found, check /poll`);
    return;
  }
  try {
    await db.deletePoll(id);
    bot.sendMessage(user, `Poll [${index}] removed`);
  } catch (e) {
    bot.sendMessage(user, `Poll [${index}] could not be removed`);
    console.warn(e);
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = {
  startPolling,
  showPolls,
  createPoll,
  removePoll,
};
