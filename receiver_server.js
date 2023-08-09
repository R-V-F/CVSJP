const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const express = require('express');
const app = express();
const port = 3003;

app.use(express.json()); //?

//driver.getCurrentUrl()

async function loadStreams(list_of_lives) { // returns array of loaded drivers for each stream link
    let list_of_loaded_stream_drivers = [] 
    for(stream of list_of_lives) {
        if (stream == 'Empt') continue;
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

async function deleteInvalidDrivers(old_list, new_list, list_of_drivers) { //returns new list of drivers OR
    console.log('deleting invalid drivers..');                              //modify list of drivers? 
    let list_of_invalid_links = await compare_old_to_new(old_list,new_list);
    console.log(list_of_invalid_links);
    let new_list_of_drivers = [];

    for(let i = 0; i < list_of_drivers.length; i++) {
        let is_invalid_driver = 0;
        let driver_link = await list_of_drivers[i].getCurrentUrl();
        for(invalid_link of list_of_invalid_links) {
            if (driver_link.split('&').length > 1) {
                driver_link_clean = driver_link.split('&');
                console.log(`Driver link clean:${driver_link_clean[0]}\nInvalid link:${invalid_link}`)
                if(driver_link_clean[0] == invalid_link){
                    list_of_drivers[i].quit();
                    is_invalid_driver = 1;
                    console.log('deleted')
                }
            }
            else {
                if(driver_link == invalid_link){
                    console.log(`Driver link clean:${driver_link}\nInvalid link:${invalid_link} i:${i}`)
                    list_of_drivers[i].quit();
                    is_invalid_driver = 1;
                    console.log('deleted')
                }
            }
        }
        if(!is_invalid_driver) new_list_of_drivers.push(list_of_drivers[i]);
    }

    return new_list_of_drivers;
}

async function addNewDrivers(old_list, new_list, list_of_drivers) {
    console.log('adding new drivers..');
    let list_of_new_links = await compare_new_to_old(old_list, new_list);
    console.log(`list_of_drivers.length:${list_of_drivers.length}`)

    for(new_driver of list_of_new_links) {
        list_of_drivers.push(new_driver)
    }
    console.log(`list_of_drivers.length:${list_of_drivers.length}`)

}

async function compare_old_to_new(old_list,new_list){ //returns list of links to delete drivers from
    let list_of_invalid_links = [];
    for(old_link of old_list) {
        if(old_link == 'Empt') continue;
        let is_in_new_list = 0;
        for(new_link of new_list) {
            if(old_link == new_link) is_in_new_list = 1; //achou! link esta nas duas listas
        }
        if(!is_in_new_list) {
            list_of_invalid_links.push(old_link);
        }
    }
    return list_of_invalid_links;
}

async function compare_new_to_old(old_list,new_list){
    let list_of_new_links = [];
    for(new_link of new_list) {
        if(new_link == 'Empt') continue;
        let is_in_old_list = 0;
        for(old_link of old_list) {
            if(old_link == new_link) is_in_old_list = 1; //achou! link esta nas duas listas
        }
        if(!is_in_old_list) {
            list_of_new_links.push(new_link);
        }
    }
    return list_of_new_links;
}

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 
  

async function main() {

    let lives_list = [
        'https://www.youtube.com/watch?v=g-d9ORMC6B8',
        'Empt',
        'Empt',
        'Empt',
        'Empt',
        'Empt',
        'https://www.youtube.com/watch?v=1hCnQoTJqBQ',
        'Empt'
    ];
    let start = 0;

    app.post('/startuptest', async (req, res) => {
        console.log('/startuptest received');
        console.log(req.body.new_list);
        let list_of_drivers = await loadStreams(lives_list);
        let new_list_of_drivers = await deleteInvalidDrivers(lives_list, req.body.new_list, list_of_drivers);

        addNewDrivers(lives_list,req.body.new_list, new_list_of_drivers);
        res.send('Testing..');
    })

    app.post('/startup', async (req, res) => {
        console.log('/startup received')
        console.log(req.body.new_list)

        lives_list.length = 0;
        for(link of req.body.new_list) {
            lives_list.push(link);
        }
        start = 1;
        res.send('Start!');
    })
    app.post('/new_list', async (req, res) => {
        console.log(req.body.new_list);
        lives_list.length = 0;
        for(link of req.body.new_list) {
            lives_list.push(link);
        }
        res.send('okidoki');
    })

    app.listen(port, async () => {
        console.log(`Example app listening on port ${port}\n Send list to /startup`);
        setInterval(async () => {
            if(start) {
                console.log('table feeding 12s')
                console.log(lives_list);
            }
            else {
            }
        }
        ,12000);
    })
}


/**
 *  DELETE FROM your_table_name WHERE TIMESTAMPDIFF(MINUTE, your_column_name, CURRENT_TIMESTAMP) BETWEEN 0 AND 2;
 */


main();