import React from "react";
import { Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";

export default function ParsingMethod(props){
    const {method, string, onMethodChange, onStringChange} = props;

    const stringText = (method === "readPast" || method === "readUntil" || method === "readAfterLast" || method === "regexMatch" || method === "prepend" || method === "remove") ? (<>
        <FormControl>
        <TextField 
            size="small"
            value={string}
            label="String"
            sx={{minWidth: "100px"}}
            error={!string}
            onChange={(event) => onStringChange(event.target.value)}
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
        </FormControl>
        {stringText}
        </>)
}