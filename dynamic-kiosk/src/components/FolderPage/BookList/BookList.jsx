import React, {useState} from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, TablePagination } from "@mui/material";
import BookListItem from './BookListItem'
import {BrowserView, MobileView} from 'react-device-detect';
import  { useSearchParams } from "react-router-dom";
import { applyColumnSort } from "../../../helpers/sharedFunctions";
import ColumnHeader from "../../TableHelpers/ColumnHeader";
import { TextFilter, IntRangeFilter, OptionFilter } from "../../TableHelpers/Filters";
import SiteStatus from "../../SiteStatus";

export default function BookList(props){
    let { bookList, selectedSite, onReloadBook, siteList, updateList } = props;
    let [searchParams, setSearchParams] = useSearchParams();
    const clearSerarchFilter = (setting) => {
        const paramObject = Object.fromEntries([...searchParams])
        delete paramObject[setting]
        setSearchParams({...paramObject})
    }
    const setSearchFilter = (newSettings) => {
        const paramObject = Object.fromEntries([...searchParams])
        setSearchParams({...paramObject, ...newSettings})
    }
    // Add paging; add sorting...
    const titleFilter = searchParams.get("title");
    const statusFilter = searchParams.get("status");
    const unreadFilter = searchParams.get("unread") === null ? null : searchParams.get("unread").substring(1);
    const unreadFilterMode = searchParams.get("unread") === null ? "gt": searchParams.get("unread")[0] === "<" ? "lt" : "gt";

    const page = searchParams.get("page") ?? 1;
    const pageSize = searchParams.get("pageSize") ?? 10;
    const sortColumn = searchParams.get("sortColumn") ?? "title";
    const sortDesc = searchParams.get("sortDesc") == "true";
    
    //console.log(bookList[0])
    const [expanded, setExpanded] = useState(null);
    //const [page, setPage] = useState(1);
    //const [pageSize, setPageSize] = useState(10);
    //const [sortColumn, setSortColumn] = useState("title");
    //const [sortDesc, setSortDesc] = useState("false");

    const handleExpand = (index) => {
        //console.log("here", index)
        if (expanded === index)
            setExpanded(null)
        else
            setExpanded(index)
    }
    const handleSort = (column) => {
        //console.log("handleSort", sortColumn, column, sortDesc)
        if (column === sortColumn)
        {
            setSearchFilter({"sortDesc": !sortDesc})
        }
        else
        {
            setSearchFilter({"sortColumn": column, "sortDesc": false})
        }
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
            if (sortColumn === "title") return applyColumnSort (a, b, "Title", sortDesc)
            if (sortColumn === "unread") return applyColumnSort (a, b, "CountUnread", sortDesc, "Title")
            if (sortColumn === "status") return applyColumnSort (a, b, "Status", sortDesc, "Title")
            return 0
        })
        .slice((page - 1) * pageSize, page * pageSize)

    const maxUnread = Math.max.apply(null, [...bookList.map(b => b.CountUnread + 0), 10])
    const statusOptions = bookList == null ? null : [...new Set(bookList.map(b => b.Status))].map(s => {return { label: (<SiteStatus status={s} checkingTriggered={false}/>), value:s}})
    const unreadHeader = <>
        <ColumnHeader text="Unread" sort={sortColumn === "unread" ? sortDesc ? "desc" : "asc" : null} onSortClick={() => handleSort("unread")} />
        <IntRangeFilter
            filter={{value: unreadFilter, mode: unreadFilterMode}}
            onFilterClear={() => clearSerarchFilter("unread")}
            onFilterApply={(v) => setSearchFilter({"unread": v})}
            maxUnread={maxUnread || 100}
            label="Unread Count"
        />
        </>
    const statusHeader = <>
        <ColumnHeader text="Status" sort={sortColumn === "status" ? sortDesc ? "desc" : "asc" : null} onSortClick={() => handleSort("status")} />
        <OptionFilter
            filter={statusFilter}
            onFilterClear={() => clearSerarchFilter("status")}
            onFilterApply={(v) => setSearchFilter({"status": v})}
            options={statusOptions}
        />
        </>
    const titleHeader = <>
        <ColumnHeader text="Book Title" sort={sortColumn === "title" ? sortDesc ? "desc" : "asc" : null} onSortClick={() => handleSort("title")} />
        <TextFilter
            filter={titleFilter}
            onFilterClear={() => clearSerarchFilter("title")}
            onFilterApply={(v) => setSearchFilter({"title": v})}
            label="Title"
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
                        <BookListItem key={i} book={x} expanded={expanded} onExpand={handleExpand} selectedSite={selectedSite} onReloadBook={onReloadBook} siteList={siteList} loading={updateList.filter(u => u.bookId === x.Id)} />
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
            onPageChange={(e,v) => setSearchFilter({"page": v+1})}
            onRowsPerPageChange={(e) => setSearchFilter({"pageSize": e.target.value+0})}
        />
    </>)
}