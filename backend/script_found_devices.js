const axios = require('axios').default;
const fs = require('fs');

// URL pro získání seznamu světel
const url = 'https://192.168.1.12/api/7IXh-UlA6VQ0cutRjQb6wDI1USYa7iXHZfVwKj0l/lights';

// Zakázání ověřování certifikátu
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// Funkce pro získání a uložení seznamu světel
function getAndSaveLights() {
    axios.get(url)
        .then(response => {
            const lights = response.data;
            const jsonLights = JSON.stringify(lights, null, 2);

            // Uložení seznamu světel do souboru JSON
            fs.writeFileSync('lights.json', jsonLights);

            console.log('Seznam světel byl uložen do souboru lights.json');
        })
        .catch(error => {
            console.error('Chyba při získávání seznamu světel:', error);
        });
}

// Zavolání funkce pro získání a uložení seznamu světel
getAndSaveLights();
