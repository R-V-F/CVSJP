const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');
const express = require('express');
const app = express();
const port = 3000;

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 
async function isLive(driver) { // returns boolean ans
    let xpath = '/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[1]/div[2]/div/div/ytd-player/div/div/div[30]/div[2]/div[1]/div[1]/button';
    let xpath2 = '/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[1]/div[2]/div/div/ytd-player/div/div/div[29]/div[2]/div[1]/div[1]';
    try {
        let element = await driver
            .wait(until.elementLocated(By.xpath(xpath2)), 5000)
            //.getText();
        console.log(element);
        return true;
    } catch (e) {
        console.log('isLive error:\n'+e);
        return false;
    } 
}

async function main() {
    let xpath = '/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[2]/ytd-watch-metadata/div/div[4]/div[1]/div/div[1]/yt-formatted-string/span[1]';

    let xpath2 = '/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[1]/div[2]/div/div/ytd-player/div/div/div[33]/div[2]/div[1]/div[1]/button';
    let test_driver = await new Builder()
        //.forBrowser('firefox')
        .forBrowser(Browser.CHROME)
        //.setFirefoxOptions(new firefox.Options().headless())
        .setChromeOptions(new chrome.Options().headless())
        .build();
    await test_driver.get('https://www.youtube.com/watch?v=oRq1Z_vhvHQ&ab_channel=JovemPanNews');
    await delay(10000)
    await test_driver.getTitle();
    try {
        let element = await test_driver
            .wait(until.elementLocated(By.xpath(xpath2)), 10000)
            .getText();
        let info = element.split(' ');
        console.log(info);
        console.log((info.includes('agora') || info.includes('now')));
    } catch (e) {
        console.log('element not found');
    } 
}

main();

//i have to wait till the page loads completely