import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import { TableCell, TableRow, IconButton, CircularProgress } from "@mui/material";
import { Update, Bookmark, BookmarkBorder, Edit, AutoStories } from '@mui/icons-material';
import SiteStatus from "../SiteStatus"


export default function BookListItem(props){
    const {book} = props;
    console.log(book.Id)
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch(`http://localhost:3000/book/${book.Id}/chapters`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setData(data)
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            })
    }, [book.Id])
    const unreadCount = data ? data.filter(x => x.Read === false).length : 0;
    const readCount = data ? data.filter(x => x.Read === false).length : 0;
    if (loading) 
        return <TableRow><TableCell colSpan={4}><CircularProgress/></TableCell></TableRow>
    if (error)
        return <TableRow><TableCell colSpan={4}>Error encountered loading book data: {error}</TableCell></TableRow>
    return (<><TableRow>
        <TableCell rowSpan={1 + book.Sites.length} padding="none"><img
            src={book.Sites[0].Image}
            alt={book.Title}
            loading="lazy"
            style={{
                maxWidth: "100px",
                maxHeight: "100px",
                width: "auto",
                height: "auto"
            }}
            />
        </TableCell>
        <TableCell>{book.Title}</TableCell>
        <TableCell/>
        <TableCell sx={{whiteSpace: "nowrap"}}>
            {data ? data.filter(x => x.Read === false).length : ""}
            { data ? data.filter(x => x.Read === false).length > 0 ? (
            <IconButton>
                <AutoStories/> {/* Read unread */}
            </IconButton>) : <></> : <></> }
        </TableCell>
        <TableCell sx={{whiteSpace: "nowrap"}}>
            <IconButton disabled={unreadCount === 0}>
                <Bookmark/> {/* Flag all Read */}
            </IconButton>
            <IconButton disabled={readCount === 0}>
                <BookmarkBorder/> {/* Flag all Unread */}
            </IconButton>
            <IconButton component={Link} to={`/book/${book.Id}`}>
                <Edit/> {/* Edit Book */}
            </IconButton>
        </TableCell>
        </TableRow>
        { book.Sites.map((site, i) => (
        <TableRow key={i}>
        <TableCell>
            {site.Url}
        </TableCell>
        <TableCell sx={{whiteSpace: "nowrap"}}>
            <SiteStatus 
                site={site}
                chapterList={data}
                checkingTriggered={false}
                checkingComplete={false}
            />
        </TableCell>
        <TableCell/>
        <TableCell sx={{whiteSpace: "nowrap"}}>
            <IconButton >
                <Update/> {/* Check for updates */}
            </IconButton>
        </TableCell>

        </TableRow>
        ))
        }
        </>)
}