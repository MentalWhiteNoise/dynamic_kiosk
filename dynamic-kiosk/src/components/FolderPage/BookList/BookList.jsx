import React, {useState} from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TablePagination } from "@mui/material";
import BookListItem from './BookListItem'
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import UnreadFilter from "./UnreadFilter";
import TitleFilter from "./TitleFilter";
import StatusFilter from "./StatusFilter"
import {BrowserView, MobileView} from 'react-device-detect';
import  { useLocation, useSearchParams } from "react-router-dom";

export default function BookList(props){
    let { bookList, selectedSite, onReloadBook, siteList } = props;
    let [searchParams, setSearchParams] = useSearchParams();
    const setSearchFilter = (property, filterText) => {
        
        const paramObject = Object.fromEntries([...searchParams])
        console.log(paramObject)
        if (filterText == null){
            delete paramObject[property]
            setSearchParams({...paramObject})
        }
        else
            setSearchParams({...paramObject, [property]: filterText})
    }
    const titleFilter = searchParams.get("title");
    const statusFilter = searchParams.get("status");
    const unreadFilter = searchParams.get("unread") === null ? null : searchParams.get("unread").substring(1);
    const unreadFilterMode = searchParams.get("unread") === null ? "gt": searchParams.get("unread")[0] === "<" ? "lt" : "gt";

    //console.log(bookList[0])
    const [expanded, setExpanded] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState("title");
    const [sortDesc, setSortDesc] = useState("false");
    const [openElement, setOpenElement] = useState({ 
        status: null,
        title: null, 
        unread: null,
    })
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
        setSearchFilter(item, value) 
        setOpenElement({...openElement, [item]: null})
    }
    const onFilterClear = (item, dflt) =>{
        setSearchFilter(item, null) 
        setOpenElement({...openElement, [item]: null})
    }
    const onFilterOpen = (item, element) => {
        setOpenElement({...openElement, [item]: element})
    }
    
    const filterAmount = unreadFilter === null ? null : parseInt(unreadFilter);
    //console.log(filterAmount)
    //console.log(filter.unread.filter.mode)
    const filteredItems = bookList.filter(b => {
        if (statusFilter !== null && b.Status !== statusFilter)
            return false;

        if (titleFilter !== null && !b.Title.toLowerCase().match(titleFilter.toLowerCase()))
            return false;
        if (filterAmount !== null && (
                b.CountUnread == null
                || (b.CountUnread <= filterAmount && unreadFilterMode === "gt")
                || (b.CountUnread >= filterAmount && unreadFilterMode === "lt")
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

    const maxUnread = Math.max.apply(null, [...bookList.map(b => b.CountUnread + 0), 10])
    const statusList = [...new Set(bookList.map(b => b.Status))]
    const unreadHeader = <>
        <Button onClick={()=>handleSort("unread")}>Unread{ sortColumn === "unread" ? sortDesc ? <ArrowDownward/> : <ArrowUpward/> : <></> }</Button>
        <UnreadFilter
            filter={{value: unreadFilter, mode: unreadFilterMode}}
            openElement={openElement.unread}
            onFilterOpen={onFilterOpen}
            onFilterClose={onFilterClose}
            onFilterClear={onFilterClear}
            maxUnread={maxUnread}
        /></>
    const statusHeader = <>
        <Button onClick={()=>handleSort("status")}>Status{ sortColumn === "status" ? sortDesc ? <ArrowDownward/> : <ArrowUpward/> : <></> }</Button>
        <StatusFilter
            filter={statusFilter}
            openElement={openElement.status}
            onFilterOpen={onFilterOpen}
            onFilterClose={onFilterClose}
            onFilterClear={onFilterClear}
            statusList={statusList}
        />
        </>
    const titleHeader = <>
        <Button onClick={()=>handleSort("title")}>Book Title{ sortColumn === "title" ? sortDesc ? <ArrowDownward/> : <ArrowUpward/> : <></> }</Button>
        <TitleFilter
            filter={titleFilter}
            openElement={openElement.title}
            onFilterOpen={onFilterOpen}
            onFilterClose={onFilterClose}
            onFilterClear={onFilterClear}
        />
        </>
    
    return (<>
        <BrowserView>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell sx={{whiteSpace: 'nowrap'}}>{unreadHeader}</TableCell>
                        <TableCell sx={{whiteSpace: 'nowrap'}}>{statusHeader}</TableCell>
                        <TableCell sx={{whiteSpace: 'nowrap'}}>{titleHeader}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((x, i) => (
                        <BookListItem key={i} book={x} expanded={expanded} onExpand={handleExpand} selectedSite={selectedSite} onReloadBook={onReloadBook} siteList={siteList} />
                    ))}
                </TableBody>
            </Table>
        </BrowserView>
        <MobileView>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell/>
                        <TableCell colSpan={2} sx={{whiteSpace: 'nowrap'}}>{titleHeader}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell sx={{whiteSpace: 'nowrap'}}>{unreadHeader}</TableCell>
                        <TableCell sx={{whiteSpace: 'nowrap'}}>{statusHeader}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((x, i) => (
                        <BookListItem key={i} book={x} expanded={expanded} onExpand={handleExpand} selectedSite={selectedSite} onReloadBook={onReloadBook} siteList={siteList} />
                    ))}
                </TableBody>
            </Table>
        </MobileView>
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