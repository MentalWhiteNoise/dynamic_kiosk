import React, {useState} from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TablePagination, IconButton, Menu, MenuItem, TextField, Tooltip } from "@mui/material";
import BookListItem from './BookListItem'
import { AddCircle, ArrowDownward, ArrowUpward, ChevronLeft, ChevronRight, FilterAlt, FilterAltOff, FilterAltOutlined } from "@mui/icons-material";
import SiteStatus from "../SiteStatus";

export default function BookList(props){
    let { bookList, selectedSite, onReloadBook, siteList } = props;
    //console.log(bookList[0])
    const [expanded, setExpanded] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState("title");
    const [sortDesc, setSortDesc] = useState("false");
    const [filter, setFilter] = useState({ 
        status: { openElement: null, filter: null }, 
        title: { openElement: null, filter: null }, 
        unread: { openElement: null, filter: { value: null, mode: "gt"}}
    })
    const [tempFilter, setTempFilter] = useState({title: "", unread: {value: "", mode: "gt"}});
    const handleExpand = (index) => {
        //console.log("here", index)
        if (expanded === index)
            setExpanded(null)
        else
            setExpanded(index)
    }
    const handleSort = (column) => {
        console.log("handleSort", sortColumn, column, sortDesc)
        if (column === sortColumn)
        {
            setSortDesc(!sortDesc)
        }
        else
        {
            setSortColumn(column);
            setSortDesc(false)
        }
    }
    const onFilterClose = (item, value) =>{
        let newFilter = {...filter}
        newFilter[item] = {...filter[item], openElement: null}
        if (value != null)
            newFilter[item].filter = value
        setFilter(newFilter)
    }
    const onFilterClear = (item, dflt) =>{
        let newFilter = {...filter}
        newFilter[item] = {...filter[item], filter: dflt, openElement: null}
        setFilter(newFilter)
    }
    const onFilterOpen = (item, element) => {
        let newFilter = {...filter}
        newFilter[item] = {...filter[item], openElement: element}
        setFilter(newFilter)
    }
    
    const filterAmount = (filter.unread.filter.value === null || filter.unread.filter.value === "") ? null : parseInt(filter.unread.filter.value);
    //console.log(filterAmount)
    //console.log(filter.unread.filter.mode)
    const filteredItems = bookList.filter(b => {
        if (filter.status.filter !== null && b.Status !== filter.status.filter)
            return false;

        if (filter.title.filter !== null && !b.Title.toLowerCase().match(filter.title.filter.toLowerCase()))
            return false;
        if (filterAmount !== null && (
                b.CountUnread == null
                || (b.CountUnread < filterAmount && filter.unread.filter.mode === "gt")
                || (b.CountUnread > filterAmount && filter.unread.filter.mode === "lt")
            ))
            return false;

        return true;
    })
    //console.log(filteredItems.length)
    const rows = filteredItems.sort((a,b) => {
            if (sortColumn === "title")
            {
                if (a.Title > b.Title) return (sortDesc) ? 1 : -1
                if (a.Title < b.Title) return (sortDesc) ? -1 : 1
                return 0
            }
            if (sortColumn === "unread")
            {
                if (a.CountUnread > b.CountUnread) return (sortDesc) ? 1 : -1
                if (a.CountUnread < b.CountUnread) return (sortDesc) ? -1 : 1
                if (a.Title > b.Title) return 1
                if (a.Title < b.Title) return -1
                return 0
            }
            if (sortColumn === "status")
            {
                if (a.Status > b.Status) return (sortDesc) ? 1 : -1
                if (a.Status < b.Status) return (sortDesc) ? -1 : 1
                if (a.Title > b.Title) return 1
                if (a.Title < b.Title) return -1
                return 0
            }
            return 0
        })
        .slice((page - 1) * pageSize, page * pageSize)
    const statusList = [...new Set(bookList.map(b => b.Status))]
    let filterStatusMenuItems = statusList.map((s, i) =>{
        return { onClick: () => {onFilterClose("status",s)}, 
                    menu: <SiteStatus status={s} checkingTriggered={false}/>,
                    selected: (filter.status.filter === s)}
    })    
    if (filter.status.filter != null)
        filterStatusMenuItems.push( {onClick: () => onFilterClear("status"), menu: <FilterAltOff/>})

    const maxUnread = Math.max.apply(null, [...bookList.map(b => b.CountUnread + 0), 10])
    return (<>
        <Table size="small" stickyHeader>
            <TableHead>
                <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell colSpan={2}>
                        <Button onClick={()=>handleSort("title")}>Book Title{ sortColumn === "title" ? sortDesc ? <ArrowDownward/> : <ArrowUpward/> : <></> }</Button>
                        <IconButton onClick={(e) => onFilterOpen("title", e.currentTarget)} id="filterStatusBtn">
                            {filter.title.filter == null ? <FilterAltOutlined/> : <FilterAlt/>}
                        </IconButton>
                        <Menu
                            anchorEl={filter.title.openElement}
                            open={filter.title.openElement != null}
                            onClose={() => {setTempFilter({...tempFilter, Title: filter.title.filter || ""}); onFilterClose("title", null)}}
                        >
                            <MenuItem>
                            <TextField size="small" label="Filter" value={tempFilter.title} onChange={(e) => setTempFilter({...tempFilter, title: e.target.value})}/>
                            <Tooltip title={tempFilter.title === "" ? "" : "Apply Filter"}>
                            <IconButton disabled={tempFilter.title === ""} onClick={() => {onFilterClose("title", tempFilter.title)}}>
                                <AddCircle/>
                            </IconButton>
                            </Tooltip>
                            <Tooltip title={tempFilter.title === "" ? "" : "Clear Filter"}>
                            <IconButton disabled={tempFilter.title === ""} onClick={() => {setTempFilter({...tempFilter, title: ""}); onFilterClear("title")}}>
                                <FilterAltOff/>
                            </IconButton>
                            </Tooltip>
                            </MenuItem>
                        </Menu>
                    </TableCell>
                    <TableCell>
                        <Button onClick={()=>handleSort("status")}>Status{ sortColumn === "status" ? sortDesc ? <ArrowDownward/> : <ArrowUpward/> : <></> }</Button>
                        <IconButton onClick={(e) => onFilterOpen("status", e.currentTarget)} id="filterStatusBtn">
                            {filter.status.filter == null ? <FilterAltOutlined/> : <FilterAlt/>}
                        </IconButton>
                        <Menu
                            anchorEl={filter.status.openElement}
                            open={filter.status.openElement != null}
                            onClose={() => onFilterClose("status", null)}
                        >
                            { filterStatusMenuItems.map((s, i) =><MenuItem key={i} onClick={s.onClick} selected={s.selected === true}>{s.menu}</MenuItem> ) }
                        </Menu>
                    </TableCell>
                    <TableCell>
                        <Button onClick={()=>handleSort("unread")}>Number Unread{ sortColumn === "unread" ? sortDesc ? <ArrowDownward/> : <ArrowUpward/> : <></> }</Button>
                        <IconButton onClick={(e) => onFilterOpen("unread", e.currentTarget)} id="filterStatusBtn">
                            {filter.unread.filter.value == null ? <FilterAltOutlined/> : <FilterAlt/>}
                        </IconButton>
                        <Menu
                            anchorEl={filter.unread.openElement}
                            open={filter.unread.openElement != null}
                            onClose={() => {
                                setTempFilter({...tempFilter, unread: {...tempFilter.unread, value: filter.unread.filter.value || "", mode: filter.unread.filter.mode}}); 
                                onFilterClose("unread", null)}
                            }
                        >
                            <MenuItem>
                            <Button onClick={() => {setTempFilter({...tempFilter, unread: {...tempFilter.unread, mode: tempFilter.unread.mode === "lt" ? "gt": "lt"}})}}>
                                {tempFilter.unread.mode === "lt" ? <ChevronLeft/> : <ChevronRight/> }
                            </Button>
                            <TextField 
                                type="number"
                                size="small"
                                value={tempFilter.unread.value} 
                                onChange={(e) => setTempFilter({...tempFilter, unread: {...tempFilter.unread, value: e.target.value }})}
                                InputProps={{
                                    inputProps: { 
                                        max: maxUnread, min: 0 
                                    }
                                }}
                                label="Unread"
                            />
                            <Tooltip title={tempFilter.unread.value === "" ? "" : "Apply Filter"}>
                            <IconButton disabled={tempFilter.unread.value === ""} onClick={() => {onFilterClose("unread", tempFilter.unread)}}>
                                <AddCircle/>
                            </IconButton>
                            </Tooltip>
                            <Tooltip title={tempFilter.unread.value === "" ? "" : "Clear Filter"}>
                            <IconButton 
                                disabled={tempFilter.unread.value === ""} 
                                onClick={() => {
                                    setTempFilter({...tempFilter, unread: {...tempFilter.unread, value: "", mode: "gt"}}); 
                                    onFilterClear("unread", { value: null, mode: "gt" })
                                }}
                            >
                                <FilterAltOff/>
                            </IconButton>
                            </Tooltip>
                            </MenuItem>
                        </Menu>
                    </TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((x, i) => (
                    <BookListItem key={i} book={x} expanded={expanded} onExpand={handleExpand} selectedSite={selectedSite} onReloadBook={onReloadBook} siteList={siteList} />
                ))}
            </TableBody>
        </Table>
        <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={filteredItems.length}
            rowsPerPage={pageSize}
            page={page-1}
            onPageChange={(e,v) => setPage(v+1)}
            onRowsPerPageChange={(e) => setPageSize(e.target.value+0)}
        />
    </>)
}