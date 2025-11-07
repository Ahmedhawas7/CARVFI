import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const AuthModal = ({ isOpen, onClose, onAuthSuccess, walletAddress }) => {
  const { 
    availableWallets, 
    connectWallet, 
    isLoading, 
    error 
  } = useWallet();
  
  const [activeTab, setActiveTab] = useState('connect');
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    carvPlayUsername: '',
    carvUID: '',
    twitter: '',
    telegram: '',
    avatar: '',
    bio: 'Ready to explore the world of Web3 and Social Finance! 🚀'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // توليد username تلقائي عند فتح المودال
  useEffect(() => {
    if (walletAddress && isOpen && !formData.username) {
      const randomNum = Math.floor(Math.random() * 10000);
      const newUsername = `user${randomNum}`;
      setFormData(prev => ({ ...prev, username: newUsername }));
    }
  }, [walletAddress, isOpen, formData.username]);

  if (!isOpen) return null;

  const handleWalletConnect = async (walletType) => {
    try {
      console.log(`🔗 Connecting to ${walletType}...`);
      const result = await connectWallet(walletType);
      if (result.success) {
        console.log('✅ Wallet connected successfully');
        onClose();
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // مسح الخطأ عندما يبدأ المستخدم الكتابة
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (!/^[a-z0-9]+$/.test(formData.username)) {
      errors.username = 'Username must contain only lowercase letters and numbers';
    }

    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Submitting profile data:', formData);
      
      if (onAuthSuccess) {
        onAuthSuccess(formData);
        console.log('✅ onAuthSuccess called successfully');
      } else {
        console.error('❌ onAuthSuccess is not defined!');
      }

    } catch (error) {
      console.error('❌ Error creating account:', error);
      setFormErrors({ submit: 'Failed to create account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomUsername = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    const newUsername = `user${randomNum}`;
    setFormData(prev => ({ ...prev, username: newUsername }));
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

  // مودال إكمال الملف الشخصي (التصميم الجديد)
  if (walletAddress) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl">
                🌐
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Join CARVFi Community 🚀</h2>
            <p className="text-gray-400">Complete your profile to start your Web3 journey</p>
            
            {/* Wallet Info */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 mt-4 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <span>✅</span>
                <span className="font-semibold">Wallet Connected</span>
              </div>
              <p className="text-green-300 text-sm font-mono">
                {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-8">
            
            {/* Profile Picture Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-4xl text-white mb-4 mx-auto border-4 border-white/20 shadow-2xl overflow-hidden">
                  {formData.avatar ? (
                    <img 
                      src={formData.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg border-2 border-white/30"
                >
                  📷
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray-400 text-sm">Click the camera to add a profile picture</p>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Username */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white mb-3">
                  Username *
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                    placeholder="Choose a unique username"
                    className={`flex-1 px-4 py-3 bg-gray-800 border-2 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all ${
                      formErrors.username ? 'border-red-500' : 'border-gray-600'
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={generateRandomUsername}
                    className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all disabled:opacity-50 font-semibold"
                    disabled={isSubmitting}
                  >
                    Random
                  </button>
                </div>
                {formErrors.username && (
                  <p className="text-red-400 text-sm mt-2">{formErrors.username}</p>
                )}
                <p className="text-gray-400 text-xs mt-2">Lowercase letters and numbers only</p>
              </div>

              {/* First Name & Last Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Your first name"
                  className={`w-full px-4 py-3 bg-gray-800 border-2 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all ${
                    formErrors.firstName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                  disabled={isSubmitting}
                />
                {formErrors.firstName && (
                  <p className="text-red-400 text-sm mt-2">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Your last name"
                  className={`w-full px-4 py-3 bg-gray-800 border-2 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all ${
                    formErrors.lastName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                  disabled={isSubmitting}
                />
                {formErrors.lastName && (
                  <p className="text-red-400 text-sm mt-2">{formErrors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3 bg-gray-800 border-2 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all ${
                    formErrors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                  disabled={isSubmitting}
                />
                {formErrors.email && (
                  <p className="text-red-400 text-sm mt-2">{formErrors.email}</p>
                )}
              </div>

            </div>

            {/* Bio Section */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                placeholder="Tell us about yourself and your Web3 journey..."
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Carv Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  🎮 Carv Play Username
                </label>
                <input
                  type="text"
                  value={formData.carvPlayUsername}
                  onChange={(e) => handleInputChange('carvPlayUsername', e.target.value)}
                  placeholder="Your gaming username"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  🔢 Carv UID
                </label>
                <input
                  type="text"
                  value={formData.carvUID}
                  onChange={(e) => handleInputChange('carvUID', e.target.value)}
                  placeholder="Your unique Carv ID"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  🐦 Twitter
                </label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  📱 Telegram
                </label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                🌐 Profile Picture URL
              </label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => handleInputChange('avatar', e.target.value)}
                placeholder="Paste direct image URL for your profile"
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all"
                disabled={isSubmitting}
              />
              <p className="text-gray-400 text-xs mt-2">Paste a direct image URL for your profile picture</p>
            </div>

            {/* Error Messages */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {formErrors.submit && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl">
                <p className="text-sm">{formErrors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-700 text-white py-4 rounded-xl font-semibold hover:bg-gray-600 transition-all disabled:opacity-50 border-2 border-gray-600"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Start My Journey
                  </>
                )}
              </button>
            </div>

            {/* Benefits */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <h4 className="text-blue-400 font-semibold mb-2">🎁 What you'll get:</h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• 50 Welcome Points to start your journey</li>
                <li>• Access to exclusive CARVFi rewards</li>
                <li>• Personalized SocialFi dashboard</li>
                <li>• AI-powered Web3 assistant</li>
              </ul>
            </div>

          </form>
        </div>
      </div>
    );
  }

  // مودال ربط المحفظة العادي (نفس التصميم السابق)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 w-full max-w-md border border-gray-700 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
            🔗
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Choose your wallet to continue</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-800 rounded-2xl p-1">
          <button
            className={`flex-1 py-3 font-semibold rounded-xl transition-all ${
              activeTab === 'connect' 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('connect')}
          >
            Connect Wallet
          </button>
        </div>

        {/* Wallet List */}
        <div className="space-y-3">
          {availableWallets.length > 0 ? (
            availableWallets.map((wallet, index) => (
              <button 
                key={index}
                onClick={() => handleWalletConnect(wallet.name.toLowerCase())}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 bg-gray-800 border-2 border-gray-700 rounded-xl hover:border-purple-500/50 hover:bg-gray-750 transition-all disabled:opacity-50 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{wallet.icon}</span>
                <span className="font-semibold text-white flex-1 text-left">{wallet.name}</span>
                {isLoading && (
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>
            ))
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🎒</div>
              <p className="text-gray-400 mb-4">No wallets detected</p>
              <a 
                href="https://www.backpack.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg"
              >
                Install BackPack
              </a>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl mt-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Security Note */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 mt-6">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <span>🔒</span>
            <span className="font-semibold">Secure Connection</span>
          </div>
          <p className="text-green-300 text-sm">Your wallet connection is encrypted and private</p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            By connecting, you agree to our Terms of Service & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;