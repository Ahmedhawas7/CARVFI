import React, { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import AIChat from './components/AIChat';
import RewardsDashboard from './components/RewardsDashboard';
import BotProtection from './components/BotProtection';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('carvfi_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setShowAuthModal(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('carvfi_user');
      }
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    console.log('Authentication successful:', userData);
    
    // نخزن البيانات الأساسية فقط
    const simpleUserData = {
      type: userData.type,
      address: userData.address
    };
    
    setUser(simpleUserData);
    localStorage.setItem('carvfi_user', JSON.stringify(simpleUserData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('carvfi_user');
    setShowAuthModal(true);
  };

  if (showAuthModal) {
    return (
      <div className="app">
        <AuthModal 
          isOpen={true}
          onClose={() => {}} 
          onAuthSuccess={handleAuthSuccess}
        />
        <div className="auth-background">
          <div className="welcome-content">
            <h1>🌐 CARVFi</h1>
            <p>Web3 Social Platform</p>
            <div className="welcome-features">
              <div className="feature">🤖 AI Assistant</div>
              <div className="feature">💰 Rewards System</div>
              <div className="feature">🛡️ Bot Protection</div>
              <div className="feature">🔗 Multi-Chain Support</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">🌐 CARVFi</h1>
          <p className="tagline">Web3 Social Platform</p>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-wallet">
              {user?.address ? `${user.address.substring(0, 6)}...${user.address.substring(38)}` : 'No wallet'}
            </span>
            <span className="network-badge">
              {user?.type === 'evm' ? 'Ethereum' : 'Solana'}
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

      <main className="main-content">
        {activeTab === 'profile' && <UserProfile user={user} />}
        {activeTab === 'rewards' && <RewardsDashboard user={user} />}
        {activeTab === 'protection' && <BotProtection user={user} />}
      </main>

      {showAIChat && (
        <AIChat 
          user={user}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
}

export default App;
