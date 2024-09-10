const axios = require('axios').default;


const url = 'https://192.168.1.12/api/7IXh-UlA6VQ0cutRjQb6wDI1USYa7iXHZfVwKj0l/lights/1/state';

// Zakázání ověřování certifikátu
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const colors = [
    { "on": true, "sat": 254, "bri": 254, "hue": 25000 },
    { "on": true, "sat": 254, "bri": 254, "hue": 40000 },
    { "on": true, "sat": 254, "bri": 254, "hue": 55000 }
];

let currentIndex = 0;

// Funkce pro odeslání požadavku s barvou
function sendColor() {
    axios.put(url, colors[currentIndex])
        .then(response => {
            console.log('Barva byla změněna.');
        })
        .catch(error => {
            console.error('Chyba při odesílání požadavku:', error);
        });

    // Přepnutí na další barvu
    currentIndex = (currentIndex + 1) % colors.length;
}


setInterval(sendColor, 1500);
