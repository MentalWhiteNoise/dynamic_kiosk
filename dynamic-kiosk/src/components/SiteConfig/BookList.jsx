import React, {} from "react";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Tooltip, IconButton, Link } from "@mui/material";
import AssistantIcon from '@mui/icons-material/Assistant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { tableCellClasses } from '@mui/material/TableCell';
//import { Link } from "react-router-dom";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      //backgroundColor: theme.palette.common.black,
      //color: theme.palette.common.white,
      fontSize: 14,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
    }));

function formatDate(dateString){
    if (dateString && dateString.length > 10) {
        return dateString.substring(0,9)
    }
}
export default function BookList(props) {
    const {site, bookList, onSelectExampleUrl, editMode} = props;
    const navigate = useNavigate();
    const onBookClick = (id) =>{
        navigate(`/book/${id}`)
    }
    /*console.log(site)
    for (var bk of bookList){
        console.log(bk)
    }*/
    return (
        <TableContainer component={Paper}>
            <Table  size="small" aria-label="simple table">
                <TableHead>
                <TableRow>
                    <StyledTableCell><b>Title</b></StyledTableCell>
                    <StyledTableCell><b>Folder</b></StyledTableCell>
                    <StyledTableCell><b>Url</b></StyledTableCell>
                    <StyledTableCell><b>Last Attempted</b></StyledTableCell>
                    <StyledTableCell><b>Last Successful</b></StyledTableCell>
                    <StyledTableCell><b>Status</b></StyledTableCell>
                    <StyledTableCell><b>Last Chapter Read</b></StyledTableCell>

                </TableRow>
                </TableHead>
                <TableBody>
                {(bookList ?? []).map((row) => (
                    <StyledTableRow key={row.Id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <StyledTableCell>
                        <Tooltip title="Goto Book Page">
                            { // PresentToAll, OpenInBrowser, Newspaper, MenuBook, LocalLibrary, ImportContacts, FileOpen
                            }
                            <IconButton size="small" onClick={(e) => {onBookClick(row.Id)}}>
                                <MenuBookIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                        {row.Title}
                    </StyledTableCell>
                    <StyledTableCell>{row.Folder}</StyledTableCell>
                    <StyledTableCell>
                        { editMode ? (
                        <Tooltip title="Use as example URL">
                            <IconButton aria-label="Use as example URL" size="small" onClick={(e) => {onSelectExampleUrl(row.Sites.filter((x) => x.Url.toLowerCase().startsWith(site.site.toLowerCase()))[0].Url)}}>
                                <AssistantIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>) : <IconButton aria-label="Use as example URL" size="small" disabled={true}><AssistantIcon fontSize="inherit" /></IconButton>
                        }
                        <a href={row.Sites.filter((x) => x.Url && x.Url.toLowerCase().startsWith(site.site.toLowerCase()))[0].Url} target="_blank">{row.Sites.filter((x) => x.Url.toLowerCase().startsWith(site.site.toLowerCase()))[0].Url}</a></StyledTableCell>
                    <StyledTableCell>{formatDate(row.Sites.filter((x) => x.Url.toLowerCase().startsWith(site.site.toLowerCase()))[0].LastAttempted)}</StyledTableCell>
                    <StyledTableCell>{formatDate(row.Sites.filter((x) => x.Url.toLowerCase().startsWith(site.site.toLowerCase()))[0].LastSuccessful)}</StyledTableCell>
                    <StyledTableCell>{row.Sites.filter((x) => x.Url.toLowerCase().startsWith(site.site.toLowerCase()))[0].Status}</StyledTableCell>
                    <StyledTableCell>{(row.LastChapterRead) ? row.LastChapterRead.ChapterNumber : ""}</StyledTableCell>
                    </StyledTableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>)
}