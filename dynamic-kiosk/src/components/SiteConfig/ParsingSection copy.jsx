import React, {} from "react";
import { Paper, FormControlLabel, Checkbox, IconButton, Table, TableBody, TableRow, TableCell, FormLabel } from "@mui/material";
import { Add, Delete } from '@mui/icons-material';
import ParsingMethod from "./ParsingMethod";
//import { Link } from "react-router-dom";

export default function ParsingSection(props){
    const {label, optional, parsingArray, onMethodChange, onStringChange, onRemove, onAdd, onToggle} = props
    const enabled = parsingArray != null
    //console.log(label, parsingArray)
    return (
    <Paper>
        {optional ? (<FormControlLabel 
            control={(<Checkbox 
                    checked={enabled} 
                    onChange={(event) => onToggle(event.target.checked)}
                />)} 
            label={label} />) : (<FormLabel>{label}</FormLabel>)
        }
        {
            (optional === false || enabled) ?
            (<>
            <Table size="small">
                <TableBody>
                    {(parsingArray || []).map((x, i) => (
                            <TableRow key={i}>
                                <TableCell>
                    <ParsingMethod
                        method={x.method}
                        string={x.string}
                        onMethodChange={(v) => onMethodChange(parsingArray,i,v)}
                        onStringChange={(v) => onStringChange(parsingArray,i,v)}
                        />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => onRemove(parsingArray, i)}><Delete/></IconButton>
                                </TableCell>
                            </TableRow>
                            ))
                    }
                </TableBody>
            </Table>
            <IconButton onClick={() => onAdd(parsingArray)}><Add/></IconButton></>) : <></>
        }
    </Paper>)
}