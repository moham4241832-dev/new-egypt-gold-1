# ⚡ دليل البدء السريع - 5 دقائق

## 🎯 الهدف
تحويل التطبيق إلى APK لأندرويد في 5 دقائق!

---

## ✅ المتطلبات
- [x] Node.js مثبت
- [ ] Android Studio مثبت ([تحميل](https://developer.android.com/studio))

---

## 🚀 الخطوات (نسخ ولصق فقط!)

### 1️⃣ تهيئة Capacitor
```bash
npx cap init "NEW EGYPT GOLD" com.newegyptgold.sales dist
```

### 2️⃣ بناء التطبيق
```bash
npm run build
```

### 3️⃣ إضافة أندرويد
```bash
npx cap add android
```

### 4️⃣ فتح في Android Studio
```bash
npx cap open android
```

### 5️⃣ بناء APK
في Android Studio:
- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- انتظر الإشعار
- اضغط **locate**

---

## 🎉 انتهيت!

الملف: `android/app/build/outputs/apk/debug/app-debug.apk`

أرسله لأي جهاز أندرويد وثبّته! 📱

---

## 🔄 للتحديث لاحقاً

```bash
npm run build
npx cap sync
```

ثم أعد بناء APK من Android Studio.

---

## 📱 للاختبار السريع

```bash
# على محاكي أندرويد
npx cap run android

# على جهاز متصل
npx cap run android --target=device
```

---

## ❓ مشاكل؟

**Gradle error**:
```bash
cd android && ./gradlew clean && cd ..
```

**لا يتصل بالإنترنت**:
- تأكد من وجود `.env.local`
- أعد البناء: `npm run build:mobile`

---

**وقت الإنجاز الفعلي**: 5-10 دقائق ⏱️

**حجم APK**: حوالي 15-20 ميجا 📦
