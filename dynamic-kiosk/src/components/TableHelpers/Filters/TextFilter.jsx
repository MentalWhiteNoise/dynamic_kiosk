import React, {useState} from "react";
import { IconButton, Menu, MenuItem, TextField, Tooltip } from "@mui/material";
import { AddCircle, FilterAlt, FilterAltOff, FilterAltOutlined } from "@mui/icons-material";

export default function TitleFilter(props){
    let { filter, onFilterApply, onFilterClear, label } = props;
    const [tempFilter, setTempFilter] = useState("");
    const [openElement, setOpenElement] = useState(null)
    
    const handleFilterClose = () => {
        setTempFilter(filter || "");
        setOpenElement(null);
    }
    const handleFilterApply = () => {
        setOpenElement(null);
        onFilterApply(tempFilter)
    }
    const handleFilterClear = () => {
        setTempFilter(""); 
        setOpenElement(null);
        onFilterClear();
    }
    
    return (<>
        <IconButton onClick={(e) => setOpenElement(e.currentTarget)} id="filterStatusBtn">
            {filter == null ? <FilterAltOutlined/> : <FilterAlt/>}
        </IconButton>
        <Menu
            anchorEl={openElement}
            open={openElement != null}
            onClose={handleFilterClose}
        >
            <MenuItem>
            <TextField 
                size="small" 
                label={label} 
                value={tempFilter} 
                onChange={(e) => {setTempFilter(e.target.value)}}
                onKeyPress={(e) => {
                    if (e.key === 'Enter')
                    { handleFilterApply(tempFilter) }
                }}
            />
            <Tooltip title={tempFilter === "" ? "" : "Apply Filter"}>
            <IconButton disabled={tempFilter === ""} onClick={() => {handleFilterApply(tempFilter)}}>
                <AddCircle/>
            </IconButton>
            </Tooltip>
            <Tooltip title={tempFilter === "" ? "" : "Clear Filter"}>
            <IconButton disabled={tempFilter === ""} onClick={handleFilterClear}>
                <FilterAltOff/>
            </IconButton>
            </Tooltip>
            </MenuItem>
        </Menu>
    </>);
}