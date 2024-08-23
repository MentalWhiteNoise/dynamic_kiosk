import React, {useEffect, useState, useCallback} from "react";
import { Link, useParams } from "react-router-dom";
import { Add, Cancel, ContentCopy, Delete, Web, PushPin, Save, Update, DriveFolderUpload } from "@mui/icons-material";
import { CircularProgress, Stack, Table, TableBody, TableCell, TableRow, TextField, Paper, InputLabel, Autocomplete, IconButton, Container, Tooltip, Button, Typography, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, Icon  } from "@mui/material";
import { Box } from "@mui/system";
import { Report, ReportOff, FileDownload, FileDownloadOff, RadioButtonChecked, RadioButtonUnchecked } from '@mui/icons-material'
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import SiteStatus from "../SiteStatus";
import ChapterList from "./ChapterList"
import ServerAddress from "../../services/api";
import AddSiteDialog from './AddSiteDialog'
import ConfirmationDialog from "../ConfirmationDialog";
import { openInNewTab } from "../../helpers/sharedFunctions";
import Processing from "../Processing";

// Fix book image, so it doesn't overflow (or eliminate it in lieu of site images, since that is current control anyways)
// Add Last Posted
// Add / Allow Non-automated book sites... 
// Manually update current chapter, open chapters, last read(?), last updated(?)

