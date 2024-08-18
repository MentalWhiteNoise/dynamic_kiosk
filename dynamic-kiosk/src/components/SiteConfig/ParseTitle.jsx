import React, {useState} from "react";
import { FormLabel, TextField, Grid, IconButton, FormControlLabel, Checkbox, Divider } from "@mui/material";
import {Refresh } from '@mui/icons-material'
import ParsingSection from "./ParsingSection";
import ServerAddress from "../../services/api";

//import { Link } from "react-router-dom";

export default function ParseTitle(props) {
    const {site, onSiteUpdate, exampleContents, onError} = props;
    const [exampleTitle, setExampleTitle] = useState(null);
    const [exampleAltTitle, setExampleAltTitle] = useState(null);
    const [exampleImage, setExampleImage] = useState(null);
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
    const altEnabled = site.altTitle != null
  
    return (
        <>
        <Grid container width="100%">
        <Grid minWidth="580px">
            <FormLabel>Title</FormLabel>
            <ParsingSection 
                parsingArray={site.title}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd={handleParsingMethodAdd}
                onReorder={handleReorder}
            />
            </Grid>
            <Grid>

            Example parsed title:<br/>
            <TextField
                multiline
                rows={4}
                defaultValue={exampleTitle}
                sx={{minWidth: "550px", width:"100%"}}
				inputProps={{ readOnly: true, }}
                />
                
            <IconButton onClick={() => parseContent(site.title, setExampleTitle)}><Refresh/></IconButton>

            </Grid>
            </Grid>
            <Divider sx={{padding:2}} />
            
            <Grid container width="100%">
            <Grid minWidth="580px">
            <FormControlLabel control={(<Checkbox checked={altEnabled} 
                onChange={(event) => {
                    site.altTitle = (event.target.checked) ? [{method: "readPast", string: ""}] : null;                
                    onSiteUpdate({...site});
                }
            } />)} label="Alternate Title" />
            { (altEnabled) ?
            <ParsingSection // parsingArray, onMethodChange, onStringChange, onRemove, onAdd, onReorder
                parsingArray={site.altTitle}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd={handleParsingMethodAdd}
                onReorder={handleReorder}
            /> : <></> }
            </Grid>
            <Grid>
                
            { (altEnabled) ? <>

            Example parsed alt title:<br/>
            <TextField
                multiline
                rows={4}
                defaultValue={exampleAltTitle}
                sx={{minWidth: "550px", width:"100%"}}
				inputProps={{ readOnly: true, }}
                />
                
            <IconButton onClick={() => parseContent(site.altTitle, setExampleAltTitle)}><Refresh/></IconButton>
            </> : <></> }

            </Grid>
            </Grid>
            <Divider sx={{padding:2}} />
            <Grid container width="100%">
            <Grid minWidth="580px">
            <FormLabel>Image</FormLabel>
            <ParsingSection 
                parsingArray={site.image}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd = {handleParsingMethodAdd}
                onReorder={handleReorder}
            />
            </Grid>
            <Grid>

            Example parsed image:<br/>
            <TextField
                multiline
                rows={4}
                defaultValue={exampleImage}
                sx={{minWidth: "300px", width:"100%"}}
				inputProps={{ readOnly: true, }}
                />
                
            <IconButton onClick={() => parseContent(site.image, setExampleImage)}><Refresh/></IconButton>

            </Grid>
            <Grid>
            <img src={exampleImage} sx={{maxWidth: "150px"}} />
            </Grid>
            </Grid>
    </>)    
}