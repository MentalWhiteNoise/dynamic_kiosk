//import { ListItem } from "@mui/material";
import { Table, TableBody, TableRow, TableCell, Button, TableHead, TablePagination, List, ListItem } from "@mui/material";
import React, { useState } from "react";
import SiteStatus from "../SiteStatus";
import ColumnSelection from "./ColumnSelection";
import { Link, useSearchParams } from "react-router-dom";
import { TextFilter, IntRangeFilter, OptionFilter, DateFilter } from "../TableHelpers/Filters";
import ColumHeader from "../TableHelpers/ColumnHeader"
import { openInNewTab, formatDate, applyColumnSort } from "../../helpers/sharedFunctions"

export default function SearchResults(props){
    let [searchParams, setSearchParams] = useSearchParams();
    const {searchResults} = props

    const setSearchFilter = (property, filterText) => {
        const paramObject = Object.fromEntries([...searchParams])
        if (filterText == null){
            delete paramObject[property]
            setSearchParams({...paramObject})
        }
        else
            setSearchParams({...paramObject, [property]: filterText})
    }
    const titleFilter = searchParams.get("title");
    const statusFilter = searchParams.get("status");
    const folderFilter = searchParams.get("folder");
    const altTitleFilter = searchParams.get("altTitle");
    const unreadFilter = searchParams.get("unread") === null ? null : searchParams.get("unread").substring(1);
    const unreadFilterMode = searchParams.get("unread") === null ? "gt": searchParams.get("unread")[0] === "<" ? "lt" : "gt";
    const lastCheckedFilter = searchParams.get("lastChecked") === null ? null : searchParams.get("lastChecked").substring(1);
    const lastCheckedFilterMode = searchParams.get("lastChecked") === null ? "gt": searchParams.get("lastChecked")[0] === "<" ? "lt" : "gt";
    const lastPostedFilter = searchParams.get("lastPosted") === null ? null : searchParams.get("lastPosted").substring(1);
    const lastPostedFilterMode = searchParams.get("lastPosted") === null ? "gt": searchParams.get("lastPosted")[0] === "<" ? "lt" : "gt";
    const [getDisplayColumns, setGetDisplayColumns] = useState(false)
    const [displayColumns, setDisplayColumns] = useState(["Title", "Folder", "Status", "Chapter Counts", "Last Posted"])
    const [sortColumn, setSortColumn] = useState("Title");
    const [sortDesc, setSortDesc] = useState("false");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const onFilterApply = (item, value) =>{
        setSearchFilter(item, value) 
    }
    const onFilterClear = (item) =>{
        setSearchFilter(item, null) 
    }
    const handleSort = (column) => {
        //console.log("handleSort", sortColumn, column, sortDesc)
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
    if (!searchResults) return <></>
    if (searchResults.length === 0) return <>No books found</> 
    
    const filterAmount = unreadFilter === null ? null : parseInt(unreadFilter);
    //console.log(filterAmount)
    //console.log(filter.unread.filter.mode)
    const flattenedResults = searchResults.map(b => b.Sites.map(s => {return { ...s, Id: b.Id, Title: b.Title, AltTitles: b.AltTitles, Folder: b.Folder }})).flat()
    const filteredItems = flattenedResults.filter(b => {
        if (statusFilter !== null && b.Status !== statusFilter)
            return false;
        if (folderFilter !== null && b.Folder !== folderFilter)
            return false;
        if (titleFilter !== null && !b.Title.toLowerCase().match(titleFilter.toLowerCase()))
            return false;
        if (altTitleFilter !== null && b.AltTitles.filter(a => a.toLowerCase().match(altTitleFilter.toLowerCase())).length === 0)
            return false;
        if (filterAmount !== null && (
                b.CountUnread == null
                || (b.CountUnread <= filterAmount && unreadFilterMode === "gt")
                || (b.CountUnread >= filterAmount && unreadFilterMode === "lt")
            ))
            return false;
        if (lastCheckedFilter !== null && (
                b.LastAttempted == null
                || (b.LastAttempted <= lastCheckedFilter && lastCheckedFilterMode === "gt")
                || (b.LastAttempted >= lastCheckedFilter && lastCheckedFilterMode === "lt")
            ))
            return false;
        if (lastPostedFilter !== null && (
                b.LastPosted == null
                || (b.LastPosted <= lastPostedFilter && lastPostedFilterMode === "gt")
                || (b.LastPosted >= lastPostedFilter && lastPostedFilterMode === "lt")
            ))
            return false;
        return true;
    })
    const sortedResults = filteredItems.sort((a,b) => {
        if (sortColumn === "Title") return applyColumnSort (a, b, "Title", sortDesc)
        if (sortColumn === "Folder") return applyColumnSort (a, b, "Folder", sortDesc, "Title")
        if (sortColumn === "Site") return applyColumnSort (a, b, "Site", sortDesc, "Title")
        if (sortColumn === "Status") return applyColumnSort (a, b, "Status", sortDesc, "Title")
        if (sortColumn === "Chapter Counts") return applyColumnSort (a, b, "CountUnread", sortDesc, "Title")
        if (sortColumn === "Last Checked") return applyColumnSort (a, b, "LastAttempted", sortDesc, "Title")
        if (sortColumn === "Last Posted") return applyColumnSort (a, b, "LastPosted", sortDesc, "Title")
        return 0
    })
    .slice((page - 1) * pageSize, page * pageSize)
    
    const maxUnread = Math.max.apply(null, [...searchResults.map(b => b.CountUnread + 0), 10])
    const statusOptions = [...new Set(searchResults.map(b => b.Status))].map(s => {return { label: (<SiteStatus status={s} checkingTriggered={false}/>), value:s}})
    const folderOptions = [...new Set(searchResults.map(b => b.Folder))]
    return (<>  
        <Button onClick={() => {setGetDisplayColumns(true)}}>Select Columns</Button>
        <ColumnSelection
            open={getDisplayColumns}
            onChange={(c) => {setDisplayColumns(c); setGetDisplayColumns(false)}}
            onClose={() => {setGetDisplayColumns(false)}}
            columnList={displayColumns}
        />
        <Table size="small" stickyHeader>
            <TableHead>
                <TableRow>
                    { displayColumns.includes("Image") ? <TableCell sx={{whiteSpace: "nowrap"}}><ColumHeader text="Image" /></TableCell> : <></>}
                    { displayColumns.includes("Title") ? <TableCell sx={{whiteSpace: "nowrap"}}>
                        <ColumHeader text="Title" sort={sortColumn === "Title" ? sortDesc ? "desc" : "asc" : null} onSortClick={handleSort} />
                        <TextFilter
                            filter={titleFilter}
                            onFilterClear={() => onFilterClear("title")}
                            onFilterApply={(v) => onFilterApply("title", v)}
                            label="Title"
                        />
                        </TableCell> : <></>}
                    { displayColumns.includes("Alternate Titles") ? <TableCell sx={{whiteSpace: "nowrap"}}>
                        <ColumHeader text="Alternate Titles" />
                        <TextFilter
                            filter={titleFilter}
                            onFilterClear={() => onFilterClear("altTitle")}
                            onFilterApply={(v) => onFilterApply("altTitle", v)}
                            label="Alternate Title"
                        />
                        </TableCell> : <></>}
                    { displayColumns.includes("Folder") ? <TableCell sx={{whiteSpace: "nowrap"}}>
                        <ColumHeader text="Folder" sort={sortColumn === "Folder" ? sortDesc ? "desc" : "asc" : null} onSortClick={handleSort} />
                        <OptionFilter
                            filter={folderFilter}
                            onFilterApply={(v) => onFilterApply("folder", v)}
                            onFilterClear={() => onFilterClear("folder")}
                            options={folderOptions}
                        />
                        </TableCell> : <></>}
                    { displayColumns.includes("Site Url") ? <TableCell sx={{whiteSpace: "nowrap"}}>
                        <ColumHeader text="Site" sort={sortColumn === "Site" ? sortDesc ? "desc" : "asc" : null} onSortClick={handleSort} />
                        </TableCell> : <></>}
                    { displayColumns.includes("Status") ? <TableCell sx={{whiteSpace: "nowrap"}}>
                        <ColumHeader text="Status" sort={sortColumn === "Status" ? sortDesc ? "desc" : "asc" : null} onSortClick={handleSort} />
                        <OptionFilter
                            filter={statusFilter}
                            onFilterApply={(v) => onFilterApply("status", v)}
                            onFilterClear={() => onFilterClear("status")}
                            options={statusOptions}
                        />
                        </TableCell> : <></>}
                    { displayColumns.includes("Chapter Counts") ? <TableCell sx={{whiteSpace: "nowrap"}}>
                        <ColumHeader text="Chapter Counts" sort={sortColumn === "Chapter Counts" ? sortDesc ? "desc" : "asc" : null} onSortClick={handleSort} />
                        <IntRangeFilter
                            filter={{value: unreadFilter, mode: unreadFilterMode}}
                            onFilterClear={() => onFilterClear("unread")}
                            onFilterApply={(v) => onFilterApply("unread", v)}
                            maxUnread={maxUnread || 100}
                            label="Unread Count"
                        />
                        </TableCell> : <></>}
                    { displayColumns.includes("Last Checked") ? <TableCell sx={{whiteSpace: "nowrap"}}>
                        <ColumHeader text="Last Checked" sort={sortColumn === "Last Checked" ? sortDesc ? "desc" : "asc" : null} onSortClick={handleSort} />
                        <DateFilter
                            filter={{value: lastCheckedFilter, mode: lastCheckedFilterMode}}
                            onFilterClear={() => onFilterClear("lastChecked")}
                            onFilterApply={(v) => onFilterApply("lastChecked", v)}
                            label="Last Checked"
                        />
                        </TableCell> : <></>}
                    { displayColumns.includes("Last Posted") ? <TableCell sx={{whiteSpace: "nowrap"}}>
                        <ColumHeader text="Last Posted" sort={sortColumn === "Last Posted" ? sortDesc ? "desc" : "asc" : null} onSortClick={handleSort} />
                        <DateFilter
                            filter={{value: lastPostedFilter, mode: lastPostedFilterMode}}
                            onFilterClear={() => onFilterClear("lastPosted")}
                            onFilterApply={(v) => onFilterApply("lastPosted", v)}
                            label="Last Posted"
                        />
                        </TableCell> : <></>}
                </TableRow>
            </TableHead>
            <TableBody>
                {sortedResults.map((book, key) => (
                    <TableRow key={key}>
                        { displayColumns.includes("Image") ? <TableCell>
                            <img
                                src={book.Image}
                                loading="lazy"
                                alt=""
                                style={{
                                    maxWidth: "100px",
                                    maxHeight: "100px",
                                    width: "auto",
                                    height: "auto"
                                }}
                            /></TableCell> : <></>}
                        { displayColumns.includes("Title") ? <TableCell><Button component={Link} to={`/book/${book.Id}`}>{book.Title}</Button></TableCell> : <></>}
                        { displayColumns.includes("Alternate Titles") ? <TableCell>
                            <List size="small">
                            {
                                book.AltTitles.map((a, i) => (
                                    <ListItem size="small" key={i}>{a}</ListItem>
                                ))
                            }
                            </List>
                            </TableCell> : <></>}
                        { displayColumns.includes("Folder") ? <TableCell><Button component={Link} to={`/folder/${book.Folder}`}>{book.Folder}</Button></TableCell> : <></>}
                        { displayColumns.includes("Site Url") ? <TableCell><Button sx={{textTransform: "none"}} onClick={() => openInNewTab(book.Url)}>{book.Url}</Button></TableCell> : <></>}
                        { displayColumns.includes("Status") ? <TableCell><SiteStatus status={book.Status}/></TableCell> : <></>}
                        { displayColumns.includes("Chapter Counts") ? <TableCell>{book.CountRead + book.CountUnread} ({book.CountUnread} unread)</TableCell> : <></>}
                        { displayColumns.includes("Last Checked") ? <TableCell>{formatDate(book.LastAttempted)}</TableCell> : <></>}
                        { displayColumns.includes("Last Posted") ? <TableCell>{formatDate(book.LastPosted)}</TableCell> : <></>}
                    </TableRow>

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