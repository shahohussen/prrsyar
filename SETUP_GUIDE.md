# 🎮 SURVIVOR ULTRA - ڕێنمایی تەواوی دامەزراندن

## 🚀 هەنگاوەکانی دامەزراندن (٥ خولەک)

### ١. داگرتنی پڕۆژەکە ✓
پڕۆژەکە دەبینیت لە فۆڵدەری `survivor-ultra`

### ٢. ڕێکخستنی Firebase 🔥

#### هەنگاو ١: دروستکردنی پڕۆژەیەکی Firebase
1. بڕۆ بۆ [Firebase Console](https://console.firebase.google.com)
2. کرتە لەسەر "Add Project" / "Create a project"
3. ناوێک بۆ پڕۆژەکەت هەڵبژێرە (بۆ نموونە: "survivor-ultra-game")
4. Google Analytics دەتوانی ناچالاکی بکەیت (ئەگەر پێویستت نەبێت)
5. کرتە لەسەر "Create Project"

#### هەنگاو ٢: زیادکردنی Web App
1. لە پەنجەرەی Overview، کرتە لەسەر "Web" icon (`</>`)
2. ناوێک بۆ app-ەکەت بنووسە (بۆ نموونە: "Survivor Ultra Web")
3. تکایە Firebase Hosting هەڵنەبژێرە (ئەگەر ئێستا پێویستت نەبێت)
4. کرتە لەسەر "Register app"

#### هەنگاو ٣: کۆپیکردنی Config
پاش تۆمارکردن، کۆدێکی JavaScript دەبینیت لەم شێوەیە:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

**کۆپی بکە و بیخە لە `js/config.js`** لە نێو پڕۆژەکەتدا!

#### هەنگاو ٤: چالاککردنی Authentication
1. لە Firebase Console، بڕۆ بۆ "Authentication"
2. کرتە لەسەر "Get Started"
3. لە تابی "Sign-in method"، چالاک بکە:
   - **Email/Password** ← ON
   - **Google** ← ON (پێویستت بە ئیمەیڵێکی support دەبێت)
4. کرتە لەسەر "Save"

#### هەنگاو ٥: دروستکردنی Firestore Database
1. بڕۆ بۆ "Firestore Database"
2. کرتە لەسەر "Create database"
3. هەڵبژێرە "Start in **production mode**" (ئەمنتر)
4. شوێنێک هەڵبژێرە نزیک بەکارهێنەرەکانت
5. کرتە لەسەر "Enable"

#### هەنگاو ٦: ڕێکخستنی Firestore Rules
لە Firestore Database > Rules، ئەم کۆدە دابنێ:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Questions collection
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Games collection
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

کرتە لەسەر "Publish"

### ٣. ڕێکخستنی کۆدەکە

#### هەنگاو ١: دانانی Firebase Config
لە فایلی `js/config.js`:
- Firebase Config-ی خۆت دابنێ (کە لە هەنگاوی ٢.٣ کۆپیت کرد)

#### هەنگاو ٢: زیادکردنی ئیمەیڵی ئەدمین
لە هەمان فایلدا (`js/config.js`):

```javascript
const ADMIN_EMAILS = [
    'your-email@gmail.com', // ئیمەیڵەکەی خۆت بنووسە
];
```

#### هەنگاو ٣: زیادکردنی Domain بۆ Firebase Auth
1. لە Firebase Console > Authentication > Settings
2. بڕۆ بۆ "Authorized domains"
3. زیادبکە:
   - `localhost` (بۆ تاقیکردنەوە)
   - Domain-ی خۆت (ئەگەر بۆ production دەینێریت)

### ٤. کردنەوەی پڕۆژەکە

#### ڕێگای ١: بە HTML فایل (ئاسانترین)
تەنها `index.html` دووکلیک بکە و لە browser-دا دەکرێتەوە!

#### ڕێگای ٢: بە Live Server (پێشنیارکراو)
ئەگەر VS Code بەکاردەهێنیت:
1. Extension-ی "Live Server" دامەزرێنە
2. کرتە ڕاست لەسەر `index.html`
3. هەڵبژێرە "Open with Live Server"

#### ڕێگای ٣: بە Python Server
```bash
cd survivor-ultra
python -m http.server 8000
```
پاشان بڕۆ بۆ: `http://localhost:8000`

### ٥. تاقیکردنەوە

1. **دروستکردنی هەژمار**:
   - کرتە لەسەر تابی "دروستکردنی هەژمار"
   - زانیارییەکانت بنووسە
   - کرتە لەسەر "دروستکردنی هەژمار"

2. **چوونەژوورەوە**:
   - بە ئیمەیڵ و پاسۆرد بچۆرەوە
   - یان بە Google بچۆرەوە

3. **گەڕان بە App**:
   - بەشی سەرەکی ببینە
   - پڕۆفایلەکەت چک بکە
   - کۆگا ببینە
   - یاری بکە!

4. **پانێڵی ئەدمین**:
   - ئەگەر ئیمەیڵەکەت لە `ADMIN_EMAILS` زیاد کردووە
   - دەتوانیت بچیتە بەشی "ئەدمین"
   - پرسیار زیاد بکەیت
   - بەکارهێنەران ببینیت

---

## 🔧 چارەسەری کێشەکان

### کێشە: "Firebase Config not found"
**چارەسەر**: چک بکە Firebase Config لە `js/config.js` دروست نووسراوە

### کێشە: "Permission denied" لە Firestore
**چارەسەر**: چک بکە Firestore Rules دروستن (هەنگاوی ٢.٦)

### کێشە: "Domain not authorized"
**چارەسەر**: Domain-ەکەت زیاد بکە لە Firebase Console > Authentication > Settings > Authorized domains

### کێشە: ناتوانم بچمە پانێڵی ئەدمین
**چارەسەر**: 
1. چک بکە ئیمەیڵەکەت لە `ADMIN_EMAILS` زیاد کراوە
2. دڵنیابەرەوە لەگەڵ هەمان ئیمەیڵدا چوویتە ژوورەوە
3. پەڕەکە refresh بکە

### کێشە: یاری دەست پێ ناکات
**چارەسەر**: 
1. Console-ی browser بکەرەوە (F12)
2. سەیری error-ەکان بکە
3. چک بکە هەموو فایلەکان بارکراون

---

## 📱 بڵاوکردنەوە (Deployment)

### بە Firebase Hosting:

```bash
# دامەزراندنی Firebase CLI
npm install -g firebase-tools

# چوونەژوورەوە
firebase login

# دەستپێکردن
firebase init hosting

# هەڵبژاردنی پڕۆژەکەت
# Public directory: . (خاڵ)
# Single-page app: Yes
# Automatic builds: No

# بڵاوکردنەوە
firebase deploy
```

### بە Netlify:
1. بڕۆ بۆ [netlify.com](https://netlify.com)
2. فۆڵدەری `survivor-ultra` ڕاکێشە بۆ ناو Netlify
3. تەواو! 🎉

### بە Vercel:
```bash
npm i -g vercel
cd survivor-ultra
vercel
```

---

## 🎨 دڵخوازکردن

### گۆڕینی ڕەنگەکان:
لە `css/main.css`, سەرەتای فایلەکە:

```css
:root {
    --primary: #00f3ff;     /* ڕەنگی سەرەکی */
    --secondary: #bc13fe;   /* ڕەنگی لاوەکی */
    --accent: #ff0055;      /* ڕەنگی accent */
    --gold: #ffd700;        /* زێڕ */
}
```

### گۆڕینی نرخی توان اکان:
لە `js/config.js`:

```javascript
powerupPrices: {
    time: 200,      // نرخی +٥ چرکە
    '5050': 1000,   // نرخی لابردنی ٢ وەڵام
    skip: 500,      // نرخی تێپەڕاندن
    double: 300     // نرخی ٢ هێندە خاڵ
}
```

### زیادکردنی پرسیاری نوێ:
لە پانێڵی ئەدمین:
1. بڕۆ بۆ "پرسیارەکان"
2. کرتە لەسەر "زیادکردنی پرسیار"
3. زانیاریەکان پڕبکەرەوە
4. کرتە لەسەر "زیادکردن"

---

## 📚 فێرکاریی زیاتر

### ساختاری فایلەکان:
```
survivor-ultra/
├── index.html          # پەڕەی سەرەکی
├── README.md          # ڕێنمایی پڕۆژەکە
├── SETUP_GUIDE.md     # ئەم فایلە
├── css/
│   ├── main.css       # ستایلە سەرەکییەکان
│   ├── auth.css       # ستایلی authentication
│   ├── game.css       # ستایلی یاری
│   └── admin.css      # ستایلی ئەدمین
└── js/
    ├── config.js      # ڕێکخستنەکان (Firebase, Admin, etc.)
    ├── firebase.js    # گرێدانی Firebase
    ├── auth.js        # چوونەژوورەوە/دەرچوون
    ├── game.js        # لۆژیکی یاری
    ├── shop.js        # کڕین/فرۆشتن
    ├── admin.js       # پانێڵی ئەدمین
    ├── ui.js          # کارە UI-ییەکان
    └── app.js         # دەستپێکردنی app
```

### بەکارهێنانی Firebase:
- **Authentication**: بەڕێوەبردنی یاریزانەکان
- **Firestore**: هەڵگرتنی داتا (users, questions, games)
- **Hosting**: بڵاوکردنەوەی پڕۆژەکە

### پارێزگاریی ئەمنیەتی:
✅ Firebase Config لە فایلی جیاواز
✅ Admin تەنها بە ئیمەیڵی دیاریکراو
✅ Firestore Rules بۆ پارێزگاری
✅ Input validation
✅ Error handling

---

## 🆘 پشتگیری

ئەگەر هەر کێشەیەکت هەیە:

1. **چک بکە Console-ی Browser**:
   - F12 بگرە
   - سەیری تابی "Console" بکە
   - ئەگەر error-ێک دەبینیت، بیخوێنەرەوە

2. **چک بکە Network Tab**:
   - سەیری بکە ئایا Firebase requests دەنێردرێن
   - ئەگەر error 403 یان 401 دەبینیت، کێشە لە permissions-دایە

3. **چک بکە هەموو شتێک دروستە**:
   - Firebase Config دروستە؟
   - Domain authorized-ە؟
   - Firestore Rules دروستن؟
   - ئیمەیڵی ئەدمین زیاد کراوە؟

---

## 🎉 خۆشحاڵبە!

پڕۆژەکەت ئامادەیە! 

چێژ وەربگرە لە SURVIVOR ULTRA! 🎮🚀

---

**دروست کراوە بە ❤️ بۆ یاریزانانی کورد**
