/*
I may need to build a method to reload siteConfig and readList when they change...
*/

const puppeteer = require('puppeteer');
/*
        private string WorkingDirectory;
        private List<SiteConfig> Sites;
        private List<Book> BookList;
*/
const fs = require('fs');
//const readline = require('readline');
//const path = require('path');
const webHelper = require('./webHelper');

async function parseContents(browser, url, multiPage, sites)
{
    let rtrn = {};
    let found = false;
    let site = null;
    sites.forEach(s => {
        //console.log(site.site, url)
        if (url.startsWith(s.site))
        {
            site = s;
            found = true;
        }
    })
    //console.log(site.site);
    if (!found)
    {
        console.log(`Unkown source - cannot parse ${url}`);
        return null;
    }
    
    const content = await webHelper.getUrlContents(browser, url, site.postLoad)
   
    if (content == null) return null;
    
    const title = parseText(site.title, content);
    if (isNullOrWhiteSpace(title))
    {
        console.log(`Issues parsing title for ${url}`);
        return null;
    }
    rtrn = {...rtrn, title: title};
    
    const image = parseText(site.image, content);
    if (isNullOrWhiteSpace(image))
        console.log(`Bad image for ${url}`);
    else
        rtrn = {...rtrn, image: image};

    const chapterText = parseText(site.chapterText, content);
    if (isNullOrWhiteSpace(chapterText))
    {
        console.log(`Error parsing chapters for ${url}`);
        return null;
    }
    //console.log(site.splitChapterText)
    const chaptersRaw = replaceAll(chapterText, site.splitChapterText, String.fromCharCode(30)).split(String.fromCharCode(30));

    let chapterList = [];
    chaptersRaw.forEach(chapter => {
        const tempChapter = parseRow(site.forEachChapterText, chapter);
        if (tempChapter != null)
        { chapterList.push(tempChapter); }
    })
    if (multiPage && site.multiPage != null)
    {
        try
        {
            const nextPageUrl = parseText(site.multiPage.nextPageUrl, content);
            const nextPageContents = parseContents(webHelper, nextPageUrl, true);
            nextPageContents.forEach(chapter => chapterList.push(chapter));
        }
        catch
        {

        }
    }

    rtrn = {...rtrn, chapterList: chapterList};
    return rtrn;
}
function getReadingList()
{
    const storeFile = './data/bookcheck/readingList.json'
    if (fs.existsSync(storeFile))
    {
        const items = fs.readFileSync(storeFile);
        return JSON.parse(items);
    }
    return []
}
function getSiteConfig()
{
    const configFile = './data/bookcheck/siteConfig.json'
    if (fs.existsSync(configFile))
    {
        const items = fs.readFileSync(configFile);
        return JSON.parse(items);
    }
    return []
}
function parseRow(chapterConfig, rowValue)
{
    let parsedRow = {}
    
    if (chapterConfig.filter != null)
    {
        const filterText = parseText(chapterConfig.filter.text, rowValue);
        
        if (chapterConfig.filter.in != null && chapterConfig.filter.in.length > 0)
        {
            let isIn = false;
            chapterConfig.filter.in.forEach(s =>{
                if (s == filterText)
                {
                    isIn = true;
                }
            })
            if (!isIn)
                return null;
        }
        if (chapterConfig.filter.notIn != null)
        {
            chapterConfig.filter.notIn.forEach(s =>
            {
                if (s == filterText)
                    return null;
            })
        }
    }
    const hRef = parseText(chapterConfig.hRef, rowValue);
    if (isNullOrWhiteSpace(hRef)) return null;
    parsedRow = {...parsedRow, hRef: hRef};

    const chapterTitle = parseText(chapterConfig.chapterTitle, rowValue);
    if (isNullOrWhiteSpace(chapterTitle)) return null;
    parsedRow = {...parsedRow, chapterTitle: chapterTitle};

    const uploaded = parseText(chapterConfig.dateUploaded, rowValue);    
    try
    {
        const dateUploaded = new Date(uploaded);
        parsedRow = {...parsedRow, dateUploaded: dateUploaded};
    }
    catch { }
    
    const chapterNumberText = parseText(chapterConfig.chapterNumber, rowValue);
    if (chapterNumberText != null)
    {
        try
        {
            const chapterNumber = parseFloat(chapterNumberText);
            parsedRow = {...parsedRow, chapterNumber: chapterNumber};
        }
        catch { }
    }

    return parsedRow;
}

