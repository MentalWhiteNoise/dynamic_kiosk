import React, { useState } from "react";
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Paper, Box, Container, Typography, Tooltip, Tab, Tabs } from "@mui/material";
import { Web } from '@mui/icons-material';
import ServerAddress from "../../services/api";
import Processing from "../Processing";
import { openInNewTab } from "../../helpers/sharedFunctions";

export default function AddSiteDialog(props){
    const { open, onSiteAdded, onClose, bookId } = props;
    const [tab, setTab] = useState(0);
    const [url, setUrl] = useState("");
    const [parsedSite, setParsedSite] = useState(null);
    const [parseError, setParseError] = useState(null);
    const [siteState, setSiteState] = React.useState("idle");
    // Manual site fields
    const [manualUrl, setManualUrl] = useState("");
    const [manualImageUrl, setManualImageUrl] = useState("");
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
        setManualUrl("")
        setManualImageUrl("")
        onClose()
    }
    const handleAddManualSite = () => {
        setSiteState("saving")
        fetch(`${ServerAddress}/book/${bookId}/sites/manual`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Url: manualUrl || null, ImageUrl: manualImageUrl || null })
        })
            .then(response => {
                if (response.ok) return response.json();
                throw response;
            })
            .then(() => {
                setSiteState("idle")
                onSiteAdded()
                onClose()
            })
            .catch(err => {
                console.log(err)
                setSiteState("failed")
                setParseError("Error saving manual site")
            })
    }

    const parseSiteUrl = () =>{
        setSiteState("parsing")
        setParseError(null)
        fetch(`${ServerAddress}/parse/parseurl?` + new URLSearchParams({url: url}), {method: 'POST', headers: { 'Content-Type': 'application/json' } })
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
        <DialogTitle>Add a site for this book</DialogTitle>
        <DialogContent>
            <Tabs value={tab} onChange={(e, v) => { setTab(v); setParseError(null); }} sx={{ mb: 2 }}>
                <Tab label="Auto (parse URL)" />
                <Tab label="Manual" />
            </Tabs>

            {tab === 0 && (<>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField sx={{width: "400px"}}
                        size="small"
                        label="Url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <Button disabled={url === "" || siteState !== "idle"} onClick={() => parseSiteUrl()}>Parse Site</Button>
                </Box>
                {parseError != null && <Typography color="error" variant="caption">Error parsing site: {parseError}</Typography>}
                {parsedSite != null && (
                    <Paper sx={{overflow: "auto", mt: 1}}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                        <Box sx={{ width: "100px", height: "auto", minWidth: "100px", overflow: "hidden"}}>
                            <img src={parsedSite.Image} alt={parsedSite.SiteId} loading="lazy"
                                style={{ maxWidth: "100px", width: "auto", height: "auto" }}/>
                        </Box>
                        <Container sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
                            <Typography variant="h5">{parsedSite.Title}</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
                                <Tooltip title={`Navigate to chapter list: ${parsedSite.Url}`}>
                                <IconButton onClick={() => openInNewTab(parsedSite.Url)}><Web/></IconButton>
                                </Tooltip>
                                <Typography variant="subtitle1" sx={{ alignSelf: 'center', color: "rgba(0, 0, 0, 0.6)" }}>
                                    {parsedSite.Url}
                                </Typography>
                            </Box>
                            <Typography variant="subtitle2"><b>Chapter Count:</b> {parsedSite.ChapterList.length}</Typography>
                        </Container>
                    </Box>
                    </Paper>
                )}
            </>)}

            {tab === 1 && (<>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        size="small"
                        label="Reading URL (optional)"
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        helperText="Where you go to read this book on this site"
                        sx={{ width: "400px" }}
                    />
                    <TextField
                        size="small"
                        label="Cover Image URL (optional)"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        sx={{ width: "400px" }}
                    />
                </Box>
                {parseError != null && <Typography color="error" variant="caption">{parseError}</Typography>}
            </>)}
        </DialogContent>
        <DialogActions>
            <Button disabled={siteState === "saving"} onClick={handleClose}>Never mind...</Button>
            {tab === 0 && (
                <Button disabled={parsedSite == null || siteState === "saving"} onClick={() => handleAddSite(parsedSite)} autoFocus>
                    Add Site
                </Button>
            )}
            {tab === 1 && (
                <Button disabled={siteState === "saving"} onClick={handleAddManualSite} autoFocus>
                    Add Manual Site
                </Button>
            )}
        </DialogActions>
    </Dialog>)
}