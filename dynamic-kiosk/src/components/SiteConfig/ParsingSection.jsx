import React, {} from "react";
import { Paper, IconButton, Table, TableHead, TableRow, TableBody, TableCell, TextField, Select, MenuItem } from "@mui/material";
import { Add, Delete, DragIndicator } from '@mui/icons-material';
import ParsingMethod from "./ParsingMethod";
//import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


export default function ParsingSection(props){
    const {parsingArray, onMethodChange, onStringChange, onRemove, onAdd, onReorder} = props
    //console.log(label, parsingArray)
    const onDragEnd = ({ destination, source }) => {
        // dropped outside the list
        if (!destination) return;
        onReorder(parsingArray, source.index, destination.index)
      };
    return (
        <Paper>
            <DragDropContext onDragEnd={onDragEnd}>
                <Table sx={{width:"50%"}} size="small">
                    <TableHead><TableRow>
                        <TableCell sx={{padding: 0}}></TableCell>
                        <TableCell sx={{padding: 0}}>Method</TableCell>
                        <TableCell sx={{padding: 0}}>Search String</TableCell>
                        <TableCell sx={{padding: 0}}></TableCell>
                    </TableRow></TableHead>
                    <Droppable droppableId="droppable-list">
                    {(provider) => (
                        <TableBody ref={provider.innerRef} {...provider.droppableProps} sx={{padding: 0}}>
                        {(parsingArray || []).map((x, i) => (
                            <Draggable key={i} draggableId={"drag_" + i} index={i} sx={{padding: 0}}>
                            {(provider) => (
                                <TableRow
                                key={i}
                                sx={{ "&:last-child td, &:last-child th": { border: 0, padding: 0, width: "0px" }}}
                                {...provider.draggableProps}
                                ref={provider.innerRef}
                                >
                                <TableCell sx={{padding: 0}}
                                    component="th"
                                    scope="row"
                                    {...provider.dragHandleProps}
                                >
                                    <DragIndicator/>
                                </TableCell>
                                <TableCell sx={{padding: 0, minWidth: "250px"}}>
                                    <Select
                                        size="small"
                                        value={x.method}
                                        labelId="method-select-label"
                                        sx={{minWidth: "100px"}}
                                        onChange={(event) => onMethodChange(parsingArray,i,event.target.value)}>
                                        <MenuItem value="readPast">readPast</MenuItem>
                                        <MenuItem value="readUntil">readUntil</MenuItem>
                                        <MenuItem value="trim">trim</MenuItem>
                                        <MenuItem value="movePastTag">movePastTag</MenuItem>
                                        <MenuItem value="cleanHtmlText">cleanHtmlText</MenuItem>
                                        <MenuItem value="readAfterLast">readAfterLast</MenuItem>
                                        <MenuItem value="regexMatch">regexMatch</MenuItem>
                                        <MenuItem value="toLower">toLower</MenuItem>
                                        <MenuItem value="prepend">prepend</MenuItem>
                                        <MenuItem value="movePastElement">movePastElement</MenuItem>
                                        <MenuItem value="remove">remove</MenuItem>
                                        <MenuItem value="removeOrdinalIndicator">removeOrdinalIndicator</MenuItem>
                                    </Select>
                                </TableCell>
                                <TableCell sx={{padding: 0, minWidth: "250px"}}>
                                    { (x.method === "readPast" || x.method === "readUntil" || x.method === "readAfterLast" || x.method === "regexMatch" || x.method === "prepend" || x.method === "remove") ? (<>
                                        <TextField size="small" value={x.string} sx={{minWidth: "250px"}} error={!x.string} onChange={(event) => onStringChange(parsingArray,i,event.target.value)}/>
                                        </>) : <></> }
                                </TableCell>
                                <TableCell sx={{padding: 0, width: "0px"}}><IconButton onClick={() => onRemove(parsingArray, i)}><Delete/></IconButton></TableCell>
                                </TableRow>
                            )}
                            </Draggable>
                        ))}
                        {provider.placeholder}
                        </TableBody>
                    )}
                    </Droppable>
                </Table>
            </DragDropContext>
            <IconButton onClick={() => onAdd(parsingArray)}><Add/></IconButton>
        </Paper>)
}