import React, {useState} from "react";
import { Button, IconButton, Menu, MenuItem, TextField, Tooltip } from "@mui/material";
import { AddCircle, ChevronLeft, ChevronRight, FilterAlt, FilterAltOff, FilterAltOutlined } from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { formatDate } from "../../../helpers/sharedFunctions";

export default function DateFilter(props){
    let { filter, onFilterApply, onFilterClear, label } = props;
    const [tempFilter, setTempFilter] = useState({value: "", mode: "gt"});
    const [openElement, setOpenElement] = useState(null)
    
    const handleFilterClose = () => {
        setTempFilter({value: filter.value || "", mode: filter.mode});
        setOpenElement(null);
    }
    const handleFilterApply = () => {
        setOpenElement(null);
        const dir = tempFilter.mode === "lt" ? "<" : ">"
        const filterText = tempFilter.value == null ? null : dir + formatDate(tempFilter.value)
        onFilterApply(filterText)
    }
    const handleFilterClear = () => {
        setTempFilter({value: "", mode: "gt"}); 
        setOpenElement(null);
        onFilterClear();
    }
    console.log(tempFilter.value)
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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                label={label}
                value={tempFilter.value != null ? tempFilter.value : null}
                onChange={(newValue) => {setTempFilter({...tempFilter, value: formatDate(newValue) })}}
                renderInput={(params) => <TextField {...params} />}
            />
            </LocalizationProvider>
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