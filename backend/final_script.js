const fs = require('fs');
const axios = require('axios');

// Loading the configuration from a JSON file
const config = JSON.parse(fs.readFileSync('configure.json', 'utf8'));

// Constructs the URL for API calls to the Hue Bridge using configuration settings
const hueApiUrl = `http://${config.hueBridge.ipAddress}/api/${config.hueBridge.username}`;

// Disables TLS/SSL certificate validation (not recommended for production use)
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// Returns the current time in HH:MM format
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Verifies the connection to the Hue Bridge and lists the available lights
let isHueConnected = false;

async function verifyHueConnection() {
    try {
        const response = await axios.get(`${hueApiUrl}/lights`);
        console.log('Connection to Hue Bridge was successful. Available lights:');
        console.log(response.data);
        isHueConnected = true;
    } catch (error) {
        console.error('Error connecting to Hue Bridge:', error);
        if (!isHueConnected) {
            console.error('Error: Philips Hue device not found.');
            process.exit(1);
        }
    }
}

// Safely retrieves a nested property value from an object based on a string path
function safeGet(obj, path) {
    try {
        return path.split(/[\.\[\]\'\"]/).filter(p => p).reduce((o, p) => o[p], obj);
    } catch (e) {
        return undefined;
    }
}

// Maps API data to a new structure based on a provided mapping configuration
function mapData(apiData, dataMapping, apiName) {
    let mappedData = {};
    for (let key in dataMapping) {
        const path = dataMapping[key];
        const value = safeGet(apiData, path);
        if (value === undefined) {
            console.error(`Cannot find path '${path}' in the source data.`);
            mappedData[key] = null;
        } else {
            mappedData[key] = value;
            console.log(`Retrieved value for path ${path}:`, value);
            saveChangesToFile({apiName, path, value}, 'valueLog');
        }
    }
    return mappedData;
}

// Evaluates a rule's conditions and executes its action if the conditions are met
async function applyRule(rule, data) {
    let conditionMet = false;
    // Checks condition based on external data
    if (rule.trigger.type === 'externalData'
        && rule.trigger.apiName in data) {
        const apiData = data[rule.trigger.apiName];
        const triggerValue = apiData[rule.trigger.key];
        switch (rule.trigger.condition) {
            case 'equals':
                conditionMet = triggerValue === rule.trigger.value;
                break;
            case 'notEquals':
                conditionMet = triggerValue !== rule.trigger.value;
                break;
            case 'greaterThan':
                conditionMet = triggerValue > rule.trigger.value;
                break;
            case 'lessThan':
                conditionMet = triggerValue < rule.trigger.value;
                break;
        }
    } else if (rule.trigger.type === 'time') {
        // Checks condition based on time
        const currentTime = getCurrentTime();
        switch (rule.trigger.condition) {
            case 'greaterThan':
                conditionMet = currentTime > rule.trigger.value;
                break;
            case 'lessThan':
                conditionMet = currentTime < rule.trigger.value;
                break;
            case 'equals':
                conditionMet = currentTime === rule.trigger.value;
                break;
            case 'notEquals':
                conditionMet = currentTime !== rule.trigger.value;
                break;
        }
    }
    if (conditionMet) {
        await executeAction(rule.action);
    }
}

// Saves changes to a file for logging purposes
function saveChangesToFile(changes, logType = 'actionLog') {
    const timestamp = new Date().toISOString();
    let logEntry = {timestamp, changes};
    if (logType === 'valueLog') {
        logEntry = {timestamp, ...changes};
    }

    try {
        let logs = [];
        if (fs.existsSync('changes_log.json')) {
            const data = fs.readFileSync('changes_log.json', 'utf8').trim();
            if (data) {
                logs = JSON.parse(data);
            }
        }
        logs.push(logEntry);
        fs.writeFileSync('changes_log.json', JSON.stringify(logs, null, 2));
    } catch (err) {
        console.error(`Error writing to file changes_log.json: ${err}`);
    }
}

// Executes an action by making an API call to change the state of a device
async function executeAction(action) {
    const apiUrl = `${hueApiUrl}/lights/${action.deviceId}/state`;
    try {
        const response = await axios.put(apiUrl, action.state);
        console.log(`Device state of type ${action.deviceType}, ID ${action.deviceId} was changed to:`, action.state);
        saveChangesToFile({
            action: 'executeAction',
            deviceId: action.deviceId,
            newState: action.state,
            response: response.status
        });
    } catch (err) {
        console.error(`Error changing device state: ${err}`);
    }
}

// Fetches data from an external API, maps it according to configuration, and applies automation rules
async function fetchDataFromApi(apiConfig) {
    let externalData = {};

    try {
        const response = await axios.get(apiConfig.url, {
            params: apiConfig.params
        });
        console.log(`Data obtained from ${apiConfig.name}:`);
        if (config.inputData[apiConfig.name]) {
            const dataMapping = config.inputData[apiConfig.name].dataMapping;
            externalData[apiConfig.name] = mapData(response.data, dataMapping);
        }
        await applyRulesSequentially(config.automationRules, externalData);
    } catch (error) {
        console.error(`Error obtaining data from ${apiConfig.name}:`, error);
    }
}

// Applies automation rules sequentially
async function applyRulesSequentially(rules, data) {
    for (const rule of rules) {
        await applyRule(rule, data);
        if (rule.trigger.type === 'time') {
            await applyRule(rule, {});
        }
    }
}

// Schedules API polling based on the provided configuration
async function scheduleApiPolling(apiConfig) {
    async function poll() {
        await fetchDataFromApi(apiConfig);
        setTimeout(poll, apiConfig.pollingInterval);
    }

    await poll();
}

// Starts the application and schedules polling for each configured external API
async function startApplication() {
    await verifyHueConnection();
    config.externalApis.forEach(apiConfig => {
        scheduleApiPolling(apiConfig);
    });
}

startApplication();
