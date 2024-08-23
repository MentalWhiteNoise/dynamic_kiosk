const webHelper = require('./webHelper');
const helper = require('./genericHelper');

async function getContents(browser, url, multiPage, postLoad)
{
    contents = await webHelper.getUrlContents(browser, url, postLoad)
    if (multiPage && multiPage != null) {
        try {
            const nextPageUrl = parseText(multiPage.nextPageUrl, content);
            const nextPageContents = getContents(browser, nextPageUrl, null, postLoad);
            return [contents, nextPageContents]
        }
        catch { }
    }
    return contents
}
async function parseContents(browser, url, multiPage, sites)
{
    let rtrn = {};
    let found = false;
    let site = null;
    sites.forEach(s => {
        if (url.startsWith(s.site)) {
            site = s;
            found = true;
        }
    })

    if (!found) {
        console.log(`Unkown source - cannot parse ${url}`);
        return null;
    }
    
    const content = await webHelper.getUrlContents(browser, url, site.postLoad)
    
    if (content == null) {
        console.log("Unable to pull content from web page...")
        return null;
    }

    console.log(`Pulled content from web page: ${content.length} characters`)
    
    const title = parseText(site.title, content);
    if (helper.isNullOrWhiteSpace(title)) {
        console.log(`Issues parsing title for ${url}`);
        return null;
    }
    rtrn = {...rtrn, title: title};
    
    const image = parseText(site.image, content);
    if (helper.isNullOrWhiteSpace(image))
        console.log(`Bad image for ${url}`);
    else
        rtrn = {...rtrn, image: image};

    const chapterText = parseText(site.chapterText, content);
    if (helper.isNullOrWhiteSpace(chapterText)) {
        console.log(`Error parsing chapters for ${url}`);
        return null;
    }
    //console.log("Chapter Text length", chapterText.length);
    //console.log("Chapter Text: ", chapterText.substring(0,500));
    //console.log(helper.replaceAll(chapterText, site.splitChapterText, '?').substring(0,1000))

    const chaptersRaw = helper.replaceAll(chapterText, site.splitChapterText, String.fromCharCode(30)).split(String.fromCharCode(30));
    //console.log(`${chaptersRaw.length} chapter sections`)
    let chapterList = [];
    chaptersRaw.forEach(chapter => {
        const tempChapter = parseRow(site.forEachChapterText, chapter);
        if (tempChapter != null)
        { chapterList.push(tempChapter); }
    })
    if (multiPage && site.multiPage != null) {
        try {
            const nextPageUrl = parseText(site.multiPage.nextPageUrl, content);
            const nextPageContents = parseContents(webHelper, nextPageUrl, true);
            nextPageContents.forEach(chapter => chapterList.push(chapter));
        }
        catch { }
    }
    console.log(`${chapterList.length} chapters parsed`)
    rtrn = {...rtrn, chapterList: chapterList};
    return rtrn;
}
function parseRow(chapterConfig, rowValue)
{
    let parsedRow = {}
    //console.log(chapterConfig, rowValue)
    if (chapterConfig.filter != null) {
        const filterText = parseText(chapterConfig.filter.text, rowValue);
        console.log(filterText)
        if (chapterConfig.filter.In != null && chapterConfig.filter.In.length > 0) {
            let isIn = false;
            chapterConfig.filter.In.forEach(s =>{
                if (s == filterText) isIn = true;
            })
            if (!isIn) {
                console.log("No match")
                return null;
            }
        }
        if (chapterConfig.filter.notIn != null) {
            chapterConfig.filter.notIn.forEach(s =>
            {
                if (s == filterText) return null;
            })
        }
    }
    const hRef = parseText(chapterConfig.HRef, rowValue);

    if (helper.isNullOrWhiteSpace(hRef)) return null;
    parsedRow = {...parsedRow, hRef: hRef};

    const chapterTitle = parseText(chapterConfig.ChapterTitle, rowValue);
    if (helper.isNullOrWhiteSpace(chapterTitle)) return null;
    parsedRow = {...parsedRow, chapterTitle: chapterTitle};

    const uploaded = parseText(chapterConfig.dateUploaded, rowValue);    
    try {
        const dateUploaded = new Date(uploaded);
        parsedRow = {...parsedRow, dateUploaded: dateUploaded};
    }
    catch { }
    
    const chapterNumberText = parseText(chapterConfig.ChapterNumber, rowValue);
    if (chapterNumberText != null) {
        try {
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
    try {
        methods.forEach(parseMethod => {
            let searchString = "";
            switch (parseMethod.method) {
                case "readPast":
                    searchString = parseMethod.string;
                    const stringFound = rtrn.indexOf(searchString);
                    if (stringFound === 0 || stringFound === null)
                    {
                        console.log(`Cannot find string ${searchString}`)
                        throw `Cannot find string ${searchString}`
                    }
                    rtrn = rtrn.substring(stringFound + searchString.length);
                    //rtrn = rtrn.substring(rtrn.indexOf(searchString) + searchString.length);
                    break;
                case "readUntil":
                    searchString = parseMethod.string;
                    const stringFound2 = rtrn.indexOf(searchString);
                    if (stringFound2 === 0 || stringFound2 === null)
                    {
                        console.log(`Cannot find string ${searchString}`)
                        throw `Cannot find string ${searchString}`
                    }
                    rtrn = rtrn.substring(0, stringFound2);
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
                    break;
                case "toLower":
                    rtrn = rtrn.toLowerCase();
                    break;
                case "prepend":
                    if (rtrn == null || rtrn == ""){ return null}
                    rtrn = parseMethod.string + rtrn;
                    break;
                case "movePastElement":
                    rtrn = movePastElement(rtrn);
                    break;
                case "remove":
                    rtrn = helper.replaceAll(rtrn, parseMethod.string, "");
                    break;
                case "removeOrdinalIndicator":
                    rtrn = rtrn.replace(/(?<=[0-9])(?:st|nd|rd|th)/, "");
                    break;
                case "removeHtmlComments":
                    rtrn = removeHtmlComments(rtrn);
                    break;
                case "convertDateFromEpoch":
                    rtrn = convertDateFromEpoch(rtrn);
                    break;
                default:
                    throw `Unexpected method: ${parseMethod.method}`;
            }
        })
        return rtrn;
    }
    catch {
        return null;
    }
}
function parseChapterBlocks(chapterBlockConfig, splitChapterText, content)
{
    const chapterText = parseText(chapterBlockConfig, content);
    if (helper.isNullOrWhiteSpace(chapterText)) {
        console.log(`Error parsing chapters for ${url}`);
        return null;
    }
    const chaptersRaw = helper.replaceAll(chapterText, splitChapterText, String.fromCharCode(30)).split(String.fromCharCode(30));
    return chaptersRaw;
}
function cleanHtmlText(text)
{
    text = text.trim();
    if (text[0] == '"') {
        text = text.substring(1, text.Length - 2);
        text = text.trim();
    }
    text = helper.replaceAll(text, "&#8217;", "'");
    while (text[0] == '\n') {
        text = text.substring(1, text.Length - 1);
        text = text.trim();
    }
    return text;
}
function movePastTag(text)
{
    if (text[0] == '<') {
        text = text.substring(text.indexOf(">") + 1);
        return movePastTag(text);
    }
    return text;
}
function movePastElement(text)
{
    if (text[0] == '<') {
        var tagEnd = Math.min(text.indexOf(" "), text.indexOf(">"));
        if (text[tagEnd - 1] == '/')
        { return movePastTag(text); }
        var tag = text.substring(1, tagEnd - 1);
        return text.substring(text.indexOf("</{tag}>") + "</{tag}>".Length);
    }
    return text;
}
function removeHtmlComments(text)
{
    return text.replace(new RegExp("<!--(.*?)-->", "g"), "")
}
function convertDateFromEpoch(text)
{
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCMilliseconds(parseInt(text));
    return d.toISOString()
}
module.exports = { parseContents, getContents, parseText, parseChapterBlocks };