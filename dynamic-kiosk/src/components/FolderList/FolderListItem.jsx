import { ListItemButton, ListItemText, ListItemAvatar, Avatar, Divider } from "@mui/material";
import { Folder } from '@mui/icons-material';
import React from "react";
import { Link } from "react-router-dom";

export default function FolderListItem(props){
    const {folder} = props;
    return (<>
        <Divider />
        <ListItemButton component={Link} to={`/folder/${folder}`}>
        <ListItemAvatar>
          <Avatar>
            <Folder />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={folder} secondary="(Look up date last loaded)"/>
        </ListItemButton>
        </>)
}