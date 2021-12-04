import React, {} from "react";
import { Avatar, IconButton, Paper, Typography, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Folder, Update, Edit } from '@mui/icons-material';

export default function FolderHeader(props){
    let { folder, bookList, siteList, onSiteChange, selectedSite } = props;  
    const effectiveBookList = (bookList == null) ? [] : bookList.filter(x => selectedSite == null || x.Sites.filter(y=>y.Url.match(selectedSite)).length > 0)
    return (<Paper>
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
                <IconButton
                    disabled={effectiveBookList.length === 0}
                >
                    <Update />
                </IconButton>
                <IconButton>
                    <Edit />
                </IconButton>
                </td>
            </tr>
            </tbody>
        </table>
    </Paper>)
}