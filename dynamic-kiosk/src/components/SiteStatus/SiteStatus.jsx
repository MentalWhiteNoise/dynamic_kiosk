import React from "react";
import { CircularProgress } from "@mui/material";
import { Info, Error, CheckCircle, ReadMore, Update, Warning } from '@mui/icons-material';

export default function SiteStatus(props){
    const {site, chapterList, checkingTriggered, checkingComplete} = props;
    //console.log(site);
    if (checkingTriggered && !checkingComplete)
    {
        return (<>
            <Update
                sx={{
                    padding: 0
                }}/><CircularProgress
                size={24}
                sx={{
                    padding: 0,
                    marginLeft: '-24px',
                }}/>
            Checking
            <Update
                sx={{
                    padding: 0
                }}/><CircularProgress
                size={24}
                sx={{
                    padding: 0,
                    marginLeft: '-24px',
                }}/>
            </>)
    }
    if (chapterList == null)
        return (<><Info/>pending check<Info/></>)

    if (site.LastAttempted == null)
        return (<><Info/>never checked!<Info/></>)

    const lastErred = new Date(site.LastSuccessful) > new Date(site.LastAttempted)
    if (lastErred)
        return (<><Error/>last check failed<Error/></>)

    const lastChecked = Math.floor((new Date() - new Date(site.LastSuccessful))/(1000*60*60*24))
    const lastPostedDate = Math.max( ...(chapterList.map(x => {
        const siteLinks = x.Links.filter(y => y.SiteId === site.SiteId || (y.SiteId === "00000000-0000-0000-0000-000000000000" && y.HRef.match(site.Url)))
        if (siteLinks == null || siteLinks.length < 1) return null;
        return new Date(siteLinks[0].DateUploaded);})));
    const lastPosted = Math.floor((new Date() - lastPostedDate)/(1000*60*60*24))
    //console.log(lastErred, lastChecked, lastPosted)

    if(lastChecked < 30 && lastPosted > 60)
        return (<><Warning/>no recent updates<Warning/></>)
        
    if (lastChecked > 30)
        return (<><Info/>been a while<Info/></>)

    if (chapterList.filter(x => x.Read === false).length > 0)
        return (<><ReadMore/>more to read<ReadMore/></>)

    if (chapterList.length > 0)
        return (<><CheckCircle/>up to date<CheckCircle/></>)

    return (<><Info/>not sure<Info/></>)
}