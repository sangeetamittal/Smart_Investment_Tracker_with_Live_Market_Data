const axios = require('axios');

// Load environment variables
require('dotenv').config();

// Base URL and API key
const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com';
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;

// Function to fetch stock data
const fetchStockPrice = async (symbol) => {
  try {
    const response = await axios.get(`${TWELVE_DATA_BASE_URL}/time_series`, {
      params: {
        symbol,
        interval: '1min',
        apikey: TWELVE_DATA_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch stock price from Twelve Data');
  }
};

// Function to fetch ETF data
const fetchETFPrice = async (symbol) => {
  return fetchStockPrice(symbol); // ETFs can use the same method as stocks
};

// Function to fetch forex price
const fetchForexPrice = async (symbol) => {
  return fetchStockPrice(symbol); // Forex can use the same structure
};

// Mutual Fund Data from MFAPI (for India)
const fetchMutualFundPrice = async (fundCode) => {
  try {
    const response = await axios.get(`https://api.mfapi.in/mf/${fundCode}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch mutual fund price');
  }
};

// Crypto price from CoinGecko
const fetchCryptoPrice = async (symbol) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: symbol,
        vs_currencies: 'inr'
      }
    });
    return response.data[symbol].inr;
  } catch (error) {
    throw new Error('Failed to fetch crypto price');
  }
};

module.exports = {
  fetchStockPrice,
  fetchETFPrice,
  fetchForexPrice,
  fetchMutualFundPrice,
  fetchCryptoPrice
};
