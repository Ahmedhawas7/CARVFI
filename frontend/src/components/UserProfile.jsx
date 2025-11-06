import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StorageService from '../services/StorageService';

const UserProfile = ({ user }) => {
  const [profile, setProfile] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    carvPlayUsername: '',
    carvUID: '',
    twitter: '',
    telegram: '',
    avatar: '',
    bio: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        carvPlayUsername: user.carvPlayUsername || '',
        carvUID: user.carvUID || '',
        twitter: user.twitter || '',
        telegram: user.telegram || '',
        avatar: user.avatar || '',
        bio: user.bio || 'Tell us about yourself and your Web3 journey...'
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // استخدام StorageService بدلاً من localStorage المباشر
      const updatedUser = {
        ...user,
        ...profile,
        lastUpdated: new Date().toISOString()
      };

      // حفظ عبر StorageService
      StorageService.saveUser(updatedUser);

      // حفظ النشاط
      StorageService.saveActivity(user.walletAddress, {
        type: 'profile_update',
        description: 'Profile updated successfully',
        points: 5
      });

      StorageService.updatePoints(user.walletAddress, 5);

      console.log('✅ Profile data saved via StorageService');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('avatar', e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <div className="modern-main">
        <div className="main-container">
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>No User Data</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please go back to dashboard</p>
            <button
              onClick={handleBackToDashboard}
              className="cta-button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>←</span>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-main">
      <div className="main-container">
        {/* Header */}
        <div className="welcome-banner" style={{ marginBottom: '2rem' }}>
          <div className="welcome-content">
            <h2>Profile Settings 👤</h2>
            <p>Manage your account information and preferences</p>
          </div>
          <button
            onClick={handleBackToDashboard}
            className="action-btn"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>←</span>
            Back to Dashboard
          </button>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Personal Profile</h3>
              <span className="card-badge">Active</span>
            </div>

            <form onSubmit={handleSaveProfile}>
              {/* Profile Picture */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div style={{ 
                    width: '120px', 
                    height: '120px',
                    background: profile.avatar ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    color: 'white',
                    marginBottom: '1rem',
                    border: '4px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    overflow: 'hidden'
                  }}>
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '2rem' }}>
                        {profile.firstName?.charAt(0) || '👤'}
                      </span>
                    )}
                  </div>
                  
                  <label 
                    htmlFor="avatar-upload"
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '3px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    📷
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Click the camera icon to update your profile picture
                </p>
              </div>

              {/* Basic Information Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ 
                  color: '#ffffff', 
                  marginBottom: '1.5rem', 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingBottom: '0.5rem'
                }}>
                  Basic Information
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#94a3b8', 
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Enter username"
                      required
                      className="profile-input"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#94a3b8', 
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="profile-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#94a3b8', 
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="First name"
                      required
                      className="profile-input"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#94a3b8', 
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Last name"
                      required
                      className="profile-input"
                    />
                  </div>
                </div>
              </div>

              {/* Carv Information Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ 
                  color: '#ffffff', 
                  marginBottom: '1.5rem', 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingBottom: '0.5rem'
                }}>
                  Carv Information
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#94a3b8', 
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Carv Play Username
                    </label>
                    <input
                      type="text"
                      value={profile.carvPlayUsername}
                      onChange={(e) => handleInputChange('carvPlayUsername', e.target.value)}
                      placeholder="Your Carv Play username"
                      className="profile-input"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#94a3b8', 
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Carv UID
                    </label>
                    <input
                      type="text"
                      value={profile.carvUID}
                      onChange={(e) => handleInputChange('carvUID', e.target.value)}
                      placeholder="Your Carv UID"
                      className="profile-input"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ 
                  color: '#ffffff', 
                  marginBottom: '1.5rem', 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingBottom: '0.5rem'
                }}>
                  Social Media
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#94a3b8', 
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={profile.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="@username"
                      className="profile-input"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#94a3b8', 
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Telegram
                    </label>
                    <input
                      type="text"
                      value={profile.telegram}
                      onChange={(e) => handleInputChange('telegram', e.target.value)}
                      placeholder="@username"
                      className="profile-input"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#94a3b8', 
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself and your Web3 journey..."
                  className="profile-input"
                  style={{ 
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    minHeight: '100px'
                  }}
                />
              </div>

              {/* Wallet Address (Read-only) */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#94a3b8', 
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  Wallet Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={user.walletAddress}
                    readOnly
                    className="profile-input"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: '#64748b',
                      cursor: 'not-allowed'
                    }}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)' 
                  }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: 'rgba(16, 185, 129, 0.2)', 
                      color: '#10b981', 
                      padding: '0.3rem 0.6rem', 
                      borderRadius: '6px',
                      fontWeight: '600'
                    }}>
                      Connected
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '2rem'
              }}>
                <button
                  type="button"
                  onClick={handleBackToDashboard}
                  className="action-btn"
                  style={{ 
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#94a3b8'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="cta-button"
                  style={{ 
                    minWidth: '140px',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner" style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderWidth: '2px',
                        borderTopColor: 'white'
                      }}></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>

              {/* Status Messages */}
              {saveStatus === 'success' && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  borderRadius: '12px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  ✅ Changes saved successfully! +5 points
                </div>
              )}
              
              {saveStatus === 'error' && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  borderRadius: '12px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  ❌ Error saving changes, please try again
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 0.9rem;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .profile-input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .profile-input::placeholder {
          color: #64748b;
        }

        textarea.profile-input {
          resize: vertical;
          min-height: 100px;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;