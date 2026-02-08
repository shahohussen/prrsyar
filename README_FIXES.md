# SURVIVOR ULTRA - نوسخەی چاککراو

## 🎯 چاکسازییەکان

### ✅ **کێشە چارەسەرکراوەکان**

#### **1. سیستەمی تۆکن (Token System)**
- ✅ حساباتی ورد بۆ تۆکنەکان لە هەموو شوێنێک
- ✅ تۆکن بە دەقیقی زیاد دەبێت کاتێک:
  - وەڵامی ڕاست دەدەیت (10 تۆکن)
  - یاری دەبەیتەوە (50 تۆکن)
  - یاری تەواو دەکەیت (20 تۆکن)
  - ڕیکلام دەبینیت (100 تۆکن - زیادکرا لە 20)
- ✅ تۆکن بە دەقیقی کەم دەبێتەوە کاتێک لە shop توانا دەکڕیت
- ✅ Animation بۆ نیشاندانی گۆڕانکارییەکان

#### **2. یاری سەرەکی (Main Game Scheduling)**
- ✅ یاری سەرەکی لە کاتژمێر 8:00 شەو (20:00) دەست پێ دەکات
- ✅ Countdown timer نیشان دەدات تا یاری سەرەکی
- ✅ پاداشتی جیاواز بۆ یاری سەرەکی (500 خاڵ، 50 تۆکن)
- ✅ جیاوازی لە نێوان "یاری خێرا" و "یاری سەرەکی"

#### **3. سیستەمی ڕیکلام (Ad System)**
- ✅ دوگمەی "سەیری ڕیکلام" زیاد کراوە
- ✅ هەر ڕیکلامێک = 100 تۆکن
- ✅ Cooldown period (5 خولەک) بۆ پێشگیریکردن لە abuse
- ✅ پێشنیار بۆ سەیرکردنی ڕیکلام کاتێک تۆکنەکان کەمن
- ✅ Simulation بۆ ماوەی ڕیکلام (30 چرکە)

#### **4. بەشی ئەدمین (Admin Panel)**
- ✅ دوگمەی ئەدمین زیاد کراوە لە navigation (تەنها بۆ ئەدمینەکان دیارە)
- ✅ Admin panel بە تەواوی کاردەکات
- ✅ تەنها ئیمەیڵە ئەدمینەکان دەتوانن بچنەژوورەوە

#### **5. بەشی پڕۆفایل (Profile Section)**
- ✅ بەشی ئامار (Stats) بە تەواوی
  - کۆی یاری
  - بردنەوەکان
  - لەدەستدانەکان
  - کۆی خاڵ
  - تۆکنەکان
  - ڕێژەی بردنەوە
- ✅ سیستەمی دەستکەوت (Achievements) بە 8 دەستکەوت
- ✅ مێژووی یاریەکان
- ✅ دەستکاری زانیاری
- ✅ دوگمەی دەرچوون

#### **6. بەشی کۆگا (Shop System)**
- ✅ تۆکن بە ورد کەم دەبێتەوە کاتێک توانا دەکڕیت
- ✅ دڵنیابوونەوە پێش کڕین
- ✅ پێشنیار بۆ سەیرکردنی ڕیکلام ئەگەر تۆکن کەمت بێت
- ✅ نیشاندانی ماوەی تۆکن دوای کڕین

---

### 🔧 **چاکسازییەکانی تەکنیکی**

#### **کێشەکانی کۆد:**
- ✅ `handleTimeOut()` function زیاد کرا لە game.js
- ✅ Field names یەکخرا (displayName لە جیاتی name)
- ✅ totalScore/points یەکخرا لە هەموو شوێنێک
- ✅ Error handling باشتر کرا
- ✅ Missing HTML elements زیاد کران
- ✅ Online users counter (کارا دەبێت بە real-time)

#### **Performance:**
- ✅ Batch operations بۆ Firestore
- ✅ Precise token calculations بە `addTokens()` و `deductTokens()`
- ✅ Better state management

#### **UI/UX:**
- ✅ Loading overlays باشتر کران
- ✅ Animations زیاد کران
- ✅ Empty states بۆ بەشە بەتاڵەکان
- ✅ Token click suggestions

---

### 📝 **فایلە چاککراوەکان**

