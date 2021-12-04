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

    useEffect(() => {
        fetch(`http://localhost:3000/folder/${folder}/books`)
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
    const handleSiteChange = (newSite) => {
        setSite(newSite === "" ? null : newSite);
    }
    const loading = siteListLoading || bookListLoading;
    const error = (bookListError && siteListError) ? bookListError + "\n" + siteListError : bookListError || siteListError
    //console.log(site)
    const effectiveBookList = (bookList == null) ? [] : bookList.filter(x => site == null || x.Sites.filter(y=>y.Url.match(site)).length > 0)
    const effectiveSiteList = siteList == null ? [] : siteList
    //console.log(effectiveSiteList);
    return (<>    
        <FolderHeader
            folder={folder}
            bookList={bookList}
            siteList={effectiveSiteList}
            onSiteChange={handleSiteChange}
            selectedSite={site}
            />
        {loading ? <>loading</> : error ? <>error encountered loading data for folder: {error}</> : (
            <BookList
                bookList={effectiveBookList}
            />
        )}
    </>)
}