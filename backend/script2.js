const axios = require('axios').default;

// URL pro získání seznamu světel
const lightsUrl = 'https://192.168.1.2/api/7IXh-UlA6VQ0cutRjQb6wDI1USYa7iXHZfVwKj0l/lights';

// Zakázání ověřování certifikátu
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const colors = [
    {"on": true, "sat": 254, "bri": 254, "hue": 25000},
    {"on": true, "sat": 254, "bri": 254, "hue": 40000},
    {"on": true, "sat": 254, "bri": 254, "hue": 55000}
];

let currentIndex = 0;
const selectedLights = {};

// Funkce pro zjištění existujících světel na Philips Hue Bridge
function checkLights() {
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

                // Pokud existují světla, spusti změnu barev
                setInterval(() => {
                    changeColorOnLights(selectedLights, colors[currentIndex]);
                    currentIndex = (currentIndex + 1) % colors.length;
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Chyba při získávání seznamu světel:', error);
        });
}

// Funkce pro odeslání barvy na všechna světla
// Kontrola jestli je objekt světlo
function changeColorOnLights(object, color) {
    for (const key in object) {
        console.log(object[key]);
        if (typeof object[key] === 'string' && object[key].includes("Hue color lamp")) {
            axios.put(lightsUrl+'/' + key + '/state', color)
                .then(response => {
                    console.log('Barvy světel byly změněny.');
                })
                .catch(error => {
                    console.error('Chyba při odesílání požadavku na změnu barev světel:', error);
                });
        }
    }
}


checkLights();
