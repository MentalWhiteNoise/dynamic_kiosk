import React, {} from "react";
import { Paper, FormControlLabel, Checkbox, IconButton, FormLabel, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Add, Delete, DragIndicator, ExpandMore } from '@mui/icons-material';
import NavigationMethod from "./NavigationMethod";
//import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function NavigationSection(props){
    const {label, optional, navigationArray, onMethodChange, onPropertyChange, onRemove, onAdd, onToggle, onReorder, onExpandChange, expanded} = props
    const enabled = navigationArray != null
    const onDragEnd = ({ destination, source }) => {
        // dropped outside the list
        if (!destination) return;
        onReorder(navigationArray, source.index, destination.index)
      };
    //console.log(label, navigationArray)
    return (
    <Paper>
    <Accordion expanded={expanded} onChange={(e, i) => {onExpandChange(i && (optional === false || enabled))}}>
        <AccordionSummary
          expandIcon={<ExpandMore />}          
          >
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
                    {(navigationArray || []).map((x, i) => (
                        <Draggable key={i} draggableId={"drag_" + i} index={i}>
                        {(provided, snapshot) => (
                        <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                        >
                        <DragIndicator/>
                        <NavigationMethod
                            method={x.method}
                            properties={x.properties}
                            onMethodChange={(v) => onMethodChange(i,v)}
                            onPropertyChange={(p,v) => onPropertyChange(i,p,v)}
                            />
                                    <IconButton onClick={() => onRemove(i)}><Delete/></IconButton>
                        </Paper>
                        )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
                )}
            </Droppable>
            </DragDropContext>
            <IconButton onClick={onAdd}><Add/></IconButton></>) : <></>
        }
        </AccordionDetails>
    </Accordion>
    </Paper>)
}