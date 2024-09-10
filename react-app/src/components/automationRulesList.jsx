import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    tableContainer: {
        maxWidth: '80%', // Omezení šířky na 80% pro lepší vzhled
        margin: 'auto', // Centrování
        marginTop: theme.spacing(3), // Rozestup od horního okraje
        marginBottom: theme.spacing(3), // Rozestup od dolního okraje
        border: `1px solid ${theme.palette.divider}`, // Přidání ohraničení
        borderRadius: theme.shape.borderRadius, // Zaoblené rohy
        padding: theme.spacing(2), // Vnitřní odsazení
        '&:not(:last-child)': {
            marginBottom: theme.spacing(4), // Zajistí rozestupy mezi tabulkami
        },
    },
    button: {
        margin: theme.spacing(1),
    },
}));

const AutomationRulesList = () => {
    const classes = useStyles();
    const [rules, setRules] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/getAutomationRules')
            .then(response => response.json())
            .then(data => setRules(data))
            .catch(error => console.error('Error:', error));
    }, []);

    const deleteRule = async (ruleId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/deleteRule/${ruleId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Po úspěšném smazání pravidla aktualizujeme seznam pravidel
                setRules(rules.filter(rule => rule.id !== ruleId));
                alert('Rule deleted successfully!');
            } else {
                console.error('Failed to delete the rule.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
        <TableContainer component={Paper} className={classes.tableContainer}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell align="right">Type</TableCell>
                        <TableCell align="right">API Name</TableCell>
                        <TableCell align="right">Key</TableCell>
                        <TableCell align="right">Condition</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">Device Type</TableCell>
                        <TableCell align="right">Device ID</TableCell>
                        <TableCell align="right">State On</TableCell>
                        <TableCell align="right">Brightness</TableCell>
                        <TableCell align="right">Hue</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rules.map((rule) => (
                        <TableRow key={rule.id}>
                            <TableCell>{rule.id}</TableCell>
                            <TableCell align="right">{rule.trigger.type}</TableCell>
                            <TableCell align="right">{rule.trigger.apiName}</TableCell>
                            <TableCell align="right">{rule.trigger.key}</TableCell>
                            <TableCell align="right">{rule.trigger.condition}</TableCell>
                            <TableCell align="right">{rule.trigger.value}</TableCell>
                            <TableCell align="right">{rule.action.deviceType}</TableCell>
                            <TableCell align="right">{rule.action.deviceId}</TableCell>
                            <TableCell align="right">{rule.action.state.on.toString()}</TableCell>
                            <TableCell align="right">{rule.action.state.bri}</TableCell>
                            <TableCell align="right">{rule.action.state.hue}</TableCell>
                            <TableCell align="right">
                                <Button color="primary" onClick={() => {}}>Edit</Button>
                                <Button className={classes.button} color="secondary" onClick={() => deleteRule(rule.id)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default AutomationRulesList;
