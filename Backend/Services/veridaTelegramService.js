const { VeridaClient } = require('@verida/client-ts');
const { NodeAccount } = require('@verida/account-node');
require('dotenv').config();

class VeridaService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return this.client;
    
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
      this.initialized = true;
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

  async getTelegramMetrics(did) {
    try {
      const telegramData = await this.getTelegramData(did);
      
      if (!telegramData) {
        return 0; // No telegram connected = 0 metrics
      }
      
      // Basic score just for having connected
      // In a production environment, you would analyze more data points from Telegram
      
      // Return value between 0 and 1 (as a normalized metric)
      return this.calculateTelegramScore(did) / 10;
    } catch (error) {
      console.error('Error calculating Telegram metrics:', error);
      return 0;
    }
  }

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

  async storeUserTelegramPrivateData(did, privateData) {
    try {
      if (!did) {
        throw new Error('Verida DID is required');
      }
      
      const context = await this.getUserContext(did);
      const db = await context.openDatabase('telegram_private_data');
      
      // Store the private data
      const dataToStore = {
        ...privateData,
        savedDate: new Date().toISOString(),
        type: 'telegram_private_data'
      };
      
      await db.save(dataToStore);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to store Telegram private data in Verida:', error);
      throw error;
    }
  }

  async disconnectVerida() {
    if (this.client) {
      try {
        await this.client.disconnect();
        this.client = null;
        this.initialized = false;
        return { success: true };
      } catch (error) {
        console.error('Failed to disconnect Verida client:', error);
        throw error;
      }
    }
    return { success: true };
  }
}

module.exports = new VeridaService();
