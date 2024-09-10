import React, { useState } from 'react';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    makeStyles,
    Slider, Typography
} from '@material-ui/core';

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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    submitButton: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const AddApiForm = () => {
    const classes = useStyles();
    const [newApi, setNewApi] = useState({
        name: '',
        url: '',
        pollingInterval: 1000,
        dataType: ''
    });

    const handleApiChange = (e) => {
        setNewApi({ ...newApi, [e.target.name]: e.target.value });
    };
    const handleSliderChange = (event, newValue) => {
        setNewApi({ ...newApi, pollingInterval: newValue });
    };

    const submitApi = (e) => {
        e.preventDefault();

        fetch('http://localhost:5000/api/addApi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newApi),
        })
            .then(response => {
                if(response.ok) {
                    return response.text();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                console.log('Success:', data);
                alert('API was added successfully!');
                setNewApi({ name: '', url: '', pollingInterval: 1000, dataType: '' }); // Resetovat formulář
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('There was a problem with your submission: ' + error.message);
            });
    };

    return (
        <Paper className={classes.paper}>
            <form onSubmit={submitApi}>
                <h2>Add New API</h2>
                <TextField
                    name="name"
                    label="API Name"
                    value={newApi.name}
                    onChange={handleApiChange}
                    required
                    fullWidth
                    margin="normal"
                />
                <TextField
                    name="url"
                    label="API URL"
                    value={newApi.url}
                    onChange={handleApiChange}
                    required
                    fullWidth
                    margin="normal"
                />
                <Typography id="polling-interval-slider" gutterBottom>
                    Polling Interval (ms)
                </Typography>
                <Slider
                    name="pollingInterval"
                    value={newApi.pollingInterval}
                    onChange={handleSliderChange}
                    aria-labelledby="polling-interval-slider"
                    valueLabelDisplay="auto"
                    step={500}
                    marks
                    min={0}
                    max={20000}
                    className={classes.slider}
                />
                <FormControl className={classes.formControl} fullWidth margin="normal">
                    <InputLabel>Data Type</InputLabel>
                    <Select
                        name="dataType"
                        value={newApi.dataType}
                        onChange={handleApiChange}
                        required
                    >
                        <MenuItem value="json">JSON</MenuItem>
                        <MenuItem value="xml">XML</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" color="primary" className={classes.submitButton}>
                    Add API
                </Button>
            </form>
        </Paper>
    );
};

export default AddApiForm;
