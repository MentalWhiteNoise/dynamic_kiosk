import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import BookList from './BookList'
import FolderHeader from './FolderHeader'

export default function FolderPage(props){
    let { folder } = useParams();
    const [bookList, setBookList] = useState(null);
    const [bookListLoading, setBookListLoading] = useState(true);
    const [bookListError, setBookListError] = useState(null);
    const [siteList, setSiteList] = useState(null);

    const [siteListLoading, setSiteListLoading] = useState(true);

    const [siteListError, setSiteListError] = useState(null);
    const [site, setSite] = useState(null);
    const [updateList, setUpdateList] = useState([]);
    const [cancelUpdate, setCancelUpdate] = useState(false);
    const [sortColumn, setSortColumn] = useState("title");
    const [sortDesc, setSortDesc] = useState("false");

    useEffect(() => {
        fetch(`http://localhost:3000/folder/${folder}/books`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                let tempBookList = [...data]
                tempBookList.forEach(x => x.status = "idle")
                setBookList(tempBookList)
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
                setBookListError(error);
            })
            .finally(() => {
                setBookListLoading(false);
            })
        fetch(`http://localhost:3000/sites`)
                .then(response =>{
                    if (response.ok){
                        return response.json();
                    }
                    throw response
                })
                .then(data => {
                    setSiteList(data)
                })
                .catch(error => {
                    console.error("Error fetching data: ", error)
                    setSiteListError(error);
                })
                .finally(() => {
                    setSiteListLoading(false);
                })
    }, [folder])
 
    useEffect(() => {
        if (updateList.length > 0 && !cancelUpdate)
        {

            const bookItem = updateList.shift()
            console.log(`Checking updates for ${bookItem.bookId}`)
            //const bookItem = updateList.pop()
            let book = bookList.find(x => x.Id.toString() === bookItem.bookId.toString())
            book.status = "checking"
            setBookList(bookList)
            //setBookList([...bookList])
            fetch(`http://localhost:3000/book/${bookItem.bookId}/site/${bookItem.siteId}/checkForUpdates`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
                .then(checkResponse => {
                    book.status = "idle"
                    //console.log(bookList)
                    //setBookList([...bookList])
                    setBookList(bookList)
                    setUpdateList([...updateList])
                })
        }
        else if (updateList.length > 0 && cancelUpdate)
        {
            console.log("reset book list?")
            bookList.forEach(b => {b.status = "idle"})
            setBookList(bookList)
            setUpdateList([])
            //setCancelUpdate(false)
        }
    }, [updateList, bookList,cancelUpdate])

    const handleSiteChange = (newSite) => {
        setSite(newSite === "" ? null : newSite);
    }
    const handleUpdateClick = () => {
        let listToUpdate = []
        let tempList = [...bookList]
        tempList.forEach(b => {
            b.Sites.forEach(s => {
                if (site == null || s.Url.match(site))
                {
                    listToUpdate.push({ bookId: b.Id, siteId : s.SiteId })
                    b.status = "queued"
                }
            })
        })
        //console.log(tempList[95])
        setBookList(tempList)
        setUpdateList(listToUpdate)
        setCancelUpdate(false)
    }
    const handleCancelUpdate = () => {
        console.log("Canceling update...")
        setCancelUpdate(true)

        bookList.forEach(b => {b.status = "idle"})
        setBookList([...bookList])
    }
    const handleReloadBook =(bookId) =>{
        console.log(`Reload book ${bookId}`)
        fetch(`http://localhost:3000/book/${bookId}`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                //let tempBookList = [...bookList]
                const idx = bookList.findIndex(x => x.Id === bookId)
                bookList[idx] = {...data, status: "idle"}
                setBookList([...bookList])
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
                setBookListError(error);
            })
            .finally(() => {
                setBookListLoading(false);
            })
    }
    const handleSort = (column) => {
        console.log("handleSort", sortColumn, column, sortDesc)
        if (column === sortColumn)
        {
            setSortDesc(!sortDesc)
        }
        else
        {
            setSortColumn(column);
            setSortDesc(false)
        }
    }
    useEffect(() => {
        if (!bookList || bookListLoading) return
        console.log("Resorting??")
        const newList = [...bookList]
        newList.sort((a,b) => {
            if (sortColumn === "title")
            {
                if (a.Title > b.Title) return (sortDesc) ? 1 : -1
                if (a.Title < b.Title) return (sortDesc) ? -1 : 1
                return 0
            }
            if (sortColumn === "unread")
            {
                if (a.CountUnread > b.CountUnread) return (sortDesc) ? 1 : -1
                if (a.CountUnread < b.CountUnread) return (sortDesc) ? -1 : 1
                if (a.Title > b.Title) return (sortDesc) ? 1 : -1
                if (a.Title < b.Title) return (sortDesc) ? -1 : 1
                return 0
            }
            if (sortColumn === "status")
            {
                if (a.Status > b.Status) return (sortDesc) ? 1 : -1
                if (a.Status < b.Status) return (sortDesc) ? -1 : 1
                if (a.Title > b.Title) return (sortDesc) ? 1 : -1
                if (a.Title < b.Title) return (sortDesc) ? -1 : 1
                return 0
            }
            return 0
        })
        console.log(newList)
        setBookList([...newList])
    }, [sortColumn, sortDesc])
    const loading = siteListLoading || bookListLoading;
    const error = (bookListError && siteListError) ? bookListError + "\n" + siteListError : bookListError || siteListError
    //console.log(site)
    const effectiveBookList = (bookList == null) ? [] : [...bookList.filter(x => site == null || x.Sites.filter(y=>y.Url.match(site)).length > 0)]
    //console.log(effectiveBookList.length)
    const bookListUrls = ((bookList == null) ? [] : bookList.map(b => b.Sites.map(s => s.Url)).flat())
    const effectiveSiteList = siteList == null ? [] : siteList.filter(s => bookListUrls.filter(u => u.match(s)).length > 0)
    //console.log(effectiveSiteList);
    return (<>    
        <FolderHeader
            folder={folder}
            bookList={bookList}
            siteList={effectiveSiteList}
            onSiteChange={handleSiteChange}
            selectedSite={site}
            onUpdateClick={handleUpdateClick}
            onCancelUpdate={handleCancelUpdate}
            />
        {loading ? <>loading</> : error ? <>error encountered loading data for folder: {error}</> : (
            <BookList
                bookList={effectiveBookList}
                selectedSite={site}
                onReloadBook={handleReloadBook}
                siteList={siteList}
                onSort={handleSort}
                sortColumn={sortColumn}
                sortDesc={sortDesc}
            />
        )}
    </>)
}