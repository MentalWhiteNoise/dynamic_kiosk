const puppeteer = require('puppeteer');
const helper = require('./genericHelper');

var isWin = process.platform === "win32";
//console.log(process.platform)

const getBrowser = (headless) => { 
    if (isWin)
        return puppeteer.launch({
            //headless: false,
            setJavaScriptEnabled: true,
            //slowMo: 250, 
            //executablePath: '/usr/bin/chromium-browser'
        });
    else 
        return puppeteer.launch({
            //headless: false,
            setJavaScriptEnabled: true,
            //slowMo: 250, 
            executablePath: '/usr/bin/chromium-browser'
        });
}

const getUrlContents = async (browser, url, navigationMethods) =>{
    try {
        const page = await browser.newPage()
        // this seems to fix the issue with some sites...
        //await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36");
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36");
        //await page.setJavaScriptEnabled(true);
        console.log("Navigate To URL")

        await page.goto(url);//, { waitUntil: 'networkidle2' }); // May not hit this if it uses javascript!
        console.log("Apply navigation...")
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
    for (const navMethod of navigationMethods) {
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
                console.log("waitForElement")
                const waitForSelector = navMethod.properties.selector;
                const timeout = parseInt(navMethod.properties.timeout | "1000");
                await page.waitForSelector(waitForSelector, { Timeout: timeout })
                console.log("Selector seen")
                await helper.sleep(500);
                //console.log("Slept 5 seconds")
                break;
            case "wait":
                const waitTimeout = parseInt(navMethod.properties.timeout | "1000");
                await helper.sleep(waitTimeout);
                break;
            default:
                throw "Unexpected method: " + navMethod.Method;
        }
    }
}
module.exports = { getBrowser, getUrlContents };
