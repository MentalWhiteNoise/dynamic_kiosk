import { Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";
import React from "react";

export default function NavigationMethod(props){
    const {method, properties, onMethodChange, onPropertyChange} = props;

    const selector = (method === "clickElement" || method === "enterInput" || method === "clickEachElement" || method === "waitForElement") ? (<>
        <FormControl>
        <TextField 
            size="small"
            value={properties.selector || ""}
            label="Selector"
            sx={{minWidth: "100px"}}
            error={!properties.selector}
            onChange={(event) => onPropertyChange("selector", event.target.value)}
            />
        </FormControl>
        </>) : <></>
    const text = (method === "enterInput") ? (<>
        <FormControl>
        <TextField 
            size="small"
            value={properties.text || ""}
            label="Text"
            sx={{minWidth: "100px"}}
            error={!properties.text}
            onChange={(event) => onPropertyChange("text", event.target.value)}
            />
        </FormControl>
        </>) : <></>
    const timeout = (method === "waitForElement" || method === "wait") ? (<>
        <FormControl>
        <TextField 
            size="small"
            value={properties.timeout || ""}
            label="Timeout"
            sx={{minWidth: "100px"}}
            onChange={(event) => onPropertyChange("timeout", event.target.value)}
            />
        </FormControl>
        </>) : <></>

    return (
        <>
        <FormControl>
        <InputLabel id="method-select-label">Method</InputLabel>
        <Select
            size="small"
            value={method}
            label="Method"
            labelId="method-select-label"
            sx={{minWidth: "100px"}}
            onChange={(event) => onMethodChange(event.target.value)}>
            <MenuItem value="clickElement">clickElement</MenuItem>
            <MenuItem value="enterInput">enterInput</MenuItem>
            <MenuItem value="clickEachElement">clickEachElement</MenuItem>
            <MenuItem value="waitForElement">waitForElement</MenuItem>
            <MenuItem value="wait">wait</MenuItem>
        </Select>
        </FormControl>
        {selector}
        {text}
        {timeout}
        </>)
}