function parseText (methods, text) {
    let rtrn = text;
    if (methods == null || methods.length  == 0)
        return null;
    try
    {
        methods.forEach(parseMethod => 
        {
            let searchString = "";
            switch (parseMethod.method)
            {
                case "readPast":
                    searchString = parseMethod.string;
                    rtrn = rtrn.substring(rtrn.indexOf(searchString) + searchString.length);
                    break;
                case "readUntil":
                    searchString = parseMethod.string;
                    rtrn = rtrn.substring(0, rtrn.indexOf(searchString));
                    break;
                case "trim":
                    rtrn = rtrn.trim();
                    break;
                case "movePastTag":
                    rtrn = movePastTag(rtrn);
                    break;
                case "cleanHtmlText":
                    rtrn = cleanHtmlText(rtrn);
                    break;
                case "readAfterLast":
                    rtrn = rtrn.substring(rtrn.lastIndexOf(parseMethod.string) + parseMethod.string.length);
                    break;
                case "regexMatch":
                    const matches = rtrn.match(parseMethod.string);
                    rtrn = matches[matches.length - 1];
                    //rtrn = matches[matches.length - 1].groups[0].value;
                    break;
                case "toLower":
                    rtrn = rtrn.toLowerCase();
                    break;
                case "prepend":
                    rtrn = parseMethod.string + rtrn;
                    break;
                case "movePastElement":
                    rtrn = movePastElement(rtrn);
                    break;
                case "remove":
                    rtrn = replaceAll(rtrn, parseMethod.string, "");
                    break;
                case "removeOrdinalIndicator":
                    rtrn = rtrn.replace(/(?<=[0-9])(?:st|nd|rd|th)/, "");
                    break;
                default:
                    throw `Unexpected method: ${parseMethod.method}`;
            }
        })
        return rtrn;
    }
    catch
    {
        return null;
    }
}
function cleanHtmlText(text)
{
    text = text.trim();
    if (text[0] == '"')
    {
        text = text.substring(1, text.Length - 2);
        text = text.trim();
    }
    text = replaceAll(text, "&#8217;", "'");
    while (text[0] == '\n')
    {
        text = text.substring(1, text.Length - 1);
        text = text.trim();
    }

    return text;
}
function movePastTag(text)
{
    if (text[0] == '<')
    {
        text = text.substring(text.indexOf(">") + 1);
        return movePastTag(text);
    }
    return text;
}
function movePastElement(text)
{
    if (text[0] == '<')
    {
        var tagEnd = Math.min(text.indexOf(" "), text.indexOf(">"));
        if (text[tagEnd - 1] == '/')
        { return movePastTag(text); }
        var tag = text.substring(1, tagEnd - 1);
        return text.substring(text.indexOf("</{tag}>") + "</{tag}>".Length);
    }
    return text;
}
function isNullOrWhiteSpace(text) {
    if (typeof text === 'undefined' || text == null) return true;
    return text.replace(/\s/g, '').length < 1;
}
function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
  }

