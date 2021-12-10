import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import { TableCell, TableRow, IconButton, Badge, Tooltip } from "@mui/material";
import { Bookmark, BookmarkBorder, Edit, AutoStories } from '@mui/icons-material';
import BookSiteListItem from "./BookSiteListItem";

function openInNewTab(url){
    //console.log("here:", url)
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
}
export default function BookListItem(props){
    const {onExpand, expanded, selectedSite, onReloadBook, siteList} = props;
    const [book, setBook] = useState(props.book);
    //console.log(book.Id)
    const [checkingTriggered, setCheckingTriggered] = useState(book.status === "checking");
    useEffect(() => { reloadBook(book.Id) }, [book.Id])
    useEffect(() => { 
        setCheckingTriggered(book.status === "queued" || book.status === "checking") 
    }, [book.status])
    useEffect(() => {setBook(props.book)}, [props.book])


    const reloadBook = (bookId) => {
        fetch(`http://localhost:3080/book/${bookId}`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then((data) => {
                setBook(data)
            })
            .catch((e) => {
                console.log("ERROR: " + e.toString())
            })
    }
    const handleCheckForUpdate = (bookId, siteId) =>{
        setCheckingTriggered(true);
        fetch(`http://localhost:3080/book/${bookId}/site/${siteId}/checkForUpdates?headless=false`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(response =>{
                if (response.ok){
                    return;
                }
                throw response
            })
            .then(() => {
                reloadBook(bookId)
            })
            .catch((e) => {
                console.log("ERROR: " + e.toString())
                onReloadBook(bookId)
            })
            .finally(() => {
                setCheckingTriggered(false);
            })
    }

    const handleFlagAllUnread = (bookId) => {
        fetch(`http://localhost:3080/book/${bookId}/chapters/flagUnread`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(checkResponse => reloadBook(bookId))
    }
    const handleFlagAllRead = (bookId) => {
        fetch(`http://localhost:3080/book/${bookId}/chapters/flagRead`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(checkResponse => {
                console.log(checkResponse)
                reloadBook(bookId)
            })
    }
    
    const handleFlagRead = (bookId, chapterNumber) => {
        //console.log(bookId, chapterNumber)
        fetch(`http://localhost:3080/book/${bookId}/chapter/${chapterNumber}/flagRead`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(checkResponse => {
                //console.log(checkResponse)
                reloadBook(bookId)
            })
    }
    const matchedSites = book.Sites.filter(s => selectedSite == null || s.Url.match(selectedSite))
    //console.log(book.Sites)
    return (<>
        <TableRow>
        <TableCell rowSpan={1 + matchedSites.length * 2} padding="none"><img
            src={book.Sites[0].Image}
            loading="lazy"
            alt=""
            style={{
                maxWidth: "100px",
                maxHeight: "100px",
                width: "auto",
                height: "auto"
            }}
            />
        </TableCell>
        <TableCell colSpan={2}>{book.Title}</TableCell>
        <TableCell/>
        <TableCell sx={{whiteSpace: "nowrap"}}>
            <Tooltip title="Continue reading">
            <IconButton onClick={() => openInNewTab(book.LastChapterRead.HRef)}>
            <Badge badgeContent={book.CountUnread}>
                <AutoStories/> {/* Read unread */}
            </Badge>
            </IconButton>
            </Tooltip>
            Last Read: {book.LastChapterRead ? book.LastChapterRead.ChapterNumber : "n/a"}
        </TableCell>
        <TableCell sx={{whiteSpace: "nowrap"}}>
            <Tooltip title={book.CountUnread === 0 ? "" : "Flag all Read"}>
            <IconButton disabled={book.CountUnread === 0} onClick={(e) => handleFlagAllRead(book.Id)}>
                <Bookmark/> {/* Flag all Read */}
            </IconButton>
            </Tooltip>
            <Tooltip title={book.CountRead === 0 ? "" : "Flag all unread"}>
            <IconButton disabled={book.CountRead === 0} onClick={(e) => handleFlagAllUnread(book.Id)}>
                <BookmarkBorder/> {/* Flag all Unread */}
            </IconButton>
            </Tooltip>
            <Tooltip title="Edit Book">
            <IconButton component={Link} to={`/book/${book.Id}`}>
                <Edit/> {/* Edit Book */}
            </IconButton>
            </Tooltip>
        </TableCell>
        </TableRow>

        { matchedSites.map((site, index) => (
            <BookSiteListItem
                key={index}
                siteRowId={book.Id + "_" + index}
                onExpand={onExpand}
                expanded={expanded}
                site={site}
                siteList={siteList}
                checkForUpdate={() => handleCheckForUpdate(book.Id, site.SiteId)}
                checkingTriggered={checkingTriggered}
                onFlagRead={(chapterNumber) => handleFlagRead(book.Id, chapterNumber)}
                book={book}
            />            
        ))}
        </>)
}