import React, {} from "react";
import { Paper, IconButton, Table, TableHead, TableRow, TableBody, TableCell, TextField } from "@mui/material";
import { Add, Delete } from '@mui/icons-material';


export default function InTextList(props){
    const {valueList, onStringChange, onRemove, onAdd} = props
    return (
        <Paper>
            <Table sx={{width:"50%"}} size="small">
                <TableHead><TableRow>
                    <TableCell sx={{padding: 0}}>Filter for Values In</TableCell>
                    <TableCell sx={{padding: 0}}></TableCell>
                </TableRow></TableHead>
                <TableBody sx={{padding: 0}}>
                {(valueList || []).map((x, i) => (
                        <TableRow
                        key={i}
                        sx={{ "&:last-child td, &:last-child th": { border: 0, padding: 0, width: "0px" }}}
                        >
                        <TableCell sx={{padding: 0, minWidth: "250px"}}>
                                <TextField size="small" value={x} sx={{minWidth: "250px"}} error={!x} onChange={(event) => onStringChange(valueList,i,event.target.value)}/>
                        </TableCell>
                        <TableCell sx={{padding: 0, width: "0px"}}><IconButton onClick={() => onRemove(valueList, i)}><Delete/></IconButton></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <IconButton onClick={() => onAdd(valueList)}><Add/></IconButton>
        </Paper>)
}