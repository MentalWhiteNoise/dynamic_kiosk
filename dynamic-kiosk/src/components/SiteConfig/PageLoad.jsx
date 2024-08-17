import React, {} from "react";
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import NavigationSection from "./NavigationSection";
import ParsingSection from "./ParsingSection";

export default function PageLoad(props) {
    const {site, onSiteUpdate, exampleUrl, onExampleUrlUpdate, exampleContents, onLoadExampleContents} = props;

    const [contentsOpen, setContentsOpen] = React.useState(false);
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
    // OpenInBrowser
    // SystemUpdateAlt, Archive, ArrowCircleDown

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
            <ParsingSection
                label="Multi-Page: Next URL"
                optional={true}
                parsingArray={(site.multiPage || {nextPageUrl: null}).nextPageUrl}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd={handleParsingMethodAdd}
                onToggle={(checked) => {
                    site.multiPage = {nextPageUrl: (checked) ? [{method: "readPast", string: ""}] : null} 
                    onSiteUpdate({...site});
                }}
                onReorder={handleReorder}
                onExpandChange={() => {}}
                expanded={true}
            />
    </>)    
}