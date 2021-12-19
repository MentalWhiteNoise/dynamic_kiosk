const fs = require('fs');
const parseHelper = require('./parseHelper');
const helper = require('./genericHelper');
const { error } = require('console');
const uuid = require('uuid')

// manipulation to work with windows or linux...
const dataFolder = helper.replaceAll(__dirname, '\\', '/').replace("/services/bookCheck", "") + "/data/bookCheck"

// File lookups
function getReadingList()
{
    const storeFile = `${dataFolder}/readingList.json`
    if (fs.existsSync(storeFile))
    {
        const items = fs.readFileSync(storeFile);
        return JSON.parse(items);
    }
    else {
	console.log("file not found", storeFile)
    }
    return []
}
function getSiteConfig()
{
    const configFile = `${dataFolder}/siteConfig.json`
    if (fs.existsSync(configFile))
    {
        const items = fs.readFileSync(configFile);
        return JSON.parse(items);
    }
    return []
}
function getChapters(bookId){
    const chapterFile = `${dataFolder}/Chapters_${bookId}.json`
    if (fs.existsSync(chapterFile))
    {
        const items = fs.readFileSync(chapterFile);
        return JSON.parse(items);
    }
    return [];
}

// File save operations
async function saveBookList(bookList){
    let data = JSON.stringify(bookList, null, 2);
    await fs.writeFile(`${dataFolder}/readingList.json`, data, (err) =>{
        if (err) throw err;
        console.log("Reading list updated")
    })
}
async function saveChapters(bookId, chapterList){
    const chapterFile = `${dataFolder}/Chapters_${bookId}.json`
    let data = JSON.stringify(chapterList, null, 2);
    await fs.writeFile(chapterFile, data, (err) =>{
        if (err) throw err;
        console.log("Chapter list updated")
    })
}

// Simple get methods
function getSites(){
    return getSiteConfig().map(s => s.site);
}
function getBookList(){
    return getReadingList();
}
function getFolders(hidden){ 
    const readingList = getReadingList()
    const folderList = [...new Set(readingList.map(b => {
        return b.Folder;
    }))];
    let returnList = []
    folderList.forEach(f =>{
        if (hidden || f.toLowerCase() !== "hidden"){
            const bookDates = readingList.filter(b=> b.Folder === f).map(b => {
                return { LastSuccessful: helper.maxDate(b.Sites, "LastSuccessful")};
            })
            returnList.push({Folder: f, LastChecked: helper.maxDate(bookDates, "LastSuccessful")})
        }
    })
    return returnList
}
function getPagedChapters(bookId, pageSize, page){
    const chapters = getChapters(bookId)
        .sort((a,b) => a.ChapterNumber > b.ChapterNumber ? -1 : a.ChapterNumber < b.ChapterNumber ? 1 : 0)
    const pageNum = (page * pageSize > chapters.length) ? 0 : page - 1;
    return { chapters: chapters.slice(pageNum * pageSize, (pageNum + 1) * pageSize), chapterCount: chapters.length };
}
function getBook(bookId){
    const bookList = getBookList()
    const book = bookList.find(x => x.Id.toString() === bookId)
    return mergeBookStatus(book)
}
function getBooksForFolder(folderName){
    const bookList = getBookList()
    const filteredList = bookList.filter(x => x.Folder.toLowerCase() == folderName.toLowerCase())
    const mergedList = mergeListBookStatus(filteredList)
    return mergedList
}
function searchBooks(searchString, searchUrl){
    const bookList = getBookList();
    const filteredList = bookList.filter(x => 
        (x.Title.toLowerCase().match(searchString.toLowerCase()) || 
        (x.AltTitles !== null && x.AltTitles.filter(y => y.toLowerCase().match(searchString.toLowerCase())).length > 0)) ||
        (searchUrl && x.Sites.filter(s => s.toLowerCase().match(searchString.toLowerCase()).length > 0))
    )
    const mergedList = mergeListBookStatus(filteredList)
    return mergedList
}


