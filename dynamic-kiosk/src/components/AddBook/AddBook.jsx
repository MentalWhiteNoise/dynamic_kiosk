import React, {useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Divider, Paper, Typography, List, ListItem, ListItemButton, ListItemText, ListSubheader, TextField, Snackbar, Alert, Autocomplete } from "@mui/material";
import ServerAddress from "../../services/api";
import { Box } from "@mui/system";
import { openInNewTab } from "../../helpers/sharedFunctions";
import Processing from "../Processing";

export default function AddBook(){
    const [siteList, setSiteList] = useState(null);
    const [folderList, setFolderList] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState("");
    const [addBookError, setAddBookError] = useState(null)
    const [newUrl, setNewUrl] = useState([]);
    const [attemptingToAdd, setAttemptingToAdd] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        fetch(`${ServerAddress}/sites`)
                .then(response =>{
                    if (response.ok){
                        return response.json();
                    }
                    throw response
                })
                .then(data => {
                    setSiteList(data)
                })
                .catch(error => {
                    console.error("Error fetching data: ", error)
                })
        fetch(`${ServerAddress}/folders`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setFolderList(data)
            })
            .catch(error => {
                console.error("Error loading folders: ", error)
            })
    }, [])
    const addNewBook = () => {
        if(siteList.filter(s => newUrl.match(s)).length === 0)
        {
            console.log("URL not from valid site")
            setAddBookError("URL requested does not match the list of configured sites. Please use a site listed, or add and configure the new site.")
        }
        setAttemptingToAdd(true);
        fetch(`${ServerAddress}/books`, {method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ Url: newUrl, Folder: (selectedFolder === "" ? "New" : selectedFolder) }) })
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                else{
                    throw response;
                }
            })
            .then((data) => {
                navigate(`/book/${data.Id}`)
            })
            .catch((err) => {
                // correct way to retrieve text from failure
                setAttemptingToAdd(false);
                err.text().then( errorMessage => {
                    console.log(err)
                    setAddBookError(`Error adding book: ${errorMessage}`)
                })
            })

        console.log(newUrl)
    }
    const minLength = siteList == null ? 14 : Math.min.apply(null, siteList.map(s => s.length)) + 6
    return (<>
        <Snackbar open={addBookError != null} autoHideDuration={6000} onClose={() => setAddBookError(null)}>
          <Alert onClose={() => setAddBookError(null)} severity="error" sx={{ width: '100%' }}>
            {addBookError}
          </Alert>
        </Snackbar>
        <Typography variant="subtitle1">Enter the URL of the chapter list for the book you would like to add</Typography>
        <br/>
        <Autocomplete
            size="small"
            freeSolo
            value={selectedFolder}
            options={(folderList||[]).map(f => f.Folder)}
            sx={{ width: 300 }}
            onChange={(e, v) => setSelectedFolder(v)}
            renderInput={(params) => (
                <TextField {...params} label="Folder"
                    onChange={(e) => setSelectedFolder(e.target.value)}/>
            )}
        />
        <br/>
        <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
        <TextField fullWidth 
            size="small"
            label="New Book URL" 
            value={newUrl} 
            onChange={(e) => {setNewUrl(e.target.value)}}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && newUrl.length >= minLength) { addNewBook() }
                }}
            />
        <Button variant="contained" onClick={() => {addNewBook()}} disabled={newUrl.length < minLength}>
            Add new book
        </Button>
        </Box>
        <Paper>
        <Divider/>
        <List disablePadding dense
            component="nav"
            subheader={
                <ListSubheader component="div">
                Configured Sites:
                </ListSubheader>
            }>
        {
            siteList == null ? <></> : siteList.map((s,i) => (
                <ListItem disablePadding key={i}><ListItemButton onClick={() => openInNewTab(s)}><ListItemText primary={s}/></ListItemButton></ListItem>
            ))
        }
        </List>
        </Paper>
    <Processing open={attemptingToAdd} />
    </>)
}