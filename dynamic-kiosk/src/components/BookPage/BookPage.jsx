
import { Add, Cancel, ContentCopy, Delete, Edit, PushPin, Save, Update } from "@mui/icons-material";
import { CircularProgress, Stack, Table, TableBody, TableCell, TableRow, TextField, Paper, InputLabel, Autocomplete, IconButton, Container, Tooltip, Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import SiteStatus from "../SiteStatus";
import ChapterList from "./ChapterList"

export default function BookPage(props){
    let { bookId } = useParams();
    const [book, setBook] = useState(null);
    const [bookLoading, setBookLoading] = useState(true);
    const [bookError, setBookError] = useState(null);
    const [chapterData, setChapterData] = useState(null);
    const [chaptersLoading, setChaptersLoading] = useState(true);
    const [chaptersError, setChaptersError] = useState(null);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [folderList, setFolderList] = useState([]);
    useEffect(() => {loadBook()}, [bookId])
    useEffect(() => {
        fetch('http://localhost:3000/folders')
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setFolderList(data)
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
            })

    }, [])
    const [checkingTriggered, setCheckingTriggered] = useState(false);
    const handlePropertyChange = (newValue, property) =>{
        book[property] = newValue;
        setBook({...book})
        setUnsavedChanges(true)
    }
    const loadBook = () =>{
        fetch(`http://localhost:3000/book/${bookId}`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setBook(data)
                setCheckingTriggered(data.Status === "checking")
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
                setBookError(error);
            })
            .finally(() => {
                setBookLoading(false);
            })
        fetch(`http://localhost:3000/book/${bookId}/chapters`)
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
        setUnsavedChanges(false);
    }
    const saveChanges = () => {
        
    }
    const cancelChanges = () => {
        loadBook();
    }
    const removeAltTitle = (index) => {
        let altTitles = [...book.AltTitles]
        altTitles.splice(index, 1);
        handlePropertyChange(altTitles, "AltTitles")
    }
    const handleFlagRead = (chapterNumber) => {
        fetch(`http://localhost:3000/book/${bookId}/chapter/${chapterNumber}/flagRead`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(checkResponse => {
                loadBook(bookId)
            })
    }
    const handleFlagUnread = (chapterNumber) => {
        fetch(`http://localhost:3000/book/${bookId}/chapter/${chapterNumber}/flagUnread`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(checkResponse => {
                loadBook(bookId)
            })
    }
    const handleCheckForUpdate = (bookId, siteId) =>{
        setCheckingTriggered(true);
        fetch(`http://localhost:3000/book/${bookId}/site/${siteId}/checkForUpdates?headless=false`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(response =>{
                if (response.ok){
                    return;
                }
                throw response
            })
            .then(() => {
                loadBook(bookId)
            })
            .catch((e) => {
                console.log("ERROR: " + e.toString())
                loadBook(bookId)
            })
            .finally(() => {
                setCheckingTriggered(false);
            })
    }

    
    if (bookLoading) 
        return <CircularProgress/>
    if (bookError)
        return <>Error encountered loading book data: {bookError}</>
    return (<>
        {bookLoading || book == null? <>loading</> : bookError ? <>error encountered loading data for this book: {bookError}</> : (
            <>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell rowSpan={3}>
                            <img
                            src={book.Sites[0].Image}
                            alt={book.Title}
                            loading="lazy"
                            style={{
                                maxWidth: "275px",
                                maxHeight: "275px",
                                width: "auto",
                                height: "auto"
                            }}/>
                            <Tooltip title={unsavedChanges ? "Save Changes" : ""}>
                                <Button disabled={!unsavedChanges} onClick={() => saveChanges()}>
                                    <Save/>Save
                                </Button>
                            </Tooltip>
                            <Tooltip title={unsavedChanges ? "Revert Changes" : ""}>
                                <Button disabled={!unsavedChanges} onClick={() => cancelChanges()}>
                                    <Cancel/>Cancel
                                </Button>
                            </Tooltip>
                        </TableCell>
                        <TableCell width="100%">
                            <TextField fullWidth 
                                label="Title" 
                                value={book.Title} 
                                onChange={(e) => handlePropertyChange(e.target.value, "Title")}
                                />
                        </TableCell>
                        <TableCell>
                            <Autocomplete
                                freeSolo
                                value={book.Folder}
                                options={folderList}
                                sx={{ width: 300 }}
                                onChange={(e, v) => {
                                    handlePropertyChange(v, "Folder")
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Folder"/>
                                )}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <InputLabel>Alt Titles:</InputLabel>
                            <Paper>
                            <Stack direction="row">
                                {book.AltTitles.map((alt, i) => (<Container key={i}>   
                                    <Tooltip title={alt === book.Title ? "" : "Copy to Title"}>
                                        <IconButton disabled={alt === book.Title} onClick={() => handlePropertyChange(alt, "Title")}>
                                            <ContentCopy/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete alternate title">
                                        <IconButton onClick={() => removeAltTitle(i)}>
                                            <Delete/>
                                        </IconButton>
                                    </Tooltip>
                                    {alt}
                                    </Container>))}
                            </Stack>
                            </Paper>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <InputLabel>Sites: </InputLabel>
                            <Paper>
                                {book.Sites.map((site, i) => (
                                <Paper key={i}>
                                <Box  sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                                    <Box sx={{ width: "100px", height: "auto" }}>
                                        <img
                                        src={site.Image}
                                        alt={site.SiteId}
                                        loading="lazy"
                                        style={{
                                            maxWidth: "100px",
                                            width: "auto",
                                            height: "auto"
                                        }}/>
                                        <Box sx={{ display: 'inline-flex'}}>
                                        <Tooltip title={book.Image === site.Image ? "" : "Use as book image"}>
                                        <IconButton disabled={book.Image === site.Image} sx={{ left:"-40px", top: "-10px", color: "white" }}>
                                            <PushPin/>
                                        </IconButton>
                                        </Tooltip>
                                        </Box>
                                    </Box>
                                    <Container sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                                            <Box style={{display: 'table'}}>
                                            <IconButton>
                                                <Delete/>
                                            </IconButton>
                                            </Box>
                                            <Box style={{display: 'table'}}>
                                                <Typography variant="h5" sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
                                                    {site.SiteId}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                                            <IconButton>
                                                <Edit/>
                                            </IconButton>
                                            <Box style={{display: 'table'}}>
                                                <Typography variant="subtitle1" sx={{ display: 'table-cell', verticalAlign: 'middle', color: "rgba(0, 0, 0, 0.6)" }} >
                                                    {site.Url}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Container sx={{ display: 'table', height: '100%' }}>
                                            <Typography variant="subtitle2" sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
                                                <b>Chapter Count:</b> {site.CountRead + site.CountUnread} ( {site.CountUnread} unread )
                                            </Typography>
                                        </Container>
                                    </Container>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
                                        <Container>
                                        <Typography variant="caption">
                                            <b>Last Attempted:</b> {new Date(site.LastAttempted).toLocaleDateString()}<br/>
                                            <b>Last Successful:</b> {new Date(site.LastSuccessful).toLocaleDateString()}
                                        </Typography>
                                        </Container>
                                        <Box style={{ display: 'table', height: '100%' }}>
                                        <Container sx={{display: 'table-cell', flexDirection: 'row', verticalAlign: 'middle', textAlign: 'center'}}>
                                                <Tooltip title="Check for updates">
                                                <IconButton onClick={(e) => handleCheckForUpdate(book.Id, site.SiteId)} >
                                                    <Update/> {/* Check for updates */}
                                                </IconButton>
                                                </Tooltip>
                                            <SiteStatus 
                                                status={site.Status}
                                                checkingTriggered={checkingTriggered}/>
                                        </Container>
                                        </Box>
                                    </Box>
                                </Box>
                                </Paper>
                                ))}

                            <IconButton>
                                <Add/>
                            </IconButton>
                            </Paper>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <ChapterList 
                                book={book} 
                                reloadBook={loadBook}
                                onFlagRead={handleFlagRead}
                                onFlagUnread={handleFlagUnread}
                                />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </>
        )}
        </>)
}