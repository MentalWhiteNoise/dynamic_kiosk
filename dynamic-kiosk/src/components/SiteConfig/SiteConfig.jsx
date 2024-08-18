import React, {useState, useEffect} from "react";
import { Select, MenuItem, FormControl, InputLabel, Paper, IconButton, Tooltip, Grid, Container, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tab, Tabs } from "@mui/material";
import {Save, Cancel, Edit, ContentCopy, NoteAdd} from '@mui/icons-material'
import SiteUrlDialog from "./SiteUrlDialog";
//import { Link } from "react-router-dom";
import BookList from "./BookList";
import PageLoad from "./PageLoad";
import ParseTitle from "./ParseTitle"
import ParseChapters from "./ParseChapters"
import ErrorMessage from "../ErrorMessage"
import ServerAddress from "../../services/api";

export default function SiteConfig(props){
    const [siteList, setSiteList] = useState(null);
    const [bookList, setBookList] = useState(null);
    const [filteredBookList, setFilteredBookList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [site, setSite] = useState(undefined);
    const [hasChanged, setHasChanged] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newSiteMode, setNewSiteMode] = useState(false);
    const [newUrlDialogOpen, setNewUrlDialogOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [exampleUrl, setExampleUrl] = useState(null);
    const [exampleContents, setExampleContents] = useState(null);
    const [copySite, setCopySite] = useState(false);
    

    useEffect(() => {
        fetch(`${ServerAddress}/siteconfig`)
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
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            })
        fetch(`${ServerAddress}/books/find?search=`)
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
                console.error("Error fetching book list: ", error)
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            })
    }, [])
    const handleSiteChange = (newSite) => {
        console.log("handleSiteChange")
        setHasChanged(false)
        setSite(siteList.find(x => x.site === newSite));
        
        var filteredBooks = ((bookList ?? []).filter((x) => x.Sites.filter((y) => (y.Url ?? "").toLowerCase().startsWith((newSite??"xxx").toLowerCase()) ).length > 0))
        //console.log(filteredBooks)
        setFilteredBookList(filteredBooks)
    }
    const handleSiteUpdate = (newSite) =>
    {
        console.log("handleSiteUpdate")
        setHasChanged(true)
        setSite(newSite)
    }
    const handleCancel = () =>{
        console.log("handleCancel")
        if (newSiteMode){
            var tempSiteList = siteList
            tempSiteList = tempSiteList.slice(0,-1)
            setNewSiteMode(false)
            setSiteList(tempSiteList)
        }
        setHasChanged(false)
        setExampleUrl("")
        setTabValue(0)
        setEditMode(false)
        setCopySite(false)
    }
    const handleSetEdit = () => {
        console.log("handleSetEdit")
        setEditMode(true)
    }
    const handleBookSave = () => {
        console.log("handleBookSave")
    }
    const handleBookCopy = () => {
        console.log("handleBookCopy")
        setCopySite(true)
        setNewUrlDialogOpen(true)
    }
    const handleNewBook = () => {
        console.log("handleNewBook")
        setNewUrlDialogOpen(true)
    }
    const handleCloseNewUrlDialog = () => {
        console.log("handleCloseUrlDialog")
        setNewUrlDialogOpen(false)
    }
    const checkSiteExists = (url) => {
        for (const existingUrl of siteList){
            if (url == existingUrl.site || url.startsWith(existingUrl.site) ||  existingUrl.site.startsWith(url)) {
                return true
            }
        }
        return false;
    }
    const handleSaveNewUrlDialog = (url, urlIsExample) => {
        console.log("handleSaveUrlDialog")
        if (urlIsExample){
            var splitUrl = url.split('/')
            var tempExampleUrl = url
            // two slashes, then site... 
            url = splitUrl.slice(0, 3).join("/") + '/'
            console.log(url)
            console.log(tempExampleUrl)
            if (checkSiteExists(url)) {
                setError("Site already exists!")
                return
            }
            setExampleUrl(tempExampleUrl)
            setTabValue(1)
        }
        if (checkSiteExists(url)) {
            setError("Site already exists!")
            return
        }
        
        var newSite = copySite ? structuredClone(site) : {
            "site": url,
            "title": [],
            "image": [],
            "chapterText": [],
            "splitChapterText": "",
            "forEachChapterText": {
                "HRef": [],
                "ChapterTitle": [],
                "dateUploaded": [],
                "ChapterNumber": []
            }
        }
        newSite.site = url
        var newSiteList = siteList
        newSiteList.push(newSite)
        setFilteredBookList([])
        setSiteList(newSiteList)
        setEditMode(true)
        setNewSiteMode(true)
        setNewUrlDialogOpen(false)
        setSite(newSite)
    }
    const handleTabChange = (event, newValue) => {
        console.log("handleTabChange")
        setTabValue(newValue);
    };
    const handleUpdateExampleUrl = (url) => {
        console.log("handleUpdateExampleUrl")
        setExampleUrl(url)
        setTabValue(1);
        setExampleContents(null)
    }
    const getExampleContents = (url) => {
        fetch(`${ServerAddress}/parse/getpagecontents`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    //PostLoad: 'yourValue',
                    //MultiPage: 'yourOtherValue',
                    Url: url
                })
            })
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setExampleContents(data)
            })
            .catch(error => {
                setError("Error loading page contents")
                console.error("Error loading page contents: ", error)
            })
            .finally(() => {
                setLoading(false);
            })
    }

    if (loading) return "Loading...";
    //if (error) return "Error...";
    //console.log(site)
    return (<Paper>
        <ErrorMessage errorMessage={error} onClearErrorMessage={() => setError(null)}/>
        <SiteUrlDialog onSiteSave={handleSaveNewUrlDialog} dialogOpen={newUrlDialogOpen} onCancel= {handleCloseNewUrlDialog} />
        <Grid container sx={{}}>
        <Grid item sx={{ whiteSpace: 'nowrap', m: 2 }}><h1>Edit Site Scraping Configuration</h1>
        </Grid>
        <Grid item sx={{ whiteSpace: 'nowrap', m: 2}} display="flex">

        <Container sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <FormControl>
        <InputLabel id="site-select-label">Site</InputLabel>
        <Select
            value={(site) ? site.site : ""}
            label="Site"
            labelId="site-select-label"
            sx={{minWidth: "200px", }}
            onChange={(event) => handleSiteChange(event.target.value)}>
            {siteList.map((x, i)=>(
                <MenuItem key={i} value={x.site} >{x.site}</MenuItem>
            ))}
        </Select>
        </FormControl>
        </Container>
        <Container sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {hasChanged ? <Tooltip title="Save Changes"><IconButton onClick={() => handleBookSave()}><Save/></IconButton></Tooltip> : <IconButton disabled={true}><Save/></IconButton>}
        {editMode ? <Tooltip title="Cancel"><IconButton onClick={() => handleCancel()}><Cancel/></IconButton></Tooltip> : <IconButton disabled={true}><Cancel/></IconButton>}
        {editMode == false && site != null ? <Tooltip title="Edit Site Settings"><IconButton onClick={() => handleSetEdit()} ><Edit/></IconButton></Tooltip> : <IconButton disabled={true}><Edit/></IconButton>}
        {editMode == false && site != null ? <Tooltip title="Copy to New"><IconButton onClick={() => handleBookCopy()}><ContentCopy/></IconButton></Tooltip> : <IconButton disabled={true}><ContentCopy/></IconButton>}
        {editMode == false ? <Tooltip title="Create New Site"><IconButton onClick={() => handleNewBook()}><NoteAdd/></IconButton></Tooltip> : <IconButton disabled={true}><NoteAdd/></IconButton>}
        </Container>
        </Grid>
        </Grid>
        { site != null ? (<>
        <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons={false}
            aria-label="scrollable prevent tabs example"
        >
            <Tab label="Book List" />
            <Tab label="Page Load" disabled={editMode == false} />
            <Tab label="Title & Image" disabled={editMode == false} />
            <Tab label="Chapters" disabled={editMode == false} />
        </Tabs>
        <Paper hidden={tabValue!=0}>
            <BookList bookList={filteredBookList} site={site} editMode={editMode} onSelectExampleUrl={handleUpdateExampleUrl} />
        </Paper>
        <Paper hidden={tabValue!=1}>
            <PageLoad site={site} onSiteUpdate={handleSiteUpdate} exampleUrl={exampleUrl} onExampleUrlUpdate={handleUpdateExampleUrl} exampleContents={exampleContents} onLoadExampleContents={getExampleContents} onError={(err) => setError(err)} />
        </Paper>
        <Paper hidden={tabValue!=2}>
            <ParseTitle site={site} onSiteUpdate={handleSiteUpdate} exampleContents={exampleContents} onError={(err) => setError(err)} />
        </Paper>
        <Paper hidden={tabValue!=3}>
            <ParseChapters site={site} onSiteUpdate={handleSiteUpdate} exampleContents={exampleContents} onError={(err) => setError(err)} />
        </Paper></>) : <></> }
        </Paper>)
}