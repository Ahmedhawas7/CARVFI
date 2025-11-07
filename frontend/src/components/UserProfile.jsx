import React, { useState, useEffect } from 'react';
import './UserProfile.css';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const savedUser = localStorage.getItem('carvfi_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserData(user);
      setEditForm({
        username: user.username || '',
        email: user.email || '',
        twitter: user.twitter || '',
        telegram: user.telegram || '',
        wallet: user.wallet || ''
      });
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditForm({
        username: userData.username || '',
        email: userData.email || '',
        twitter: userData.twitter || '',
        telegram: userData.telegram || '',
        wallet: userData.wallet || ''
      });
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Simulate API call to update profile
      setTimeout(() => {
        const updatedUser = { ...userData, ...editForm };
        setUserData(updatedUser);
        localStorage.setItem('carvfi_user', JSON.stringify(updatedUser));
        
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setMessage('Error updating profile');
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="login-prompt">
          <h2>Please Login</h2>
          <p>You need to login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <button 
          className={`edit-btn ${isEditing ? 'cancel' : 'edit'}`}
          onClick={handleEditToggle}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {userData.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2>{userData.username}</h2>
            <p className="user-email">{userData.email}</p>
          </div>

          <div className="profile-details">
            <div className="detail-group">
              <h3>Account Information</h3>
              
              <div className="detail-item">
                <label>Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <span>{userData.username}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <span>{userData.email}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Wallet Address</label>
                <span className="wallet-address">
                  {userData.wallet ? 
                    `${userData.wallet.substring(0, 8)}...${userData.wallet.substring(userData.wallet.length - 6)}` 
                    : 'Not connected'
                  }
                </span>
              </div>
            </div>

            <div className="detail-group">
              <h3>Social Connections</h3>
              
              <div className="detail-item">
                <label>Twitter</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="twitter"
                    value={editForm.twitter}
                    onChange={handleInputChange}
                    placeholder="@username"
                    className="edit-input"
                  />
                ) : (
                  <span>{userData.twitter || 'Not connected'}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Telegram</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="telegram"
                    value={editForm.telegram}
                    onChange={handleInputChange}
                    placeholder="@username"
                    className="edit-input"
                  />
                ) : (
                  <span>{userData.telegram || 'Not connected'}</span>
                )}
              </div>
            </div>

            <div className="detail-group">
              <h3>Account Stats</h3>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-label">Member Since</span>
                  <span className="stat-value">January 2024</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Status</span>
                  <span className="stat-value active">Active</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Rewards Points</span>
                  <span className="stat-value">175</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="action-buttons">
            <button 
              className="save-btn"
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;