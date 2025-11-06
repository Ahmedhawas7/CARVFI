import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock service for now - we'll replace with real web3Service
const mockWeb3Service = {
  getAvailableWallets: () => [
    { name: 'BackPack', type: 'injected', icon: '🎒' },
    { name: 'Phantom', type: 'injected', icon: '👻' },
    { name: 'Solana', type: 'injected', icon: '🔷' }
  ],
  
  connectWallet: async (walletType) => {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful connection
    return {
      success: true,
      publicKey: 'Ckpc8hRJ' + Math.random().toString(36).substr(2, 9) + 'GzWCeM',
      network: 'Carv SVM Testnet',
      walletName: walletType
    };
  },
  
  disconnectWallet: async () => {
    return true;
  },
  
  getBalance: async () => {
    return (Math.random() * 10).toFixed(4);
  },
  
  getConnectionStatus: () => ({
    isConnected: false,
    publicKey: null,
    network: 'Carv SVM Testnet',
    walletName: null,
    balance: '0'
  }),
  
  isAnyWalletAvailable: () => true
};

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
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    // Get available wallets on component mount
    const wallets = mockWeb3Service.getAvailableWallets();
    setAvailableWallets(wallets);
    
    // Check initial connection status
    const status = mockWeb3Service.getConnectionStatus();
    if (status.isConnected) {
      setIsConnected(true);
      setPublicKey(status.publicKey);
      setWalletName(status.walletName);
      setBalance(status.balance);
    }
  }, []);

  const connectWallet = async (walletType = 'backpack') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mockWeb3Service.connectWallet(walletType);
      
      if (result.success) {
        setIsConnected(true);
        setPublicKey(result.publicKey);
        setWalletName(result.walletName);
        
        // Get initial balance
        const accountBalance = await mockWeb3Service.getBalance();
        setBalance(accountBalance);
      }
    } catch (error) {
      setError(error.message);
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await mockWeb3Service.disconnectWallet();
      setIsConnected(false);
      setPublicKey(null);
      setBalance('0');
      setError(null);
      setWalletName(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const refreshBalance = async () => {
    if (isConnected && publicKey) {
      try {
        const accountBalance = await mockWeb3Service.getBalance();
        setBalance(accountBalance);
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      }
    }
  };

  const value = {
    isConnected,
    publicKey,
    balance,
    walletName,
    isLoading,
    error,
    availableWallets,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    isAnyWalletAvailable: mockWeb3Service.isAnyWalletAvailable()
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};