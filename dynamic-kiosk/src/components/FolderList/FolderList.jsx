import { List, ListSubheader, Paper } from "@mui/material";
import React, {useState, useEffect} from "react";
import FolderListItem from "./FolderListItem";

export default function FolderList(props){
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch('http://localhost:3080/folders')
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setData(data)
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            })
    }, [])

    if (loading) return "Loading...";
    if (error) return <>Error... {error.toString()}</>;

    //console.log(data)
    return (<>
        <Paper>
        <List
            subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                    Folders
                </ListSubheader>
            }
        >
        {data.map((x,i) => <FolderListItem key={i} folder={x}/>)}
        </List>
        </Paper>
    </>)
}