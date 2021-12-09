import React, {} from "react";
import { TableCell, TableRow, IconButton, Tooltip, Button } from "@mui/material";
import { Update, KeyboardArrowDown, KeyboardArrowUp, Web } from '@mui/icons-material';
import SiteStatus from "../SiteStatus"
import ChapterList from './ChapterList'

const openInNewTab = (url) => {
    console.log("here:", url)
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
}

const BookSiteListItem = (props) => {    
    const {siteRowId, onExpand, expanded, site, checkForUpdate, checkingTriggered, onFlagRead, siteList, book} = props;
    let siteName = siteList.find(s => site.Url.match(s))

    //console.log(site)
    //console.log(lastRead)
    return (
    <React.Fragment key={siteRowId}>
    <TableRow>
    <TableCell>
        <IconButton disabled={site.CountUnread < 1} onClick={(e) => onExpand(siteRowId)}>{(expanded === siteRowId) ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}</IconButton>
    </TableCell>
    <TableCell>
        <Tooltip title= {`Navigate to chapter list: ${site.Url}`}>
        <Button onClick={() => openInNewTab(site.Url)}>
            <Web/>
            Chapter List
        </Button>
        </Tooltip>{siteName}
    </TableCell>
    <TableCell sx={{whiteSpace: "nowrap"}}>
        <SiteStatus 
            status={site.Status}
            checkingTriggered={checkingTriggered}
        />
    </TableCell>
    <TableCell/>
    <TableCell sx={{whiteSpace: "nowrap"}}>
        <Tooltip title="Check for updates">
        <IconButton onClick={(e) => checkForUpdate()} >
            <Update/> {/* Check for updates */}
        </IconButton>
        </Tooltip>
    </TableCell>
    </TableRow>
    {(expanded === siteRowId) ? 
        <ChapterList 
            site={site}
            onFlagRead={onFlagRead}
            book={book}
        />
    : <TableRow></TableRow>
    }
    </React.Fragment>
    )
}
export default BookSiteListItem