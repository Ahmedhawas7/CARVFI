// src/services/web3Service.js
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Carv SVM Testnet configuration
export const CARV_SVM_CONFIG = {
  name: 'Carv SVM Testnet',
  url: 'https://svm.carv.io/chain', 
  chainId: 'carv-svm-testnet',
  symbol: 'CARV',
  explorer: 'https://explorer.carv.io/'
};

export class CarvWeb3Service {
  constructor() {
    this.connection = new Connection(CARV_SVM_CONFIG.url, 'confirmed');
    this.currentProvider = null;
    this.isConnected = false;
    this.publicKey = null;
    this.balance = '0';
  }

  // Check available connection methods
  getAvailableWallets() {
    const wallets = [];
    
    if (typeof window !== 'undefined') {
      // Check for BackPack
      if (window.backpack) {
        wallets.push({
          name: 'BackPack',
          type: 'injected',
          icon: '🎒'
        });
      }
      
      // Check for other Solana wallets
      if (window.solana) {
        wallets.push({
          name: 'Solana',
          type: 'injected', 
          icon: '🔷'
        });
      }
      
      // Check for Phantom
      if (window.phantom) {
        wallets.push({
          name: 'Phantom',
          type: 'injected',
          icon: '👻'
        });
      }
    }
    
    // Always available: Direct connection
    wallets.push({
      name: 'Solana Wallet',
      type: 'direct',
      icon: '🔗',
      description: 'Connect any Solana wallet'
    });
    
    return wallets;
  }

  // Connect using specific wallet
  async connectWallet(walletType = 'direct') {
    try {
      if (walletType === 'direct') {
        return await this.connectDirect();
      } else {
        return await this.connectInjectedWallet(walletType);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  // Direct connection - shows instructions
  async connectDirect() {
    // For direct connection, we'll just simulate success
    // In real implementation, you'd use WalletConnect or similar
    this.isConnected = true;
    this.publicKey = new PublicKey('11111111111111111111111111111111'); // Dummy public key for demo
    this.currentProvider = 'direct';

    return {
      success: true,
      publicKey: this.publicKey.toString(),
      network: CARV_SVM_CONFIG.name,
      walletName: 'Direct Connection'
    };
  }

  // Connect to injected wallet (BackPack, Phantom, etc.)
  async connectInjectedWallet(walletName) {
    if (typeof window === 'undefined') {
      throw new Error('Window not available');
    }

    let provider;
    
    switch (walletName.toLowerCase()) {
      case 'backpack':
        provider = window.backpack;
        break;
      case 'solana':
        provider = window.solana;
        break;
      case 'phantom':
        provider = window.phantom;
        break;
      default:
        throw new Error(`Unsupported wallet: ${walletName}`);
    }

    if (!provider) {
      throw new Error(`${walletName} wallet not found`);
    }

    try {
      await provider.connect();
      this.currentProvider = walletName;
      this.isConnected = true;
      this.publicKey = provider.publicKey;

      // Get initial balance
      await this.getBalance();

      return {
        success: true,
        publicKey: this.publicKey.toString(),
        network: CARV_SVM_CONFIG.name,
        walletName: walletName
      };
    } catch (error) {
      console.error(`Failed to connect to ${walletName}:`, error);
      throw error;
    }
  }

  async getBalance() {
    if (!this.isConnected || !this.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // For demo, return a fixed balance
      // In production, you'd call: const balance = await this.connection.getBalance(this.publicKey);
      this.balance = (Math.random() * 10).toFixed(4); // Random balance for demo
      return this.balance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      // Return demo balance on error
      return '5.2500';
    }
  }

  async disconnectWallet() {
    if (this.currentProvider && this.currentProvider !== 'direct' && 
        typeof window !== 'undefined' && window[this.currentProvider]) {
      try {
        await window[this.currentProvider].disconnect();
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
    
    this.currentProvider = null;
    this.isConnected = false;
    this.publicKey = null;
    this.balance = '0';
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      publicKey: this.publicKey ? this.publicKey.toString() : null,
      network: CARV_SVM_CONFIG.name,
      walletName: this.currentProvider,
      balance: this.balance
    };
  }

  isAnyWalletAvailable() {
    const wallets = this.getAvailableWallets();
    return wallets.length > 0;
  }
}

// Create singleton instance
const web3Service = new CarvWeb3Service();
export default web3Service;