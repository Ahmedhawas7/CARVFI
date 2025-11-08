import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import AuthModal from './components/AuthModal';
import RewardsDashboard from './components/RewardsDashboard';
import UserProfile from './components/UserProfile';
import BotProtection from './components/BotProtection';
import AIAssistant from './components/AIAssistant';
import ModernHeader from './components/ModernHeader';
import WelcomeHero from './components/WelcomeHero';
import './styles/global.css';

// Enhanced Storage Service
const StorageService = {
  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem('carvfi_current_user') || 'null');
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  saveUser: (userData) => {
    try {
      localStorage.setItem('carvfi_current_user', JSON.stringify(userData));
      
      const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
      const userKey = userData.walletAddress?.toLowerCase();
      if (userKey) {
        users[userKey] = userData;
        localStorage.setItem('carvfi_users', JSON.stringify(users));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('carvfi_current_user');
  }
};

const AppContent = () => {
  const { isConnected, publicKey, disconnectWallet } = useWallet();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isConnected && publicKey) {
      const savedUser = StorageService.getCurrentUser();
      if (savedUser && savedUser.walletAddress === publicKey) {
        setUser(savedUser);
        setShowAuthModal(false);
        navigate('/dashboard');
      } else {
        setShowAuthModal(true);
      }
    } else {
      setUser(null);
    }
  }, [isConnected, publicKey, navigate]);

  const checkAuthentication = () => {
    const userData = StorageService.getCurrentUser();
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  };

  const handleLoginSuccess = (userData) => {
    const success = StorageService.saveUser(userData);
    if (success) {
      setUser(userData);
      setShowAuthModal(false);
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
    disconnectWallet();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading CARVFi...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <BotProtection />
      
      {/* Modern Header */}
      <ModernHeader 
        user={user}
        activeFeature={activeFeature}
        onFeatureChange={setActiveFeature}
        onLoginClick={() => setShowAuthModal(true)}
        onLogoutClick={handleLogout}
      />

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <WelcomeHero onGetStarted={() => setShowAuthModal(true)} />
              )
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              user ? <RewardsDashboard user={user} /> : <Navigate to="/" replace />
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              user ? <UserProfile user={user} /> : <Navigate to="/" replace />
            } 
          />
          
          <Route 
            path="/ai-assistant" 
            element={
              user ? <AIAssistant user={user} /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            if (!user) {
              disconnectWallet();
            }
          }}
          onLoginSuccess={handleLoginSuccess}
          walletAddress={publicKey}
        />
      )}

      {/* Global Styles */}
      <style jsx>{`
        .app {
          min-height: 100vh;
          background: var(--gradient-dark);
          position: relative;
        }

        .main-content {
          padding-top: 80px;
          min-height: calc(100vh - 80px);
        }

        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--gradient-dark);
          gap: 20px;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid var(--purple-royal);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;
