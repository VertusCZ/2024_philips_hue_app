import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
    root: {
        minWidth: 275,
        margin: '20px',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
});

const LightsComponent = () => {
    const classes = useStyles();
    const [data, setData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const url = 'https://192.168.1.3/api/7IXh-UlA6VQ0cutRjQb6wDI1USYa7iXHZfVwKj0l/lights';

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError(error);
                setIsLoading(false);
            });
    }, []);

    const renderData = () => {
        return Object.keys(data).map(key => {
            const light = data[key];
            return (
                <Grid item key={key} xs={12} sm={6} md={4}>
                    <Card className={classes.root}>
                        <CardContent>
                            <Typography variant="h5" component="h2">Světlo {key}</Typography>
                            <Typography className={classes.pos} color="textSecondary">Typ: {light.type}</Typography>
                            <Typography variant="body2" component="p">Název: {light.name}</Typography>
                            <Typography variant="body2" component="p">Model: {light.modelid}</Typography>
                            <Typography variant="body2" component="p">Výrobce: {light.manufacturername}</Typography>
                            <Typography variant="body2" component="p">Verze softwaru: {light.swversion}</Typography>
                            <Typography variant="body2" component="p">Stav: {Object.entries(light.state).map(([stateKey, value]) => `${stateKey}: ${value}`).join(', ')}</Typography>
                            <img src={light.state.on ? "light_on.png" : "light_off.png"} width="100" alt="Stav světla" />
                        </CardContent>
                    </Card>
                </Grid>
            );
        });
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <Grid container spacing={3} justifyContent="center">
            {renderData()}
        </Grid>
    );
};

export default LightsComponent;
