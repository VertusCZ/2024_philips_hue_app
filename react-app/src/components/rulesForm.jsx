import React, {useState, useEffect} from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Paper,
    makeStyles,
    FormControlLabel, Switch
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
    },
    submitButton: {
        marginTop: theme.spacing(2),
    },
    switchControl: {
        margin: theme.spacing(3, 0, 1),
    },
}));

const AddRuleForm = () => {

    const classes = useStyles();
    const [newRule, setNewRule] = useState({
        id: '',
        trigger: {
            type: '',
            apiName: '',
            key: '',
            condition: '',
            value: ''
        },
        action: {
            deviceType: '',
            deviceId: '',
            state: {
                on: true,
                bri: 0,
                hue: 0
            }
        }
    });
    const [apiNames, setApiNames] = useState([]);


    const handleTriggerTypeChange = (e) => {
        const updatedType = e.target.value;
        setNewRule({
            ...newRule,
            trigger: {...newRule.trigger, type: updatedType},
        });
    };

    useEffect(() => {
        fetch('http://localhost:5000/api/getApis')
            .then(response => response.json())
            .then(data => {
                setApiNames(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    const [keys, setKeys] = useState([]);

    useEffect(() => {
        if (newRule.trigger.apiName) {
            fetch(`http://localhost:5000/api/getDataMapping/${newRule.trigger.apiName}`)
                .then(response => response.json())
                .then(data => {
                    setKeys(Object.keys(data)); // Předpokládáme, že data jsou objekt klíčů a cest
                })
                .catch(error => console.error('Error:', error));
        }
    }, [newRule.trigger.apiName]);

    const [conditions, setConditions] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/getConditions')
            .then(response => response.json())
            .then(data => {
                setConditions(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    const [lights, setLights] = useState([]);
    const [filteredDevices, setFilteredDevices] = useState([]);


    useEffect(() => {
        fetch('http://localhost:5000/api/getLights')
            .then(response => response.json())
            .then(data => {
                setLights(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);


    const handleDeviceTypeChange = (e) => {
        const selectedType = e.target.value;
        setNewRule({
            ...newRule,
            action: {...newRule.action, deviceType: selectedType}
        });
        // Filtrujte zařízení na základě vybraného typu
        const filtered = lights.filter(light => light.deviceType === selectedType);
        setFilteredDevices(filtered);
    };


    const handleTriggerChange = (e) => {
        setNewRule({
            ...newRule,
            trigger: {...newRule.trigger, [e.target.name]: e.target.value}
        });
    };

    const handleActionChange = (e) => {
        setNewRule({
            ...newRule,
            action: {...newRule.action, [e.target.name]: e.target.value}
        });
    };

    const handleStateChange = (e) => {
        setNewRule({
            ...newRule,
            action: {
                ...newRule.action,
                state: {
                    ...newRule.action.state,
                    [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
                }
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const ruleToSubmit = {...newRule};


        if (ruleToSubmit.action.deviceType === 'On/Off plug-in unit') {
            delete ruleToSubmit.action.state.bri;
            delete ruleToSubmit.action.state.hue;
        }

        fetch('http://localhost:5000/api/addRule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ruleToSubmit),
        })
            .then(response => response.ok ? response.text() : Promise.reject(response))
            .then(data => {
                alert('Rule added successfully!');
                // Reset form to initial state
                setNewRule({
                    id: '',
                    trigger: {
                        type: 'externalData',
                        apiName: '',
                        key: '',
                        condition: '',
                        value: ''
                    },
                    action: {
                        deviceType: '',
                        deviceId: '',
                        state: {
                            on: true,
                            bri: 0,
                            hue: 0
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was a problem with your submission.');
            });
    };

    return (
        <Paper className={classes.paper}>
            <form onSubmit={handleSubmit}>
                <h2>Add New Automation Rule</h2>

                <FormControl className={classes.formControl} fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                        name="type"
                        value={newRule.trigger.type}
                        onChange={handleTriggerTypeChange}
                        required
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="externalData">External Data</MenuItem>
                        <MenuItem value="time">Time</MenuItem>
                    </Select>
                </FormControl>

                {newRule.trigger.type === 'externalData' && (
                    <>
                        <FormControl className={classes.formControl} fullWidth>
                            <InputLabel>API Name</InputLabel>
                            <Select
                                name="apiName"
                                value={newRule.trigger.apiName}
                                onChange={handleTriggerChange}
                                required
                            >
                                {apiNames.map((api) => (
                                    <MenuItem key={api.name} value={api.name}>{api.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl className={classes.formControl} fullWidth>
                            <InputLabel>Key</InputLabel>
                            <Select
                                name="key"
                                value={newRule.trigger.key}
                                onChange={handleTriggerChange}
                                required
                            >
                                {keys.map((key) => (
                                    <MenuItem key={key} value={key}>{key}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl className={classes.formControl} fullWidth>
                            <InputLabel>Condition</InputLabel>
                            <Select
                                name="condition"
                                value={newRule.trigger.condition}
                                onChange={handleTriggerChange}
                                required
                            >
                                {conditions.map((condition) => (
                                    <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            className={classes.formControl}
                            fullWidth
                            label="Value"
                            name="value"
                            value={newRule.trigger.value}
                            onChange={handleTriggerChange}
                            required
                        />
                    </>
                )}

                {newRule.trigger.type === 'time' && (
                    <>
                        <FormControl className={classes.formControl} fullWidth>
                            <InputLabel>Condition</InputLabel>
                            <Select
                                name="condition"
                                value={newRule.trigger.condition}
                                onChange={handleTriggerChange}
                                required
                            >
                                {conditions.map((condition) => (
                                    <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            className={classes.formControl}
                            fullWidth
                            label="Value"
                            name="value"
                            value={newRule.trigger.value}
                            onChange={handleTriggerChange}
                            required
                        />
                    </>
                )}
                <h3>Action</h3>
                <FormControl fullWidth className={classes.formControl}>
                    <InputLabel>Device Type</InputLabel>
                    <Select
                        native
                        label="Device Type"
                        name="deviceType"
                        value={newRule.action.deviceType}
                        onChange={handleDeviceTypeChange}
                        required
                    >
                        <option aria-label="None" value=""/>
                        <option value="Extended color light">Extended Color Light</option>
                        <option value="On/Off plug-in unit">On/Off Plug-in Unit</option>
                    </Select>
                </FormControl>

                <FormControl fullWidth className={classes.formControl}>
                    <InputLabel>Device ID</InputLabel>
                    <Select
                        native
                        label="Device ID"
                        name="deviceId"
                        value={newRule.action.deviceId}
                        onChange={handleActionChange}
                        required
                    >
                        <option aria-label="None" value=""/>
                        {filteredDevices.map(device => (
                            <option key={device.deviceId}
                                    value={device.deviceId}>{device.name} ({device.deviceId})</option>
                        ))}
                    </Select>
                </FormControl>

                {newRule.action.deviceType !== 'On/Off plug-in unit' && (
                    <>
                        <TextField
                            className={classes.formControl}
                            fullWidth
                            label="Brightness"
                            type="number"
                            name="bri"
                            placeholder="Brightness"
                            value={newRule.action.state.bri}
                            onChange={handleStateChange}
                            required={newRule.action.deviceType === 'Extended color light'}
                            inputProps={{
                                min: 0, // Prevent negative values
                                max: 255,
                            }}
                        />

                        <TextField
                            className={classes.formControl}
                            fullWidth
                            label="Hue"
                            type="number"
                            name="hue"
                            placeholder="Hue"
                            value={newRule.action.state.hue}
                            onChange={handleStateChange}
                            required={newRule.action.deviceType === 'Extended color light'}
                            inputProps={{
                                min: 0,
                                max: 65535,
                            }}
                        />
                    </>
                )}
                <div className={classes.switchControl}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={newRule.action.state.on}
                                onChange={handleStateChange}
                                name="on"
                                color="primary"
                            />
                        }
                        label="State On"
                    />
                </div>

                <Button type="submit" variant="contained" color="primary" className={classes.submitButton}>
                    Add Rule
                </Button>
            </form>
        </Paper>
    );
};
export default AddRuleForm;
