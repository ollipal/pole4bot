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

const getStatus = async (page, msg) => {
  try {
    const { hasSpace, date, location, day, className } = await getInfo(
      page,
      msg
    );
    if (moment(date, "DD.MM.YYYY").isBefore(moment(), "Day")) {
      return `${className} on ${day} ${date} in ${location} ${PAST_POSTFIX}`;
    }
    if (hasSpace) {
      return `${className} on ${day} ${date} in ${location} has space!
https://www.polenow.com/calendarday.php?day=${date}`;
    } else {
      return `${className} ${day} ${date} in ${location} is full :(`;
    }
  } catch (e) {
    return e;
  }
};

const getInfo = async (page, command) => {
  const { location, day, className } = parseCommand(command);
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

const parseCommand = (command) => {
  const commandParts = command.split("/");
  if (commandParts.length !== 3) {
    throw `Cannot parse command '${command}'`;
  }
  return {
    location: commandParts[0],
    day: commandParts[1],
    className: commandParts[2],
  };
};

module.exports = {
  PAST_POSTFIX,
  getBrowser,
  getPage,
  getStatus,
};
