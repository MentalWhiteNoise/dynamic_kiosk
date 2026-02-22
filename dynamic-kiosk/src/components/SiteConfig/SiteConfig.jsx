import React, {useState, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Select, MenuItem, FormControl, InputLabel, Paper, IconButton, Tooltip, Grid, Container, Tab, Tabs } from "@mui/material";
import {Save, Cancel, Edit, ContentCopy, NoteAdd, Report, ReportOff } from '@mui/icons-material'
import SiteUrlDialog from "./SiteUrlDialog";
//import { Link } from "react-router-dom";
import BookList from "./BookList";
import PageLoad from "./PageLoad";
import ParseTitle from "./ParseTitle"
import ParseChapters from "./ParseChapters"
import ErrorMessage from "../ErrorMessage"
import ServerAddress from "../../services/api";

function SetBrokenButton(props){
    const { site, onSetBroken} = props;
    if (site == null){
        return <IconButton disabled={true}><Report/></IconButton>
    }
    if (site.broken) {
        return <Tooltip title="Revert Broken"><IconButton onClick={() => onSetBroken(false)}><ReportOff/></IconButton></Tooltip>
    }
    return <Tooltip title="Flag Broken"><IconButton onClick={() => onSetBroken(true)}><Report/></IconButton></Tooltip>
}
function SaveChangesButton(props) {
    const { hasChanged, onSiteSave } = props
    if (hasChanged){
        return <Tooltip title="Save Changes"><IconButton onClick={() => onSiteSave()}><Save/></IconButton></Tooltip>
    }
    return <IconButton disabled={true}><Save/></IconButton>
}
function CancelButton(props) {
    const { editMode, onCancel } = props
    if (editMode) {
        return <Tooltip title="Cancel"><IconButton onClick={() => onCancel()}><Cancel/></IconButton></Tooltip>
    }
    return <IconButton disabled={true}><Cancel/></IconButton>
}
function SetEditModeButton(props)
{
    const {site, editMode, onSetEdit } = props
    if (editMode || site == null || site.broken){
        return <IconButton disabled={true}><Edit/></IconButton>
    }
    return <Tooltip title="Edit Site Settings"><IconButton onClick={() => onSetEdit()} ><Edit/></IconButton></Tooltip>
}
function CopyToNewButton(props){
    const { editMode, site, onCopyToNew } = props
    if (editMode || site == null){
        return <IconButton disabled={true}><ContentCopy/></IconButton>
    }
    return <Tooltip title="Copy to New"><IconButton onClick={() => onCopyToNew()}><ContentCopy/></IconButton></Tooltip>
}
function CreateNewSiteButton(props){
    const { editMode, onCreateNewSite } = props
    if (editMode){
        return <IconButton disabled={true}><NoteAdd/></IconButton>
    }
    return <Tooltip title="Create New Site"><IconButton onClick={() => onCreateNewSite()}><NoteAdd/></IconButton></Tooltip>
}

export default function SiteConfig(props){
    let { siteId } = useParams();
    const navigate = useNavigate();
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
    useEffect(() => {
        var selectedSite = null
        if (siteId && siteList)
        { 
            setHasChanged(false)
            var selectedSiteIndex = siteList.findIndex(obj => obj.site == siteId)
            if (selectedSiteIndex > -1)
            setSite(siteList[selectedSiteIndex]) 
            selectedSite = siteList[selectedSiteIndex]?.site ?? "xxx"
            var filteredBooks = ((bookList ?? []).filter((x) => x.Sites.filter((y) => (y.Url ?? "").toLowerCase().startsWith((siteList[selectedSiteIndex].site??"xxx").toLowerCase()) ).length > 0))
            setFilteredBookList(filteredBooks)
        }
    }, [siteList, bookList, siteId])
    const handleSiteChange = (newSite) => {
        console.log("handleSiteChange")
        console.log(newSite)
        navigate(`/config/${encodeURIComponent(newSite)}`)
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
    const handleSiteSave = () => {
        console.log("handleSiteSave")
        if (newSiteMode){
            addNewSite()
        }
        else {
            updateSite(site)
        }
        setEditMode(false)
        // Validate site
        // If is new, PUT /siteconfig (new endpoint)
        // If is edit, POST /siteconfig/:siteId (new endpoint)
    }
    const handleSiteCopy = () => {
        console.log("handleSiteCopy")
        setCopySite(true)
        setNewUrlDialogOpen(true)
    }
    const handleNewSite = () => {
        console.log("handleNewSite")
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
        setHasChanged(copySite)
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
        console.log(site)
        console.log(site.postLoad)
        fetch(`${ServerAddress}/parse/getpagecontents`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    PostLoad: site.postLoad ?? [],
                    MultiPage: site.MultiPage ?? [],
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
    const addNewSite = () => {
        // Validate site config here?
        fetch(`${ServerAddress}/siteconfig`, {method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ site: site }) })
            .then(response =>{
                if (response.ok){
                    return response;
                }
                else{
                    throw response;
                }
            })
            .then((data) => {
                //handleSiteChange(site)
                navigate(`/config`)
            })
            .catch((err) => {
                // correct way to retrieve text from failure
                setError("failed to add new site!");
                console.error("failed to add new site: ", error)
            })

    }
    const updateSite = (newSite) => {
        // Validate site config here?
        //console.log(JSON.stringify({ site: newSite }))
        fetch(`${ServerAddress}/siteconfig/${encodeURIComponent(newSite.site)}`, {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ site: newSite }) })
            .then(response =>{
                if (response.ok){
                    return response;
                }
                else{
                    throw response;
                }
            })
            .then((data) => {
                //handleSiteChange(site)
                navigate(`/config`)
            })
            .catch((error) => {
                // correct way to retrieve text from failure
                setError("failed to update site!");
                console.error("failed to update site: ", error)
            })

    }
    const handleSetBroken = (broken) => {
        console.log("handleSetBroken")
        var newSite = structuredClone(site)
        newSite.broken = broken
        updateSite(newSite)
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
            disabled={editMode}
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
        <SaveChangesButton hasChanged={hasChanged} onSiteSave={handleSiteSave} />
        <CancelButton editMode={editMode} onCancel={handleCancel} />
        <SetEditModeButton site={site} editMode={editMode} onSetEdit={handleSetEdit} />
        <CopyToNewButton editMode={editMode} site={site} onCopyToNew={handleSiteCopy} />
        <CreateNewSiteButton editMode={editMode} onCreateNewSite={handleNewSite} />
        <SetBrokenButton site={site} editMode={editMode} onSetBroken={handleSetBroken} />
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