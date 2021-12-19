//import { ListItem } from "@mui/material";
import { TextField, Button, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState, useCallback } from "react";
import ServerAddress from "../../services/api";
import { useSearchParams } from "react-router-dom";
import Processing from "../Processing";
import SearchResults from "./SearchResults"
/*
Should we also add "Search URL", or "Columns Selected" to the query parameters in the url? Maybe even make it non-human readable (bit-flag)
Note: Online search returns books if any site matches... so if a book has multiple sites, even a row that doesn't match may show up... 
*/

export default function BookSearch(props){
    let [searchParams, setSearchParams] = useSearchParams();
    const setSearchString = (value) => {
        //console.log(searchParams)
        if (value == null || value === ""){
            delete searchParams.search
            setSearchParams({...searchParams})
        }
        else
            setSearchParams({...searchParams, search: value})
    }
    const searchString = searchParams.get("search");
    const [tempSearchString, setTempSearchString] = useState(searchString || "")
    const [searchUrl, setSearchUrl] = useState(false)    
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false)

    const search = useCallback((searchStr) => {
        setSearching(true);
        fetch(`${ServerAddress}/books/find?` + new URLSearchParams({search: searchStr, includeUrl: searchUrl}))
            .then(response =>{
                if (response.ok){
                    return response.json();
                }
                throw response
            })
            .then(data => {
                setSearchResults(data)
            })
            .catch(error => {
                console.error("Error fetching data: ", error)
            })
            .finally(() => {
                setSearching(false);
            })
    }, [searchUrl])
    useEffect(() => { if (searchString != null) search(searchString) }, [search, searchString])

    return (<>
        
        <br/>
        <Box sx={{ display: 'flex', flexDirection: 'row', whiteSpace: 'nowrap' }}>
        <TextField fullWidth 
            size="small"
            label="Search Text" 
            value={tempSearchString} 
            onChange={(e) => {setTempSearchString(e.target.value)}}
                onKeyPress={(e) => {
                    if (e.key === 'Enter')
                    {
                        setSearchString(tempSearchString); 
                        search(tempSearchString)
                    }
                }}
            />
        <Button variant="contained" onClick={() => {setSearchString(tempSearchString); search(tempSearchString)}}>
            { tempSearchString === "" ? "Find All" : "Search"}
        </Button>
        </Box>
        <FormGroup>
            <FormControlLabel control={<Checkbox checked={searchUrl} onChange={(e) => {setSearchUrl(e.target.checked)}} />} label="Search URL" />
        </FormGroup>
        <SearchResults searchResults={searchResults}/>
    <Processing open={searching} />
    </>)
}