// Book CRUD operations
async function removeBook(bookId){
    const bookList = getReadingList().filter(r => r.Id != bookId)
    await saveBookList(bookList);
}
function updateBook(bookList, bookId, book)
{
    let foundItem = bookList.findIndex(x => x.Id == parseInt(bookId))
    bookList[foundItem] = book;
    return [...bookList];
}
function saveBook(book)
{
    const bookList = getReadingList()
    let cleanedBook = { // Get rid of unnecessary properties
        Id: book.Id,
        Title: book.Title,
        Sites: book.Sites.map(s => {
            let site = {
                SiteId: s.SiteId,
                Url: s.Url,
                Image: s.Image
            }
            if (s.LastAttempted != null && s.LastAttempted != undefined)
                site.LastAttempted = s.LastAttempted
            if (s.LastUploaded != null && s.LastUploaded != undefined)
                site.LastUploaded = s.LastUploaded
            if (s.LastPosted != null && s.LastPosted != undefined)
                site.LastPosted = s.LastPosted
            return site
        }),
        AltTitles: [...book.AltTitles],
        Folder: book.Folder
    }
    if (book.LastUploaded != null && book.LastUploaded != undefined)
        cleanedBook.LastUploaded = book.LastUploaded
    const newList = updateBook(bookList, cleanedBook.Id, cleanedBook)
    saveBookList(newList)
}


