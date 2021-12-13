import React from "react";
import { TableCell, TableRow, IconButton, Button, Tooltip } from "@mui/material";
import { OpenInBrowser, Bookmark } from "@mui/icons-material";

const openInNewTab = (url) => {
    //console.log("here:", url)
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
}
const formatDate= (date) =>{
  if (date == null) return null
  return (new Date(date)).toISOString().substring(0,10)
}
export default function ChapterListItem(props){
    const {chapter, link, onFlagRead} = props;
    return (
        <TableRow>
            <TableCell>{chapter.ChapterNumber}</TableCell>
            <TableCell>                
                <Tooltip title="Flag Read">
                <IconButton onClick={(e) => onFlagRead(chapter.ChapterNumber)}>
                    <Bookmark/>
                </IconButton>
                </Tooltip>
            </TableCell>
            <TableCell>
                <Button onClick={() => openInNewTab(link.HRef)}>
                    <OpenInBrowser/>
                    {chapter.ChapterTitle}
                </Button>
            </TableCell>
            <TableCell>{formatDate(link.DateUploaded)}</TableCell>
        </TableRow>
    )
}