function getSites(){
    return getSiteConfig().map(s => s.site);
}
function getBookList(){
    return getReadingList();
}
function getFolders(){ 
    return [...new Set(getReadingList().map(b => b.Folder))]
}
async function removeBook(bookId){
    const bookList = getReadingList().filter(r => r.Id != bookId)
    await saveBookList(bookList);

}
function getChapters(bookId){
    //const directoryPath = path.join(__dirname, 'Documents');
    const chapterFile = `./data/bookcheck/Chapters_${bookId}.json`
    if (fs.existsSync(chapterFile))
    {
        const items = fs.readFileSync(chapterFile);
        return JSON.parse(items);
    }
    /*fs.readdir('./data/bookCheck', (err, files) => {
        files.forEach(file => {
          console.log(file);
        });
      });*/
    return [];
}
function updateBook(bookList, bookId, book)
{
    bookList.forEach(b =>{
        if (b.Id == bookId)
        {
            b = book;
        }
    })
    return bookList;
}
async function saveBookList(bookList){
    let data = JSON.stringify(bookList, null, 2);
    fs.writeFile("./data/bookcheck/readingList.json", data, (err) =>{
        if (err) throw err;
        console.log("Reading list updated")

    })
}
async function saveChapters(bookId, chapterList){
    const chapterFile = `./data/bookcheck/Chapters_${bookId}.json`
    let data = JSON.stringify(chapterList, null, 2);
    fs.writeFile(chapterFile, data, (err) =>{
        if (err) throw err;
        console.log("Chapter list updated")

    })
}
async function checkBook(browser, bookId){
    const book = getReadingList().find(x => x.Id === bookId);
    const updatedBook = await checkBook_internal(browser, book, null);
    if (updatedBook == null)
    {
        throw "Unable to parse book. There may be an issue with the site or with the url.";
    }
    else if (updatedBook.hasChanged)
    {
        const bookList = updateBook(getReadingList(), bookId, updatedBook)
        saveBookList(bookList);
    }
}
async function checkBookAtSite(browser, bookId, siteId){
    const book = getReadingList().find(x => x.Id === bookId);
    const updatedBook = await checkBook_internal(browser, book, siteId);
    if (updatedBook == null)
    {
        throw "Unable to parse book. There may be an issue with the site or with the url.";
    }
    else if (updatedBook.hasChanged)
    {
        const bookList = updateBook(getReadingList(), bookId, updatedBook)
        saveBookList(bookList);
    }
}
async function checkBook_internal(browser, book, site){
    let rtrn = null;
    console.log(`Checking ${book.Title} (#${book.Id})...`)
    const existingChapters = getChapters(book.Id);
    //console.log(book);
    await book.Sites.reduce(async (undefined, s) => {
        //console.log(s)
        if (site === null || s.SiteId == site)
        {
            //console.log(s);
            const tempCheckSite = await checkSiteForChapters(browser, book, s, getChapters(book.Id));
            if (tempCheckSite != null)
            {
                rtrn = tempCheckSite;
                return tempCheckSite;
            }
        }
    }, undefined)
    return rtrn;
}
async function checkSiteForChapters(browser, book, site, existingChapters)
{
    //console.log(site)
    let rtrn = { hasChanged: false, item: book}
    let chapterUpdate = false;
    site.LastAttempted = new Date(Date.now());
    const parsedContent = await parseContents(browser, site.Url, false, getSiteConfig())
    if (parsedContent != null)
    {
        site.LastSuccessful = new Date(Date.now());
        rtrn.hasChanged = true
        if (rtrn.item.Title != parsedContent.title)
        {
            if (isNullOrWhiteSpace(rtrn.item.Title))
            {
                rtrn.item.Title = parsedContent.title;
            }
            else
            {
                let matchFound = false;
                rtrn.item.AltTitles.forEach(t =>{
                    if (t === parsedContent.title)
                    {
                        matchFound = true;
                    }
                })
                if (!matchFound)
                {
                    rtrn.item.AltTitles.push(parsedContent.title);
                }
            }
        }

        if (site.Image != parsedContent.image && !isNullOrWhiteSpace(parsedContent.image))
        {
            site.Image = parsedContent.image;
        }

        if (existingChapters === null)
            existingChapters = []
            
        parsedContent.chapterList.forEach(c => {
            let exists = false;
            existingChapters.some(e => {
                let linkFound = false;
                if (e.ChapterNumber === c.chapterNumber)
                {
                    exists = true;
                    e.Links.forEach(l => {
                        if (l.SiteId == site.SiteId)
                        {
                            linkFound = true;
                            if (l.HRef != c.hRef)
                            {
                                l.HRef = c.hRef;
                                chapterUpdate = true;
                            }
                            if (l.DateUploaded != c.dateUploaded)
                            {
                                l.DateUploaded = c.dateUploaded
                                chapterUpdate = true;
                            }
                            if (l.ChapterTitle != c.chapterTitle)
                            {
                                l.ChapterTitle = c.chapterTitle
                                chapterUpdate = true;
                            }
                        }                        
                    })
                    if (!linkFound)
                    {
                        e.Links.push (
                            {
                                SiteId: site.SiteId,
                                ChapterTitle: c.chapterTitle,
                                HRef: c.hRef,
                                DateUploaded: c.dateUploaded
                            }
                        );
                        chapterUpdate = true;
                    }
                    return true;
                }
                else if (e.chapterNumber === null && c.chapterNumber === null)
                {
                    throw "Both null. Not sure javascript will ever hit here."
                    return true;
                }
            })
            if (!exists){
                console.log(`Adding to existing chapters...${c.chapterNumber}`)
                existingChapters.push({
                    ChapterNumber: c.chapterNumber,
                    ChapterTitle: c.chapterTitle,
                    Read: false,
                    Links: [
                        {
                            SiteId: site.SiteId,
                            ChapterTitle: c.chapterTitle,
                            HRef: c.hRef,
                            DateUploaded: c.dateUploaded
                        }
                    ]
                })
                chapterUpdate = true;
            }

        })
    }
    else
    {
        console.log(`Could not parse ${book.Title} at ${site.Url}`)
        return null
    }
    if (chapterUpdate){

        //console.log("SAVE CHAPTERS HERE")
        // save chapters
        await saveChapters(book.Id, existingChapters);
        //console.log(rtrn);
    }
    return rtrn;        
}
/*
(async () => {
    const browser = await webHelper.getBrowser(false);
    console.log("A");
    const content = await parseContents(browser, "https://readmanganato.com/manga-qi951517", false, siteConfig);
    console.log(content);
    console.log("F");
    await browser.close();
})()
*/
/*
(async () => {
    const browser = await webHelper.getBrowser(false);
    await checkBook(browser, 2);
    await browser.close();
})()
*/
/*
(() =>{
    console.log(checkBook(2))
})()*/


module.exports = { getSites, getSiteConfig, getBookList, getFolders, getChapters, removeBook, checkBook, checkBookAtSite };
