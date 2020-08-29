import puppeteer from "puppeteer";

export const getBrowser = async () => {
  return await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
};

export const hasSpace = async (browser, loc, day, className) => {
  try {
    const page = await browser.newPage();

    await page.goto(
      "https://www.polenow.com/pole4fit/index.php?date=1597681194"
    );
    await page.content();
    await page.screenshot({ path: "screenshot.png" });
    let data = await page.evaluate(
      ({ loc, day, className }) => {
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

        const locDiv = getElement(
          "loc",
          document,
          'div[class="CALENDARCONT"] > div',
          'div[class="col-md-12 top-buffer text-align"] > h4',
          loc
        );

        const dayDiv = getElement(
          "day",
          locDiv,
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

        return (
          classDiv
            .querySelector('div[class="classbutton"]')
            .innerText.split(/\r?\n/)
            .slice(-1)[0] === "Tilaa"
        );
      },
      { loc, day, className }
    );
    console.log(data);
    return data;
  } catch (e) {
    console.error(e.message);
    return e.message;
  }
};
