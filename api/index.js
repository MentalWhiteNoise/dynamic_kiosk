const express = require('express')
var cors = require('cors')
const bodyParser = require('body-parser');
const querystring = require('querystring');
const bookHelper = require('./services/bookCheck/bookHelper')
const webHelper = require('./services/bookCheck/webHelper');
const { query } = require('express');
const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '500mb'}));
app.use(cors())
const port = 8080
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
    });

app.get('/sites', (req, res) => {
    const siteList = bookHelper.getSites()
    res.json(siteList)
})
app.get('/siteconfig', (req, res) => {
    const siteConfig = bookHelper.getSiteConfig()
    res.json(siteConfig)
})
app.put('/siteconfig', async (req, res) => {
    const {site } = req.body;
    // Validate site!
    const siteConfig = bookHelper.getSiteConfig()    
    var found = false
    for(var s of siteConfig){
        if (s.site == site.site){
            found = true
            break
        }
    }
    if (found)
    {
        console.log("Site already exists.", req.body)
        res.status(400).send('Site already exists.')
        return
    }            
    siteConfig.push(site)
    try{
        bookHelper.saveSiteList(siteConfig);
        res.send(`Site list updated for ${site.site}.`)
    }
    catch(ex){
        console.log(ex)
        res.status(500).send(ex)
    }
})

app.delete('/siteconfig/:siteUrl', (req, res) => {
    res.status(500).send('TO BE DEVELOPED!')
})
app.post('/siteconfig/:siteUrl', (req, res) => {
    const {site } = req.body;
    console.log(site)
    if (site === null || site === undefined || site.site != req.params.siteUrl)
    {
        console.log("Site specified does not match url provided.", req.body)
        res.status(400).send('Site specified does not match url provided. Cannot update.')
        return
    }            
    const siteConfig = bookHelper.getSiteConfig()
    objIndex = siteConfig.findIndex(obj => obj.site == site.site);
    
    if (objIndex == -1)
    {
        console.log("Site not found in the config.", req.body)
        res.status(400).send('Site not found in the config.')
        return
    }
    siteConfig[objIndex] = site

    try{
        bookHelper.saveSiteList(siteConfig);
        res.send(`Site list updated for ${req.params.siteUrl}.`)
    }
    catch(ex){
        console.log(ex)
        res.status(500).send(ex)
    }
})
app.get('/folders', (req, res) => {
    const folderList = bookHelper.getFolders()
    res.json(folderList)
})
app.get('/folder/:folderName/books', (req, res) => {

    const bookList = bookHelper.getBooksForFolder(req.params.folderName)
    res.json(bookList)
})
app.get('/book/:bookId', (req, res) => {
    const book = bookHelper.getBook(req.params.bookId)
    res.json(book)
})
app.get('/book/:bookId/chapters/unread', (req, res) => {
    const chapters = bookHelper.getChapters(req.params.bookId)
    const filteredList = chapters.filter(x => x.Read == false)
        .sort((a,b) => {
            if (a.ChapterNumber > b.ChapterNumber)
                return 1
            else if (b.ChapterNumber > a.ChapterNumber)
                return -1
            else 
                return 0
        })
    res.json(filteredList)
})
app.get('/book/:bookId/chapters/lastread', (req, res) => {
    const chapters = bookHelper.getChapters(req.params.bookId)
    const filteredList = chapters.filter(x => x.Read).sort((a,b) => {
        if (a.ChapterNumber < b.ChapterNumber)
            return 1
        else if (b.ChapterNumber < a.ChapterNumber)
            return -1
        else 
            return 0
    })
    if (filteredList === null || filteredList.length === 0)
        res.json()
    else {
        res.json(filteredList[0])
    }
})
app.get('/book/:bookId/chapters', (req, res) => {

    const chapters = bookHelper.getPagedChapters(req.params.bookId, parseInt(req.query.pageSize || 20), parseInt(req.query.page || 1))
    const totalPages = Math.floor(chapters.chapterCount / (req.query.pageSize | 20)) + 1
    chapters.pageCount = totalPages;
    if (totalPages > req.query.page | 1)
        chapters.next = `/book/${req.params.bookId}/chapters/${(req.query.page | 1) + 1}`
    res.json(chapters)
})

app.post('/book/:bookId/checkForUpdates', async (req, res) => {    
    const browser = await webHelper.getBrowser(req.query == null || !req.query.headless);
    try{
        await bookHelper.checkBook(browser, req.params.bookId);
        res.sendStatus(200);
    }
    catch(ex){
        console.log(ex);
        res.sendStatus(500)
    }
    finally{
        await browser.close();
    }
})
app.post('/book/:bookId/site/:siteId/checkForUpdates', async (req, res) => { 
    // add optional parameter for display browser
    const browser = await webHelper.getBrowser(req.query == null || !req.query.headless);
    try{
        await bookHelper.checkBookAtSite(browser, req.params.bookId, req.params.siteId);
        res.sendStatus(200);
    }
    catch(ex){
        console.log(ex);
        res.sendStatus(500)
    }
    finally{
        await browser.close();
    }
    
    //res.send(`Checking for updates for book ${req.params.bookId}`)
})