function FavoritButton(props) {
    const {book, onFavoriteToggle } = props
    if (book == null){
        return <></>
    }
    if (book.Shelved) {
        return <IconButton disabled={true}><StarOutlineIcon/></IconButton>
    }
    if (book.Favorited) {
        return <Tooltip title="Favorited! Click to unfavorite..."><IconButton onClick={() => onFavoriteToggle(false)}><StarIcon/></IconButton></Tooltip>
    }
    return <Tooltip title="Click to Favorite book"><IconButton onClick={() => onFavoriteToggle(true)}><StarOutlineIcon/></IconButton></Tooltip>
}
function ShelveButton(props) {
    const {book, onShelveBook } = props
    if (book == null || book.completed){
        return <></>
    }
    if (book.shelved) {
        return <Tooltip title="Shelved! Click to take off the shelf..."><IconButton onClick={() => onShelveBook(false)}><BookmarkBorderIcon/></IconButton></Tooltip>
    }
    return <Tooltip title="Click to shelve the book (not interested right now)"><IconButton onClick={() => onShelveBook(true)}><BookmarkRemoveIcon/></IconButton></Tooltip>
}
function CompletedButton(props){
    const {book, onCompleteBook } = props
    if (book == null || book.shelved){
        return <></>
    }
    if (book.completed) {
        return <Tooltip title="Completed! Click to cancel completion..."><IconButton onClick={() => onCompleteBook(false)}><BookmarkAddedIcon/></IconButton></Tooltip>
    }
    return <Tooltip title="Click to flag completed!"><IconButton onClick={() => onCompleteBook(true)}><BookmarkAddIcon/></IconButton></Tooltip>
}
function ExpectedFrequencySelect(props) {
    const {book, onSelectFrequncy } = props
    if (book == null) {
        return <></>
    }
    return (<FormControl>
        <FormLabel>Expected Frequency</FormLabel>
        <RadioGroup value={book.Frequency ?? ""} onChange={(event) => {onSelectFrequncy(event.target.value)}} row>
            <FormControlLabel value="" control={<Radio />} label="Unknown" />
            <FormControlLabel value="Weekly" control={<Radio />} label="Weekly" />
            <FormControlLabel value="Monthly" control={<Radio />} label="Monthly" />
            <FormControlLabel value="Infrequent" control={<Radio />} label="Infrequent" />
            <FormControlLabel value="No longer updating" control={<Radio />} label="No longer updating" />
        </RadioGroup>
        </FormControl>)
}
function SetBrokenButton(props){
    const { site, onSetBroken} = props;
    if (site == null){
        return <IconButton disabled={true}><Report/></IconButton>
    }
    if (site.Broken) {
        return <Tooltip title="Revert Broken"><IconButton onClick={() => onSetBroken(false)}><ReportOff/></IconButton></Tooltip>
    }
    return <Tooltip title="Flag Broken"><IconButton onClick={() => onSetBroken(true)}><Report/></IconButton></Tooltip>
}
function SetPrimaryButton(props){
    const { site, onSetPrimary} = props;
    if (site == null){
        return <IconButton disabled={true}><RadioButtonUnchecked/></IconButton>
    }
    if (site.Primary) {
        return <Tooltip title="Currently default"><IconButton disableRipple disableFocusRipple><RadioButtonChecked/></IconButton></Tooltip>
    }
    return <Tooltip title="Set as default site"><IconButton onClick={() => onSetPrimary(true)}><RadioButtonUnchecked/></IconButton></Tooltip>
}
function SetManualButton(props){
    const { site, onSetManual} = props;
    if (site == null){
        return <IconButton disabled={true}><FileDownloadOff/></IconButton>
    }
    if (site.Broken) {
        return <Tooltip title="Currently Manual. Flagged as broken - cannot auto-ingest."><IconButton disableRipple disableFocusRipple><FileDownloadOff/></IconButton></Tooltip>
    }
    if (site.Manual) {
        return <Tooltip title="Currently Manual. Click to enable auto-ingest."><IconButton onClick={() => onSetManual(false)}><FileDownloadOff/></IconButton></Tooltip>
    }
    return <Tooltip title="Auto-ingest enabled. Click to set to manual."><IconButton onClick={() => onSetManual(true)}><FileDownload/></IconButton></Tooltip>
}
export default function BookPage(props){
    let { bookId } = useParams();
    const [book, setBook] = useState(null);
    const [bookLoading, setBookLoading] = useState(true);
    const [bookError, setBookError] = useState(null);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [folderList, setFolderList] = useState([]);
    const [addSiteOpen, setAddSiteOpen] = React.useState(false);
    const [confirmDelete, setConfirmDelete] = React.useState(false);
    const [clickedSite, setClickedSite] = React.useState(null);
    const [activity, setActivity] = React.useState("idle");
    console.log(book)
    const loadBook = useCallback(() =>{
        fetch(`${ServerAddress}/book/${bookId}`)
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
        setUnsavedChanges(false);
    }, [bookId])

    useEffect(() => {loadBook()}, [loadBook, bookId])
    useEffect(() => {
        fetch(`${ServerAddress}/folders`)
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
    const saveChanges = () => {
        console.log(book)
        fetch(`${ServerAddress}/book/${book.Id}`, {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) })
            .then(() => {
                loadBook(book.Id)
            })
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
        fetch(`${ServerAddress}/book/${bookId}/chapter/${chapterNumber}/flagRead`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(checkResponse => {
                loadBook(bookId)
            })
    }
    const handleFlagUnread = (chapterNumber) => {
        fetch(`${ServerAddress}/book/${bookId}/chapter/${chapterNumber}/flagUnread`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(checkResponse => {
                loadBook(bookId)
            })
    }
    const handleCheckForUpdate = (bookId, siteId) =>{
        setCheckingTriggered(true);
        fetch(`${ServerAddress}/book/${bookId}/site/${siteId}/checkForUpdates?headless=false`, {method: 'POST', headers: { 'Content-Type': 'application/json' } })
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
    const handleDeleteSite = () => {
        setActivity("Deleting Site");
        setConfirmDelete(false);
        //console.log("Delete site", clickedSite)
        fetch(`${ServerAddress}/book/${bookId}/site/${clickedSite}`, {method: 'DELETE'})
            .then(response =>{
                if (response.ok){
                    return
                }
                throw response
            })
            .then(() => {
                loadBook();
                setActivity("idle");
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => {
                setActivity("idle")
            })
    }
    const handleFavoriteToggle = (enable) => {
        handlePropertyChange(enable, "Favorited")
    }
    const handleShelveBook = (enable) => {
        handlePropertyChange(enable, "Shelved")
        handlePropertyChange(false, "Favorited")
    }
    const handleCompleteBook = (enable) => {
        handlePropertyChange(enable, "Completed")
    }
    const handleSelectFrequncy = (frequency) => {
        handlePropertyChange(frequency, "Frequency")
    }
    const handleSetSiteBroken = (broken, siteId) => {
        console.log("handleSetSiteBroken")
        var newSiteList = structuredClone(book.Sites)
        for (var site of newSiteList){
            if (site.SiteId == siteId){
                site.Broken = broken
            }
        }
        handlePropertyChange(newSiteList, "Sites")
    }
    const handleSetSitePrimary = (primary, siteId) => {
        console.log("handleSetSitePrimary")
        var newSiteList = structuredClone(book.Sites)
        for (var site of newSiteList){
            if (site.SiteId == siteId){
                site.Primary = primary
            }
            else {
                site.Primary = false
            }
        }
        handlePropertyChange(newSiteList, "Sites")
    }
    const handleSetSiteManual = (manual, siteId) => {
        console.log("handleSetSiteManual")
        console.log(manual)
        var newSiteList = structuredClone(book.Sites)
        for (var site of newSiteList){
            if (site.SiteId == siteId){
                site.Manual = manual
            }
        }
        handlePropertyChange(newSiteList, "Sites")
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
                        <TableCell rowSpan={4} sx={{whiteSpace: "nowrap"}}>
                            <img
                            src={book.Sites[0].Image}
                            alt={book.Title}
                            loading="lazy"
                            style={{
                                maxWidth: "275px",
                                maxHeight: "275px",
                                width: "auto",
                                height: "auto"
                            }}/><br/>
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
                        <TableCell sx={{whiteSpace: "nowrap"}}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                                <Box>
                                    <Tooltip title={`Go to ${book.Folder}`}>
                                    <IconButton component={Link} to={`/folder/${book.Folder}`}>
                                        <DriveFolderUpload/>
                                    </IconButton>
                                    </Tooltip>
                                </Box>
                                <Autocomplete
                                    freeSolo
                                    value={book.Folder}
                                    options={folderList.map(f => f.Folder)}
                                    sx={{ width: 300 }}
                                    onChange={(e, v) => handlePropertyChange(v, "Folder")}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Folder"
                                            onChange={(e) => handlePropertyChange(e.target.value, "Folder")}/>
                                    )}
                                />
                            </Box>
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
                        <TableCell>
                            <ExpectedFrequencySelect book={book} onSelectFrequncy={handleSelectFrequncy} />
                        </TableCell>
                        <TableCell>
                            <FavoritButton book={book} onFavoriteToggle={handleFavoriteToggle} />
                            <ShelveButton book={book} onShelveBook={handleShelveBook} />
                            <CompletedButton book={book} onCompleteBook={handleCompleteBook} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <InputLabel>Sites: </InputLabel>
                            <Paper>
                                {book.Sites.map((site, i) => (
                                <Paper key={i}>

                                { /* site.Broken, site.Manual, site.Primary */ }
                                <Box  sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap', height: '40px'  }}>
                                    <SetPrimaryButton site={site} onSetPrimary={() => {handleSetSitePrimary(true, site.SiteId)}} />
                                    </Box>
                                    <Box sx={{ width: "100px", height: "auto", minWidth: "100px", overflow: "hidden"}}>
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
                                            <Tooltip title={book.Sites.length === 1 ? "" : "Delete site and all chapters"}>
                                            <IconButton disabled={book.Sites.length === 1} onClick={() => {setConfirmDelete(true); setClickedSite(site.SiteId)}}>
                                                <Delete/>
                                            </IconButton>
                                            </Tooltip>
                                            </Box>
                                            <Box style={{display: 'table'}}>
                                                <Typography variant="h5" sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
                                                    {site.SiteId}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                                            <Tooltip title= {`Navigate to chapter list: ${site.Url}`}>
                                            <IconButton onClick={() => openInNewTab(site.Url)}>
                                                <Web/>
                                            </IconButton>
                                            </Tooltip>
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
                                    <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap', height: '40px'  }}>
                                    <SetBrokenButton site={site} onSetBroken={(broken) => {handleSetSiteBroken(broken, site.SiteId)}} />
                                    <SetManualButton site={site} onSetManual={(manual) => {handleSetSiteManual(manual, site.SiteId)}} />
                                    </Box>
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

                            <Tooltip title="Add new site for reading book">
                            <IconButton onClick={() => {setAddSiteOpen(true)}}>
                                <Add/>
                            </IconButton>
                            </Tooltip>
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
            <AddSiteDialog
                open={addSiteOpen}
                onSiteAdded={loadBook}
                bookId={book.Id}
                onClose={() => {setAddSiteOpen(false)}}
            />
            <ConfirmationDialog
                open={confirmDelete}
                onConfirm={() => handleDeleteSite()}
                onCancel={() => setConfirmDelete(false)}
                title="Delete site and all chapters?"
                message={"This site, any chapters from this site, and any read history from chapters only from this site will be delete. Are you sure you want to continue?"}
            />
            <Processing 
                open={activity !== "idle"}
            />
            </>
        )}
        </>)
}