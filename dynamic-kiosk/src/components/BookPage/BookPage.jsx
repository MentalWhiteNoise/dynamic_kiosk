
import { CircularProgress, Stack, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { Box } from "@mui/system";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

export default function BookPage(props){
    let { bookId } = useParams();
    const [book, setBook] = useState(null);
    const [bookLoading, setBookLoading] = useState(true);
    const [bookError, setBookError] = useState(null);
    const [chapterData, setChapterData] = useState(null);
    const [chaptersLoading, setChaptersLoading] = useState(true);
    const [chaptersError, setChaptersError] = useState(null);
    useEffect(() => {
        fetch(`http://localhost:3000/book/${bookId}`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setBook(data)
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
                setBookError(error);
            })
            .finally(() => {
                setBookLoading(false);
            })
        fetch(`http://localhost:3000/book/${bookId}/chapters`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setChapterData(data)
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
                setChaptersError(error);
            })
            .finally(() => {
                setChaptersLoading(false);
            })
    }, [bookId])
    
    if (bookLoading) 
        return <CircularProgress/>
    if (bookError)
        return <>Error encountered loading book data: {bookError}</>
    return (<>
        {bookLoading? <>loading</> : bookError ? <>error encountered loading data for this book: {bookError}</> : (
            <>
            Need to add a form for editing stuff... 
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell rowSpan={3}>
                            <img
                            src={book.Sites[0].Image}
                            alt={book.Title}
                            loading="lazy"
                            style={{
                                maxWidth: "250px",
                                maxHeight: "250px",
                                width: "auto",
                                height: "auto"
                            }}/>
                        </TableCell>
                        <TableCell>{book.Title}</TableCell>
                        <TableCell>{book.Folder}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            Alt Titles: <Stack direction="row">
                                {book.AltTitles.map((alt, i) => (<Box key={i}>{alt}</Box>))}
                            </Stack>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            Sites: 
                            <Table>
                                <TableBody>
                                {book.Sites.map((site, i) => (
                                    <>
                                    <TableRow key={i}>
                                        <TableCell rowSpan={2}>
                                            <img
                                            src={site.Image}
                                            alt={site.SiteId}
                                            loading="lazy"
                                            style={{
                                                maxWidth: "100px",
                                                maxHeight: "100px",
                                                width: "auto",
                                                height: "auto"
                                            }}/>
                                        </TableCell>
                                        <TableCell colSpan={2}>{site.Url}</TableCell>
                                    </TableRow>
                                    <TableRow key={i + "_b"}>
                                        <TableCell>Last Attempted: {new Date(site.LastAttempted).toLocaleDateString()}</TableCell>
                                        <TableCell>Last Successful: {new Date(site.LastSuccessful).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                    </>
                                ))}
                                </TableBody>
                            </Table>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={3}>
                            {chaptersLoading ? <CircularProgress/> : chaptersError ? <>Error loading chapters: {chaptersError}</> : (
                                <>{chapterData.length} Chapters</>
                            )}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </>
        )}
        </>)
}