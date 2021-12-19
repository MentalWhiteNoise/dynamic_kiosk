import React from "react";
import { ListItem, ListItemButton, ListItemIcon, Checkbox, ListItemText } from "@mui/material";

const ColumnOption = (props) =>{
    const {column, checked, onChange, locked} = props
    return (<ListItem disablePadding>
        <ListItemButton  onClick={() => { if (locked !== true) onChange(column)}} dense>
            <ListItemIcon>
                <Checkbox edge="start" checked={checked} disableRipple />
            </ListItemIcon>
            <ListItemText id={column} primary={column} />
        </ListItemButton>
    </ListItem>)
}

export default ColumnOption