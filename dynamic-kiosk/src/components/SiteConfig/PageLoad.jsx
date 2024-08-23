import React, {useState} from "react";
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControlLabel, Checkbox, IconButton } from "@mui/material";
import {Refresh } from '@mui/icons-material'
import NavigationSection from "./NavigationSection";
import ParsingSection from "./ParsingSection";
import ServerAddress from "../../services/api";

export default function PageLoad(props) {
    const {site, onSiteUpdate, exampleUrl, onExampleUrlUpdate, exampleContents, onLoadExampleContents, onError} = props;
    const [contentsOpen, setContentsOpen] = React.useState(false);
    const [exampleNextPageUrl, setExampleNextPageUrl] = useState(null);
    if (site == null) return <></>
    //console.log(site)
    const handleParsingMethodChange = (array, index, value) =>
    {
        array[index].method = value;
        onSiteUpdate({...site})
    }
    const handleParsingStringChange = (array, index, value) =>
    {
        array[index].string = value;
        onSiteUpdate({...site})
    }
    const handleParsingMethodRemove = (array, index) =>
    {
        array.splice(index, 1);
        onSiteUpdate({...site})
        
    }
    const handleParsingMethodAdd = (array) =>
    {
        array.push({method: "readPast", string: ""})
        onSiteUpdate({...site})
    }
    const handleReorder = (array, source, destination) => {
        const [removed] = array.splice(source, 1);
        array.splice(destination, 0, removed);
        onSiteUpdate({...site})
    };
    const openInNewTab = (url) => {
      window.open(url, "_blank", "noreferrer");
    };
    const handleOpenContents = () => {
        setContentsOpen(true)
    }
    const handleCloseContents = () => {
        setContentsOpen(false)
    }
    const parseContent = (parsingArray, setMethod) => {
      if (parsingArray == null || parsingArray.length == 0 || exampleContents == null)
      {return}
        fetch(`${ServerAddress}/parse/parsetext`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ParseConfig: parsingArray,
                  Contents: exampleContents,
                })
            })
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setMethod(data)
            })
            .catch(error => {
                onError("Error parsing content")
                console.error("Error loading page contents: ", error)
            })
            /*.finally(() => {
                setLoading(false);
            })*/
    }
    // OpenInBrowser
    // SystemUpdateAlt, Archive, ArrowCircleDown
    const multiPageEnabled = site.multiPage != null && site.multiPage.nextPageUrl != null

    return (
        <>
            <TextField id="example-url" sx={{minWidth:"500px"}} size="small" label="Example Url" value={exampleUrl ?? ""} onChange={(event) => onExampleUrlUpdate(event.target.value)} variant="outlined" />
            &nbsp;<Button variant="contained" size="small" disabled={exampleUrl == undefined} onClick={() => openInNewTab(exampleUrl)} >Goto URL</Button>
            &nbsp;<Button variant="contained" size="small" disabled={exampleUrl == undefined} onClick={() => onLoadExampleContents(exampleUrl)} >Load Contents</Button>
            &nbsp;<Button variant="contained" size="small" disabled={exampleContents == undefined} onClick={handleOpenContents} >Show Contents</Button>

            <Dialog
                fullWidth={true}
                maxWidth="xl"
                onClose={handleCloseContents} open={contentsOpen}>
                <DialogTitle>Page Contents</DialogTitle>
                
                <DialogContent>{exampleContents}</DialogContent>
                <DialogActions>
                <Button onClick={handleCloseContents}>Close</Button>
                </DialogActions>
            </Dialog>
            <NavigationSection 
                label="Post Load"
                optional={true}
                navigationArray={site.postLoad}
                onMethodChange={(index, newMethod) => {
                    site.postLoad[index].method = newMethod;
                    onSiteUpdate({...site});
                }}
                onPropertyChange={(index, property, newValue) =>{
                    site.postLoad[index].properties[property] = newValue;
                    onSiteUpdate({...site});
                }}
                onRemove={(index) => {
                    site.postLoad.splice(index, 1);
                    onSiteUpdate({...site});
                }}
                onAdd = {() => {
                    site.postLoad.push({method: "wait", properties: {timeout: 1000}})
                    onSiteUpdate({...site});
                }}
                onToggle={(checked) => {
                    site.postLoad = (checked) ? [{method: "wait", properties: {timeout: 1000}}] : null;
                    onSiteUpdate({...site});
                }}
                onReorder={handleReorder}
                onExpandChange={() => {}}
                expanded={true}
            />
            <Grid container width="100%">
            <Grid minWidth="580px">
                <FormControlLabel control={(<Checkbox checked={multiPageEnabled} 
                    onChange={(event) => {
                        if (event.target.checked)
                        {
                            if (!site.multiPage)
                            {site.multiPage = {"nextPageUrl": []}}

                            site.multiPage.nextPageUrl.push({method: "readPast", string: ""})

                        }
                        site.multiPage.nextPageUrl = (event.target.checked) ? {"nextPageUrl": [{method: "readPast", string: ""}]} : null;
                        onSiteUpdate({...site});
                    }
                } />)} label="Multi-Page: Next URL" />
                { (multiPageEnabled) ?
                <ParsingSection 
                    parsingArray={(site.multiPage || {nextPageUrl: null}).nextPageUrl}
                    onMethodChange={handleParsingMethodChange}
                    onStringChange={handleParsingStringChange}
                    onRemove={handleParsingMethodRemove}
                    onAdd={
                        (array) => {
                            if (!site.multiPage)
                            {site.multiPage = {"nextPageUrl": []}}

                            site.multiPage.nextPageUrl.push({method: "readPast", string: ""})
                            onSiteUpdate({...site})

                        }}
                    onReorder={handleReorder}
                /> : <></> }
                </Grid>
                <Grid>
    
                { (multiPageEnabled) ? <>
                Example next page:<br/>
                <TextField
                    multiline
                    rows={4}
                    defaultValue={exampleNextPageUrl}
                    sx={{minWidth: "550px", width:"100%"}}
                    inputProps={{ readOnly: true, }}
                    />
                    
                <IconButton onClick={() => parseContent((site.multiPage || {nextPageUrl: null}).nextPageUrl, setExampleNextPageUrl)}><Refresh/></IconButton>
    
                </> : <></> }
                </Grid>
                </Grid>
    </>)    
}