const fs = require('fs').promises; // Importujte fs.promises na začátku souboru
const path = require('path');
const express = require('express');
const cors = require('cors');
const {get} = require("axios");

const app = express();
const configPath = path.join(__dirname, 'configure.json');

const logsFilePath = 'changes_log.json';

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({extended: true}));

// Adds a new API configuration to the system
app.post('/api/addApi', async (req, res) => {
    const newApi = req.body;

    try {
        const data = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(data);
        config.externalApis.push(newApi);

        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        res.send('API added successfully.');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error occurred.');
    }
});
// Adds or updates a data mapping for a specific API
app.post('/api/addInputDataMapping', async (req, res) => {
    console.log(req.body);
    const {apiName, dataMapping} = req.body;

    if (!apiName || !dataMapping || typeof dataMapping !== 'object') {
        return res.status(400).send('API name and data mapping are required and must be an object.');
    }

    try {
        const data = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(data);

        config.inputData = config.inputData || {};
        config.inputData[apiName] = {dataMapping: {...config.inputData[apiName]?.dataMapping, ...dataMapping}};

        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        res.send('Input data mapping updated successfully.');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error occurred.');
    }
});
// Adds a new automation rule to the system
app.post('/api/addRule', async (req, res) => {
    const newRule = req.body;

    try {
        const data = await fs.readFile(configPath, 'utf8');
        let config = JSON.parse(data);


        const maxId = config.automationRules.reduce((max, rule) => Math.max(max, parseInt(rule.id)), 0);

        newRule.id = String(maxId + 1);

        config.automationRules.push(newRule);

        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        res.send('Rule added successfully with ID ' + newRule.id);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error occurred.');
    }
});


// Retrieves a list of configured external APIs
app.get('/api/getApis', async (req, res) => {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(data);


        const apiNames = config.externalApis.map(api => ({name: api.name}));

        res.json(apiNames);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error occurred while fetching APIs.');
    }
});

// Retrieves the data mapping for a specific API
app.get('/api/getDataMapping/:apiName', async (req, res) => {
    const {apiName} = req.params;

    try {
        const data = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(data);
        const mapping = config.inputData[apiName] ? config.inputData[apiName].dataMapping : {};

        res.json(mapping);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error occurred while fetching data mapping.');
    }
});

// Retrieves a list of available conditions for automation rules
app.get('/api/getConditions', async (req, res) => {
    try {
        const schemaPath = path.join(__dirname, 'configure-schema.json');
        const schemaContent = await fs.readFile(schemaPath, 'utf8');
        const schema = JSON.parse(schemaContent);

        // Navigace k enum hodnotám pro condition
        const conditions = schema.properties.automationRules.items.properties.trigger.properties.condition.enum;

        res.json(conditions);
    } catch (error) {
        console.error('Error loading conditions:', error);
        res.status(500).send('Error loading conditions');
    }
});

// Retrieves a list of available light devices from the Hue Bridge
app.get('/api/getLights', async (req, res) => {
    const hueConfig = await fs.readFile(configPath, 'utf8')
        .then(data => JSON.parse(data))
        .catch(error => {
            console.error('Error reading config file:', error);
            res.status(500).send('Server error occurred while reading config file.');
            return null;
        });

    if (!hueConfig) return;

    const hueApiUrl = `http://${hueConfig.hueBridge.ipAddress}/api/${hueConfig.hueBridge.username}/lights`;

    try {
        const response = await get(hueApiUrl);
        const lights = Object.entries(response.data).map(([key, value]) => ({
            deviceId: key,
            deviceType: value.type,
            name: value.name
        }));
        res.json(lights);
    } catch (error) {
        console.error('Error fetching lights from Hue Bridge:', error);
        res.status(500).send('Server error occurred while fetching lights.');
    }
});
// Retrieves detailed information about configured external APIs
app.get('/api/getListApis', async (req, res) => {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(data);

        const apiList = config.externalApis.map(api => ({
            name: api.name,
            url: api.url,
            pollingInterval: api.pollingInterval,
            dataType: api.dataType
        }));

        res.json(apiList);
    } catch (error) {
        console.error('Error reading or parsing the config file:', error);
        res.status(500).send('Server error occurred while accessing the configuration.');
    }
});
// Retrieves the entire inputData configuration
app.get('/api/getInputData', async (req, res) => {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(data);

        res.json(config.inputData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error occurred while fetching input data.');
    }
});
// Retrieves all configured automation rules
app.get('/api/getAutomationRules', async (req, res) => {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(data);

        res.json(config.automationRules);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error occurred while fetching automation rules.');
    }
});

// Deletes a specific API configuration
app.delete('/api/deleteApi/:apiName', async (req, res) => {
    const apiName = req.params.apiName;

    try {
        const data = await fs.readFile(configPath, 'utf8');
        let config = JSON.parse(data);

        const apiIndex = config.externalApis.findIndex(api => api.name === apiName);

        if (apiIndex !== -1) {
            config.externalApis.splice(apiIndex, 1);

            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            res.send('API deleted successfully.');
        } else {
            res.status(404).send('API not found.');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error occurred.');
    }
});
// Deletes a specific data mapping key for an API
app.delete('/api/deleteInputDataMapping/:apiName/:dataMappingKey', async (req, res) => {
    const {apiName, dataMappingKey} = req.params;

    try {
        const data = await fs.readFile(configPath, 'utf8');
        let config = JSON.parse(data);

        if (config.inputData[apiName] && config.inputData[apiName].dataMapping[dataMappingKey]) {
            delete config.inputData[apiName].dataMapping[dataMappingKey];


            if (Object.keys(config.inputData[apiName].dataMapping).length === 0) {
                delete config.inputData[apiName];
            }

            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            res.send({message: 'Data mapping or inputData object deleted successfully.'});
        } else {
            res.status(404).send({message: 'Data mapping key not found.'});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({message: 'Server error occurred.'});
    }
});
// Deletes a specific automation rule by ID
app.delete('/api/deleteRule/:ruleId', async (req, res) => {
    const ruleId = req.params.ruleId;

    try {
        const data = await fs.readFile(configPath, 'utf8');
        let config = JSON.parse(data);

        const ruleIndex = config.automationRules.findIndex(rule => rule.id === ruleId);
        if (ruleIndex !== -1) {
            config.automationRules.splice(ruleIndex, 1);

            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            res.send('Rule deleted successfully.');
        } else {
            res.status(404).send('Rule not found.');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error occurred.');
    }
});


// Retrieves all logs
app.get('/logs', async (req, res) => {
    try {
        const data = await fs.readFile(logsFilePath, 'utf8');
        res.header("Content-Type", 'application/json');
        res.send(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error reading the log file.');
    }
});

// Deletes a specific log by ID
app.delete('/logs/:id', async (req, res) => {
    const logId = parseInt(req.params.id);
    try {
        const data = await fs.readFile(logsFilePath, 'utf8');
        let logs = JSON.parse(data);
        if (logId >= 0 && logId < logs.length) {
            logs.splice(logId, 1); // Odstranění logu
            await fs.writeFile(logsFilePath, JSON.stringify(logs, null, 2));
            res.send({message: 'Log deleted successfully'});
        } else {
            res.status(404).send('Log not found.');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing the log file.');
    }
});

// Deletes all logs
app.delete('/logs', async (req, res) => {
    try {
        await fs.writeFile(logsFilePath, JSON.stringify([], null, 2));
        res.send({message: 'All logs deleted successfully'});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error writing the log file.');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
