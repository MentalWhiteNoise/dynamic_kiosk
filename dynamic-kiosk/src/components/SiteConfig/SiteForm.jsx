import React, {} from "react";
import { FormControl, Paper, FormLabel, TextField } from "@mui/material";
import NavigationSection from "./NavigationSection";
import ParsingSection from "./ParsingSection";
//import { Link } from "react-router-dom";

export default function SiteForm(props) {
    const {site, onSiteUpdate} = props;
    if (site == null) return <></>
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
    const handleParsiongMethodAdd = (array) =>
    {
        array.push({method: "readPast", string: ""})
        onSiteUpdate({...site})
    }
    return (
        <>
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
        />
        <ParsingSection 
            label="Title"
            parsingArray={site.title}
            onMethodChange={handleParsingMethodChange}
            onStringChange={handleParsingStringChange}
            onRemove={handleParsingMethodRemove}
            onAdd={handleParsiongMethodAdd}
        />
        <ParsingSection
            label="Alternate Title"
            optional={true}
            parsingArray={site.altTitle}
            onMethodChange={handleParsingMethodChange}
            onStringChange={handleParsingStringChange}
            onRemove={handleParsingMethodRemove}
            onAdd={handleParsiongMethodAdd}
            onToggle={(checked) => {
                site.altTitle = (checked) ? [{method: "readPast", string: ""}] : null;                
                onSiteUpdate({...site});
            }}
        />
        <ParsingSection 
            label="Image"
            parsingArray={site.image}
            onMethodChange={handleParsingMethodChange}
            onStringChange={handleParsingStringChange}
            onRemove={handleParsingMethodRemove}
            onAdd = {handleParsiongMethodAdd}
        />
        <ParsingSection 
            label="Chapter Text"
            parsingArray={site.chapterText}
            onMethodChange={handleParsingMethodChange}
            onStringChange={handleParsingStringChange}
            onRemove={handleParsingMethodRemove}
            onAdd = {handleParsiongMethodAdd}
        />
        <FormControl>
        <TextField 
            size="small"
            value={site.splitChapterText}
            label="Split Chapter Text"
            sx={{minWidth: "100px"}}
            error={!site.splitChapterText}
            onChange={(event) => {
                site.splitChapterText = event.target.value 
                onSiteUpdate({...site})
            }}
            />
        </FormControl>
        <Paper>
            <FormLabel>For Each Chapter Text...</FormLabel>
            Custom Filter Logic... In vs Not In... 
            <ParsingSection 
                label="HRef"
                parsingArray={site.forEachChapterText.HRef}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd = {handleParsiongMethodAdd}
            />
            <ParsingSection 
                label="Chapter Title"
                parsingArray={site.forEachChapterText.ChapterTitle}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd = {handleParsiongMethodAdd}
            />
            <ParsingSection 
                label="Date Uploaded"
                parsingArray={site.forEachChapterText.dateUploaded}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd = {handleParsiongMethodAdd}
            />
            <ParsingSection 
                label="Chapter Number"
                parsingArray={site.forEachChapterText.ChapterNumber}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd = {handleParsiongMethodAdd}
            />
        </Paper>
        <ParsingSection
            label="Multi-Page: Next URL"
            optional={true}
            parsingArray={(site.multiPage || {nextPageUrl: null}).nextPageUrl}
            onMethodChange={handleParsingMethodChange}
            onStringChange={handleParsingStringChange}
            onRemove={handleParsingMethodRemove}
            onAdd={handleParsiongMethodAdd}
            onToggle={(checked) => {
                site.multiPage = {nextPageUrl: (checked) ? [{method: "readPast", string: ""}] : null} 
                onSiteUpdate({...site});
            }}
        />
    </>)    
}