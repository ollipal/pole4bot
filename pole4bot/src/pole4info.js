const puppeteer = require("puppeteer");
var moment = require("moment");

const PAST_POSTFIX = "is in the past";

const getBrowser = async () => {
  return await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
};

const getPage = async (browser) => {
  const page = await browser.newPage();
  await page.goto("https://www.polenow.com/pole4fit/index.php");
  await page.content();
  return page;
};

const getNextWeek = async (page) => {
  await page.evaluate(() => {
    [...document.querySelectorAll('a[class="btn btn-sm btn-default"]')]
      .find((element) =>
        element.querySelector('span[class="glyphicon glyphicon-chevron-right"]')
      )
      .click();
  });
  const reqElements = [
    'div[class="CALENDARCONT"] > div',
    'div[class="panel panel-info day-panel"], div[class="panel panel-default day-panel"]',
    'div[role="alert"]',
  ];
  for (elem of reqElements) {
    await page.waitForSelector(elem);
  }
  return page;
};

const getStatus = async (page, command) => {
  try {
    const { hasSpace, date, location, day, className } = await getInfo(
      page,
      command
    );
    if (moment(date, "DD.MM.YYYY").isBefore(moment(), "Day")) {
      return {
        longStatus: `${className} on ${day} ${date} in ${location} ${PAST_POSTFIX}`,
        shortStatus: `${date} ${PAST_POSTFIX}`,
      };
    }
    if (hasSpace) {
      return {
        longStatus: `${className} on ${day} ${date} in ${location} has space!\nhttps://www.polenow.com/calendarday.php?day=${date}`,
        shortStatus: `${date} has space\n(https://www.polenow.com/calendarday.php?day=${date})`,
      };
    } else {
      return {
        longStatus: `${className} ${day} ${date} in ${location} is full :(`,
        shortStatus: `${date} is full`,
      };
    }
  } catch (e) {
    // shorten if multiline-errors
    return {
      longStatus: e.toString().split("\n")[0],
      shortStatus: e.toString().split("\n")[0],
    };
  }
};

const getStatuses = async (page, command, week) => {
  // all statuses to "-" initially
  let statusThis, statusNext, statusNextNext;
  statusThis = statusNext = statusNextNext = {
    longStatus: "-",
    shortStatus: "-",
  };
  if (week === undefined || week === "this") {
    statusThis = await getStatus(page, command);
  }
  // load only the required pages
  if (week !== "this") {
    page = await getNextWeek(page);
    if (week === undefined || week === "next") {
      statusNext = await getStatus(page, command);
    }
    if (week !== "next") {
      page = await getNextWeek(page);
      if (week === undefined || week === "nextnext") {
        statusNextNext = await getStatus(page, command);
      }
    }
  }
  return { statusThis, statusNext, statusNextNext };
};

const getInfo = async (page, command) => {
  const { location, day, className, week } = parseCommand(command);
  return await page.evaluate(
    ({ location, day, className }) => {
      getElement = (name, base, fromElements, subElement, includes) => {
        const element = [
          ...base.querySelectorAll(fromElements),
        ].find((element) =>
          element
            .querySelector(subElement)
            .innerHTML.toLowerCase()
            .includes(includes.toLowerCase())
        );
        if (element === undefined) {
          throw `${name} ${includes} was not found`;
        }
        return element;
      };

      const locationDiv = getElement(
        "location",
        document,
        'div[class="CALENDARCONT"] > div',
        'div[class="col-md-12 top-buffer text-align"] > h4',
        location
      );

      const dayDiv = getElement(
        "day",
        locationDiv,
        'div[class="panel panel-info day-panel"], div[class="panel panel-default day-panel"]',
        'div[class="panel-heading"] > div[class="panel-heading"]',
        day
      );

      const classDiv = getElement(
        "className",
        dayDiv,
        'div[role="alert"]',
        'div[class="classbutton"]',
        className
      );

      return {
        hasSpace:
          classDiv
            .querySelector('div[class="classbutton"]')
            .innerText.split(/\r?\n/)
            .slice(-1)[0] === "Tilaa",
        date: dayDiv
          .querySelector(
            'div[class="panel-heading"] > div[class="panel-heading"]'
          )
          .innerText.split(/\r?\n/)[1],
        location,
        day,
        className,
      };
    },
    { location, day, className }
  );
};

const getReplyAndStatuses = async (command, browser) => {
  // get command parts, and also fail immediatly if not parseable
  const { location, day, className, week } = parseCommand(command);

  // get statuses
  let page = await getPage(browser);
  const statuses = await getStatuses(page, command, week);

  // get reply
  let reply;
  switch (week) {
    case "this":
      reply = statuses.statusThis.longStatus;
      break;
    case "next":
      reply = statuses.statusNext.longStatus;
      break;
    case "nextnext":
      reply = statuses.statusNextNext.longStatus;
      break;
    case undefined:
      reply = `${className} on ${day} in ${location}:
\n\nthis:\n${statuses.statusThis.shortStatus}
\n\nnext:\n${statuses.statusNext.shortStatus}
\n\nnextnext:\n${statuses.statusNextNext.shortStatus}`;
      break;
  }
  return {
    reply,
    statuses,
  };
};

const parseCommand = (command) => {
  let commandParts = command.split("/");
  if (commandParts.length === 3) {
    commandParts.push(undefined);
  }
  if (
    commandParts.length !== 4 ||
    !["this", "next", "nextnext", undefined].includes(commandParts[3])
  ) {
    throw `Cannot parse command '${command}'`;
  }
  return {
    location: commandParts[0],
    day: commandParts[1],
    className: commandParts[2],
    week: commandParts[3],
  };
};

module.exports = {
  PAST_POSTFIX,
  getBrowser,
  getPage,
  getNextWeek,
  getStatus,
  getStatuses,
  getReplyAndStatuses,
  parseCommand,
};
