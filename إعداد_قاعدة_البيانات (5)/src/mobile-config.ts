// تكوين خاص بالموبايل
import { Capacitor } from '@capacitor/core';

export const isMobile = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'

// إعدادات خاصة بالموبايل
export const mobileConfig = {
  // تفعيل الوضع الليلي تلقائياً على الموبايل
  darkMode: isMobile,
  
  // حجم الخط على الموبايل
  fontSize: isMobile ? 'large' : 'medium',
  
  // تفعيل الاهتزاز عند النقر
  hapticFeedback: isMobile,
  
  // تفعيل الإشعارات
  notifications: isMobile,
};

// دالة للتحقق من نوع المنصة
export const isIOS = () => platform === 'ios';
export const isAndroid = () => platform === 'android';
export const isWeb = () => platform === 'web';
