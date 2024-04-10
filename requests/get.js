require('dotenv').config();
const axios = require('axios');
const post = require('./post.js')

const coinApiUrl = process.env.COIN_API_URL;
const coinApiKey = process.env.COIN_API_KEY;

const headers = {
    'X-CoinAPI-Key': coinApiKey
};

const getExchangeRate = () => {

    axios.get(coinApiUrl, { headers })
        .then(response => {
            post.postExchangeRate(response.data.time, response.data.rate)
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

module.exports = {
    getExchangeRate
}