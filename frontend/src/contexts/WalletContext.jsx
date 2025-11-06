import React, { createContext, useContext, useState, useEffect } from 'react';
import web3Service from '../services/web3Service';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check initial connection status
  useEffect(() => {
    checkInitialConnection();
  }, []);

  const checkInitialConnection = async () => {
    if (web3Service.isMetaMaskInstalled() && web3Service.isConnected) {
      const status = web3Service.getConnectionStatus();
      setIsConnected(status.isConnected);
      setAccount(status.address);
      
      try {
        const accountBalance = await web3Service.getBalance();
        setBalance(accountBalance);
      } catch (error) {
        console.error('Failed to get balance:', error);
      }
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await web3Service.connectWallet();
      
      if (result.success) {
        setIsConnected(true);
        setAccount(result.address);
        
        // Get initial balance
        const accountBalance = await web3Service.getBalance();
        setBalance(accountBalance);
      }
    } catch (error) {
      setError(error.message);
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    web3Service.disconnectWallet();
    setIsConnected(false);
    setAccount(null);
    setBalance('0');
    setError(null);
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (isConnected && account) {
      try {
        const accountBalance = await web3Service.getBalance();
        setBalance(accountBalance);
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      }
    }
  };

  // Listen for account changes
  useEffect(() => {
    const handleAccountChange = (event) => {
      setAccount(event.detail.address);
      refreshBalance();
    };

    const handleWalletDisconnected = () => {
      disconnectWallet();
    };

    window.addEventListener('accountChanged', handleAccountChange);
    window.addEventListener('walletDisconnected', handleWalletDisconnected);

    return () => {
      window.removeEventListener('accountChanged', handleAccountChange);
      window.removeEventListener('walletDisconnected', handleWalletDisconnected);
    };
  }, []);

  const value = {
    isConnected,
    account,
    balance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    isMetaMaskInstalled: web3Service.isMetaMaskInstalled()
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};