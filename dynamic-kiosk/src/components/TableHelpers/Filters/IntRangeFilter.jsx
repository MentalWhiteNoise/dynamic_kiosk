import React, {useState} from "react";
import { Button, IconButton, Menu, MenuItem, TextField, Tooltip } from "@mui/material";
import { AddCircle, ChevronLeft, ChevronRight, FilterAlt, FilterAltOff, FilterAltOutlined } from "@mui/icons-material";

export default function IntRangeFilter(props){
    let { filter, onFilterApply, onFilterClear, minValue, maxValue, label } = props;
    const [tempFilter, setTempFilter] = useState({value: "", mode: "gt"});
    const [openElement, setOpenElement] = useState(null)
    
    const handleFilterClose = () => {
        setTempFilter({value: filter.value || "", mode: filter.mode});
        setOpenElement(null);
    }
    const handleFilterApply = () => {
        setOpenElement(null);
        const dir = tempFilter.mode === "lt" ? "<" : ">"
        const filterText = tempFilter.value == null ? null : dir + tempFilter.value
        onFilterApply(filterText)
    }
    const handleFilterClear = () => {
        setTempFilter({value: "", mode: "gt"}); 
        setOpenElement(null);
        onFilterClear();
    }

    return (<>
        <IconButton onClick={(e) => setOpenElement(e.currentTarget)} id="filterStatusBtn">
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
                    { handleFilterApply() }
                }}
                InputProps={{
                    inputProps: { 
                        max: maxValue, min: minValue || 0 
                    }
                }}
                label={label}
            />
            <Tooltip title={tempFilter.value === "" ? "" : "Apply Filter"}>
            <IconButton disabled={tempFilter.value === ""} onClick={handleFilterApply}>
                <AddCircle/>
            </IconButton>
            </Tooltip>
            <Tooltip title={tempFilter.value === "" ? "" : "Clear Filter"}>
            <IconButton 
                disabled={tempFilter.value === ""} 
                onClick={handleFilterClear}
            >
                <FilterAltOff/>
            </IconButton>
            </Tooltip>
            </MenuItem>
        </Menu>
    </>);
}