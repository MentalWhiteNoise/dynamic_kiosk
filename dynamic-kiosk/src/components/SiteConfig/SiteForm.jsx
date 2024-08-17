import React, {useState} from "react";
import { styled } from '@mui/material/styles';
import { FormControl, Paper, FormLabel, TextField, Accordion, AccordionSummary, AccordionDetails, Tabs, Tab } from "@mui/material";
import {ExpandMore} from '@mui/icons-material'
import NavigationSection from "./NavigationSection";
import ParsingSection from "./ParsingSection";
import { tableCellClasses } from '@mui/material/TableCell';
import BookList from "./BookList";
import PageLoad from "./PageLoad";
import ParseTitle from "./ParseTitle"
import ParseChapters from "./ParseChapters"
import ServerAddress from "../../services/api";

//import { Link } from "react-router-dom";

export default function SiteForm(props) {
    const {site, onSiteUpdate, bookList, editMode/*, hasChanged*/} = props;
    const [value, setValue] = React.useState(0);
    const [exampleUrl, setExampleUrl] = React.useState(null);
    const [exampleContents, setExampleContents] = React.useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    if (site == null) return <></>
    //console.log(site)
  
    const handleChange = (event, newValue) => {
      setValue(newValue);
    };
    const handleUpdateExampleUrl = (url) => {
        setExampleUrl(url)
        setValue(1);
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
                console.error("Error loading page contents: ", error)
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            })
    }
  
    return (
        <><Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons={false}
            aria-label="scrollable prevent tabs example"
        >
            <Tab label="Book List" />
            <Tab label="Page Load" disabled={editMode == false} />
            <Tab label="Title & Image" disabled={editMode == false} />
            <Tab label="Chapters" disabled={editMode == false} />
        </Tabs>
        <Paper hidden={value!=0}>
            <BookList bookList={bookList} site={site} onSelectExampleUrl={handleUpdateExampleUrl} />
        </Paper>
        <Paper hidden={value!=1}>
            <PageLoad site={site} onSiteUpdate={onSiteUpdate} exampleUrl={exampleUrl} onExampleUrlUpdate={handleUpdateExampleUrl} exampleContents={exampleContents} onLoadExampleContents={getExampleContents} />
        </Paper>
        <Paper hidden={value!=2}>
            <ParseTitle site={site} onSiteUpdate={onSiteUpdate} exampleContents={exampleContents} />
        </Paper>
        <Paper hidden={value!=3}>
            <ParseChapters site={site} onSiteUpdate={onSiteUpdate} exampleContents={exampleContents} />
        </Paper>
    </>)    
}