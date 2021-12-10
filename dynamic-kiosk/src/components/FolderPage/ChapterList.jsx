// Add data pull here... 
import React, {useState, useEffect} from "react";
import { Table, TableBody, TableCell, TableRow, CircularProgress } from "@mui/material";
import ChapterListItem from './ChapterListItem'
import ServerAddress from "../../services/api";

const ChapterList = (props) => {    
    const [chapters, setChapters] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {site, onFlagRead, book} = props;
    useEffect(() => {
        fetch(`${ServerAddress}/book/${book.Id}/chapters/unread`)
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setChapters(data)
            })
            .catch(error => {
                setError(error);
            })
            .finally(() => {
                //console.log("Enabling Stuff...")
                setLoading(false);
            })
    }, [book])

    //console.log(unread)
    //console.log(lastRead)
    if (loading) 
        return <TableRow><TableCell colSpan={4}><CircularProgress/></TableCell></TableRow>
    if (error)
        return <TableRow><TableCell colSpan={4}>Error encountered loading book data: {error}</TableCell></TableRow>
    return (
        <TableRow>
        <TableCell colSpan={5}>
            <Table size="small">
                <TableBody>
            {chapters.map((x, i)=>{
                const link = x.Links.find(y => y.HRef.match(site))
                //console.log(link)
                return (
                    <ChapterListItem
                        key={i}
                        chapter={x}
                        link={link}
                        onFlagRead={onFlagRead}
                    />)
            }
            )}
            </TableBody>
            </Table>
        </TableCell>
        </TableRow>)
}
export default ChapterList