// Chapter CRUD
// Delete Chapter By Site Id
function internalDeleteChaptersBySite(bookId, siteId, chapterNumber){
    const chapterList = getChapters(bookId);
    const newChapterList = [];
    chapterList.forEach(c => {
        if (c.ChapterNumber == chapterNumber || chapterNumber == null)
        {
            const newLinks = c.Links.filter(x => x.SiteId != siteId)
            if (newLinks.length > 0) {
                c.Links = [...newLinks];
                newChapterList.push(c);
            } 
        }
        else{
            newChapterList.push(c);
        }
    })
    saveChapters(bookId, newChapterList);

}
function deleteChapterBySite(bookId, siteId, chapterNumber){
    internalDeleteChaptersBySite(bookId, siteId, chapterNumber)
}
function deleteSiteChapters(bookId, siteId){
    internalDeleteChaptersBySite(bookId, siteId, null)
}
// Delete Site Id
function deleteSite(bookId, siteId){
    const bookList = getBookList()
    const book = bookList.find(x => x.Id.toString() === bookId)
    const siteIndex = book.Sites.findIndex(x => x.SiteId === siteId)
    if (book.Sites.length < 1 && siteIndex != null){
        console.log("A book needs to have at least one site. Add a replacement site first, or delete the book.")
        throw "A book needs to have at least one site. Add a replacement site first, or delete the book."
    }
    const newChapterList = [...getChapters(bookId).filter(x => x.SiteId !== siteId)];
    saveChapters(bookId, newChapterList);
    book.Sites = [...book.Sites.filter(x => x.SiteId != siteId)]
    const newBookList = updateBook(bookList, bookId, book)
    saveBookList(newBookList)
}
async function addSite(browser, bookId, siteId, siteUrl){
    const bookList = getBookList()
    const book = bookList.find(x => x.Id.toString() === bookId)
    const newSiteId = siteId == null ? uuid.v4() : siteId
    book.Sites.push({
        SiteId: newSiteId,
        Url: siteUrl
    })
    await saveBookList(bookList)
    await checkBookAtSite(browser, bookId, newSiteId)
}
async function addBook(browser, url, folder){
    const bookList = getBookList()
    const existing = bookList.filter(b => b.Sites.filter(s => s.Url.toLowerCase() === url.toLowerCase()).length > 0)
    if (existing.length > 0)
        throw "Already exists"
    const newId = Math.max.apply(null, bookList.map(b => b.Id)) + 1
    let parsedSite = null
    try{
        parsedSite = await testParseUrl(browser, url)
    }
    catch{
        throw "Could not parse site"
    }
     
    if (parsedSite == null)
        throw "Could not parse site"
    console.log(parsedSite)
    const newBook = {
        Id: newId,
        Folder: folder,
        AltTitles: [],
        Sites: [
            {
                SiteId : parsedSite.SiteId,
                Url: url
            }
        ]
    }
    bookList.push(newBook)
    await saveBookList([...bookList])
    await helper.sleep(500)
    await checkBookAtSite(browser, newId, parsedSite.SiteId)
    return newBook;
}
// Checking for new chapters
async function checkBook(browser, bookId){
    const book = getReadingList().find(x => x.Id === parseInt(bookId));
    const updatedBook = await checkBook_internal(browser, book, null);
    if (updatedBook == null)
    {
        throw "Unable to parse book. There may be an issue with the site or with the url.";
    }
    else if (updatedBook.hasChanged)
    {
        const bookList = updateBook(getReadingList(), bookId, updatedBook.item)
        saveBookList(bookList);
    }
}
async function checkBookAtSite(browser, bookId, siteId){
    const book = getReadingList().find(x => x.Id === parseInt(bookId));
    const updatedBook = await checkBook_internal(browser, book, siteId);
    if (updatedBook == null)
    {
        console.log("Unable to parse book. There may be an issue with the site or with the url.");
        // Set attempted
        book.Sites.forEach(s =>{
            if (siteId === null || s.SiteId == siteId) {
                s.LastAttempted = new Date(Date.now());
            }
        })
        const bookList = updateBook(getReadingList(), bookId, {...book})
        saveBookList(bookList);
        throw "Unable to parse book. There may be an issue with the site or with the url.";
    }
    else if (updatedBook.hasChanged)
    {
        const bookList = updateBook(getReadingList(), bookId, updatedBook.item)
        saveBookList(bookList);
    }
}
async function checkBook_internal(browser, book, site){
    let rtrn = null;
    console.log(`Checking ${book.Title} (#${book.Id})...`)
    const existingChapters = getChapters(book.Id);
    
    await book.Sites.reduce(async (undefined, s) => {
        if (site === null || s.SiteId == site)
        {
            const tempCheckSite = await checkSiteForChapters(browser, book, s, getChapters(book.Id));
            if (tempCheckSite != null) {
                rtrn = tempCheckSite;
                return tempCheckSite;
            }
        }
    }, undefined)
    return rtrn;
}
async function checkSiteForChapters(browser, book, site, existingChapters)
{
    let rtrn = { hasChanged: false, item: book}
    let chapterUpdate = false;
    site.LastAttempted = new Date(Date.now());

    const parsedContent = await parseHelper.parseContents(browser, site.Url, false, getSiteConfig())

    if (parsedContent != null) {
        site.LastSuccessful = new Date(Date.now());
        rtrn.hasChanged = true
        if (rtrn.item.Title != parsedContent.title)
        {
            if (helper.isNullOrWhiteSpace(rtrn.item.Title)){
                rtrn.item.Title = parsedContent.title;
            }
            else
            {
                let matchFound = false;
                rtrn.item.AltTitles.forEach(t =>{
                    if (t === parsedContent.title) {
                        matchFound = true;
                    }
                })
                if (!matchFound) {
                    rtrn.item.AltTitles.push(parsedContent.title);
                }
            }
        }

        if (site.Image != parsedContent.image && !helper.isNullOrWhiteSpace(parsedContent.image)) {
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
                        if (l.SiteId == site.SiteId) {
                            linkFound = true;
                            if (l.HRef != c.hRef) {
                                l.HRef = c.hRef;
                                chapterUpdate = true;
                            }
                            if (l.DateUploaded != c.dateUploaded) {
                                l.DateUploaded = c.dateUploaded
                                chapterUpdate = true;
                            }
                            if (l.ChapterTitle != c.chapterTitle) {
                                l.ChapterTitle = c.chapterTitle
                                chapterUpdate = true;
                            }
                        }
                    })
                    if (!linkFound) {
                        e.Links.push ({
                            SiteId: site.SiteId,
                            ChapterTitle: c.chapterTitle,
                            HRef: c.hRef,
                            DateUploaded: c.dateUploaded
                        });
                        chapterUpdate = true;
                    }
                    return true;
                }
                else if (e.chapterNumber === null && c.chapterNumber === null) {
                    throw "Both null. Not sure javascript will ever hit here."
                }
            })
            if (!exists){
                console.log(`Adding to existing chapters...${c.chapterNumber}`)
                // Testing the ability to log last uploaded...
                rtrn.item.LastUploaded = helper.maxDate([{LastUploaded: c.dateUploaded}, {LastUploaded: rtrn.item.LastUploaded}], "LastUploaded")
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
    else {
        console.log(`Could not parse ${book.Title} at ${site.Url}`)
        return null
    }
    if (chapterUpdate) {
        await saveChapters(book.Id, existingChapters);
    }
    return rtrn;
}
async function testParseUrl(browser, url)
{
    let site = {
        SiteId: uuid.v4(),
        Url: url,
        LastAttempted: Date(Date.now()),
        ChapterList: []
    };
    const parsedContent = await parseHelper.parseContents(browser, url, false, getSiteConfig())

    if (parsedContent != null) {
        site.LastSuccessful = new Date(Date.now());
        site.Title = parsedContent.title
        site.Image = parsedContent.image;

        parsedContent.chapterList.forEach(c => {
            site.LastUploaded = helper.maxDate([{LastUploaded: c.dateUploaded}, {LastUploaded: site.LastUploaded}], "LastUploaded")
            site.ChapterList.push({
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
        })
    }
    else {
        console.log(`Could not parse ${url}`)
        return null
    }
    return site;
}
// Chapter list CRUD
async function flagAllRead(bookId){
    const book = getReadingList().find(x => x.Id.toString() === bookId.toString());
    let existingChapters = getChapters(book.Id);

    existingChapters.forEach(c => {
        if (!c.Read)
            c.Read = true;
    })
    saveChapters(bookId, existingChapters)
}
async function flagAllUnread(bookId){
    const book = getReadingList().find(x => x.Id.toString() === bookId.toString());
    let existingChapters = getChapters(book.Id);

    existingChapters.forEach(c => {
        if (c.Read)
            c.Read = false;
    })
    saveChapters(bookId, existingChapters)
}
async function flagRead(bookId, chapterNumber){
    const book = getReadingList().find(x => x.Id.toString() === bookId.toString());
    let existingChapters = getChapters(book.Id);

    existingChapters.forEach(c => {
        if (!c.Read && c.ChapterNumber.toString() === chapterNumber.toString())
            c.Read = true;
    })
    saveChapters(bookId, existingChapters)
}
async function flagUnread(bookId, chapterNumber){
    const book = getReadingList().find(x => x.Id.toString() === bookId.toString());
    let existingChapters = getChapters(book.Id);

    existingChapters.forEach(c => {
        if (c.Read && c.ChapterNumber.toString() === chapterNumber.toString())
            c.Read = false;
    })
    saveChapters(bookId, existingChapters)
}

// Helper methods
function mergeListBookStatus(bookList){
    const newList = bookList.map(b => mergeBookStatus(b))
    return [...newList];
}
function mergeBookStatus(book){
    const chapterList = getChapters(book.Id)
    let lastReadChapter = null;
    book.Sites = book.Sites.map(s => {
        let siteChapterLinks = []
        //console.log(b.Id)
        chapterList.forEach(c => {
            c.Links.forEach(l => {
                // where site Ids match
                if (l.SiteId === s.SiteId) {
                    siteChapterLinks.push({ChapterNumber: c.ChapterNumber, ChapterTitle: c.ChapterTitle, Read: c.Read, ...l});
                }
                // where site Urls match
                else if (l.SiteId == "00000000-0000-0000-0000-000000000000" && l.HRef.match(s.Url)) {
                    siteChapterLinks.push({ChapterNumber: c.ChapterNumber, ChapterTitle: c.ChapterTitle, Read: c.Read, ...l});
                }
            })
        })
        
        const lastReadSiteChapter = siteChapterLinks.filter(sc => sc.Read)
            .sort((a,b) => a.ChapterNumber > b.ChapterNumber ? -1 : a.ChapterNumber < b.ChapterNumber ? 1 : a.DateUploaded > b.DateUploaded ? -1 : a.DateUploaded < b.DateUploaded ? 1 : 0)[0]

        if (siteChapterLinks.length > 0){
            lastReadChapter = (lastReadChapter) ?
                (lastReadChapter.ChapterNumber < lastReadSiteChapter.ChapterNumber) ?
                lastReadSiteChapter :
                (lastReadChapter.ChapterNumber > lastReadSiteChapter.ChapterNumber) ?
                lastReadChapter :
                (lastReadChapter.DateUploaded < lastReadSiteChapter.DateUploaded) ?
                lastReadSiteChapter : lastReadChapter
                : lastReadSiteChapter
        }

        let tempSite = {...s,
            CountRead: siteChapterLinks.filter(sc => sc.Read).length,
            CountUnread: siteChapterLinks.filter(sc => sc.Read === false).length,
            LastPosted: helper.maxDate(siteChapterLinks, 'DateUploaded'),
            LastChapterRead: lastReadSiteChapter
        }
        tempSite = {...tempSite, Status: getStatusCategory(tempSite)}
        return tempSite
    })
    const siteSummary = {
        CountRead: helper.sum(book.Sites, 'CountRead'),
        CountUnread: helper.sum(book.Sites, 'CountUnread'),
        LastPosted: helper.maxDate(book.Sites, 'LastPosted'),
        LastAttempted: helper.maxDate(book.Sites, 'LastAttempted'),
        LastSuccessful: helper.maxDate(book.Sites, 'LastSuccessful')
    }
    book.Status = getStatusCategory(siteSummary)
    book.LastChapterRead = lastReadChapter
    book.CountRead = chapterList.filter(sc => sc.Read).length
    book.CountUnread = chapterList.filter(sc => sc.Read === false).length
    // temporary cleanup: how many chapters aren't in sites?
    if (siteSummary.CountRead + siteSummary.CountUnread < chapterList.length)
        console.log(`${chapterList.length - (siteSummary.CountRead + siteSummary.CountUnread)} chapters not matched to sites for book ${book.Id} (${book.Title})`)
    return book;
}
function getStatusCategory(bookSite)
{
    if (bookSite.CountUnread + bookSite.CountRead === 0)
        return "pending check"

    if (bookSite.LastAttempted == null)
        return "never checked"

    if (new Date(bookSite.LastSuccessful) < new Date(bookSite.LastAttempted))
        return "check failed"

    const lastCheckedDays = Math.floor((new Date() - new Date(bookSite.LastSuccessful))/(1000*60*60*24))
    const lastPostedDays = Math.floor((new Date() - bookSite.LastPosted)/(1000*60*60*24))

    if (lastCheckedDays < 30 && lastPostedDays > 60)
        return "no recent updates"

    if (lastCheckedDays > 30)
        return "no recent check"

    if (bookSite.CountUnread > 0)
        return "more to read"

    if (bookSite.CountRead > 0)
        return "up to date"

    return "unknown"
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


module.exports = { getSites, getSiteConfig, 
    getFolders, 
    getBook,getBooksForFolder,searchBooks,
    getChapters, getPagedChapters, 
    addSite, 
    saveBook, addBook, removeBook, 
    deleteChapterBySite, deleteSite, deleteSiteChapters, 
    checkBook, checkBookAtSite, testParseUrl,
    flagAllRead, flagAllUnread, flagRead, flagUnread};
