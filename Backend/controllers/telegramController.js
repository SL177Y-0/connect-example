const telegramService = require('../services/telegram');
const veridaService = require('../services/verida');

exports.fetchPrivateData = async (req, res) => {
  try {
    const { telegramId, veridaDid } = req.body;
    
    if (!telegramId || !veridaDid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Telegram ID and Verida DID are required' 
      });
    }
    
    // Fetch private data from Telegram
    const privateData = await telegramService.fetchUserData(telegramId);
    
    // Store in Verida vault
    await veridaService.storeUserTelegramPrivateData(veridaDid, privateData);
    
    res.json({
      success: true,
      message: 'Telegram private data fetched and stored successfully'
    });
  } catch (error) {
    console.error('Failed to fetch Telegram data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch and store Telegram data'
    });
  }
}; 