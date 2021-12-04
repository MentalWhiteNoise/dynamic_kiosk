import React, {} from "react";
import { Paper, FormControlLabel, Checkbox, IconButton, Table, TableBody, TableRow, TableCell, FormLabel } from "@mui/material";
import { Add, Delete } from '@mui/icons-material';
import NavigationMethod from "./NavigationMethod";
//import { Link } from "react-router-dom";

export default function NavigationSection(props){
    const {label, optional, navigationArray, onMethodChange, onPropertyChange, onRemove, onAdd, onToggle} = props
    const enabled = navigationArray != null
    //console.log(label, navigationArray)
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
                    {(navigationArray || []).map((x, i) => (
                            <TableRow key={i}>
                                <TableCell>
                    <NavigationMethod
                        method={x.method}
                        properties={x.properties}
                        onMethodChange={(v) => onMethodChange(i,v)}
                        onPropertyChange={(p,v) => onPropertyChange(i,p,v)}
                        />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => onRemove(i)}><Delete/></IconButton>
                                </TableCell>
                            </TableRow>
                            ))
                    }
                </TableBody>
            </Table>
            <IconButton onClick={onAdd}><Add/></IconButton></>) : <></>
        }
    </Paper>)
}