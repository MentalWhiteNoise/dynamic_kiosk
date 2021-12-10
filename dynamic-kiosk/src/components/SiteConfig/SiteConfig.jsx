import React, {useState, useEffect} from "react";
import { Select, MenuItem, FormControl, InputLabel, Paper, IconButton, Tooltip } from "@mui/material";
import {Save, Cancel, Edit, ContentCopy} from '@mui/icons-material'
import SiteForm from "./SiteForm";
//import { Link } from "react-router-dom";
import ServerAddress from "../../services/api";

export default function SiteConfig(props){
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [site, setSite] = useState(null);
    const [hasChanged, setHasChanged] = useState(false);

    useEffect(() => {
        fetch(`${ServerAddress}/siteconfig`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setData(data)
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            })
    }, [])
    const handleSiteChange = (newSite) => {
        setHasChanged(false)
        setSite(data.find(x => x.site === newSite));
    }
    const handleSiteUpdate = (newSite) =>
    {
        setHasChanged(true)
        setSite(newSite)
    }

    if (loading) return "Loading...";
    if (error) return "Error...";
    //console.log(site)
    return (<Paper>

        <h1>Edit Site Scraping Configuration</h1>
        <Paper>
        <FormControl>
        <InputLabel id="site-select-label">Site</InputLabel>
        <Select
            value={(site) ? site.site : ""}
            label="Site"
            labelId="site-select-label"
            sx={{minWidth: "100px"}}
            onChange={(event) => handleSiteChange(event.target.value)}>
            {data.map((x, i)=>(
                <MenuItem key={i} value={x.site} >{x.site}</MenuItem>
            ))}
        </Select>
        </FormControl>
        <Tooltip title="Save Changes"><IconButton disabled={!hasChanged}><Save/></IconButton></Tooltip>
        <Tooltip title="Cancel"><IconButton disabled={!hasChanged}><Cancel/></IconButton></Tooltip>
        <Tooltip title="Edit Url"><IconButton><Edit/></IconButton></Tooltip>
        <Tooltip title="Copy to New"><IconButton disabled={hasChanged}><ContentCopy/></IconButton></Tooltip>
        </Paper>
        <SiteForm
            site={site}
            hasChanged={hasChanged}
            onSiteUpdate={handleSiteUpdate}
        />
        </Paper>)
}