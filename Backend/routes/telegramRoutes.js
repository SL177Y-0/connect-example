const express = require("express");
const router = express.Router();
const VeridaTelegramService = require("../Services/veridaTelegramService");
const crypto = require('crypto');

// Validate Telegram authentication data
const validateTelegramAuth = (telegramData) => {
  const { hash, ...data } = telegramData;
  if (!hash) return false;
  
  // Remove hash from the check object
  delete data.hash;
  
  // Sort object by keys
  const dataCheckString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');
  
  // Create data check hash using bot token
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('Telegram bot token is missing in environment variables');
  }
  
  const secretKey = crypto.createHash('sha256')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  // Verify hash
  return calculatedHash === hash;
};

router.post("/connect", async (req, res) => {
  try {
    const { did, chatId, telegramData } = req.body;
    
    if (!did || !chatId) {
      return res.status(400).json({ error: "Provide Verida DID and Telegram Chat ID" });
    }
    
    // Validate the Telegram auth data if provided
    if (telegramData && telegramData.hash) {
      const isValid = validateTelegramAuth(telegramData);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid Telegram authentication data" });
      }
    }
    
    await VeridaTelegramService.connectTelegram(did, chatId, telegramData);
    res.json({ message: "Telegram connected successfully" });
  } catch (error) {
    console.error("Error connecting Telegram:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get Telegram metrics for a user
router.get("/metrics/:did", async (req, res) => {
    try {
        const { did } = req.params;
        
        if (!did) {
            return res.status(400).json({ error: "Verida DID is required" });
        }
        
        const metrics = await VeridaTelegramService.getTelegramMetrics(did);
        
        res.json({ metrics });
    } catch (error) {
        console.error("Error getting Telegram metrics:", error);
        res.status(500).json({ error: error.message || "Server Error" });
    }
});

router.get("/score/:did", async (req, res) => {
  try {
    const { did } = req.params;
    
    if (!did) {
      return res.status(400).json({ error: "Verida DID is required" });
    }
    
    const score = await VeridaTelegramService.calculateTelegramScore(did);
    res.json({ telegramScore: score });
  } catch (error) {
    console.error("Error getting Telegram score:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/fetch-private", async (req, res) => {
  try {
    const { telegramId, veridaDid } = req.body;
    
    if (!telegramId || !veridaDid) {
      return res.status(400).json({ error: "Telegram ID and Verida DID are required" });
    }
    
    // Fetch private data from Telegram
    // This would require a more complex implementation with Telegram API
    
    // For now, return a success message
    res.json({ success: true, message: "Data fetching initiated" });
  } catch (error) {
    console.error("Error fetching private Telegram data:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;