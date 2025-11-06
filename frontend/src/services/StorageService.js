// في frontend/src/services/StorageService.js - أضف هذه الدوال
class StorageService {
  // الدوال الحالية تبقى كما هي...
  
  // دالة جديدة لحفظ بيانات المستخدم
  static saveUserData(userData) {
    try {
      localStorage.setItem('userAccount', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userWallet', userData.address);
      return { success: true };
    } catch (error) {
      console.error('StorageService: Failed to save user data', error);
      return { success: false, error: error.message };
    }
  }

  // دالة جديدة لجلب بيانات المستخدم
  static getUserData() {
    try {
      const userData = localStorage.getItem('userAccount');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('StorageService: Failed to get user data', error);
      return null;
    }
  }

  // دالة للتحقق من تسجيل الدخول
  static isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  // دالة للحصول على عنوان المحفظة
  static getUserWallet() {
    return localStorage.getItem('userWallet');
  }
}

export default StorageService;