#### **JavaScript:**
1. `config.js` - گۆڕانکاری لە بڕی تۆکنەکان
2. `firebase.js` - زیادکردنی presence system
3. `game.js` - چاککردنی هەموو کێشەکان + countdown بۆ یاری سەرەکی
4. `shop.js` - سیستەمی ڕیکلام + token suggestions
5. `ui.js` - profile section باشتر + proper field names
6. `app.js` - event listeners باشتر + admin button

#### **HTML:**
1. `index.html` - زیادکردنی:
   - دوگمەی ئەدمین لە navigation
   - بەشی countdown بۆ یاری سەرەکی
   - بەشەکانی پڕۆفایل (stats, achievements, history)
   - enhancements.css

#### **CSS:**
1. `enhancements.css` - فایلی نوێ بۆ:
   - Countdown styles
   - Token suggestion styles
   - Enhanced profile styles
   - Achievement animations
   - Loading overlay enhancements

---

### 🎮 **چۆن بەکاریبهێنیت**

1. **دابەزاندن:**
   ```
   هەموو فایلەکان هەن لە فۆڵدەری survivor-ultra-fixed
   ```

2. **Firebase Setup:**
   - لە `js/config.js` کۆنفیگی Firebase ی خۆت دابنێ
   - لە `ADMIN_EMAILS` ئیمەیڵی خۆت زیاد بکە

3. **Firebase Security Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       match /questions/{questionId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /leaderboard/{userId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /purchases/{purchaseId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
     }
   }
   ```

4. **Upload to Hosting:**
   - Firebase Hosting پێشنیار دەکرێت
   - یان هەر hosting-ێکی دیکە بۆ static sites

---

### 🆕 **تایبەتمەندییە نوێیەکان**

- **یاری سەرەکی** لە 20:00 هەر شەوێک
- **Countdown تا یاری سەرەکی**
- **ڕیکلام بۆ تۆکن** (100 تۆکن بۆ هەر ڕیکلامێک)
- **پێشنیار بۆ ڕیکلام** کاتێک تۆکن کەمە
- **بەشی پڕۆفایل تەواو** لەگەڵ stats و achievements
- **دوگمەی ئەدمین** لە navigation
- **Online users counter**
- **Token animations**
- **Achievement system** لەگەڵ 8 دەستکەوت

---

### ⚠️ **تێبینیە گرنگەکان**

1. **Admin Emails:**
   - لە `js/config.js` ئیمەیڵی خۆت زیاد بکە لە `ADMIN_EMAILS`
   
2. **Ad Integration:**
   - ئێستا simulation ە (30 چرکە)
   - بۆ production دەتوانیت AdMob یان ad provider زیاد بکەیت

3. **Token Prices:**
   - Powerup prices لە `config.js` دا دەتوانیت بیگۆڕیت

4. **Main Game Time:**
   - ئێستا 20:00 (8 PM) دانراوە
   - دەتوانیت لە `game.js` بیگۆڕیت

---

### 📊 **بڕە نوێیەکانی تۆکن**

- ✅ وەڵامی ڕاست: **10 تۆکن**
- ✅ بردنەوەی یاری: **50 تۆکن**
- ✅ تەواوکردنی یاری: **20 تۆکن**
- ✅ سەیرکردنی ڕیکلام: **100 تۆکن** (زیادکرا)
- ✅ چوونەژوورەوەی ڕۆژانە: **30 تۆکن**

---

### 🎯 **Powerup Prices**

- 50-50: **1000 تۆکن**
- تێپەڕاندن: **500 تۆکن**
- کاتی زیادە: **200 تۆکن**
- دوو هێندە: **300 تۆکن**

---

### 🚀 **بۆ داهاتوو**

پێشنیارەکانی زیادکردن:
- [ ] Integration لەگەڵ AdMob بۆ ڕیکلامی ڕاستەقینە
- [ ] Push notifications بۆ یاری سەرەکی
- [ ] Social sharing
- [ ] Sound effects
- [ ] More achievements
- [ ] Tournament mode
- [ ] Friend system

---

### 📞 **پشتگیری**

ئەگەر هەر کێشەیەکت هەبوو یان پرسیارێکت هەیە، تکایە issue بکەرەوە.

---

**سەرکەوتوو بیت! 🎮✨**
