import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { FilterAlt, FilterAltOff, FilterAltOutlined } from "@mui/icons-material";

export default function StatusFilter(props){
    let { filter, onFilterApply, onFilterClear, options } = props;
    const [openElement, setOpenElement] = useState(null)
    
    const handleFilterClose = () => {
        setOpenElement(null);
    }
    const handleFilterApply = (value) => {
        setOpenElement(null);
        onFilterApply(value)
    }
    const handleFilterClear = () => {
        setOpenElement(null);
        onFilterClear();
    }
    
    let filterStatusMenuItems = options.map((option, i) =>{
        return { onClick: () => {handleFilterApply(option.value || option)}, 
                    menu: option.label || option,
                    selected: (filter === option.value || option)}
    })    
    if (filter != null)
        filterStatusMenuItems.push( {onClick: () => handleFilterClear(), menu: <FilterAltOff/>})
    return (<>
        <IconButton onClick={(e) => setOpenElement(e.currentTarget)} id="filterStatusBtn">
            {filter == null ? <FilterAltOutlined/> : <FilterAlt/>}
        </IconButton>
        <Menu
            anchorEl={openElement}
            open={openElement != null}
            onClose={() => handleFilterClose()}
        >
            { filterStatusMenuItems.map((s, i) =><MenuItem key={i} onClick={s.onClick} selected={s.selected === true}>{s.menu}</MenuItem> ) }
        </Menu>
    </>);
}