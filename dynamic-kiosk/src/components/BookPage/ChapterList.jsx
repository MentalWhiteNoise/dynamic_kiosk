
import { Delete, CheckBoxOutlineBlank, CheckBox, OpenInBrowser, Bookmark, BookmarkBorder, DeleteOutline } from "@mui/icons-material";
import { CircularProgress, Table, TableBody, TableCell, TableRow, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { Box } from "@mui/system";
import React, {useEffect, useState} from "react";

const openInNewTab = (url) => {
    //console.log("here:", url)
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
}
export default function ChapterList(props){
    let { book, reloadBook, onFlagRead, onFlagUnread } = props;
    const [enableDelete, setEnableDelete] = useState(false);
    const [chapterData, setChapterData] = useState(null);
    const [chaptersLoading, setChaptersLoading] = useState(true);
    const [chaptersError, setChaptersError] = useState(null);
    const [linkConfirmOpen, setLinkConfirmOpen] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);
    
    useEffect(() => {
        fetch(`http://localhost:3000/book/${book.Id}/chapters`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setChapterData(data)
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
                setChaptersError(error);
            })
            .finally(() => {
                setChaptersLoading(false);
            })
    }, [book])
    
    const handleFlagAllUnread = () => {
        fetch(`http://localhost:3000/book/${book.Id}/chapters/flagUnread`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(checkResponse => reloadBook(book.Id))
    }
    const handleFlagAllRead = () => {
        fetch(`http://localhost:3000/book/${book.Id}/chapters/flagRead`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(checkResponse => {
                console.log(checkResponse)
                reloadBook(book.Id)
            })
    }
    const onCloseLinkConfirm = () => { setLinkConfirmOpen(false); }
    const onDeleteLink = (siteId, chapterNumber) => {
        setSelectedLink({SiteId: siteId, ChapterNumber: chapterNumber})
        setLinkConfirmOpen(true)
    }
    const onDeleteSiteChapter = (siteId, chapterNumber) =>{
        
    }
    const onDeleteAllChaptersForSite = (siteId) =>{
        
    }
    if (chaptersLoading) 
        return <CircularProgress/>
    if (chaptersError)
        return <>Error encountered loading chapters: {chaptersError}</>
    return (
            <>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Tooltip title={book.CountUnread === 0 ? "" : "Flag all Read"}>
                            <IconButton disabled={book.CountUnread === 0} onClick={(e) => handleFlagAllRead()}>
                                <Bookmark/> {/* Flag all Read */}
                            </IconButton>
                            </Tooltip>
                            <Tooltip title={book.CountRead === 0 ? "" : "Flag all unread"}>
                            <IconButton disabled={book.CountRead === 0} onClick={(e) => handleFlagAllUnread()}>
                                <BookmarkBorder/> {/* Flag all Unread */}
                            </IconButton>
                            </Tooltip>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell>
                            <Tooltip title={enableDelete ? "Disable Delete Link" : "Enable Delete Link"}>
                            <IconButton onClick={(e) => setEnableDelete(!enableDelete)}>
                                {enableDelete ? <Delete/> : <DeleteOutline/>}
                            </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Read</TableCell>
                        <TableCell>Number</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Link</TableCell>
                    </TableRow>
                    {chapterData.chapters.map((c,i) => (
                        <TableRow key={i}>
                            <TableCell>  
                                {c.Read ? (
                                <Tooltip title="Flag Unread">
                                <IconButton onClick={(e) => onFlagUnread(c.ChapterNumber)}>
                                    <CheckBox/>
                                </IconButton>
                                </Tooltip>) : (
                                <Tooltip title="Flag Read">
                                <IconButton onClick={(e) => onFlagRead(c.ChapterNumber)}>
                                    <CheckBoxOutlineBlank/>
                                </IconButton>
                                </Tooltip>)
                                }
                            </TableCell>
                            <TableCell>
                                {c.ChapterNumber}
                            </TableCell>
                            <TableCell>
                                {c.ChapterTitle}
                            </TableCell>
                            <TableCell sx={{display: "flex", flexDirection: "column"}}>
                                {c.Links.map((link, j) =>(
                                <Box key={j}>
                                {enableDelete ? 
                                <Tooltip title="Delete Link">
                                    <IconButton onClick={() => onDeleteLink(link.SiteId, c.ChapterNumber)}>
                                        <Delete/>
                                    </IconButton>
                                </Tooltip> : <></>}
                                <Tooltip title={link.HRef}>
                                <Button onClick={() => openInNewTab(link.HRef)}>
                                    <OpenInBrowser/>
                                </Button>
                                </Tooltip>
                                {link.SiteId}
                                </Box>
                                ))}
                            </TableCell>
                        </TableRow>
                    ))}
                    
                </TableBody>
            </Table>
            <Dialog
                open={linkConfirmOpen}
                onClose={onCloseLinkConfirm}
            >
                <DialogTitle>
                {"What would you like to delete?"}
                </DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Would you like to delete all links at {selectedLink?.SiteId} or only chapter {selectedLink?.ChapterNumber} at {selectedLink?.SiteId}?
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={onCloseLinkConfirm}>Never mind...</Button>
                <Button onClick={() => { onDeleteSiteChapter(selectedLink?.SiteId, selectedLink?.ChapterNumber); onCloseLinkConfirm()}}>
                    Delete Chapter
                </Button>
                <Button onClick={() => { onDeleteAllChaptersForSite(selectedLink?.SiteId); onCloseLinkConfirm()}}>
                    Delete All Chapters
                </Button>
                </DialogActions>
            </Dialog>
            </>
    )
}