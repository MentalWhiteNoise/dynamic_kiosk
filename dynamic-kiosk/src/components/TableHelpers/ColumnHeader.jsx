import { Typography, Button } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import React, {  } from "react";

const ColumnHeader = (props) => {
    const { text, onSortClick, sort } = props
    if (onSortClick)
        return <Button sx={{textTransform: "none", fontWeight: "bold"}} onClick={()=>onSortClick(text)}>{text}{ sort === "desc" ? <ArrowUpward/> : sort === "asc" ? <ArrowDownward/> : <></> }</Button>
    return <Typography variant="button" sx={{textTransform: "none", fontWeight: "bold"}}>{text}</Typography>
}

export default ColumnHeader