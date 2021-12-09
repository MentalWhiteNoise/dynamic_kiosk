import React, {useState} from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";
import BookListItem from './BookListItem'
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

export default function BookList(props){
    let { bookList, selectedSite, onReloadBook, siteList, onSort, sortColumn, sortDesc } = props;
    //console.log(bookList[0])
    const [expanded, setExpanded] = useState(null);
    const handleExpand = (index) => {
        //console.log("here", index)
        if (expanded === index)
            setExpanded(null)
        else
            setExpanded(index)
    }
    return (<>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell colSpan={2}><Button onClick={()=>onSort("title")}>Book Title{ sortColumn === "title" ? sortDesc ? <ArrowDownward/> : <ArrowUpward/> : <></> }</Button></TableCell>
                    <TableCell><Button onClick={()=>onSort("status")}>Status{ sortColumn === "status" ? sortDesc ? <ArrowDownward/> : <ArrowUpward/> : <></> }</Button></TableCell>
                    <TableCell><Button onClick={()=>onSort("unread")}>Number Unread{ sortColumn === "unread" ? sortDesc ? <ArrowDownward/> : <ArrowUpward/> : <></> }</Button></TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {bookList.map((x, i) => (
                    <BookListItem key={i} book={x} expanded={expanded} onExpand={handleExpand} selectedSite={selectedSite} onReloadBook={onReloadBook} siteList={siteList} />
                ))}
            </TableBody>
        </Table>
    </>)
}