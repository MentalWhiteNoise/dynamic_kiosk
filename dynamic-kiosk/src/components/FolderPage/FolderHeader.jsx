import React, {} from "react";
import { Avatar, IconButton, Paper, Typography, Select, MenuItem, InputLabel, FormControl, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import { Folder, Update, Edit, UpdateDisabled } from '@mui/icons-material';

export default function FolderHeader(props){
    const { folder, bookList, siteList, onSiteChange, selectedSite, onUpdateClick, onCancelUpdate } = props;  
    const [open, setOpen] = React.useState(false);
    const effectiveBookList = (bookList == null) ? [] : bookList.filter(x => selectedSite == null || x.Sites.filter(y=>y.Url.match(selectedSite)).length > 0)
    const running = effectiveBookList.filter(x => x.status !== "idle").length
    
    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
    return (<Paper>
        I started adding more... but I think I need to move more logic into the api. I am doing too much client side data manipulation. Also, I may want to page large book counts from the api side...
        <br/>Action Items: 
        <ul>
            <li>Add remaining to check count to folder header</li>
            <li>Add paging and sorting</li>
        </ul>
        <table style={{width: "100%"}}>
            <tbody>
            <tr>
                <td style={{whiteSpace: "nowrap", padding: "0.5em"}}>
                <Avatar sx={{verticalAlign: "middle"}}>
                    <Folder />
                </Avatar>                        
                </td>
                <td style={{whiteSpace: "nowrap", padding: "0.5em"}}>
                <Typography variant="h5">{folder}</Typography>
                <Typography sx={{ fontSize: 14 }} color="text.secondary">(Lookup data last loaded)</Typography>
                </td>
                <td style={{width: "100%", padding: "0.5em"}}>
                <FormControl>
                <InputLabel id="site-select-label">Site</InputLabel>
                <Select
                    value={selectedSite || ""}
                    label="Site"
                    labelId="site-select-label"
                    onChange={(event) => onSiteChange(event.target.value)}
                    sx={{minWidth: "200px", whiteSpace: "nowrap"}}
                >
                    <MenuItem key={-1} value={""}><i>all</i></MenuItem>
                    {siteList.map((x, i) => (
                            <MenuItem key={i} value={x}>{x}</MenuItem>
                        ))
                    }
                </Select>
                </FormControl>
                </td>
                <td style={{whiteSpace: "nowrap", padding: "0.5em"}}>
                { (running === 0) ? (
                    <Tooltip title={effectiveBookList.length === 0 ? "" : "Check for updates"}>
                    <IconButton
                        disabled={effectiveBookList.length === 0}
                        onClick={() => handleClickOpen()}
                    >
                        <Update />
                    </IconButton>
                    </Tooltip>) : (
                    <Tooltip title={"Cancel Updates"}>
                    <IconButton
                        onClick={() => onCancelUpdate()}
                    >
                        <UpdateDisabled />
                    </IconButton>
                    </Tooltip>)
                }
                <Tooltip title="Rename Folder">
                <IconButton>
                    <Edit />
                </IconButton>
                </Tooltip>
                </td>
            </tr>
            </tbody>
        </table>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to process all these?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            There are {effectiveBookList.length} books that will be updated. This may take a while. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Never mind...</Button>
          <Button onClick={() => { onUpdateClick(); handleClose()}} autoFocus>
            Run it!
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>)
}