app.get('/books/find', (req, res) => {
    if(req.query.search === undefined)
    {
        console.log("Please specify a search query parameter.")
        res.status(400).send('Please specify a search query parameter')
        return
    }
    const bookList = bookHelper.searchBooks(req.query.search, (req.query.includeUrl === true));
    res.json(bookList)
})

app.put('/books/manual', (req, res) => {
    const { Title, Folder, ImageUrl, Url } = req.body;
    if (!Title) {
        res.status(400).send('Title is required for a manual book.')
        return
    }
    try {
        const newBook = bookHelper.addManualBook(Title, Folder || "New", ImageUrl, Url)
        res.json(newBook)
    } catch(ex) {
        console.log(ex)
        res.status(500).send(ex)
    }
})
app.put('/books', async (req, res) => {
    const {Url, Folder} = req.body;
    if (Url === null || Url === undefined)
    {
        console.log("Must specify a minimum of a URL.", req.body)
        res.status(400).send({ message: 'Must specify a minimum of a URL'})
        return
    }
    const browser = await webHelper.getBrowser(req.query == null || !req.query.headless);
    let newBook = null
    try{
        newBook = await bookHelper.addBook(browser, Url, Folder || "New")
        res.json(newBook)
    }
    catch(ex){
        console.log(ex)
        res.status(500).send(ex)
    }
})

app.delete('/book/:bookId', (req, res) => {
    res.status(500).send('TO BE DEVELOPED!')
    //res.send(`Delete book ${req.params.bookId}`)
})
app.post('/book/:bookId', (req, res) => {
    const {Id, Title, Folder, Sites } = req.body;
    if (Id === null || Id === undefined || Id != req.params.bookId)
    {
        console.log("Book specified does not match url provided.", req.body)
        res.status(400).send('Book specified does not match url provided. Cannot update.')
        return
    }
    if (Title === null || Title === undefined || Folder === null || Folder === undefined || Sites === null || Sites === undefined || Sites.length < 1)
    {
        console.log("Missing required properties for the book.", req.body)
        res.status(400).send('Missing one or more required properties for the book. Cannot update.')
        return
    }
    try{
        bookHelper.saveBook(req.body);
        res.send(`Book ${req.params.bookId} updated.`)
    }
    catch(ex){
        console.log(ex)
        res.status(500).send(ex)
    }
    //console.log(req.body)
    //res.send(`Attempting to update book ${req.params.bookId}`)
})
app.put('/book/:bookId/sites/manual', (req, res) => {
    const { Url, ImageUrl } = req.body;
    try {
        const newSiteId = bookHelper.addManualSite(req.params.bookId, Url, ImageUrl)
        res.json({ SiteId: newSiteId })
    } catch(ex) {
        console.log(ex)
        res.status(500).send(ex)
    }
})
app.put('/book/:bookId/sites', async (req, res) => {
    const {Url, SiteId} = req.body;
    if (Url === null || Url === undefined)
    {
        console.log("Must specify a minimum of a URL.", req.body)
        res.status(400).send('Must specify a minimum of a URL')
        return
    }
    try{
        const browser = await webHelper.getBrowser(req.query == null || !req.query.headless);
        bookHelper.addSite(browser, req.params.bookId, SiteId, Url);
        res.send(`Added new site to ${req.params.bookId}`)
    }
    catch(ex){
        console.log(ex)
        res.status(500).send(`Error saving site for book ${req.params.bookId}: ${ex}`)
    }
})
app.delete('/book/:bookId/site/:siteId', (req, res) => {
    bookHelper.deleteSite(req.params.bookId, req.params.siteId)
    res.send(`Site ${req.params.siteId} for book ${req.params.bookId} deleted.`)
})
app.delete('/book/:bookId/site/:siteId/chapter/:chapter', (req, res) => {    
    bookHelper.deleteChapterBySite(req.params.bookId, req.params.siteId, req.params.chapter)
    res.send(`Chapter ${req.params.chapter} for book ${req.params.bookId}, site ${req.params.siteId} deleted.`)
})
app.delete('/book/:bookId/site/:siteId/chapters/', (req, res) => {
    bookHelper.deleteSiteChapters(req.params.bookId, req.params.siteId);
    res.send(`All chapters for book ${req.params.bookId}, site ${req.params.siteId} deleted.`)
})
app.post('/book/:bookId/site/:siteId', (req, res) => { 
    const {SiteId, Url, Image, LastAttempted, LastSuccessful} = req.body;
    if (SiteId === null || SiteId === undefined || SiteId != req.params.siteId)
    {
        console.log("Site specified does not match url provided.", req.body)
        res.status(400).send('Site specified does not match url provided. Cannot update.')
        return
    }
    if (Url === null || Url === undefined)
    {
        console.log("Missing required properties for the site.", req.body)
        res.status(400).send('Missing one or more required properties for the site. Cannot update.')
        return
    }
    res.status(500).send('TO BE DEVELOPED!')
    console.log(req.body)
    res.send(`Attempting to update link ${req.params.siteId} for book ${req.params.bookId}`)
})

