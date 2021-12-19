import React, {useEffect, useState } from "react";
import {useParams } from "react-router-dom";
import BookList from './BookList'
import FolderHeader from './FolderHeader'
import ServerAddress from "../../services/api";
import  { useSearchParams } from "react-router-dom";
import {CircularProgress} from '@mui/material'


export default function FolderPage(props){
    let { folder } = useParams();
    let [searchParams, setSearchParams] = useSearchParams();
    const setSite = (newSite) => {
        //console.log(searchParams)
        if (newSite == null){
            delete searchParams.site
            setSearchParams({...searchParams})
        }
        else
            setSearchParams({...searchParams, site: newSite})
    }
    const site = searchParams.get("site");
    
    const [bookList, setBookList] = useState(null);
    const [bookListLoading, setBookListLoading] = useState(true);
    const [bookListError, setBookListError] = useState(null);
    const [siteList, setSiteList] = useState(null);

    const [siteListLoading, setSiteListLoading] = useState(true);

    const [siteListError, setSiteListError] = useState(null);
    //const [site, setSite] = useState(null);
    const [updateList, setUpdateList] = useState([]);
    const [cancelUpdate, setCancelUpdate] = useState(false);

    useEffect(() => {
        fetch(`${ServerAddress}/folder/${folder}/books`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setBookList(data)
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
                setBookListError(error);
            })
            .finally(() => {
                setBookListLoading(false);
            })
        fetch(`${ServerAddress}/sites`)
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
            fetch(`${ServerAddress}/book/${bookItem.bookId}/site/${bookItem.siteId}/checkForUpdates`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
                .then(() => {
                    setUpdateList([...updateList])
                })
        }
        else if (updateList.length > 0 && cancelUpdate)
        {
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
                }
            })
        })
        setUpdateList(listToUpdate)
        setCancelUpdate(false)
    }
    const handleCancelUpdate = () => {
        console.log("Canceling update...")
        setCancelUpdate(true)
    }
    const handleReloadBook =(bookId) =>{
        console.log(`Reload book ${bookId}`)
        fetch(`${ServerAddress}/book/${bookId}`)
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
    const loading = siteListLoading || bookListLoading;
    const error = (bookListError && siteListError) ? bookListError + "\n" + siteListError : bookListError || siteListError
    //console.log(site)
    const effectiveBookList = (bookList == null) ? [] : [...bookList.filter(x => site == null || x.Sites.filter(y=>y.Url.match(site)).length > 0)]
    //console.log(effectiveBookList.length)
    const bookListUrls = ((bookList == null) ? [] : bookList.map(b => b.Sites.map(s => s.Url)).flat())
    const effectiveSiteList = siteList == null ? [] : siteList.filter(s => bookListUrls.filter(u => u.match(s)).length > 0)
    //console.log(effectiveSiteList);
    if (siteListLoading|| bookListLoading)
        return <CircularProgress/>
    return (<>
        <FolderHeader
            folder={folder}
            bookList={bookList}
            siteList={effectiveSiteList}
            onSiteChange={handleSiteChange}
            selectedSite={site}
            onUpdateClick={handleUpdateClick}
            onCancelUpdate={handleCancelUpdate}
            running={updateList.length}
            />
        {loading ? <>loading</> : error ? <>error encountered loading data for folder: {error}</> : (
            <BookList
                bookList={effectiveBookList}
                selectedSite={site}
                onReloadBook={handleReloadBook}
                siteList={siteList}
                updateList={updateList}
            />
        )}
    </>)
}