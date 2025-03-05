// Backend/Services/veridaTelegramService.js
const { VeridaClient } = require('@verida/client-ts');
const { NodeAccount } = require('@verida/account-node');
require('dotenv').config();

class VeridaTelegramService {
  constructor() {
    this.client = null;
    this.context = null;
  }

  async initialize() {
    if (this.client) return this.client;
    
    try {
      const privateKey = process.env.VERIDA_PRIVATE_KEY;
      
      if (!privateKey) {
        throw new Error('Verida private key is missing in environment variables');
      }
      
      const account = new NodeAccount({
        privateKey: privateKey
      });
      
      this.client = new VeridaClient({
        network: process.env.VERIDA_NETWORK || 'testnet',
        didClientConfig: {
          rpcUrl: process.env.VERIDA_RPC_URL || 'https://node1-testnet.verida.network:5001'
        }
      });
      
      await this.client.connect(account);
      return this.client;
    } catch (error) {
      console.error('Failed to initialize Verida client:', error);
      throw error;
    }
  }

  async getUserContext(did) {
    const client = await this.initialize();
    return await client.openContext('fomoscore', did);
  }

  async connectTelegram(did, chatId, telegramData = {}) {
    try {
      if (!did) {
        throw new Error('Verida DID is required');
      }
      
      if (!chatId) {
        throw new Error('Telegram Chat ID is required');
      }
      
      const context = await this.getUserContext(did);
      const db = await context.openDatabase('telegram_data');
      
      // Store the connection data
      const dataToStore = {
        telegramId: chatId,
        publicData: telegramData,
        connectionDate: new Date().toISOString(),
        type: 'telegram_connection'
      };
      
      await db.save(dataToStore);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to connect Telegram to Verida:', error);
      throw error;
    }
  }

  async getTelegramData(did) {
    try {
      if (!did) {
        return null;
      }
      
      const context = await this.getUserContext(did);
      const db = await context.openDatabase('telegram_data');
      
      const results = await db.getMany({
        type: 'telegram_connection'
      });
      
      return results[0] || null;
    } catch (error) {
      console.error('Failed to get Telegram data from Verida:', error);
      return null;
    }
  }

  // This method can be called by your score calculation code
  async calculateTelegramScore(did) {
    try {
      const telegramData = await this.getTelegramData(did);
      
      if (!telegramData) {
        return 0; // No telegram connected
      }
      
      // Basic score just for having Telegram connected
      // In a real implementation, you would analyze more data points
      return 10; // Maximum 10 points as specified in requirements
    } catch (error) {
      console.error('Error calculating Telegram score:', error);
      return 0;
    }
  }
}

module.exports = new VeridaTelegramService();