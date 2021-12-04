import React, {useState, useEffect} from "react";
import { Select, MenuItem, FormControl, InputLabel, Paper } from "@mui/material";
import SiteForm from "./SiteForm";
//import { Link } from "react-router-dom";

export default function SiteConfig(props){
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [site, setSite] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3000/siteconfig')
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
        setSite(data.find(x => x.site === newSite));
    }
    const handleParsingMethodChange = (array, index, value) =>
    {
        array[index].method = value;
        let newSite = {...site};
        setSite(newSite)
    }
    const handleParsingStringChange = (array, index, value) =>
    {
        array[index].string = value;
        let newSite = {...site};
        setSite(newSite)
    }
    const handleParsingMethodRemove = (array, index) =>
    {
        array.splice(index, 1);
        let newSite = {...site};
        setSite(newSite)
        
    }
    const handleParsiongMethodAdd = (array) =>
    {
        array.push({method: "readPast", string: ""})
        let newSite = {...site};
        setSite(newSite)
    }
    const handleSiteUpdate = (newSite) =>
    {
        setSite(newSite)
    }

    if (loading) return "Loading...";
    if (error) return "Error...";
    //console.log(site)
    return (<Paper>
        <h1>Edit Site Scraping Configuration</h1>
        Add buttons for rename, copy, save, (and cancel?)<br/>
        Check out sticky subheader in lists for tracking which section I'm in, the Collapse section or even accordions for editing the pieces, <br/>
        Possibly consider the data grid object, or opening dialogs for editing sections... event tabs<br/>
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
        <SiteForm
            site={site}
            onParsingMethodChange={handleParsingMethodChange}
            onParsingStringChange={handleParsingStringChange}
            onParsingMethodRemove={handleParsingMethodRemove}
            onParsiongMethodAdd={handleParsiongMethodAdd}
            onSiteUpdate={handleSiteUpdate}
        />
        </FormControl>
        </Paper>)
}