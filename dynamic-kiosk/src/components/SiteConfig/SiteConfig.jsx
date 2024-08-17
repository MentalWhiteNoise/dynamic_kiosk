import React, {useState, useEffect} from "react";
import { Select, MenuItem, FormControl, InputLabel, Paper, IconButton, Tooltip, TextField, Grid, Container } from "@mui/material";
import {Save, Cancel, Edit, ContentCopy} from '@mui/icons-material'
import SiteForm from "./SiteForm";
//import { Link } from "react-router-dom";
import ServerAddress from "../../services/api";

export default function SiteConfig(props){
    const [siteList, setSiteList] = useState(null);
    const [bookList, setBookList] = useState(null);
    const [filteredBookList, setFilteredBookList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [site, setSite] = useState(undefined);
    const [hasChanged, setHasChanged] = useState(false);
    const [editMode, setEditMode] = React.useState(false);

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
        setHasChanged(false)
        setSite(siteList.find(x => x.site === newSite));
        
        var filteredBooks = ((bookList ?? []).filter((x) => x.Sites.filter((y) => (y.Url ?? "").toLowerCase().startsWith((newSite??"xxx").toLowerCase()) ).length > 0))
        //console.log(filteredBooks)
        setFilteredBookList(filteredBooks)
    }
    const handleSiteUpdate = (newSite) =>
    {
        setHasChanged(true)
        setSite(newSite)
    }
    const handleCancel = () =>{
        setEditMode(false)
    }

    if (loading) return "Loading...";
    if (error) return "Error...";
    //console.log(site)
    return (<Paper>
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
        {hasChanged ? <Tooltip title="Save Changes" disabled={!hasChanged}><IconButton disabled={!hasChanged}><Save/></IconButton></Tooltip> : <IconButton disabled={!hasChanged}><Save/></IconButton>}
        {hasChanged ? <Tooltip title="Cancel"><IconButton disabled={!hasChanged} onClick={() => handleCancel()}><Cancel/></IconButton></Tooltip> : <IconButton disabled={!hasChanged}><Cancel/></IconButton>}
        {site == null ? <IconButton disabled={site == null} onClick={() => setEditMode(true)}><Edit/></IconButton> : <Tooltip title="Edit Url"><IconButton disabled={site == null}><Edit/></IconButton></Tooltip>}
        {site == null ? <IconButton disabled={site == null}><ContentCopy/></IconButton> : <Tooltip title="Copy to New"><IconButton disabled={site == null}><ContentCopy/></IconButton></Tooltip>}
        </Container>
        </Grid>
        </Grid>
        <SiteForm
            site={site}
            hasChanged={hasChanged}
            onSiteUpdate={handleSiteUpdate}
            bookList={filteredBookList}
            editMode={editMode}
        />
        </Paper>)
}