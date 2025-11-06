// frontend/src/services/web3Service.js
import { ethers } from 'ethers';

// Carv network configuration
export const CARV_NETWORK = {
  chainId: '0x18297', // 98951 in hexadecimal
  chainName: 'Carv SVM AI Agentic Chain',
  rpcUrls: ['https://svm.carv.io/chain'],
  blockExplorerUrls: ['https://explorer.carv.io/'],
  nativeCurrency: {
    name: 'CARV',
    symbol: 'CARV',
    decimals: 18
  }
};

export class CarvWeb3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.isConnected = false;
    this.currentAccount = null;
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
  }

  // Connect wallet function
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('Please install MetaMask to use this dApp');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      // Switch to Carv network
      await this.switchToCarvNetwork();
      
      // Setup ethers provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.isConnected = true;
      this.currentAccount = accounts[0];

      // Listen for account changes
      this.setupEventListeners();

      return {
        success: true,
        address: accounts[0],
        network: 'Carv SVM'
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  // Switch to Carv network
  async switchToCarvNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CARV_NETWORK.chainId }],
      });
    } catch (switchError) {
      // If network not found, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CARV_NETWORK],
          });
        } catch (addError) {
          throw new Error('Failed to add Carv network to wallet');
        }
      } else {
        throw switchError;
      }
    }
  }

  // Get wallet balance
  async getBalance(address = null) {
    if (!this.provider) throw new Error('Wallet not connected');
    
    const targetAddress = address || this.currentAccount;
    const balance = await this.provider.getBalance(targetAddress);
    return ethers.formatEther(balance);
  }

  // Get current network
  async getNetwork() {
    if (!this.provider) throw new Error('Wallet not connected');
    return await this.provider.getNetwork();
  }

  // Disconnect wallet
  disconnectWallet() {
    this.provider = null;
    this.signer = null;
    this.isConnected = false;
    this.currentAccount = null;
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }

  // Setup event listeners for account/network changes
  setupEventListeners() {
    if (!window.ethereum) return;

    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        this.disconnectWallet();
        window.dispatchEvent(new Event('walletDisconnected'));
      } else {
        // Account changed
        this.currentAccount = accounts[0];
        window.dispatchEvent(new CustomEvent('accountChanged', { 
          detail: { address: accounts[0] } 
        }));
      }
    });

    // Listen for network changes
    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload(); // Reload on network change
    });
  }

  // Get current connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      address: this.currentAccount,
      provider: this.provider
    };
  }
}

// Create singleton instance
const web3Service = new CarvWeb3Service();
export default web3Service;