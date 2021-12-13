import { ListItemButton, ListItemText, ListItemAvatar, Avatar, Divider } from "@mui/material";
import { Folder } from '@mui/icons-material';
import React from "react";
import { Link } from "react-router-dom";

const formatDate= (date) =>{
  if (date == null) return null
  return (new Date(date)).toISOString().substring(0,10)
}
export default function FolderListItem(props){
    const {folder} = props;
    return (<>
        <Divider />
        <ListItemButton component={Link} to={`/folder/${folder.Folder}`}>
        <ListItemAvatar>
          <Avatar>
            <Folder />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={folder.Folder} secondary={formatDate(folder.LastChecked)}/>
        </ListItemButton>
        </>)
}