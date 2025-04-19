// Backend for Personal Financial Dashboard (Express.js + MongoDB)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./db/connect');
const twelveDataAPI = require('./twelveDataAPI'); // Import the twelveDataAPI module
const setupWebSocketServer = require('./socket'); // Import the WebSocket server setup

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB using external file
connectDB();

app.get('/', (req, res) => {
    res.send('Hello World');
});

//Test the api on postman
// app.get('/api/test', (req, res) => {
//     res.json({ success: true, message: "API is working!" });
// });  

// Mongoose Schema and Model
const investmentSchema = new mongoose.Schema({
  userId: String,
  type: String,
  name: String,
  amount: Number,
  units: Number,
  date: Date,
  navAtPurchase: Number,
});

const Investment = mongoose.model('Investment', investmentSchema);
  
// Sample endpoint: Add investment entry
app.post('/api/investment', async (req, res) => {
  try {
    const newInvestment = new Investment(req.body);
    await newInvestment.save();
    res.status(200).json({ message: 'Investment added successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add investment' });
  }
});

// Get user investments
app.get('/api/investment/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const investments = await Investment.find({ userId });
    res.status(200).json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// Fetch price based on asset type (stock, etf, forex, mutual fund, crypto)
app.get('/api/price/:assetType/:symbol', async (req, res) => {
    const { assetType, symbol } = req.params;
  
    try {
      let price;
      switch (assetType.toLowerCase()) {
        case 'stock':
          // Fetch stock price from Twelve Data API
          price = await twelveDataAPI.fetchStockPrice(symbol);
          break;
        
        case 'etf':
          // Fetch ETF price from Twelve Data API
          price = await twelveDataAPI.fetchETFPrice(symbol);
          break;
  
        case 'forex':
          // Fetch forex price from Twelve Data API
          price = await twelveDataAPI.fetchForexPrice(symbol);
          break;
  
        case 'mutualfund':
          // Fetch mutual fund data (using MFAPI for example)
          price = await twelveDataAPI.fetchMutualFundPrice(symbol);
          break;
  
        case 'crypto':
          // Fetch crypto price from CoinGecko API
          price = await twelveDataAPI.fetchCryptoPrice(symbol);
          break;
  
        default:
          return res.status(400).json({ error: 'Invalid asset type provided' });
      }
  
      res.status(200).json({ price });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch ${assetType} price for symbol ${symbol}` });
    }
});

// Fetch real-time data
const server = http.createServer(app); // Create HTTP server for WebSocket integration
setupWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`HTTP + WebSocket server running on http://localhost:${PORT}`);
});
