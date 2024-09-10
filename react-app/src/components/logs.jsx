import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, makeStyles } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    tableContainer: {
        maxWidth: '80%',
        maxHeight: '400px',
        overflow: 'auto',
        margin: 'auto',
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
        '&:not(:last-child)': {
            marginBottom: theme.spacing(4),
        },
    },
}));

const ActivityLogs = () => {
    const classes = useStyles();
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const url = 'http://localhost:5000/logs'; // Příklad URL
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error('There was a problem with fetching the log data:', error);
        }
    };

    const deleteLog = async (logId) => {
        // Předpokládá, že logId je index v poli logů
        try {
            await fetch(`http://localhost:5000/logs/${logId}`, {
                method: 'DELETE',
            });
            // Znovunačtení logů
            fetchLogs();
        } catch (error) {
            console.error('Error deleting log:', error);
        }
    };

    const deleteAllLogs = async () => {
        try {
            await fetch('http://localhost:5000/logs', {
                method: 'DELETE',
            });
            setLogs([]); // Resetování stavu po úspěšném smazání všech logů
        } catch (error) {
            console.error('Error deleting all logs:', error);
        }
    };

    return (
        <div>
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Details</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log, index) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                    {log.timestamp}
                                </TableCell>
                                <TableCell>
                                    {log.changes ? (
                                        `Action: ${log.changes.action}, Device ID: ${log.changes.deviceId},
                                         State: ${JSON.stringify(log.changes.newState)}, Response: ${log.changes.response}`
                                    ) : (
                                        `Path: ${log.path}, Value: ${log.value}`
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <Button color="secondary" onClick={() => deleteLog(index)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Button color="primary" onClick={deleteAllLogs}>Delete All Logs</Button>
        </div>
    );
};

export default ActivityLogs;
