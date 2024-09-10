const fs = require('fs');
const axios = require('axios');

// Načtení konfigurace
const config = JSON.parse(fs.readFileSync('configure.json', 'utf8'));

// URL a API klíč pro přímé volání Hue Bridge
const hueApiUrl = `http://${config.hueBridge.ipAddress}/api/${config.hueBridge.username}`;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
        if (!isHueConnected) {
            console.error('Error: Philips Hue zařízení nebylo nalezeno v daném intervalu.');
            process.exit(1);
        }
    }
}

// Funkce pro mapování dat podle konfigurace
function safeGet(obj, path) {
    try {
        return path.split(/[\.\[\]\'\"]/).filter(p => p).reduce((o, p) => o[p], obj);
    } catch (e) {
        return undefined;
    }
}


function mapData(apiData, dataMapping) {
    let mappedData = {};
    for (let key in dataMapping) {
        const path = dataMapping[key]; // Definice 'path' je platná pouze zde uvnitř cyklu
        const value = safeGet(apiData, path);
        if (value === undefined) {
            console.error(`Nelze nalézt cestu '${path}' ve zdrojových datech.`);
            mappedData[key] = null; // Nastavíme na null nebo jinou vhodnou výchozí hodnotu
        } else {
            mappedData[key] = value;
        }
        // Logování zde je v pořádku, protože jsme stále uvnitř cyklu 'for'
        console.log(`Pokus o získání cesty: ${path} z dat:`, apiData);
        console.log(`Získaná hodnota pro cestu ${path}:`, value);
    }
    return mappedData;
}




// Funkce pro aplikaci pravidla automatizace
// Upravená funkce pro aplikaci pravidel s počkáním mezi akcemi
async function applyRule(rule, data) {
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
    }else if (rule.trigger.type === 'time') {
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
        await executeAction(rule.action); // Zde je akce provedena a čekáme na dokončení
        // Případné zpoždění mezi akcemi, pokud je potřeba
        /*
        if (rule.action.deviceType === 'plug') {
            await sleep(5000); // Přidání zpoždění po zapnutí plugu
            // Nyní můžete spustit další akci, která by měla následovat
        }
         */
    }
}
// Funkce pro získání aktuálního stavu zařízení
async function getCurrentState(deviceId) {
    try {
        const response = await axios.get(`${hueApiUrl}/lights/${deviceId}`);
        return response.data.state.on;
    } catch (err) {
        console.error(`Chyba při získávání stavu zařízení: ${err}`);
        return null; // V případě chyby vrátíme null
    }
}

// Funkce pro provedení akce
// Upravená funkce pro provedení akce s kontrolou stavu plugu
async function executeAction(action) {
    const apiUrl = `${hueApiUrl}/lights/${action.deviceId}/state`;

    // Kontrola, zda je akce pro plug a pokus o získání jeho aktuálního stavu
    if (action.deviceType === 'plug') {
        const isPlugOn = await getCurrentState(action.deviceId);
        if (isPlugOn) {
            console.log(`Plug ID ${action.deviceId} je již zapnutý, přeskakuji čekání.`);
        } else {
            console.log(`Zapínám plug ID ${action.deviceId}...`);
            await axios.put(apiUrl, action.state);
            console.log(`Plug ID ${action.deviceId} byl zapnut.`);
            console.log('Čekáme, aby se plug úplně aktivoval...');
            await sleep(3000); // Zpoždění 5 sekund pouze pokud byl plug právě zapnut
        }
    } else {
        // Pro ostatní typy zařízení (např. světla) provádíme akci bez kontroly
        try {
            await axios.put(apiUrl, action.state);
            console.log(`Stav zařízení typu ${action.deviceType}, ID ${action.deviceId} byl změněn na:`, action.state);
        } catch (err) {
            console.error(`Chyba při změně stavu zařízení: ${err}`);
        }
    }
}

// Hlavní funkce pro získání dat z externích API, mapování a aplikaci pravidel
async function fetchDataFromApi(apiConfig) {
    let externalData = {};

    try {
        const response = await axios.get(apiConfig.url, {
            params: apiConfig.params // Předpokládá, že parametry jsou součástí konfigurace
        });
        console.log(`Data získána z ${apiConfig.name}:`);

        // Získání a mapování dat podle inputData konfigurace
        if (config.inputData[apiConfig.name]) {
            const dataMapping = config.inputData[apiConfig.name].dataMapping;
            externalData[apiConfig.name] = mapData(response.data, dataMapping);
        }

        // Aplikace pravidel automatizace sekvenčně, po získání a mapování dat
        await applyRulesSequentially(config.automationRules, externalData);
    } catch (error) {
        console.error(`Chyba při získávání dat z ${apiConfig.name}:`, error);
    }
}


// Aplikace pravidel automatizace sekvenčně

async function applyRulesSequentially(rules, data) {
    for (const rule of rules) {
        await applyRule(rule, data); // Použijí se 'await' pro zajištění sekvenčního zpracování
        if (rule.trigger.type === 'time') {
            await applyRule(rule, {});
        }
    }
}
async function scheduleApiPolling(apiConfig) {
    async function poll() {
        await fetchDataFromApi(apiConfig);
        setTimeout(poll, apiConfig.pollingInterval );
    }
    await poll();
}


// Spuštění aplikace s individuálně nastavenými intervaly pro každé API
async function startApplication() {
    await verifyHueConnection();
    config.externalApis.forEach(apiConfig => {
        scheduleApiPolling(apiConfig);
    });
}

startApplication();





