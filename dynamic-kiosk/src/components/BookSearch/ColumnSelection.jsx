import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List } from "@mui/material";
import ColumnOption from "./ColumnOption";

export default function ColumnSelection(props){
    const { open, onChange, onClose, columnList } = props;  
    const [tempColumnList, setTempColumnList] = useState(columnList)

    const toggleTempColumnList = (column) => {
        const colList = [...tempColumnList]
        if (colList.includes(column)){
            const colIndex = colList.indexOf(column)            
            colList.splice(colIndex, 1);
        }
        else {
            colList.push(column)
        }
        setTempColumnList(colList)
    }
    const handleClose = () => {
        setTempColumnList(columnList);
        onClose();
    }
    //console.log(tempColumnList);
    return (
        <Dialog 
            open={open}
            onClose={handleClose}
            >
            <DialogTitle>Select which columns to include</DialogTitle>
            <DialogContent>
                <List>
                    <ColumnOption column="Title" locked={true} checked={true} />
                    <ColumnOption column="Folder" locked={true} checked={true} />
                    <ColumnOption column="Image" checked={tempColumnList.includes("Image")} onChange={toggleTempColumnList} />
                    <ColumnOption column="Alternate Titles" checked={tempColumnList.includes("Alternate Titles")} onChange={toggleTempColumnList} />
                    <ColumnOption column="Site Url" checked={tempColumnList.includes("Site Url")} onChange={toggleTempColumnList} />
                    <ColumnOption column="Chapter Counts" checked={tempColumnList.includes("Chapter Counts")} onChange={toggleTempColumnList} />
                    <ColumnOption column="Status" checked={tempColumnList.includes("Status")} onChange={toggleTempColumnList} />
                    <ColumnOption column="Last Checked" checked={tempColumnList.includes("Last Checked")} onChange={toggleTempColumnList} />
                    <ColumnOption column="Last Posted" checked={tempColumnList.includes("Last Posted")} onChange={toggleTempColumnList} />
                </List>

            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button disabled={tempColumnList === columnList} onClick={() => onChange(tempColumnList)} autoFocus>Apply</Button>
            </DialogActions>
        </Dialog>
)}