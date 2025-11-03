import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import AIChat from './components/AIChat';
import RewardsDashboard from './components/RewardsDashboard';
import BotProtection from './components/BotProtection';
import { CarvService } from './services/carv';
import { SolanaService } from './services/solana';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showAIChat, setShowAIChat] = useState(false);
  const [carvService, setCarvService] = useState(null);
  const [solanaService, setSolanaService] = useState(null);

  useEffect(() => {
    initializeServices();
    checkExistingSession();
  }, []);

  const initializeServices = () => {
    setCarvService(new CarvService());
    setSolanaService(new SolanaService());
  };

  const checkExistingSession = () => {
    const savedUser = localStorage.getItem('carvfi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // إذا مافيش user محفوظ، نفتح الـ AuthModal تلقائياً
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('carvfi_user', JSON.stringify(userData));
    setShowAuthModal(false); // نغلق الـ modal بعد التسجيل الناجح
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('carvfi_user');
    setShowAuthModal(true); // نفتح الـ modal مرة تانيه بعد التسجيل خروج
  };

  // إذا كان الـ modal مفتوح، نعرض فقط الـ modal
  if (showAuthModal) {
    return (
      <div className="app">
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
        <div className="loading-screen">
          <div className="loading-content">
            <h1>🌐 CARVFi</h1>
            <p>Web3 Social Platform</p>
            <p className="loading-subtitle">Connect your wallet to get started</p>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان فيه user مسجل، نعرض الواجهة الرئيسية
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1 className="logo">🌐 CARVFi</h1>
          <p className="tagline">Web3 Social Platform</p>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-wallet">
              {user.type === 'evm' 
                ? `EVM: ${user.address.substring(0, 6)}...${user.address.substring(38)}`
                : `SOL: ${user.address.substring(0, 6)}...`
              }
            </span>
            <span className="network-badge">
              {user.type === 'evm' ? 'Ethereum' : 'Solana'}
            </span>
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>
            Logout
          </button>
          <button 
            className="btn btn-ai" 
            onClick={() => setShowAIChat(!showAIChat)}
          >
            🤖 AI
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="navigation">
        {['profile', 'rewards', 'protection'].map(tab => (
          <button
            key={tab}
            className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'profile' && (
          <UserProfile 
            user={user}
            carvService={carvService}
            solanaService={solanaService}
          />
        )}
        
        {activeTab === 'rewards' && (
          <RewardsDashboard 
            user={user}
          />
        )}
        
        {activeTab === 'protection' && (
          <BotProtection 
            user={user}
          />
        )}
      </main>

      {/* AI Chat */}
      {showAIChat && (
        <AIChat 
          user={user}
          carvService={carvService}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
}

export default App;
