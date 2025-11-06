import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import AuthModal from './components/AuthModal';
import './App.css';

// خدمة تخزين محلية
const StorageService = {
  saveUser: (userData) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    const userKey = userData.walletAddress?.toLowerCase();
    
    users[userKey] = {
      ...userData,
      points: userData.points || 0,
      streak: userData.streak || 1,
      level: userData.level || 1,
      loginCount: userData.loginCount || 1,
      lastLogin: userData.lastLogin || new Date().toISOString(),
      createdAt: userData.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('carvfi_users', JSON.stringify(users));
    localStorage.setItem('carvfi_current_user', JSON.stringify(users[userKey]));
    
    console.log('💾 User saved:', users[userKey]);
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('carvfi_current_user') || 'null');
  },

  getUser: (walletAddress) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    return users[walletAddress?.toLowerCase()];
  },

  updateStreak: (walletAddress) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    const userKey = walletAddress?.toLowerCase();
    
    if (users[userKey]) {
      const today = new Date().toDateString();
      const lastLogin = users[userKey].lastLogin ? new Date(users[userKey].lastLogin).toDateString() : null;
      
      if (lastLogin !== today) {
        users[userKey].streak = (users[userKey].streak || 0) + 1;
        users[userKey].lastLogin = new Date().toISOString();
        users[userKey].loginCount = (users[userKey].loginCount || 0) + 1;
        users[userKey].lastUpdated = new Date().toISOString();
        localStorage.setItem('carvfi_users', JSON.stringify(users));
        
        // تحديث المستخدم الحالي
        const currentUser = StorageService.getCurrentUser();
        if (currentUser && currentUser.walletAddress?.toLowerCase() === userKey) {
          currentUser.streak = users[userKey].streak;
          currentUser.lastLogin = users[userKey].lastLogin;
          currentUser.loginCount = users[userKey].loginCount;
          localStorage.setItem('carvfi_current_user', JSON.stringify(currentUser));
        }
        
        return users[userKey].streak;
      }
    }
    return 0;
  },

  updatePoints: (walletAddress, pointsToAdd) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    const userKey = walletAddress?.toLowerCase();
    
    if (users[userKey]) {
      users[userKey].points = (users[userKey].points || 0) + pointsToAdd;
      users[userKey].lastUpdated = new Date().toISOString();
      localStorage.setItem('carvfi_users', JSON.stringify(users));
      
      // تحديث المستخدم الحالي أيضاً
      const currentUser = StorageService.getCurrentUser();
      if (currentUser && currentUser.walletAddress?.toLowerCase() === userKey) {
        currentUser.points = users[userKey].points;
        localStorage.setItem('carvfi_current_user', JSON.stringify(currentUser));
      }
      
      return users[userKey].points;
    }
    return 0;
  },

  saveActivity: (walletAddress, activity) => {
    const activities = JSON.parse(localStorage.getItem('carvfi_activities') || '{}');
    const userKey = walletAddress?.toLowerCase();
    
    if (!activities[userKey]) {
      activities[userKey] = [];
    }
    
    activities[userKey].unshift({
      id: Date.now().toString(),
      ...activity,
      timestamp: new Date().toISOString()
    });
    
    activities[userKey] = activities[userKey].slice(0, 50);
    localStorage.setItem('carvfi_activities', JSON.stringify(activities));
  }
};

