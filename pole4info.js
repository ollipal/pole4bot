const puppeteer = require("puppeteer");

const getBrowser = async () => {
  return await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
};

const getStatus = async (browser, msg) => {
  const { hasSpace, date, location, day, className } = await getInfo(
    browser,
    msg
  );
  console.log(date);
  if (hasSpace) {
    return `${className} on ${day} ${date} in ${location} has spots left!
https://www.polenow.com/calendarday.php?day=${date}`;
  } else {
    return `${className} ${day} ${date} in ${location} is now full :(`;
  }
};

const getInfo = async (browser, msg) => {
  const { location, day, className } = parseMsg(msg);
  const page = await browser.newPage();

  await page.goto("https://www.polenow.com/pole4fit/index.php");
  await page.content();
  await page.screenshot({ path: "screenshot.png" });
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

const parseMsg = (msg) => {
  const msgText = msg.text.toString();
  const msgParts = msgText.split("/");
  if (msgParts.length !== 3) {
    throw `Cannot parse message '${msgText}'`;
  }
  return { location: msgParts[0], day: msgParts[1], className: msgParts[2] };
};

module.exports = {
  getBrowser,
  getStatus,
};
