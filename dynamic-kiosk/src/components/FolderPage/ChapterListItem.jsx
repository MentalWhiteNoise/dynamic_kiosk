import React from "react";
import { TableCell, TableRow, IconButton, Button, Tooltip } from "@mui/material";
import { OpenInBrowser, Bookmark } from "@mui/icons-material";

const openInNewTab = (url) => {
    //console.log("here:", url)
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
}
export default function ChapterListItem(props){
    const {chapter, link, onFlagRead} = props;
    return (
        <TableRow>
            <TableCell>{chapter.ChapterNumber}</TableCell>
            <TableCell>
                <Button onClick={() => openInNewTab(link.HRef)}>
                    <OpenInBrowser/>
                    {chapter.ChapterTitle}
                </Button>
            </TableCell>
            <TableCell>{link.DateUploaded ? new Date(link.DateUploaded).toLocaleDateString("en-uS") : ""}</TableCell>
            <TableCell>                
                <Tooltip title="Flag Read">
                <IconButton onClick={(e) => onFlagRead(chapter.ChapterNumber)}>
                    <Bookmark/>
                </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    )
}