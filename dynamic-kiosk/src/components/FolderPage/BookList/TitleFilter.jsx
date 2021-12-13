import React, {useState} from "react";
import { IconButton, Menu, MenuItem, TextField, Tooltip } from "@mui/material";
import { AddCircle, FilterAlt, FilterAltOff, FilterAltOutlined } from "@mui/icons-material";

export default function TitleFilter(props){
    let { filter ,openElement, onFilterOpen, onFilterClose, onFilterClear } = props;
    const [tempFilter, setTempFilter] = useState("");
    
    return (<>
        <IconButton onClick={(e) => onFilterOpen("title", e.currentTarget)} id="filterStatusBtn">
            {filter == null ? <FilterAltOutlined/> : <FilterAlt/>}
        </IconButton>
        <Menu
            anchorEl={openElement}
            open={openElement != null}
            onClose={() => {setTempFilter(filter || ""); onFilterClose("title", null)}}
        >
            <MenuItem>
            <TextField 
                size="small" 
                label="Filter" 
                value={tempFilter} 
                onChange={(e) => setTempFilter(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter')
                    { onFilterClose("title", tempFilter) }
                }}
            />
            <Tooltip title={tempFilter === "" ? "" : "Apply Filter"}>
            <IconButton disabled={tempFilter === ""} onClick={() => {onFilterClose("title", tempFilter)}}>
                <AddCircle/>
            </IconButton>
            </Tooltip>
            <Tooltip title={tempFilter === "" ? "" : "Clear Filter"}>
            <IconButton disabled={tempFilter === ""} onClick={() => {setTempFilter(""); onFilterClear("title", null)}}>
                <FilterAltOff/>
            </IconButton>
            </Tooltip>
            </MenuItem>
        </Menu>
    </>);
}