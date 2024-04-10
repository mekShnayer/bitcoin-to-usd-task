const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();
const get = require('./requests/get.js')

const fetchExchangeRateInterval = setInterval(() => {
    get.getExchangeRate()
}, 60000)


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

process.on('exit', () => {
    clearInterval(fetchExchangeRateInterval)
    redis.quit();
});