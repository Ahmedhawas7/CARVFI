// src/components/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { 
    isConnected, 
    publicKey, 
    balance, 
    isLoading, 
    error, 
    connectWallet, 
    disconnectWallet,
    availableWallets,
    walletName
  } = useWallet();

  const [selectedWallet, setSelectedWallet] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedWallet(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPublicKey = (pubkey) => {
    return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
  };

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
  };

  const handleConnect = async () => {
    if (selectedWallet) {
      await connectWallet(selectedWallet.type === 'walletconnect' ? 'walletconnect' : selectedWallet.name);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {!isConnected ? (
            // Connect Wallet State
            <div>
              {availableWallets.length === 0 ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-600 text-lg font-semibold">No Wallets Found</p>
                  <p className="text-gray-600 mb-4">
                    Please install a Solana wallet like BackPack or use WalletConnect
                  </p>
                  <div className="grid gap-3">
                    <a 
                      href="https://www.backpack.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
                    >
                      Download BackPack
                    </a>
                    <a 
                      href="https://phantom.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center"
                    >
                      Download Phantom
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Wallet Selection */}
                  {!selectedWallet ? (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 mb-4">Choose a wallet:</h3>
                      {availableWallets.map((wallet, index) => (
                        <button
                          key={index}
                          onClick={() => handleWalletSelect(wallet)}
                          className="w-full flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors"
                        >
                          <span className="text-2xl">{wallet.icon}</span>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-gray-900">{wallet.name}</div>
                            {wallet.description && (
                              <div className="text-sm text-gray-600">{wallet.description}</div>
                            )}
                          </div>
                          <span className="text-gray-400">→</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    // Selected Wallet Confirmation
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl">{selectedWallet.icon}</span>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{selectedWallet.name}</h3>
                            <p className="text-gray-600">
                              {selectedWallet.type === 'walletconnect' 
                                ? 'Scan QR code with your wallet' 
                                : 'Click connect to continue'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">❌</span>
                            <span className="font-medium">{error}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={() => setSelectedWallet(null)}
                          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleConnect}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Connecting...
                            </div>
                          ) : (
                            'Connect'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Connected State
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-green-800 text-lg">Connected to {walletName}</span>
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-green-900 font-mono text-sm break-all">
                    {publicKey}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Balance:</span>
                  <span className="font-bold text-xl text-gray-900">
                    {parseFloat(balance).toFixed(4)} CARV
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Network:</span>
                  <span className="font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    Carv SVM
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => navigator.clipboard.writeText(publicKey)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">📋</span>
                  Copy Address
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">🚪</span>
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;