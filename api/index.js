const express = require('express')
var cors = require('cors')
const bodyParser = require('body-parser');
const querystring = require('querystring');
const bookHelper = require('./services/bookCheck/bookHelper')
const webHelper = require('./services/bookCheck/webHelper');
const { query } = require('express');

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
const port = 8080

app.get('/sites', (req, res) => {
    const siteList = bookHelper.getSites()
    res.json(siteList)
})
app.get('/siteconfig', (req, res) => {
    const siteConfig = bookHelper.getSiteConfig()
    res.json(siteConfig)
})
app.get('/folders', (req, res) => {
    const folderList = bookHelper.getFolders()
    res.json(folderList)
})
app.get('/folder/:folderName/books', (req, res) => {
    const bookList = bookHelper.getBookList()
    const filteredList = bookList.filter(x => x.Folder.toLowerCase() == req.params.folderName.toLowerCase())
    const mergedList = bookHelper.mergeListBookStatus(filteredList)
    res.json(mergedList)
})
app.get('/book/:bookId', (req, res) => {
    const bookList = bookHelper.getBookList()
    const book = bookList.find(x => x.Id.toString() === req.params.bookId)
    res.json(bookHelper.mergeBookStatus(book))
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
    console.log(req.query)
    const chapters = bookHelper.getBookChapters(req.params.bookId, req.query.pageSize | 20, req.query.page | 1)
    const totalPages = Math.floor(chapters.chapterCount / (req.query.pageSize | 20)) + 1
    chapters.pageCount = totalPages;
    if (totalPages > req.query.page | 1)
        chapters.next = `/book/${req.params.bookId}/chapters/${(req.query.page | 1) + 1}`
    res.json(chapters)
})

// Action Item: Add paging & sorting to book lists
// Action Item: Add paging to chapter lists
// Action Item: Queue up update check(?)

app.post('/book/:bookId/checkForUpdates', async (req, res) => {    
    const browser = await webHelper.getBrowser(req.query == null || !req.query.headless);
    try{
        await bookHelper.checkBook(browser, req.params.bookId);
    }
    catch(ex){
        console.log(ex);
        res.sendStatus(500)
    }
    finally{
        await browser.close();
        res.sendStatus(200);
    }
})
app.post('/book/:bookId/site/:siteId/checkForUpdates', async (req, res) => { 
    // add optional parameter for display browser
    const browser = await webHelper.getBrowser(req.query == null || !req.query.headless);
    try{
        await bookHelper.checkBookAtSite(browser, req.params.bookId, req.params.siteId);
    }
    catch(ex){
        console.log(ex);
        res.sendStatus(500)
    }
    finally{
        await browser.close();
        res.sendStatus(200);
    }
    
    //res.send(`Checking for updates for book ${req.params.bookId}`)
})

app.get('/books/find', (req, res) => {
    console.log(req.query)
    if(req.query.title === undefined)
    {
        console.log("Please specify a title.")
        res.status(500).send('Please specify a title search term')
        return
    }
    const bookList = bookHelper.getBookList();
    const filteredList = bookList.filter(x => 
        x.Title.toLowerCase().match(req.query.title.toLowerCase()) || (x.AltTitles !== null && x.AltTitles.filter(y => y.toLowerCase().match(req.query.title.toLowerCase())).length > 0)
    )
    res.json(filteredList)
})
app.get('/folder/:folderName/books/find', (req, res) => {
    console.log(req.query)
    if(req.query.title === undefined)
    {
        console.log("Please specify a title.")
        res.status(500).send('Please specify a title search term')
        return
    }
    const bookList = bookHelper.getBookList();
    const filteredList = bookList.filter(x => x.Folder.toLowerCase() == req.params.folderName.toLowerCase() &&
        (x.Title.toLowerCase().match(req.query.title.toLowerCase()) || (x.AltTitles !== null && x.AltTitles.filter(y => y.toLowerCase().match(req.query.title.toLowerCase())).length > 0))
    )
    res.json(filteredList)
})

app.put('/books', (req, res) => {
    const {Title, Url, Image, Folder} = req.body;
    if (Url === null || Url === undefined)
    {
        console.log("Must specify a minimum of a URL.", req.body)
        res.status(500).send('Must specify a minimum of a URL')
        return
    }
    res.status(500).send('TO BE DEVELOPED!')
})

app.delete('/book/:bookId', (req, res) => {
    res.status(500).send('TO BE DEVELOPED!')
    //res.send(`Delete book ${req.params.bookId}`)
})
app.post('/book/:bookId', (req, res) => {
    const {Id, Title, Sites, AltTitles, Folder} = req.body;
    if (Id === null || Id === undefined || Id != req.params.bookId)
    {
        console.log("Book specified does not match url provided.", req.body)
        res.status(500).send('Book specified does not match url provided. Cannot update.')
        return
    }
    if (Title === null || Title === undefined || Folder === null || Folder === undefined || Sites === null || Sites === undefined || Sites.length < 1)
    {
        console.log("Missing required properties for the book.", req.body)
        res.status(500).send('Missing one or more required properties for the book. Cannot update.')
        return
    }
    res.status(500).send('TO BE DEVELOPED!')
    //console.log(req.body)
    //res.send(`Attempting to update book ${req.params.bookId}`)
})
app.put('/book/:bookId/sites', (req, res) => {
    const {Url, Image} = req.body;
    if (Url === null || Url === undefined)
    {
        console.log("Must specify a minimum of a URL.", req.body)
        res.status(500).send('Must specify a minimum of a URL')
        return
    }
    res.status(500).send('TO BE DEVELOPED!')
})
app.delete('/book/:bookId/site/:siteId', (req, res) => {
    // must have more than zero left...
    res.status(500).send('TO BE DEVELOPED!')
})
app.post('/book/:bookId/site/:siteId', (req, res) => { 
    const {SiteId, Url, Image, LastAttempted, LastSuccessful} = req.body;
    if (SiteId === null || SiteId === undefined || SiteId != req.params.siteId)
    {
        console.log("Site specified does not match url provided.", req.body)
        res.status(500).send('Site specified does not match url provided. Cannot update.')
        return
    }
    if (Url === null || Url === undefined)
    {
        console.log("Missing required properties for the site.", req.body)
        res.status(500).send('Missing one or more required properties for the site. Cannot update.')
        return
    }
    res.status(500).send('TO BE DEVELOPED!')
    console.log(req.body)
    res.send(`Attempting to update link ${req.params.siteId} for book ${req.params.bookId}`)
})

app.delete('/book/:bookId/site/:siteId/allChapters', (req, res) => {
    // must have more than zero left...
    res.status(500).send('TO BE DEVELOPED!')
})
app.delete('/book/:bookId/site/:siteId/chapter/:chapter', (req, res) => {
    // must have more than zero left...
    res.status(500).send('TO BE DEVELOPED!')
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

app.listen(port, () => {
  console.log(`Bookcheck API listening at http://localhost:${port}`)
})