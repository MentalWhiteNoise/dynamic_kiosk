//import { AppBar, Toolbar, Button } from "@mui/material";
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Home, Search, AddLink, Settings } from '@mui/icons-material';

import React from "react"
import { Link } from "react-router-dom";
import "./mainMenu.css"
//import { StyledEngineProvider } from '@mui/material/styles';

export default function MainMenu() {
    /* Top Menu
    const displayDesktop = () => {
        return <Toolbar>{getMenuButtons()}</Toolbar>;
    };
    const getMenuButtons = () =>{
        return (<>
            <Link to={`/`} className="link">Home</Link>
            <Link to={`/findbook`} className="link">Find Book</Link>
            <Link to={`/newbook`} className="link">Add New Book</Link>
            <Link to={`/config`} className="link">Maintenance</Link>
        </>
        );
    }
    return (
        <StyledEngineProvider injectFirst>
        <header>
        <AppBar position="static" className="header">{displayDesktop()}</AppBar>
        </header>
        </StyledEngineProvider>
    );
    */
   /* Bottom Menu */
    const [value, setValue] = React.useState(0);
    return (
        <Paper>
        <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
            setValue(newValue);
        }}
        >
        <BottomNavigationAction component={Link} to={`/`} label="Home" icon={<Home />} />
        <BottomNavigationAction component={Link} to={`/findbook`} label="Find Book" icon={<Search />} />
        <BottomNavigationAction component={Link} to={`/newbook`} label="Add New Book" icon={<AddLink />} />
        <BottomNavigationAction component={Link} to={`/config`} label="Maintenance" icon={<Settings />} />
        </BottomNavigation>
        </Paper>
    )
}