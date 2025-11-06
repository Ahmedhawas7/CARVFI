import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [walletName, setWalletName] = useState('BackPack');
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    // Always show BackPack for demo
    setAvailableWallets([
      { name: 'BackPack', type: 'injected', icon: '🎒' },
      { name: 'Phantom', type: 'injected', icon: '👻' }
    ]);
  }, []);

  const connectWallet = async (walletType = 'backpack') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful connection
      const mockPublicKey = 'Ckpc8hRJ' + Math.random().toString(36).substr(2, 9) + 'GzWCeM';
      const mockBalance = (Math.random() * 10).toFixed(4);
      
      setIsConnected(true);
      setPublicKey(mockPublicKey);
      setWalletName(walletType);
      setBalance(mockBalance);
      
      return { success: true, publicKey: mockPublicKey, walletName: walletType };
    } catch (error) {
      setError('Failed to connect wallet');
      console.error('Wallet connection error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setIsConnected(false);
    setPublicKey(null);
    setBalance('0');
    setError(null);
    setWalletName(null);
  };

  const refreshBalance = async () => {
    if (isConnected && publicKey) {
      const newBalance = (Math.random() * 10).toFixed(4);
      setBalance(newBalance);
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
    isAnyWalletAvailable: true
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};