const axios = require('axios').default;
const fs = require('fs');

// API klíč  pro OpenWeatherMap
const apiKey = '2c8ce0f495b381164aba7730836722b6';

const city = 'Ostrava';

// URL pro získání dat o počasí
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
console.log(apiUrl);

// Funkce pro získání a uložení dat o počasí
function getAndSaveWeatherData() {
    axios.get(apiUrl)
        .then(response => {
            const weatherData = response.data;

            const jsonWeatherData = JSON.stringify(weatherData, null, 2);
            const fileName = 'weatherData.json';
            fs.writeFileSync(fileName, jsonWeatherData);

            console.log('Data o počasí byla uložena do souboru weatherData.json');
        })
        .catch(error => {
            console.error('Chyba při získávání dat o počasí:', error);
        });
}


getAndSaveWeatherData();
