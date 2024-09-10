const fs = require('fs');
const axios = require('axios').default;

// URL pro získání seznamu světel
const lightsUrl = 'https://192.168.1.2/api/7IXh-UlA6VQ0cutRjQb6wDI1USYa7iXHZfVwKj0l/lights';
const filePath = 'weatherData.json';

const selectedLights = {};

// Zakázání ověřování certifikátu
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';



const colors = [
    { "on": true, "sat": 254, "bri": 254, "hue": 25000 },   // Zelená
    { "on": true, "sat": 254, "bri": 254, "hue": 40000 },   // Modrá
    { "on": true, "sat": 254, "bri": 254, "hue": 0 }        // Červená
];

const filePath = 'weatherData.json';
function readWeatherFile() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);

        const weather = jsonData.weather;
        console.log(weather[0]);
        checkLights(weather[0]);
    } catch (err) {
        console.error('Nepodařilo se načíst nebo zpracovat JSON soubor: ' + err.message);
    }
}


function checkLights(weather) {
    axios.get(lightsUrl)
        .then(response => {
            const lights = response.data;
            Object.keys(lights).forEach(key => {
                selectedLights[key] = lights[key].productname;
            });
            // Zkontrolujte, zda existují světla
            if (Object.keys(lights).length === 0) {
                console.log('Nebyla nalezena žádná světla na Philips Hue Bridge.');
            } else {
                console.log('Byla nalezena světla na Philips Hue Bridge.');
                setColor(weather, selectedLights);

            }
        })
        .catch(error => {
            console.error('Chyba při získávání seznamu světel:', error);
        });
}


function setColor(weather, selectedLight) {
        for (const key in selectedLight) {
            if (typeof selectedLight[key] === 'string' && selectedLight[key].includes("Hue color lamp")) {
                if (weather.main === "Clouds") {
                    axios.put(lightsUrl + '/' + key + '/state', colors[0])
                        .then(response => {
                            console.log('Barvy světel byly změněny.');
                        })
                        .catch(error => {
                            console.error('Chyba při odesílání požadavku na změnu barev světel:', error);
                        });
                }
                if (weather.main === "Rain") {
                    axios.put(lightsUrl + '/' + key + '/state', colors[1])
                        .then(response => {
                            console.log('Barvy světel byly změněny.');
                        })
                        .catch(error => {
                            console.error('Chyba při odesílání požadavku na změnu barev světel:', error);
                        });
                }
               else {
                    axios.put(lightsUrl + '/' + key + '/state', colors[2])
                        .then(response => {
                            console.log('Barvy světel byly změněny.');
                        })
                        .catch(error => {
                            console.error('Chyba při odesílání požadavku na změnu barev světel:', error);
                        });
                }
            }
        }

}


readWeatherFile()
