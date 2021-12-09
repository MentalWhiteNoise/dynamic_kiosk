import React, {} from "react";
import { Paper, FormControlLabel, Checkbox, IconButton, FormLabel, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Add, Delete, DragIndicator, ExpandMore } from '@mui/icons-material';
import ParsingMethod from "./ParsingMethod";
//import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


export default function ParsingSection(props){
    const {label, optional, parsingArray, onMethodChange, onStringChange, onRemove, onAdd, onToggle, onReorder, onExpandChange, expanded} = props
    const enabled = parsingArray != null
    //console.log(label, parsingArray)
    const onDragEnd = ({ destination, source }) => {
        // dropped outside the list
        if (!destination) return;
        onReorder(parsingArray, source.index, destination.index)
      };
    return (
    <Paper>
    <Accordion expanded={expanded} onChange={(e, i) => {onExpandChange(i && (optional === false || enabled))}}>
        <AccordionSummary
          expandIcon={<ExpandMore />}>
        {optional ? (<FormControlLabel 
            control={(<Checkbox 
                    checked={enabled} 
                    onChange={(event) => onToggle(event.target.checked)}
                />)} 
            label={label} />) : (<FormLabel>{label}</FormLabel>)
        }
        </AccordionSummary>
        <AccordionDetails>
        {
            (optional === false || enabled) ?
            (<>
            <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable-list">
                {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                    {(parsingArray || []).map((x, i) => (
                        <Draggable key={i} draggableId={"drag_" + i} index={i}>
                        {(provided, snapshot) => (
                        <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                        >
                        <DragIndicator/>
                            <ParsingMethod
                                index={i}
                                method={x.method}
                                string={x.string}
                                onMethodChange={(v) => onMethodChange(parsingArray,i,v)}
                                onStringChange={(v) => onStringChange(parsingArray,i,v)}
                                />
                            <IconButton onClick={() => onRemove(parsingArray, i)}><Delete/></IconButton>
                        </Paper>
                        )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
                )}
            </Droppable>
            </DragDropContext>
            <IconButton onClick={() => onAdd(parsingArray)}><Add/></IconButton></>) : <></>
        }
        </AccordionDetails>
    </Accordion>
    </Paper>)
}