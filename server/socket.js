
// TWELVE DATA

const WebSocket = require('ws');

// Load environment variables
require('dotenv').config();

//API key
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;

// Function to set up WebSocket server
const setupWebSocketServer = (server) => {
    const wss = new WebSocket.Server({ server });

    // When a client connects
    wss.on('connection', (ws) => {
        console.log('Client connected to WebSocket server');

        // On receiving a message (symbol), fetch real-time price
        ws.on('message', (message) => {
            const symbol = message.toString(); // Symbol from frontend like 'AAPL'
            console.log(`Client requested symbol: ${symbol}`);
            // Connect to Twelve Data WebSocket API for real-time price
            // const upstreamSocket = new WebSocket(`wss://ws.twelvedata.com/v1/price?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`);

            const upstreamSocket = new WebSocket('wss://ws.twelvedata.com/v1/quotes/price');

            upstreamSocket.on('open', () => {
                // Send subscription message after connection opens
                upstreamSocket.send(JSON.stringify({
                    action: 'subscribe',
                    params: {
                        symbols: symbol,
                        apikey: TWELVE_DATA_API_KEY
                    },
                }));
            });
            upstreamSocket.on('message', (data) => {
                // Send data back to the client
                ws.send(data);
            });

            upstreamSocket.on('close', () => {
                console.log('Upstream WebSocket connection closed');
            });

            upstreamSocket.on('error', (err) => {
                console.error('Error from upstream WebSocket:', err.message);
            });

            // If client closes the WebSocket, close upstream connection
            ws.on('close', () => {
                upstreamSocket.close();
            });
        });

        ws.on('error', (error) => {
            console.error('WebSocket client error:', error.message);
        });
    });

    console.log('WebSocket server is running...');
};

module.exports = setupWebSocketServer;
















// ALPACA
// 
// const WebSocket = require("ws");
// require("dotenv").config();

// const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
// const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;

// // Use IEX WebSocket for free accounts
// const ALPACA_WS_URL = "wss://stream.data.alpaca.markets/v2/test";

// const setupWebSocketServer = (server) => {
//     const wss = new WebSocket.Server({ server });

//     wss.on("connection", (clientSocket) => {
//         console.log("Frontend client connected");

//         clientSocket.on("message", (message) => {
//             const symbol = message.toString(); // e.g., 'AAPL'
//             console.log(`Client requested symbol: ${symbol}`);

//             const upstreamSocket = new WebSocket(ALPACA_WS_URL);

//             upstreamSocket.on("open", () => {
//                 console.log("Connected to Alpaca");

//                 // Step 1: Authenticate with Alpaca
//                 const authMsg = {
//                     action: "auth",
//                     key: ALPACA_API_KEY,
//                     secret: ALPACA_SECRET_KEY
//                 };
//                 upstreamSocket.send(JSON.stringify(authMsg));
//             });

//             upstreamSocket.on("message", (data) => {
//                 const parsed = JSON.parse(data);
//                 console.log("Received from Alpaca:", parsed);

//                 // Step 2: If authenticated, subscribe to the symbol
//                 if (parsed[0]?.msg === "authenticated") {
//                     const subscribeMsg = {
//                         action: "subscribe",
//                         trades: [symbol] // Can also add quotes/bars
//                     };
//                     console.log("Sending subscription message:", subscribeMsg);
//                     upstreamSocket.send(JSON.stringify(subscribeMsg));
//                 }

//                 // Step 3: Forward trade data to frontend
//                 if (parsed[0]?.T === "t") {
//                     clientSocket.send(JSON.stringify(parsed));
//                 }
//             });

//             upstreamSocket.on("error", (err) => {
//                 console.error("Alpaca WebSocket error:", err.message);
//             });

//             upstreamSocket.on("close", () => {
//                 console.log("Alpaca WebSocket closed");
//             });

//             clientSocket.on("close", () => {
//                 console.log("Frontend client disconnected");

//                 // Unsubscribe (optional, Alpaca handles auto-cleanup)
//                 const unsubscribeMsg = {
//                     action: "unsubscribe",
//                     trades: [symbol]
//                 };
//                 upstreamSocket.send(JSON.stringify(unsubscribeMsg));
//                 upstreamSocket.close();
//             });
//         });

//         clientSocket.on("error", (error) => {
//             console.error("Client WebSocket error:", error.message);
//         });
//     });

//     console.log("WebSocket server listening for frontend connections...");
// };

// module.exports = setupWebSocketServer;




// FINNHUB
//
// const WebSocket = require("ws");
// require("dotenv").config();

// const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// const setupWebSocketServer = (server) => {
//     const wss = new WebSocket.Server({ server });

//     wss.on("connection", (clientSocket) => {
//         console.log("Frontend client connected");

//         clientSocket.on("message", (message) => {
//             const symbol = message.toString(); // e.g., 'AAPL'
//             console.log(`Client requested symbol: ${symbol}`);

//             // Connect to Finnhub WebSocket
//             const upstreamSocket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

//             upstreamSocket.on('open', () => {
//                 console.log('Connected to Finnhub');
            
//                 const subscribeMsg = {
//                     type: 'subscribe',
//                     symbol: symbol // like 'AAPL'
//                 };
            
//                 console.log('Sending subscription message:', subscribeMsg);
            
//                 upstreamSocket.send(JSON.stringify(subscribeMsg));
//             });

//             upstreamSocket.on('message', (data) => {
//                 console.log("Received from Finnhub:", data.toString());
            
//                 try {
//                     const parsed = JSON.parse(data);
            
//                     // Only forward trade data to frontend
//                     if (parsed.type === 'trade') {
//                         ws.send(JSON.stringify(parsed));
//                     }
//                 } catch (err) {
//                     console.error("JSON parse error:", err);
//                 }
//             });

//             upstreamSocket.on("error", (err) => {
//                 console.error("Upstream WebSocket error:", err.message);
//             });

//             upstreamSocket.on("close", () => {
//                 console.log("Upstream WebSocket closed");
//             });

//             // If frontend disconnects
//             clientSocket.on("close", () => {
//                 console.log("Frontend client disconnected");
//                 upstreamSocket.send(JSON.stringify({ type: "unsubscribe", symbol }));
//                 upstreamSocket.close();
//             });
//         });

//         clientSocket.on("error", (error) => {
//             console.error("Client WebSocket error:", error.message);
//         });
//     });

//     console.log("WebSocket server listening for frontend connections...");
// };

// module.exports = setupWebSocketServer;
