import React, {useState} from "react";
import { Paper, FormLabel, TextField, Grid, IconButton, FormControlLabel, Checkbox, Divider } from "@mui/material";
import {Refresh } from '@mui/icons-material'
import ParsingSection from "./ParsingSection";
import InTextList from "./InTextList"
import ServerAddress from "../../services/api";


//import { Link } from "react-router-dom";

function SampleChapterList(props) {
    const { exampleChapters, exampleChapterId, onChapterSelect } = props;
    if (!exampleChapters) {
        return <></>
    }
    const sampleChapters = exampleChapters ? exampleChapters.sampleChapters : []
    return (<>
        Identified {exampleChapters.chapterCount} chapters<br />
        Select which sample to use:<br />
        {sampleChapters.map((x, i) => (
            <TextField
                key={`test_${i}`}
                multiline
                rows={4}
                defaultValue={x}
                sx={{minWidth: "550px", width:"100%"}}
                inputProps={{ readOnly: true, }}
                onClick={() => {onChapterSelect(i)}}
                color={i == exampleChapterId ? "secondary" : "primary" }
                focused={i == exampleChapterId}
                />
                ))
        }
    </>)
}

export default function ParseChapters(props) {
    const {site, onSiteUpdate, exampleContents, onError} = props;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exampleChapterBlock, setExampleChapterBlock] = useState(null);
    const [exampleChapters, setExampleChapters] = useState(null);
    const [exampleChaptersKey, setExampleChaptersKey] = useState(0);
    const [exampleChapterHref, setExampleChapterHref] = useState(null);
    const [exampleChapterChapterTitle, setExampleChapterChapterTitle] = useState(null);
    const [exampleChapterDateUploaded, setExampleChapterDateUploaded] = useState(null);
    const [exampleChapterNumber, setExampleChapterNumber] = useState(null);
    const [exampleChapterId, setExampleChapterId] = useState(-1);
    const [exampleFilterText, setExampleFilterText] = useState(null);
    
    
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
    const handleInTextChange = (array, index, value) =>
    {
        array[index] = value;
        onSiteUpdate({...site})
    }
    const handleInTextRemove = (array, index) =>
    {
        array.splice(index, 1);
        onSiteUpdate({...site})
        
    }
    const handleInTextAdd = (array) =>
    {
        array.push("{value}")
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
            .catch(error => {
                onError("Error parsing content")
                console.error("Error parsing content: ", error)
            })
            /*.finally(() => {
                setLoading(false);
            })*/
    }
    const parseChapters = () => {
        /*console.log(JSON.stringify({
            //PostLoad, Url, ChapterNumber, MultiPage
            ChapterBlockConfig: site.chapterText,
            SplitChapterText: site.splitChapterText,
            Contents: exampleContents,
          }))*/
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
                console.log(data)
                setExampleChaptersKey(exampleChaptersKey + 1)
                setExampleChapterId(-1)
                setExampleChapterHref("")
                setExampleChapterChapterTitle("")
                setExampleChapterDateUploaded("")
                setExampleChapterNumber("")
                setExampleChapters(data)
              })
              .catch(error => {
                  onError("Error parsing chapters")
                  console.error("Error parsing chapters: ", error)
              })
              /*.finally(() => {
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

    // Add book filter... filter: { text: [<parsing section>], in: [<string list>] }
    const chapterFilterEnabled = site.forEachChapterText != null && site.forEachChapterText.filter != null

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
        <SampleChapterList key={exampleChaptersKey} exampleChapters={exampleChapters} exampleChapterId={exampleChapterId} onChapterSelect={handleChapterSelect} />
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
                parsingArray={site.forEachChapterText.ChapterTitle}
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
            
            <Grid container width="100%">
            <Grid minWidth="580px">
                <FormControlLabel control={(<Checkbox checked={chapterFilterEnabled} 
                    onChange={(event) => {
                        /*if (event.target.checked)
                        {
                            if (!site.forEachChapterText.filter)
                            {site.forEachChapterText.filter = {"text": [], "In": []}}

                            site.forEachChapterText.filter.text.push({method: "readPast", string: ""})
                        }*/
                        site.forEachChapterText.filter = (event.target.checked) ? {"text": [{method: "readPast", string: ""}], "In": []} : null;
                        onSiteUpdate({...site});
                    }
                } />)} label="Chapter filtering" />
                { (chapterFilterEnabled) ? <>
                <FormLabel>Filtering text</FormLabel>
                <ParsingSection 
                    parsingArray={(site.forEachChapterText.filter || {text: null}).text}
                    onMethodChange={handleParsingMethodChange}
                    onStringChange={handleParsingStringChange}
                    onRemove={handleParsingMethodRemove}
                    onAdd={handleParsingMethodAdd}
                    onReorder={handleReorder}
                /></> : <></> }
                </Grid>
                <Grid>
    
                { (chapterFilterEnabled) ? <>
                Example filter text:<br/>
                <TextField
                    multiline
                    rows={4}
                    defaultValue={exampleFilterText}
                    sx={{minWidth: "550px", width:"100%"}}
                    inputProps={{ readOnly: true, }}
                    />
                    
                <IconButton onClick={() => {
                    console.log((site.forEachChapterText.filter || {text: null}).text); 
                    parseContent((site.forEachChapterText.filter || {text: null}).text, setExampleFilterText, exampleChapterText)
                }}><Refresh/></IconButton>
    
                </> : <></> }
                </Grid>
                </Grid>
                <Grid container width="100%">
    
                { (chapterFilterEnabled) ? <>
                    Add "in" list here...
                    <InTextList 
                        valueList={(site.forEachChapterText.filter || {In: []}).In} 
                        onStringChange={handleInTextChange} 
                        onRemove={handleInTextRemove} 
                        onAdd={handleInTextAdd} />
                </> : <></> }
                </Grid>
            <Divider sx={{padding:2}} />
        </Paper>
    </>)    
}