const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const express = require('express');
const app = express();
const port = 3000;
const mysql = require("mysql2");


async function getChannelNameFromStreamDriver(stream_driver) {
  let xpath = '/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[2]/ytd-watch-metadata/div/div[2]/div[1]/ytd-video-owner-renderer/div[1]/ytd-channel-name/div/div/yt-formatted-string/a';
  
  try {
      let element = await stream_driver.wait(until.elementLocated(By
                  .xpath(xpath)
                  
                  ), 2000) ////*[@id="thumbnail"][@id="info"]/span[1]
      //console.log(`${info[0].split('.').join('')}`);
      return element.getText();
  } catch (e) {
      return 'err'+e;
  } 
}

async function connect(){
  if(global.connection && global.connection.state !== 'disconnected')
      return global.connection;

  
  const connection = await mysql.createConnection("mysql://root:renan123@localhost:3306/db_sistema");
  console.log("Conectou no MySQL!");
  global.connection = connection;
  return connection;
}

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
} 

async function loadStreams(list_of_streams) { // returns array of loaded drivers for each stream link
  let list_of_loaded_stream_drivers = [] 
  for(stream of list_of_streams) {
    try{
      let stream_drive = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(new firefox.Options().headless())
        .build();
      await stream_drive.get(stream);
      list_of_loaded_stream_drivers.push(stream_drive);

    }
    catch(e){
      console.log(e)
    }
  }

  return list_of_loaded_stream_drivers;
}

async function getStreams(list_of_channel_drivers) { // return array of lives urls
  let list_of_streams = [];
  for (channel_driver of list_of_channel_drivers) {
    try{
      let stream_link = await getLivesFromChannel(channel_driver);
      list_of_streams.push(stream_link);
    }
    catch(e){
      console.log(e);
    }
  }
  return list_of_streams;
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
      return 'err'+e;
  } 
}



async function getViewers(driver) {
  try {
    let element = await driver
      .wait(until.elementLocated(By.xpath('/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[2]/ytd-watch-metadata/div/div[4]/div[1]/div/div[1]/yt-formatted-string/span[1]')), 10000) ////*[@id="thumbnail"]
      .getText();
    let info = element.split(' ');
    //console.log(`${info[0].split('.').join('')}`);
    return info[0].split('.').join('');
  } catch (e) {
    return 'err'+e;
  } 
}

async function main() {
  let con = await connect();
  let list_of_channel_drivers = [];
  let list_of_streams = []
  let list_of_loaded_stream_drivers = [];
  /**
   * https://www.youtube.com/@CNNbrasil
   * https://www.youtube.com/@jovempannews
   * UOL https://www.youtube.com/@uol
   * Revista Oeste https://www.youtube.com/@RevistaOeste
   * ICL https://www.youtube.com/@InstitutoConhecimentoLiberta
   * Brazil247 https://www.youtube.com/@brasil247
   * Panico https://www.youtube.com/@panicojovempan
   */

  let CNN = 'https://www.youtube.com/@CNNbrasil';
  let JPNews = 'https://www.youtube.com/@jovempannews';
  let JPNews_Bauru = 'https://www.youtube.com/@JovemPanNewsBauru';
  let UOL = 'https://www.youtube.com/@uol';
  let Revista_Oeste = 'https://www.youtube.com/@RevistaOe';
  let ICL = 'https://www.youtube.com/@InstitutoConhecimen';
  let Brazil247 = 'https://www.youtube.com/@brasil247';
  let Panico = 'https://www.youtube.com/@panicojovempan';


  /**
   * Criar um driver para cada canal vai consumir muita memoria
   * É mais facil criar um driver e ir fazendo o get um por um
   * 
   */
  let check_lives_driver = await new Builder()
    .forBrowser('firefox')
    //.forBrowser(Browser.CHROME)
    .setFirefoxOptions(new firefox.Options().headless())
    .build(); 

  let channel_list = [CNN, JPNews, JPNews_Bauru, UOL, Revista_Oeste, ICL, Brazil247, Panico];
  let jp_driver = await new Builder()
    .forBrowser('firefox')
    //.forBrowser(Browser.CHROME)
    .setFirefoxOptions(new firefox.Options().headless())
    .build();
  let cnn_driver = await new Builder()
    .forBrowser('firefox')
    //.forBrowser(Browser.CHROME)
    .setFirefoxOptions(new firefox.Options().headless())
    .build(); 
  try {
    //https://www.youtube.com/@JovemPanNewsBauru
    //https://www.youtube.com/@jovempannews
    //https://www.youtube.com/@panicojovempan
    await jp_driver.get('https://www.youtube.com/@jovempannews');
    await cnn_driver.get('https://www.youtube.com/@CNNbrasil');
    list_of_channel_drivers = [jp_driver,cnn_driver];
    list_of_streams = await getStreams(list_of_channel_drivers);

    list_of_loaded_stream_drivers = await loadStreams(list_of_streams);

    for(stream_driver of list_of_loaded_stream_drivers){
      console.log(await stream_driver.getTitle());
      console.log(await getChannelNameFromStreamDriver(stream_driver));
      console.log(await getViewers(stream_driver));
    }
    console.log('ready');
  } catch(e) {
    console.log(e + '\n erro carregando pagina');
  } 
  
  // finally {
  //   jp_driver.quit();
  // }
  let a = 0;

  app.get('/', async (req, res) => {

    for(let i = 0; i < 100; i++) {
      await delay(2000);
      
      let i = 0;
      for(stream_driver of list_of_loaded_stream_drivers){
        let title = await stream_driver.getTitle();
        let views = await getViewers(stream_driver);
        let channel = await getChannelNameFromStreamDriver(stream_driver)
        let side_n = i;
        let side;
        if (side_n%2 == 0) side = 'd'; //Gambiarra, use case switch. Eu que vou fornecer os chnnels
        else side = 'e';
        let sql = `INSERT INTO db_sistema.padrao (timestamp, views, channel, title, side) VALUES (CURRENT_TIME(),${views},'${channel}','${title}','${side}');`
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
        });
        
        // console.log(title);
        // console.log(views);
        i++;
      } 

    }
  })
  app.get('/getviews', async (req, res) => {

    
  })

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  })

} 


main();













(async function example() {
  let jp_driver = await new Builder()
  .forBrowser('firefox')
  //.forBrowser(Browser.CHROME)
  .build();
  try {
    await jp_driver.get('https://www.youtube.com/watch?v=RtvBSKrPhh0&ab_channel=JovemPanNews');
    let element = await jp_driver
      .wait(until.elementLocated(By.xpath('//*[@id="info"]/span[1]')), 10000)
      .getText();
    let info = element.split(' ');
    console.log(`${info[0]}`);
  } finally {
    jp_driver.quit();
  }
});

/**
 * enter stream
 * stay and retrieve whenever called
 * 
 */