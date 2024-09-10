import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    tableContainer: {
        maxWidth: '80%',
        margin: 'auto',
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        border: `2px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
        '&:not(:last-child)': {
            marginBottom: theme.spacing(4),
        },
    },
}));

const ApisList = () => {
    const classes = useStyles();
    const [apis, setApis] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/getListApis')
            .then(response => response.json())
            .then(data => setApis(data))
            .catch(error => console.error('Error:', error));
    }, []);

    const deleteApi = async (apiName) => {
        try {
            const response = await fetch(`http://localhost:5000/api/deleteApi/${apiName}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Po úspěšném smazání API aktualizujeme seznam API
                setApis(apis.filter(api => api.name !== apiName));
                alert('API deleted successfully!');
            } else {
                console.error('Failed to delete the API.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <TableContainer component={Paper} className={classes.tableContainer}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>API Name</TableCell>
                        <TableCell>Interval</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {apis.map((api) => (
                        <TableRow key={api.name}>
                            <TableCell component="th" scope="row">
                                {api.name}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {api.pollingInterval}
                            </TableCell>
                            <TableCell align="right">
                                <Button color="primary" onClick={() => {}}>Edit</Button>
                                <Button color="secondary" onClick={() => deleteApi(api.name)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ApisList;
