const puppeteer = require('puppeteer');
  
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
    return puppeteer.launch({headless: headless}); 
}

const getUrlContents = async (browser, url, navigationMethods) =>{
    try {
        const page = await browser.newPage()
        await page.setJavaScriptEnabled();
        await page.goto(url);
        try{
            await applyNavigation(navigationMethods, page);
        }
        catch{
            await page.close();
            return null;
        }
        const contents = await page.content();
        await page.close();
        return contents;
    }
    catch (ex){
        console.log(ex);
        return null;
    }
}

async function applyNavigation(navigationMethods, page)
{
    if (navigationMethods == null || navigationMethods.length === 0)
        return;
    await sleep(500);
    navigationMethods.forEach(async navMethod => {
        switch (navMethod.Method)
        {
            case "clickElement":
                const selector = navMethod.properties.selector;
                await page.click(selector);
                await sleep(500);
                break;
            case "enterInput":
                const inputSelector = navMethod.properties.selector;
                const inputText = navMethod.properties.text;
                await page.type(inputSelector, inputText);
                await sleep(500);
                break;
            case "clickEachElement":
                const multiSelector = navMethod.properties.selector;
                const items = await page.$$(multiSelector);
                await items.forEach(async item =>
                {
                    await item.click();
                })
                await sleep(500);
                break;
            case "waitForElement":
                const waitForSelector = navMethod.properties.selector;
                const timeout = parseInt(navMethod.properties.timeout | "1000");
                await page.waitForSelector(waitForSelector, { Timeout: timeout });
                break;
            case "wait":
                const waitTimeout = parseInt(navMethod.properties.timeout | "1000");
                await sleep(waitTimeout);
                break;
            default:
                // eslint-disable-next-line no-throw-literal
                throw "Unexpected method: " + navMethod.Method;
        }
    });

}
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = { getBrowser, getUrlContents, sleep };