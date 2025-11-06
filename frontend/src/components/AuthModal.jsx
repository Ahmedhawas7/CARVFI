// frontend/src/components/AuthModal.jsx
import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('connect');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Connect Wallet</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-4 border-b">
          <button
            className={`flex-1 py-2 font-medium ${
              activeTab === 'connect' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('connect')}
          >
            Connect
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Available Wallets</h3>
            <p className="text-sm text-gray-600">
              Choose your preferred wallet to connect
            </p>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-xl">🎒</span>
              <span className="font-medium">BackPack</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <span className="text-xl">👻</span>
              <span className="font-medium">Phantom</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors">
              <span className="text-xl">🔗</span>
              <span className="font-medium">WalletConnect</span>
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              🔒 Your wallet connection is secure and private
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By connecting, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;