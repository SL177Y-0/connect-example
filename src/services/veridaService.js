import { VeridaClient } from '@verida/client-ts';
import { WebVaultAccount } from '@verida/account-web-vault';

class VeridaService {
  constructor() {
    this.client = null;
    this.context = null;
    this.did = null;
  }

  async initialize() {
    if (this.client) return this.client;
    
    this.client = new VeridaClient({
      network: 'testnet', // Use 'mainnet' for production
      didClientConfig: {
        rpcUrl: 'https://node1-testnet.verida.network:5001'
      }
    });
    
    return this.client;
  }

  async connect() {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const account = new WebVaultAccount({
        request: {
          logoUrl: 'https://your-app-logo.png',
          appName: 'FOMOscore App',
          description: 'Calculate your FOMO score securely'
        }
      });

      await this.client.connect(account);
      this.context = await this.client.getContext('fomoscore');
      this.did = await account.did();
      
      // Save DID to localStorage for later use
      localStorage.setItem('veridaDid', this.did);
      
      return {
        did: this.did,
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to connect to Verida:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.context = null;
      this.did = null;
      localStorage.removeItem('veridaDid');
    }
  }
}

export const veridaService = new VeridaService();
