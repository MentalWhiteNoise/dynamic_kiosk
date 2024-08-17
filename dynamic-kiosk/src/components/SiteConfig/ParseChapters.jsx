import React, {useState} from "react";
import { Paper, FormLabel, TextField, Grid, IconButton, FormControlLabel, Checkbox, Divider } from "@mui/material";
import {Refresh } from '@mui/icons-material'
import ParsingSection from "./ParsingSection";
import ServerAddress from "../../services/api";

//import { Link } from "react-router-dom";

export default function ParseChapters(props) {
    const {site, onSiteUpdate, exampleContents} = props;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exampleChapterBlock, setExampleChapterBlock] = useState(null);
    const [exampleChapters, setExampleChapters] = useState(null);
    const [exampleChapterHref, setExampleChapterHref] = useState(null);
    const [exampleChapterChapterTitle, setExampleChapterChapterTitle] = useState(null);
    const [exampleChapterDateUploaded, setExampleChapterDateUploaded] = useState(null);
    const [exampleChapterNumber, setExampleChapterNumber] = useState(null);
    const [exampleChapterId, setExampleChapterId] = useState(-1);
    
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
    const parseContent = (parsingArray, setMethod, textBlock) => {
      if (parsingArray == null || parsingArray.length == 0 || textBlock == null)
      {return}
        fetch(`${ServerAddress}/parse/parsetext`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ParseConfig: parsingArray,
                  Contents: textBlock,
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
            /*.catch(error => {
                console.error("Error loading page contents: ", error)
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            })*/
    }
    const parseChapters = () => {
        console.log(JSON.stringify({
            //PostLoad, Url, ChapterNumber, MultiPage
            ChapterBlockConfig: site.chapterText,
            SplitChapterText: site.splitChapterText,
            Contents: exampleContents,
          }))
        if (site.chapterText == null || site.chapterText.length == 0 || site.splitChapterText == null || site.splitChapterText.length == 0 || exampleContents == null)
        {return}
          fetch(`${ServerAddress}/parse/parsechapterblocks`, {
                  method: 'POST',
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    //PostLoad, Url, ChapterNumber, MultiPage
                    ChapterBlockConfig: site.chapterText,
                    SplitChapterText: site.splitChapterText,
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
                setExampleChapterId(-1)
                setExampleChapterHref("")
                setExampleChapterChapterTitle("")
                setExampleChapterDateUploaded("")
                setExampleChapterNumber("")
                setExampleChapters(data)
              })
              /*.catch(error => {
                  console.error("Error loading page contents: ", error)
                  setError(error);
              })
              .finally(() => {
                  setLoading(false);
              })*/
    }
    const handleChapterSelect = (index) => {
        if (index != exampleChapterId)
        {
            setExampleChapterId(index)
            setExampleChapterHref("")
            setExampleChapterChapterTitle("")
            setExampleChapterDateUploaded("")
            setExampleChapterNumber("")
        }
    }

    const exampleChapterText = (exampleChapterId > -1 && exampleChapters && exampleChapters.chapterCount > 0) ? exampleChapters.sampleChapters[exampleChapterId] : ""

    return (
        <>
        <Grid container width="100%">
        <Grid minWidth="580px">
        <FormLabel>Chapters Block</FormLabel>
        <ParsingSection 
            parsingArray={site.chapterText}
            onMethodChange={handleParsingMethodChange}
            onStringChange={handleParsingStringChange}
            onRemove={handleParsingMethodRemove}
            onAdd={handleParsingMethodAdd}
            onReorder={handleReorder}
        />
        </Grid>
        <Grid>

        Example parsed chapter block:<br/>
        <TextField
            multiline
            rows={4}
            defaultValue={exampleChapterBlock}
            sx={{minWidth: "550px", width:"100%"}}
            inputProps={{ readOnly: true, }}
            />
            
        <IconButton onClick={() => parseContent(site.chapterText, setExampleChapterBlock, exampleContents)}><Refresh/></IconButton>

        </Grid>
        </Grid>
        <Divider sx={{padding:2}} />
        
        <Grid container width="100%">
        <Grid minWidth="580px">
        <Paper>
        <FormLabel sx={{padding: 2}}>Split Chapter Text</FormLabel>
        
        <TextField  fullWidth 
            size="small"
            value={site.splitChapterText}
            sx={{minWidth: "100px"}}
            error={!site.splitChapterText}
            onChange={(event) => {
                site.splitChapterText = event.target.value 
                onSiteUpdate({...site})
            }}
            />
        </Paper>
        </Grid>
        <Grid>        
        { exampleChapters ? <>
            Identified {exampleChapters.chapterCount} chapters<br />
            Select which sample to use:<br />
            {exampleChapters.sampleChapters.map((x, i) => (
                <TextField
                    key={i}
                    multiline
                    rows={4}
                    defaultValue={x}
                    sx={{minWidth: "550px", width:"100%"}}
                    inputProps={{ readOnly: true, }}
                    onClick={() => {handleChapterSelect(i)}}
                    color={i == exampleChapterId ? "secondary" : "primary" }
                    focused={i == exampleChapterId}
                    />
                    ))
            }
        </> : <></>}
        Example parsed chapter block:<br/>
            
        <IconButton onClick={() => parseChapters()}><Refresh/></IconButton>

        </Grid>
        </Grid>
        <Divider sx={{padding:2}} />

        <Paper>
            <FormLabel>For Each Chapter Text...</FormLabel>
            <Divider sx={{padding:2}} />
            
            <Grid container width="100%">
            <Grid minWidth="580px">
            <FormLabel>HRef</FormLabel>
            <ParsingSection 
                parsingArray={site.forEachChapterText.HRef}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd={handleParsingMethodAdd}
                onReorder={handleReorder}
            />
            </Grid>
            <Grid>

            Example parsed chapter link:<br/>
            <TextField
                multiline
                rows={4}
                defaultValue={exampleChapterHref}
                sx={{minWidth: "550px", width:"100%"}}
                inputProps={{ readOnly: true, }}
                />
                
            <IconButton onClick={() => parseContent(site.forEachChapterText.HRef, setExampleChapterHref, exampleChapterText)}><Refresh/></IconButton>

            </Grid>
            </Grid>
            <Divider sx={{padding:2}} />
            
            <Grid container width="100%">
            <Grid minWidth="580px">
            <FormLabel>Chapter Title</FormLabel>
            <ParsingSection 
                parsingArray={site.forEachChapterText.HRef}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd={handleParsingMethodAdd}
                onReorder={handleReorder}
            />
            </Grid>
            <Grid>

            Example parsed chapter link:<br/>
            <TextField
                multiline
                rows={4}
                defaultValue={exampleChapterChapterTitle}
                sx={{minWidth: "550px", width:"100%"}}
                inputProps={{ readOnly: true, }}
                />
                
            <IconButton onClick={() => parseContent(site.forEachChapterText.ChapterTitle, setExampleChapterChapterTitle, exampleChapterText)}><Refresh/></IconButton>

            </Grid>
            </Grid>
            <Divider sx={{padding:2}} />

            <Grid container width="100%">
            <Grid minWidth="580px">
            <FormLabel>Date Uploaded</FormLabel>
            <ParsingSection 
                parsingArray={site.forEachChapterText.dateUploaded}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd={handleParsingMethodAdd}
                onReorder={handleReorder}
            />
            </Grid>
            <Grid>

            Example parsed chapter date uploaded:<br/>
            <TextField
                multiline
                rows={4}
                defaultValue={exampleChapterDateUploaded}
                sx={{minWidth: "550px", width:"100%"}}
                inputProps={{ readOnly: true, }}
                />
                
            <IconButton onClick={() => parseContent(site.forEachChapterText.dateUploaded, setExampleChapterDateUploaded, exampleChapterText)}><Refresh/></IconButton>

            </Grid>
            </Grid>
            <Divider sx={{padding:2}} />

            <Grid container width="100%">
            <Grid minWidth="580px">
            <FormLabel>Chapter Number</FormLabel>
            <ParsingSection 
                parsingArray={site.forEachChapterText.ChapterNumber}
                onMethodChange={handleParsingMethodChange}
                onStringChange={handleParsingStringChange}
                onRemove={handleParsingMethodRemove}
                onAdd={handleParsingMethodAdd}
                onReorder={handleReorder}
            />
            </Grid>
            <Grid>

            Example parsed chapter number:<br/>
            <TextField
                multiline
                rows={4}
                defaultValue={exampleChapterNumber}
                sx={{minWidth: "550px", width:"100%"}}
                inputProps={{ readOnly: true, }}
                />
                
            <IconButton onClick={() => parseContent(site.forEachChapterText.ChapterNumber, setExampleChapterNumber, exampleChapterText)}><Refresh/></IconButton>

            </Grid>
            </Grid>
            <Divider sx={{padding:2}} />
        </Paper>
    </>)    
}