export async function getLivesFromChannel(driver) {
    try {
        let element = await driver.wait(until.elementLocated(By
                    .xpath('//*[@id="info"]/span[1]'
                    )), 10000) ////*[@id="thumbnail"]
        //console.log(`${info[0].split('.').join('')}`);
        return element;
    } catch (e) {
        return 'err';
    } 
}


function main() {
    console.log()
}



main();
