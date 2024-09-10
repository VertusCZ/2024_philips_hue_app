import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, makeStyles } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    tableContainer: {
        maxWidth: '80%',
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

const InputDataList = () => {
    const classes = useStyles();
    const [inputData, setInputData] = useState({});

    useEffect(() => {
        fetch('http://localhost:5000/api/getInputData')
            .then(response => response.json())
            .then(data => setInputData(data))
            .catch(error => console.error('Error:', error));
    }, []);

    const deleteInputDataMapping = async (apiName, dataMappingKey) => {
        try {
            const response = await fetch(`http://localhost:5000/api/deleteInputDataMapping/${apiName}/${dataMappingKey}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Aktualizace inputData pro odstranění specifického dataMapping klíče
                const updatedInputData = { ...inputData };
                delete updatedInputData[apiName].dataMapping[dataMappingKey];
                setInputData(updatedInputData);
                alert('Data mapping deleted successfully!');
            } else {
                alert('Failed to delete the data mapping.');
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
                        <TableCell>Data Mapping Key</TableCell>
                        <TableCell>Data Mapping Value</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(inputData).map(([apiName, dataMapping]) =>
                        Object.entries(dataMapping.dataMapping).map(([key, value]) => (
                            <TableRow key={`${apiName}-${key}`}>
                                <TableCell>{apiName}</TableCell>
                                <TableCell>{key}</TableCell>
                                <TableCell>{value}</TableCell>
                                <TableCell align="right">
                                    <Button color="primary" onClick={() => {}}>Edit</Button>
                                    <Button color="secondary" onClick={() => deleteInputDataMapping(apiName, key)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InputDataList;
