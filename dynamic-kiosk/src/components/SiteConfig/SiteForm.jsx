import React, {} from "react";
import { FormControl, Paper, FormLabel, TextField, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import {ExpandMore} from '@mui/icons-material'
import NavigationSection from "./NavigationSection";
import ParsingSection from "./ParsingSection";
//import { Link } from "react-router-dom";

export default function SiteForm(props) {
    const {site, onSiteUpdate/*, hasChanged*/} = props;
    const [expanded, setExpanded] = React.useState(null);
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
    const handleExpand = (panel) =>{
        console.log(panel)
        setExpanded(panel);
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
            onReorder={handleReorder}
            onExpandChange={(exp) => handleExpand(exp ? "postLoad" : null)}
            expanded={expanded === "postLoad"}
        />
        <ParsingSection 
            label="Title"
            parsingArray={site.title}
            onMethodChange={handleParsingMethodChange}
            onStringChange={handleParsingStringChange}
            onRemove={handleParsingMethodRemove}
            onAdd={handleParsingMethodAdd}
            onReorder={handleReorder}
            onExpandChange={(exp) => handleExpand(exp ? "title" : null)}
            expanded={expanded === "title"}
        />
        <ParsingSection
            label="Alternate Title"
            optional={true}
            parsingArray={site.altTitle}
            onMethodChange={handleParsingMethodChange}
            onStringChange={handleParsingStringChange}
            onRemove={handleParsingMethodRemove}
            onAdd={handleParsingMethodAdd}
            onReorder={handleReorder}
            onToggle={(checked) => {
                site.altTitle = (checked) ? [{method: "readPast", string: ""}] : null;                
                onSiteUpdate({...site});
            }}
            onExpandChange={(exp) => handleExpand(exp ? "altTitle" : null)}
            expanded={expanded === "altTitle"}
        />
        <ParsingSection 
            label="Image"
            parsingArray={site.image}
            onMethodChange={handleParsingMethodChange}
            onStringChange={handleParsingStringChange}
            onRemove={handleParsingMethodRemove}
            onAdd = {handleParsingMethodAdd}
            onReorder={handleReorder}
            onExpandChange={(exp) => handleExpand(exp ? "image" : null)}
            expanded={expanded === "image"}
        />
        <ParsingSection 
            label="Chapter Text"
            parsingArray={site.chapterText}
            onMethodChange={handleParsingMethodChange}
            onStringChange={handleParsingStringChange}
            onRemove={handleParsingMethodRemove}
            onAdd = {handleParsingMethodAdd}
            onReorder={handleReorder}
            onExpandChange={(exp) => handleExpand(exp ? "chaptText" : null)}
            expanded={expanded === "chaptText"}
        />
        <Accordion expanded={expanded === "splitChapt"} onChange={(e, i) => {handleExpand(i ? "splitChapt" : null)}}>
        <AccordionSummary expandIcon={<ExpandMore />}><FormLabel>Split Chapter Text</FormLabel></AccordionSummary>
        <AccordionDetails>
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
        </AccordionDetails>
        </Accordion>
        <Paper>
            <FormLabel>For Each Chapter Text...</FormLabel>
            Custom Filter Logic... In vs Not In... 
            <ParsingSection 
                label="HRef"
                parsingArray={site.forEachChapterText.HRef}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd = {handleParsingMethodAdd}
                onReorder={handleReorder}
                onExpandChange={(exp) => handleExpand(exp ? "hRef" : null)}
                expanded={expanded === "hRef"}
            />
            <ParsingSection 
                label="Chapter Title"
                parsingArray={site.forEachChapterText.ChapterTitle}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd = {handleParsingMethodAdd}
                onReorder={handleReorder}
            onExpandChange={(exp) => handleExpand(exp ? "chapTitle" : null)}
            expanded={expanded === "chapTitle"}
            />
            <ParsingSection 
                label="Date Uploaded"
                parsingArray={site.forEachChapterText.dateUploaded}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd = {handleParsingMethodAdd}
                onReorder={handleReorder}
                onExpandChange={(exp) => handleExpand(exp ? "uploaded" : null)}
                expanded={expanded === "uploaded"}
            />
            <ParsingSection 
                label="Chapter Number"
                parsingArray={site.forEachChapterText.ChapterNumber}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd = {handleParsingMethodAdd}
                onReorder={handleReorder}
            onExpandChange={(exp) => handleExpand(exp ? "chaptNum" : null)}
            expanded={expanded === "chaptNum"}
            />
        </Paper>
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
            onExpandChange={(exp) => handleExpand(exp ? "nextUrl" : null)}
            expanded={expanded === "nextUrl"}
        />
    </>)    
}