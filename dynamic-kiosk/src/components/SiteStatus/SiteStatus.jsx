import React from "react";
import { CircularProgress, Chip } from "@mui/material";
import { Info, Error, CheckCircle, ReadMore, Update, Warning } from '@mui/icons-material';

export default function SiteStatus(props){
    const {status, checkingTriggered} = props;
    //console.log(site);
    if (checkingTriggered)
    {
        return (<Chip color="secondary" size="small" variant="outlined" icon={<><Update
            sx={{
                padding: 0
            }}/><CircularProgress
            size={24}
            sx={{
                padding: 0,
                marginLeft: '-24px',
            }}/></>} label="Checking" />
            )
    }
    switch (status){
        case "pending check":
            return <Chip size="small" variant="outlined" icon={<Info />} label="pending check" />
        case "never checked": 
            return <Chip color="secondary" size="small" variant="outlined" icon={<Info />} label="never checked!" />
        case "check failed":
            return <Chip color="error" size="small" variant="outlined" icon={<Error />} label="check failed" />
        case "no recent updates":
            return <Chip color="warning" size="small" variant="outlined" icon={<Warning />} label="nothing recent" />
        case "no recent check":
            return <Chip size="small" variant="outlined" icon={<Info />} label="been a while" />
        case "more to read":
            return <Chip color="primary" size="small" variant="outlined" icon={<ReadMore />} label="more to read" />
        case "up to date": 
            return <Chip color="success" size="small" variant="outlined" icon={<CheckCircle />} label="up to date" />
        default: 
            return <Chip color="secondary" size="small" variant="outlined" icon={<Info />} label="not sure?" />
    }
}