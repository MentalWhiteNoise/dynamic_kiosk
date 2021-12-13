import React from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { FilterAlt, FilterAltOff, FilterAltOutlined } from "@mui/icons-material";
import SiteStatus from "../../SiteStatus";

export default function StatusFilter(props){
    let { filter ,openElement, onFilterOpen, onFilterClose, onFilterClear, statusList } = props;
    
    let filterStatusMenuItems = statusList.map((s, i) =>{
        return { onClick: () => {onFilterClose("status", s)}, 
                    menu: <SiteStatus status={s} checkingTriggered={false}/>,
                    selected: (filter === s)}
    })    
    if (filter != null)
        filterStatusMenuItems.push( {onClick: () => onFilterClear("status", null), menu: <FilterAltOff/>})
    return (<>
        <IconButton onClick={(e) => onFilterOpen("status", e.currentTarget)} id="filterStatusBtn">
            {filter == null ? <FilterAltOutlined/> : <FilterAlt/>}
        </IconButton>
        <Menu
            anchorEl={openElement}
            open={openElement != null}
            onClose={() => onFilterClose("status", null)}
        >
            { filterStatusMenuItems.map((s, i) =><MenuItem key={i} onClick={s.onClick} selected={s.selected === true}>{s.menu}</MenuItem> ) }
        </Menu>
    </>);
}