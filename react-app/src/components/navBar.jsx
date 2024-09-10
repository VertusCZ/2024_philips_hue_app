import React from 'react';
import { AppBar, Toolbar, Typography, Button, makeStyles } from '@material-ui/core';
import { Link } from 'react-router-dom'; // Předpokládá použití react-router-dom pro navigaci

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        marginBottom: theme.spacing(3),
    },
    title: {
        flexGrow: 1,
        display: 'flex',
    },
    link: {
        color: 'inherit',
        textDecoration: 'none',
        marginLeft: theme.spacing(2),
    },
    buttonsContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        flexGrow: 1,
    },
}));

const NavBar = () => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Philips Hue application
                    </Typography>
                    <div className={classes.buttonsContainer}>
                        <Link to="/" className={classes.link}>
                            <Button color="inherit">Home</Button>
                        </Link>
                        <Link to="/forms" className={classes.link}>
                            <Button color="inherit">Forms</Button>
                        </Link>
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default NavBar;
