import React, {useState, useEffect} from "react";
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Checkbox } from "@mui/material";
import {Save, Cancel, Edit, ContentCopy, NoteAdd} from '@mui/icons-material'

export default function SiteUrlDialog(props){
    const {onSiteSave, dialogOpen, onCancel, existingUrl} = props;
    const [siteUrl, setSiteUrl] = useState("");
    const [isExampleSite, setIsExampleSite] = useState(false);
    const isValidSite = siteUrl.length > 10
    //console.log(site)
    // url, urlIsExample
    return (
        <Dialog open={dialogOpen}>
            <DialogTitle>{existingUrl ? <>Enter new Url</> : <>Enter URL for new site to configure</>}</DialogTitle>
            <DialogContent>
            <TextField size="small" value={siteUrl} sx={{minWidth: "250px"}} error={!isValidSite} onChange={(event) => setSiteUrl(event.target.value)}/>
            {existingUrl ? <></> : <><br/><FormControlLabel control={<Checkbox onChange={(event) => {setIsExampleSite(event.target.checked)}} />} label="Url is example" /></>}
            </DialogContent>
            <DialogActions>
            <Button disabled={!isValidSite} onClick={() => {
                setSiteUrl("")
                onSiteSave(siteUrl, isExampleSite)
            }}>Use Site</Button>
            <Button onClick={() => {
                setSiteUrl("")
                onCancel()
            }}>Cancel</Button>
            </DialogActions>
        </Dialog>)
}