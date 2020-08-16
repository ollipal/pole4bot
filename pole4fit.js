const browser = await puppeteer.launch();

const page = await browser.newPage();
await page.goto('https://www.polenow.com/pole4fit/index.php?date=1597681194');
await page.content();
await page.screenshot({path: 'screenshot.png'});

/* Run javascript inside of the page */
  let data = await page.evaluate(() => {

    
const loc = 'Pasila'
const day = 'Maanantai'
const className = 'Poletech 1'

const locDiv = [...document.querySelector('div[class="CALENDARCONT"]').children]
.find(l => l.querySelector('div[class="col-md-12 top-buffer text-align"] > h4').innerHTML.toLowerCase().includes(loc.toLowerCase()));

const dayDiv = [...locDiv.querySelectorAll('div[class="panel panel-default day-panel"]')]
.find(d => d.querySelector('div[class="panel-heading"] > div[class="panel-heading"]').innerHTML.toLowerCase().includes(day.toLowerCase()));

const classDiv = [...dayDiv.querySelectorAll('div[role="alert"]')]
.find(c => c.querySelector('div[class="classbutton"]').innerHTML.toLowerCase().includes(className.toLowerCase()));

return classDiv.querySelector('div[class="classbutton"]').innerText.split(/\r?\n/).slice(-1)[0] === "Tilaa"
 });

console.log(data)


await browser.close();
