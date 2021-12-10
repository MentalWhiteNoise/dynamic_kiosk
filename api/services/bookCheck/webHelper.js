const puppeteer = require('puppeteer');
const helper = require('./genericHelper');
  
//const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});
/*const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});*/
/*
(async () => {
    const browser = await puppeteer.launch({headless: false});
    const contents = await getUrlContents(browser, 'file:///C:/Personal%20-%20STAY%20THE%20F%20OUT/Book%20Check/new/unread_Favorites.html', null);
    //const page = await browser.newPage();
    //await page.goto('https://www.geeksforgeeks.org/');
    //console.log(contents);
    await browser.close();
    return contents
})();*/
const getBrowser = (headless) => { 
    return puppeteer.launch({
        headless: headless, 
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    //return puppeteer.launch({headless: headless}); 
}

const getUrlContents = async (browser, url, navigationMethods) =>{
    try {
        const page = await browser.newPage()
        await page.setJavaScriptEnabled();
        await page.goto(url, { waitUntil: 'networkidle2' });
        //await sleep(500);

        try{
            await applyNavigation(navigationMethods, page);
        }
        catch (e){
            console.log("Error encountered applying navigation methods: ", e)
            return null;
        }
        const contents = await page.content();
        //await sleep(500);
        try{await page.close();} catch{}
        return contents;
    }
    catch (ex){
        console.log(ex);
        return null;
    }
}

async function applyNavigation(navigationMethods, page)
{
    //console.log("applyNavigation: ", navigationMethods)
    if (navigationMethods == null || navigationMethods.length === 0)
        return;
    await helper.sleep(500);
    await navigationMethods.forEach(async navMethod => {
        switch (navMethod.method)
        {
            case "clickElement":
                const selector = navMethod.properties.selector;
                await page.click(selector);
                await helper.sleep(500);
                break;
            case "enterInput":
                const inputSelector = navMethod.properties.selector;
                const inputText = navMethod.properties.text;
                await page.type(inputSelector, inputText);
                await helper.sleep(500);
                break;
            case "clickEachElement":
                const multiSelector = navMethod.properties.selector;
                const items = await page.$$(multiSelector);
                await items.forEach(async item =>
                {
                    await item.click();
                })
                await helper.sleep(500);
                break;
            case "waitForElement":
                const waitForSelector = navMethod.properties.selector;
                const timeout = parseInt(navMethod.properties.timeout | "1000");
                await page.waitForSelector(waitForSelector, { Timeout: timeout })
                break;
            case "wait":
                const waitTimeout = parseInt(navMethod.properties.timeout | "1000");
                await helper.sleep(waitTimeout);
                break;
            default:
                throw "Unexpected method: " + navMethod.Method;
        }
    })
}
module.exports = { getBrowser, getUrlContents };