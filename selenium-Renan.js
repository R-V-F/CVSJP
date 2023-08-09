const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const express = require('express');
const app = express();
const port = 3000;


async function getLivesFromChannel(driver) {
  try {
      let element = await driver.wait(until.elementLocated(By
                  .xpath(xpath)
                  
                  ), 2000) ////*[@id="thumbnail"][@id="info"]/span[1]
      //console.log(`${info[0].split('.').join('')}`);
      return element.getAttribute("href");
  } catch (e) {
      return 'err'+e;
  } 
}



async function getViewers(driver) {
  try {
    let element = await driver
      .wait(until.elementLocated(By.xpath('//*[@id="info"]/span[1]')), 10000) ////*[@id="thumbnail"]
      .getText();
    let info = element.split(' ');
    //console.log(`${info[0].split('.').join('')}`);
    return info[0].split('.').join('');
  } catch (e) {
    return 'err'+e;
  } 
}

async function main() {
  let driver = await new Builder()
  .forBrowser('firefox')
  //.forBrowser(Browser.CHROME)
  .setFirefoxOptions(new firefox.Options().headless())
  .build();
  try {
    await driver.get('https://www.youtube.com/@jovempannews');
    console.log('ready');
  } catch(e) {
    console.log(e + '\n erro carregando pagina');
  } 
  // finally {
  //   driver.quit();
  // }

  app.get('/', async (req, res) => {
    console.log( await getLivesFromChannel(driver) );
    res.send('Hello World!');
  })

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  })

} 


main();













(async function example() {
  let driver = await new Builder()
  .forBrowser('firefox')
  //.forBrowser(Browser.CHROME)
  .build();
  try {
    await driver.get('https://www.youtube.com/watch?v=RtvBSKrPhh0&ab_channel=JovemPanNews');
    let element = await driver
      .wait(until.elementLocated(By.xpath('//*[@id="info"]/span[1]')), 10000)
      .getText();
    let info = element.split(' ');
    console.log(`${info[0]}`);
  } finally {
    driver.quit();
  }
});

/**
 * enter stream
 * stay and retrieve whenever called
 * 
 */