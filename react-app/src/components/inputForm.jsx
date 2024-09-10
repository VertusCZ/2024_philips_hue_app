import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Button, Paper, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    paper: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
        margin: 'auto',
        maxWidth: 500,
    },
    submitButton: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const AddInputDataForm = () => {
    const classes = useStyles();
    const [inputData, setInputData] = useState({
        apiName: '',
        key: '',
        targetKey: ''
    });
    const [apiNames, setApiNames] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/getApis')
            .then(response => response.json())
            .then(data => setApiNames(data.map(api => api.name))) // Předpokládá se, že API vrací pole objektů s názvem 'name'
            .catch(error => console.error('Error:', error));
    }, []);

    const handleChange = (e) => {
        setInputData({ ...inputData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('http://localhost:5000/api/addInputDataMapping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiName: inputData.apiName,
                dataMapping: {
                    [inputData.key]: inputData.targetKey
                }
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // nebo .text() pokud server nevrací JSON
            })
            .then(data => {
                alert('Input data mapping added successfully!');
                setInputData({ apiName: '', key: '', targetKey: '' }); // Reset formuláře po úspěšném odeslání
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was a problem with your submission: ' + error.message);
            });
    };

    return (
        <Paper className={classes.paper}>
            <form onSubmit={handleSubmit}>
                <h2>Add Input Data Mapping</h2>
                <FormControl className={classes.formControl} fullWidth>
                    <InputLabel id="api-name-label">API Name</InputLabel>
                    <Select
                        labelId="api-name-label"
                        id="apiName"
                        name="apiName"
                        value={inputData.apiName}
                        onChange={handleChange}
                        required
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {apiNames.map(name => (
                            <MenuItem key={name} value={name}>{name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    className={classes.formControl}
                    fullWidth
                    label="Key (Data Mapping Name)"
                    name="key"
                    value={inputData.key}
                    onChange={handleChange}
                    required
                />
                <TextField
                    className={classes.formControl}
                    fullWidth
                    label="Target Key (JSON Path)"
                    name="targetKey"
                    value={inputData.targetKey}
                    onChange={handleChange}
                    required
                />
                <Button type="submit" variant="contained" color="primary" className={classes.submitButton}>
                    Add Input Data Mapping
                </Button>
            </form>
        </Paper>
    );
};

export default AddInputDataForm;
