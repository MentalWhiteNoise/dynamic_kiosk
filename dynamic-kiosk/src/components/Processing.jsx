import React from "react";
import { CircularProgress, Backdrop } from "@mui/material";

const Processing = (props) =>{
    const { open } = props
    return (<Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
    >
        <CircularProgress/>
    </Backdrop>)
}
export default Processing