app.post('/book/:bookId/site/:siteId/logRead', (req, res) => {
    const { ChapterNumber, ChapterTitle, ChapterUrl } = req.body;
    if (ChapterNumber === null || ChapterNumber === undefined) {
        res.status(400).send('ChapterNumber is required.')
        return
    }
    try {
        bookHelper.logManualRead(req.params.bookId, req.params.siteId, ChapterNumber, ChapterTitle, ChapterUrl)
        res.send(`Logged chapter ${ChapterNumber} as read for book ${req.params.bookId}`)
    } catch(ex) {
        console.log(ex)
        res.status(500).send(ex)
    }
})
app.post('/book/:bookId/chapter/:chapter/flagRead', (req, res) => {
    bookHelper.flagRead(req.params.bookId, req.params.chapter)
    res.send(`Flag chapter ${req.params.chapter} read for book ${req.params.bookId}`)
})
app.post('/book/:bookId/chapter/:chapter/flagUnread', (req, res) => {
    bookHelper.flagUnread(req.params.bookId, req.params.chapter)
    res.send(`Flag chapter ${req.params.chapter} unread for book ${req.params.bookId}`)
})
app.post('/book/:bookId/chapters/flagRead', (req, res) => {
    bookHelper.flagAllRead(req.params.bookId)
    res.send(`Flag all chapters read for book ${req.params.bookId}`)
})
app.post('/book/:bookId/chapters/flagUnread', (req, res) => {
    bookHelper.flagAllUnread(req.params.bookId)
    res.send(`Flag all chapters unread for book ${req.params.bookId}`)
})

app.post('/parse/parseurl', async (req, res) => {
    const browser = await webHelper.getBrowser(req.query == null || !req.query.headless);
    if(req.query.url === undefined)
    {
        console.log("Please specify a url attempt to parse.")
        res.status(400).send('Please specify a url to attempt to parse')
        return
    }
    const siteList = bookHelper.getSites();
    if (siteList.filter(s => req.query.url.match(s)).length === 0){
        console.log("Url is not from a configured site.")
        res.status(400).send('Url is not from a configured site')
    }

    const site = await bookHelper.testParseUrl(browser, req.query.url);
    if (site == null)
        res.status(500).send('could not parse site!')
    else
        res.json(site)
})

app.post('/parse/getpagecontents', async (req, res) => {
    const browser = await webHelper.getBrowser(req.query == null || !req.query.headless);
    const {PostLoad, MultiPage, Url} = req.body;
    if(Url === undefined)
    {
        console.log("Please specify a url.")
        res.status(400).send('Please specify a url')
        return
    }

    const rtrn = await bookHelper.getPageContents(browser, Url, PostLoad, MultiPage);
    if (rtrn == null)
        res.status(500).send('could not load url!')
    else
        res.json(rtrn)
})
app.post('/parse/parsetext', async (req, res) => {
    const {PostLoad, ParseConfig, Url, Contents, MultiPage} = req.body;
    var contentsText = Contents
    if (Contents === undefined) {
        var browser = await webHelper.getBrowser(req.query == null || !req.query.headless);
        if(Url === undefined)
        {
            console.log("Please specify a url.")
            res.status(400).send('Please specify a url')
            return
        }
        contentsText = await bookHelper.getPageContents(browser, Url, PostLoad, MultiPage);
    }
    console.log(contentsText.length)
    const rtrn = bookHelper.parseText(ParseConfig, contentsText)
    if (rtrn == null)
        res.status(500).send('could not parse text or load url!')
    else
        res.json(rtrn)
})
app.post('/parse/parsechapterblocks', async (req, res) => {
    const {PostLoad, ChapterBlockConfig, SplitChapterText, Url, ChapterNumber, Contents, MultiPage} = req.body;
    var contentsText = Contents
    if (Contents === undefined)
    {
        var browser = await webHelper.getBrowser(req.query == null || !req.query.headless);
        if(Url === undefined)
        {
            console.log("Please specify a url.")
            res.status(400).send('Please specify a url')
            return
        }
        contentsText = await bookHelper.getPageContents(browser, Url, PostLoad, MultiPage);
    }

    console.log(contentsText.length)
    const chapters = bookHelper.parseChapterBlocks(ChapterBlockConfig, SplitChapterText, contentsText)
    var rtrn = null
    if (ChapterNumber == undefined)
    {
        var chapterSample = chapters.slice(0,3)
        if (chapters.length > 3)
            chapterSample.push(chapters[chapters.length-1])
        rtrn = {
            chapterCount: chapters.length,
            sampleChapters: chapterSample
        }
    }
    else {
        rtrn = {
            chapterCount: chapters.length,
            sampleChapters: chapters[ChapterNumber]
        }
    }
    if (rtrn == null)
        res.status(500).send('could not parse text or load url!')
    else
        res.json(rtrn)
})

app.listen(port, () => {
  console.log(`Bookcheck API listening at http://localhost:${port}`)
})
