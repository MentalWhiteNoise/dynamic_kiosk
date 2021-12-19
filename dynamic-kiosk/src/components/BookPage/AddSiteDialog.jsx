import React, { useState } from "react";
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Paper, Box, Container, Typography, Tooltip } from "@mui/material";
import { Web } from '@mui/icons-material';
import ServerAddress from "../../services/api";
import Processing from "../Processing";
import { openInNewTab } from "../../helpers/sharedFunctions";

export default function AddSiteDialog(props){
    const { open, onSiteAdded, onClose, bookId } = props;  
    const [url, setUrl] = useState("");
    const [parsedSite, setParsedSite] = useState(null);
    const [parseError, setParseError] = useState(null);
    const [siteState, setSiteState] = React.useState("idle");
    const handleAddSite = (newSite) => {
        setSiteState("saving")
        setParseError(null)
        fetch(`${ServerAddress}/book/${bookId}/sites`, {method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({Url: parsedSite.Url, SiteId: parsedSite.SiteId}) })
            .then(response =>{
                if (response.ok){
                    return
                }
                throw response
            })
            .then(() => {
                setParsedSite(null)
                setSiteState("idle")
                onSiteAdded()
                onClose()
            })
            .catch(err => {
                console.log(err)
                setSiteState("failed")
                setParseError("Errors encountered saving url")
            })
    }
    const handleClose = () => {
        if (siteState === "saving")
            return
        setParsedSite(null)
        setParseError(null)
        setSiteState("idle")
        onClose()
    }

    const parseSiteUrl = () =>{
        setSiteState("parsing")
        setParseError(null)
        fetch(`${ServerAddress}/parse?` + new URLSearchParams({url: url}), {method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                if (data == null){
                    setParseError("Could not parse url")
                    setSiteState("idle")
                }
                setParsedSite(data)
                setSiteState("parsed")
            })
            .catch(err => {
                console.log(err)
                setSiteState("idle")
                setParseError("Could not parse url")
            })
    }
    // Load site list...

    return (<Dialog
        open={open}
        onClose={handleClose}
    >
        <Processing
            open={siteState === "saving" || siteState === "parsing"}
        />
        <DialogTitle>
        {"Please enter a url within the configured sites (?) and confirm"}
        </DialogTitle>
        <DialogContent>
            <TextField sx={{width: "400px"}}
                size="small"
                label="Url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
            />
            <Button disabled={url === "" || siteState !== "idle"} onClick={() => parseSiteUrl()}>Parse Site</Button>
        </DialogContent>
        {
            parseError == null ? <></> : <>Error parsing site: {parseError}</>
        }
        {
            parsedSite == null ? <></> : 
            (<Paper sx={{overflow: "auto"}}>
            <Box  sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                <Box sx={{ width: "100px", height: "auto", minWidth: "100px", overflow: "hidden"}}>
                    <img
                    src={parsedSite.Image}
                    alt={parsedSite.SiteId}
                    loading="lazy"
                    style={{
                        maxWidth: "100px",
                        width: "auto",
                        height: "auto"
                    }}/>
                </Box>
                <Container sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                        <Box style={{display: 'table'}}>
                            <Typography variant="h5" sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
                                {parsedSite.Title}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                        <Tooltip title= {`Navigate to chapter list: ${parsedSite.Url}`}>
                        <IconButton onClick={() => openInNewTab(parsedSite.Url)}>
                            <Web/>
                        </IconButton>
                        </Tooltip>
                        <Box style={{display: 'table'}}>
                            <Typography variant="subtitle1" sx={{ display: 'table-cell', verticalAlign: 'middle', color: "rgba(0, 0, 0, 0.6)" }} >
                                {parsedSite.Url}
                            </Typography>
                        </Box>
                    </Box>

                    <Container sx={{ display: 'table', height: '100%' }}>
                        <Typography variant="subtitle2" sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
                            <b>Chapter Count:</b> {parsedSite.ChapterList.length}
                        </Typography>
                    </Container>
                </Container>
            </Box>
            </Paper>)
        }
        <DialogActions>
            <Button disabled={siteState === "saving"} onClick={handleClose}>Never mind...</Button>
            <Button disabled={parsedSite == null || siteState === "saving"} onClick={() => handleAddSite(parsedSite)} autoFocus>
                Add Site
            </Button>
        </DialogActions>
    </Dialog>)
}