import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import BookListItem from './BookListItem'

export default function BookList(props){
    let { bookList } = props;
    return (<>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Book Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Number Unread</TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {bookList.map((x, i) => (
                    <BookListItem key={i} book={x}/>
                ))}
            </TableBody>
        </Table>
    </>)
}