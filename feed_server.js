const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const express = require('express');
const app = express();
const port = 3001;
const axios = require('axios');

function equalsCheck(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function getLivesFromChannel(driver) { // returns the live url ** i´m supposing one stream per channel **
  let xpath = '/html/body/ytd-app/div[1]/ytd-page-manager/ytd-browse/ytd-two-column-browse-results-renderer/div[1]/ytd-section-list-renderer/div[2]/ytd-item-section-renderer[1]/div[3]/ytd-channel-featured-content-renderer/div[2]/ytd-video-renderer/div[1]/ytd-thumbnail/a'
  
  try {
      let element = await driver.wait(until.elementLocated(By
                  .xpath(xpath)
                  
                  ), 2000) ////*[@id="thumbnail"][@id="info"]/span[1]
      //console.log(`${info[0].split('.').join('')}`);
      return element.getAttribute("href");
  } catch (e) {
        console.log(`No streams for ${await driver.getTitle()}`);
        return 'Empt';
  } 
}

async function update_list(channels_list, check_lives_driver) { //returns updated list
  const start = Date.now();
  let list_of_streams = [];
  for(channel of channels_list) {
      console.log(`Trying to get ${channel}`)
      try{
          await check_lives_driver.get(channel);
          let live_url = await getLivesFromChannel(check_lives_driver);
          list_of_streams.push(live_url);
      }
      catch(e){
          console.log('Something went wrong with update_list\n' + e);
      }
  }
  //console.log(list_of_streams);
  const end = Date.now();
  console.log(`Execution time: ${(end - start)/1000}s`);
  return list_of_streams;


}

async function main() {
    const CNN = 'https://www.youtube.com/@CNNbrasil';
    const JPNews = 'https://www.youtube.com/@jovempannews';
    const JPNews_Bauru = 'https://www.youtube.com/@JovemPanNewsBauru';
    const UOL = 'https://www.youtube.com/@uol';
    const Revista_Oeste = 'https://www.youtube.com/@RevistaOeste';
    const ICL = 'https://www.youtube.com/@InstitutoConhecimentoLiberta';
    const Brazil247 = 'https://www.youtube.com/@brasil247';
    const Panico = 'https://www.youtube.com/@panicojovempan';
  
    let channels_list = [CNN, JPNews, JPNews_Bauru, UOL, Revista_Oeste, ICL, Brazil247, Panico];
    let stream_list = [];
    let start = 0;
    let check_lives_driver = await new Builder()
      .forBrowser('firefox')
      //.forBrowser(Browser.CHROME)
      .setFirefoxOptions(new firefox.Options().headless())
      .build(); 
    stream_list = [];
  
    app.get('/', async (req, res) => {
        console.log('hi');
        res.send({item:stream_list});
    })
    app.listen(port, async () => {
      console.log(`Example app listening on port ${port}`);
      let new_list = await update_list(channels_list, check_lives_driver);
      for(link of new_list) {
        stream_list.push(link);
      }
      axios.post('http://localhost:3003/startuptest', { new_list: new_list })
              .then(response => {
                  console.log(response.data);
              });
      setInterval(async () => {
        new_list = await update_list(channels_list, check_lives_driver);
        if(!equalsCheck(new_list, stream_list)) {
          axios.post('http://localhost:3003/new_list', { new_list: new_list })
          .then(response => {
              console.log(response.data);
              // Handle the response as needed
          });
        }
      }
      ,60000)
    })
  
} 

main();
