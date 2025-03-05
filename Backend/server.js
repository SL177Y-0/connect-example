const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const Moralis = require("moralis").default;
const scoreRoutes = require('./routes/scoreRoutes.js');
const blockchainRoutes = require("./routes/blockchainRoutes");
const twitterRoutes = require("./routes/twitterRoutes");
const telegramRoutes = require("./routes/telegramRoutes"); // Real Telegram routes

// Load .env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// API Routes
app.use("/api/twitter", twitterRoutes); // Twitter routes
app.use("/api/blockchain", blockchainRoutes); // blockchain routes
app.use("/api/score", scoreRoutes); // score routes
app.use("/api/telegram", telegramRoutes); // Telegram routes

// Default route for health check
app.get("/", (req, res) => {
  res.json({ message: "Backend is running fine." });
});

// Error handling middleware for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start the server and Moralis
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize Moralis with the API key from .env
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
    console.log("Moralis initialized successfully");

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); 
  }
};

startServer();