import React, {useState} from "react";
import { Button, IconButton, Menu, MenuItem, TextField, Tooltip } from "@mui/material";
import { AddCircle, ChevronLeft, ChevronRight, FilterAlt, FilterAltOff, FilterAltOutlined } from "@mui/icons-material";

export default function UnreadFilter(props){
    let { filter ,openElement, onFilterOpen, onFilterClose, onFilterClear, maxUnread } = props;
    const [tempFilter, setTempFilter] = useState({value: "", mode: "gt"});
    
    const handleFilterClose = () => {
        setTempFilter("unread", {value: filter.value || "", mode: filter.mode});
        onFilterClose("unread", null)
    }
    return (<>
        <IconButton onClick={(e) => onFilterOpen("unread", e.currentTarget)} id="filterStatusBtn">
            {filter.value == null ? <FilterAltOutlined/> : <FilterAlt/>}
        </IconButton>
        <Menu
            anchorEl={openElement}
            open={openElement != null}
            onClose={() => {handleFilterClose()}}
        >
            <MenuItem>
            <Button onClick={() => {setTempFilter({...tempFilter, mode: tempFilter.mode === "lt" ? "gt": "lt"})}}>
                {tempFilter.mode === "lt" ? <ChevronLeft/> : <ChevronRight/> }
            </Button>
            <TextField 
                type="number"
                size="small"
                value={tempFilter.value} 
                onChange={(e) => setTempFilter({...tempFilter, value: e.target.value })}
                onKeyPress={(e) => {
                    if (e.key === 'Enter')
                    { onFilterClose("unread", tempFilter) }
                }}
                InputProps={{
                    inputProps: { 
                        max: maxUnread, min: 0 
                    }
                }}
                label="Unread"
            />
            <Tooltip title={tempFilter.value === "" ? "" : "Apply Filter"}>
            <IconButton disabled={tempFilter.value === ""} onClick={() => {
                const dir = tempFilter.mode === "lt" ? "<" : ">"
                const filterText = tempFilter.value == null ? null : dir + tempFilter.value
                onFilterClose("unread", filterText)
            }}>
                <AddCircle/>
            </IconButton>
            </Tooltip>
            <Tooltip title={tempFilter.value === "" ? "" : "Clear Filter"}>
            <IconButton 
                disabled={tempFilter.value === ""} 
                onClick={() => {
                    setTempFilter({value: "", mode: "gt"}); 
                    onFilterClear("unread", null)
                }}
            >
                <FilterAltOff/>
            </IconButton>
            </Tooltip>
            </MenuItem>
        </Menu>
    </>);
}