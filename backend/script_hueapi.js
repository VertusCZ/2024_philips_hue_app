const fs = require('fs');
const axios = require('axios');

// Načtení konfigurace
const config = JSON.parse(fs.readFileSync('configure.json', 'utf8'));

// URL a API klíč pro přímé volání Hue Bridge
const hueApiUrl = `http://${config.hueBridge.ipAddress}/api/${config.hueBridge.username}`;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}
// Funkce pro ověření spojení s Hue Bridge a výpis dostupných světel
let isHueConnected = false;

async function verifyHueConnection() {
    try {
        const response = await axios.get(`${hueApiUrl}/lights`);
        console.log('Spojení s Hue Bridge bylo úspěšné. Dostupná světla:');
        console.log(response.data);
        isHueConnected = true;
    } catch (error) {
        console.error('Chyba při připojování k Hue Bridge:', error);
    }

    setTimeout(() => {
        if (!isHueConnected) {
            console.error('Error: Philips Hue zařízení nebylo nalezeno v daném intervalu.');
            process.exit(1);
        }
    }, 5000);
}

// Funkce pro získání dat z externích API
async function fetchData(apiConfig) {
    try {
        const response = await axios.get(apiConfig.url);
        console.log(`URL:${apiConfig.url}`);
        console.log(`Data získána z API: ${apiConfig.name}`, response.data);
        return response.data;
    } catch (error) {
        console.error('Chyba při získávání dat z API:', apiConfig.name, error);
        return null;
    }
}


// Funkce pro aplikaci pravidla automatizace
function applyRule(rule, data) {
    let conditionMet = false;
    if (rule.trigger.type === 'externalData' && rule.trigger.apiName in data) {
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
        executeAction(rule.action);
    }
}

// Funkce pro provedení akce
function executeAction(action) {
    const apiUrl = `${hueApiUrl}/lights/${action.deviceId}/state`;
    axios.put(apiUrl, action.state)
        .then(() => {
            console.log(`Stav zařízení typu ${action.deviceType}, ID ${action.deviceId} byl změněn na:`, action.state);
        })
        .catch(err => {
            console.error(`Chyba při změně stavu zařízení: ${err}`);
        });
}


async function runScenarios() {
    config.automationRules.forEach(rule => {
        if (rule.trigger.type === 'time') {
            applyRule(rule, {});
        }
    });

}

async function runWeatherScenarios() {
    const weatherApi = config.externalApis.find(api => api.name === "WeatherApi");
    if (weatherApi) {
        const data = await fetchData(weatherApi);
        if (data) {
            const weatherData = {
                "WeatherApi": {
                    "weatherCondition": data.weather[0].main
                }
            };
            config.automationRules.forEach(rule => {
                if (rule.trigger.type === 'externalData' && rule.trigger.apiName === "WeatherApi") {
                    applyRule(rule, weatherData);
                }
            });
        }
    }
}

// Získání intervalu
const weatherApiConfig = config.externalApis.find(api => api.name === "WeatherApi");
const pollingInterval = weatherApiConfig.pollingInterval;


verifyHueConnection().then(() => {
    setInterval(runScenarios, 600);
    setInterval(runWeatherScenarios, pollingInterval);
});