const AppContent = () => {
  const { isConnected, publicKey, balance, walletName, connectWallet, disconnectWallet } = useWallet();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    console.log('🔄 Wallet state changed:', { isConnected, publicKey });
    
    if (isConnected && publicKey) {
      const savedUser = StorageService.getCurrentUser();
      console.log('💾 Saved user from storage:', savedUser);
      
      if (savedUser && savedUser.walletAddress === publicKey) {
        // المستخدم مسجل مسبقاً - تحديث البيانات
        console.log('✅ Existing user found - updating data');
        const newStreak = StorageService.updateStreak(publicKey);
        const updatedUser = {
          ...savedUser,
          streak: newStreak || savedUser.streak
        };
        setUser(updatedUser);
        
        // تسجيل نشاط الدخول
        if (newStreak > 0) {
          StorageService.saveActivity(publicKey, {
            type: 'login',
            description: `Daily login - Streak: ${newStreak} days`,
            points: 10
          });
          StorageService.updatePoints(publicKey, 10);
        }
      } else {
        // مستخدم جديد - فتح مودال التسجيل
        console.log('🆕 New user detected - opening auth modal');
        setShowAuthModal(true);
        setUser(null);
      }
    } else {
      // المحفظة غير متصلة
      console.log('🔌 Wallet disconnected');
      setUser(null);
      setShowAuthModal(false);
    }
  }, [isConnected, publicKey]);

  const handleAuthSuccess = (userData) => {
    console.log('🎉 Authentication successful:', userData);
    
    const userWithStats = {
      walletAddress: publicKey,
      type: 'solana',
      walletName: walletName,
      // كل البيانات الجديدة من الفورم
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      carvPlayUsername: userData.carvPlayUsername,
      carvUID: userData.carvUID,
      twitter: userData.twitter,
      telegram: userData.telegram,
      avatar: userData.avatar,
      // الإحصائيات
      points: 50, // نقاط المكافأة للتسجيل
      streak: 1,
      level: 1,
      loginCount: 1,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    // حفظ في التخزين المحلي
    StorageService.saveUser(userWithStats);
    
    // تسجيل نشاط التسجيل
    StorageService.saveActivity(publicKey, {
      type: 'registration',
      description: `New user registered successfully`,
      points: 50
    });
    
    // تحميل بيانات المستخدم المحدثة
    const updatedUser = StorageService.getUser(publicKey);
    
    setUser(updatedUser);
    setShowAuthModal(false);
    
    console.log('✅ User registration completed:', updatedUser);
  };

  const handleConnectWallet = async () => {
    try {
      console.log('🔗 Connecting wallet...');
      await connectWallet('backpack');
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
    }
  };

  const handleLogout = () => {
    console.log('🚪 User logging out');
    disconnectWallet();
    setUser(null);
    localStorage.removeItem('carvfi_current_user');
  };

  // إذا لم يكن هناك محفظة متصلة، عرض شاشة الترحيب
  if (!isConnected) {
    return (
      <div className="app">
        <div className="auth-background">
          <div className="welcome-content">
            <h1>🌐 CARVFi</h1>
            <p>Web3 Social Platform on Carv SVM</p>
            <div className="welcome-features">
              <div className="feature">🤖 AI Assistant</div>
              <div className="feature">💰 Rewards System</div>
              <div className="feature">🛡️ Bot Protection</div>
              <div className="feature">🎒 BackPack Support</div>
            </div>
            <button 
              className="btn btn-primary connect-btn"
              onClick={handleConnectWallet}
            >
              Connect BackPack Wallet
            </button>
            <p className="wallet-info">
              Connect your BackPack wallet to start earning CARV rewards
            </p>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم متصلاً ولكن لم يكمل التسجيل
  if (isConnected && publicKey && !user) {
    console.log('🚨 Rendering auth modal state');
    return (
      <div className="app">
        <AuthModal 
          isOpen={true}
          onClose={() => {
            console.log('❌ Auth modal closed without completion');
            disconnectWallet();
          }} 
          onAuthSuccess={handleAuthSuccess}
          walletAddress={publicKey}
        />
        <div className="auth-background">
          <div className="welcome-content">
            <h1>🌐 CARVFi</h1>
            <p>Complete your profile to continue</p>
            <div className="connected-wallet">
              <p>Connected: {publicKey?.slice(0, 8)}...{publicKey?.slice(-6)}</p>
              <p>Wallet: {walletName}</p>
              <p>Balance: {parseFloat(balance).toFixed(4)} CARV</p>
              <p style={{color: '#f59e0b', fontSize: '14px', marginTop: '10px'}}>
                ⚠️ Please complete your profile in the modal above
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // الواجهة الرئيسية عندما يكون المستخدم متصلاً ومسجلاً
  if (isConnected && publicKey && user) {
    console.log('🎯 Rendering main app with user:', user);
    return (
      <div className="app">
        <header className="header">
          <div className="header-left">
            <h1 className="logo">🌐 CARVFi</h1>
            <p className="tagline">Web3 Social Platform</p>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="user-details">
                <span className="user-name">
                  {user.firstName} {user.lastName}
                </span>
                <span className="user-wallet">
                  {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
                </span>
                <span className="balance-info">
                  {parseFloat(balance).toFixed(4)} CARV
                </span>
                <span className="user-points">
                  {user.points || 0} points | Streak: {user.streak || 0} days
                </span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="main-content">
          <div className="dashboard">
            <div className="welcome-section">
              <h2>🎉 Welcome back, {user.firstName}!</h2>
              <p>Your CARVFi dashboard is ready</p>
            </div>
            
            <div className="profile-card">
              <h3>👤 Profile Information</h3>
              <div className="profile-grid">
                <div className="profile-item">
                  <strong>Username:</strong> {user.username}
                </div>
                <div className="profile-item">
                  <strong>Email:</strong> {user.email}
                </div>
                {user.carvPlayUsername && (
                  <div className="profile-item">
                    <strong>Carv Play:</strong> {user.carvPlayUsername}
                  </div>
                )}
                {user.carvUID && (
                  <div className="profile-item">
                    <strong>Carv UID:</strong> {user.carvUID}
                  </div>
                )}
                {user.twitter && (
                  <div className="profile-item">
                    <strong>Twitter:</strong> {user.twitter}
                  </div>
                )}
                {user.telegram && (
                  <div className="profile-item">
                    <strong>Telegram:</strong> {user.telegram}
                  </div>
                )}
              </div>
            </div>

            <div className="wallet-card">
              <h3>💰 Wallet Information</h3>
              <div className="wallet-info">
                <p><strong>Address:</strong> {publicKey}</p>
                <p><strong>Balance:</strong> {balance} CARV</p>
                <p><strong>Network:</strong> Carv SVM Testnet</p>
                <p><strong>Wallet:</strong> {walletName}</p>
              </div>
            </div>
            
            <div className="stats-card">
              <h3>📊 Your Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{user.points || 0}</div>
                  <div className="stat-label">Points</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{user.streak || 0}</div>
                  <div className="stat-label">Day Streak</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{user.level || 1}</div>
                  <div className="stat-label">Level</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{user.loginCount || 1}</div>
                  <div className="stat-label">Logins</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // شاشة التحميل
  return (
    <div className="app">
      <div className="auth-background">
        <div className="welcome-content">
          <h1>🌐 CARVFi</h1>
          <p>Loading your profile...</p>
          <div className="connected-wallet">
            <p>Connected: {publicKey?.slice(0, 8)}...{publicKey?.slice(-6)}</p>
            <p>Please wait...</p>
          </div>
        </div>
      </div>
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