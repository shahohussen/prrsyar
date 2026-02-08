/**
 * SURVIVOR ULTRA - Configuration File
 * 
 * گرنگ: Firebase Config-ەکەت لێرە دابنێ
 * بۆ پارێزگاریی زیاتر، پێشنیاردەکرێت Firebase Config لە .env فایلێکدا هەڵبگریت
 * و لە کۆدی production-دا تەنها Domain-ی خۆت ڕێگەپێبدەیت
 */

// ==================== FIREBASE CONFIGURATION ====================
// کۆنفیگی Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDjl6xjrx1qzUlTFCQntqKP02r77S3NYvA",
    authDomain: "yary-5d067.firebaseapp.com",
    projectId: "yary-5d067",
    storageBucket: "yary-5d067.firebasestorage.app",
    messagingSenderId: "413151313270",
    appId: "1:413151313270:web:48c5129e4ab548d30b4e57",
    measurementId: "G-DPY3BZ37HP"
};

// ==================== ADMIN CONFIGURATION ====================
// لیستی ئیمەیڵە ئەدمینەکان - تەنها ئەم ئیمەیڵانە دەتوانن بچنە پەنەلی ئەدمین
const ADMIN_EMAILS = [
    'admin@example.com', // ئیمەیڵەکەی خۆت لێرە دابنێ
    // دەتوانیت ئەدمینی زیاتر زیاد بکەیت
];

// ==================== GAME CONFIGURATION ====================
const GAME_CONFIG = {
    // Token rewards - بڕە جێگیرەکان (نە هەڕەمەکی)
    tokenRewards: {
        correctAnswer: 10,      // ١٠ تۆکن بۆ هەر وەڵامێکی ڕاست
        winGame: 50,           // ٥٠ تۆکن بۆ بردنەوەی یاری
        watchAd: 20,           // ٢٠ تۆکن بۆ سەیرکردنی ڕیکلام
        dailyLogin: 30,        // ٣٠ تۆکن بۆ چوونەژوورەوەی ڕۆژانە
        gameCompletion: 20     // ٢٠ تۆکن بۆ تەواوکردنی یاری
    },
    
    // Game schedules
    schedules: {
        morning: {
            time: "10:00",
            points: 200,
            tokens: 20,
            name: "یاری بەیانی",
            icon: "🌅"
        },
        noon: {
            time: "14:00",
            points: 300,
            tokens: 30,
            name: "یاری نیوەڕۆ",
            icon: "⚡"
        },
        evening: {
            time: "20:00",
            points: 500,
            tokens: 50,
            name: "یاری سەرەکی",
            icon: "🏆"
        }
    },
    
    // Powerup prices
    powerupPrices: {
        time: 200,      // +٥ چرکە کات
        '5050': 1000,   // لابردنی ٢ وەڵام
        skip: 500,      // تێپەڕاندنی پرسیار
        double: 300     // ٢ هێندە خاڵ
    },
    
    // Game settings
    settings: {
        questionTime: 15,           // کاتی هەر پرسیارێک (چرکە)
        totalQuestions: 10,         // ژمارەی کۆی پرسیارەکان
        pointsPerAnswer: 100,       // خاڵ بۆ هەر وەڵامێکی ڕاست
        startingTokens: 500,        // تۆکنی سەرەتایی بۆ یاریزانی نوێ
        maxPowerupUses: 10,         // زۆرترین بەکارهێنانی هەر توانایەک
        adDuration: 30,             // ماوەی ڕیکلام (چرکە)
        countdownDuration: 5        // ماوەی countdown پێش دەستپێکردنی یاری (چرکە)
    },
    
    // Level system
    levelSystem: {
        xpPerLevel: 1000,          // XP پێویست بۆ هەر ئاستێک
        xpMultiplier: 1.5          // زیادکردنی XP بۆ هەر ئاستێک
    }
};

// ==================== AVATAR OPTIONS ====================
const AVATAR_OPTIONS = [
    '👤', '🎮', '👾', '🦸', '🧙', '🦹', '🧚', '👨‍🚀', 
    '👩‍🎤', '🦊', '🐯', '🦁', '🐉', '🦄', '🤖', '👻',
    '🎭', '🎪', '🎨', '🎯', '🎲', '🎰', '🏆', '⚡'
];

// ==================== UI MESSAGES ====================
const MESSAGES = {
    // Success messages
    success: {
        login: 'بەخێربێیت!',
        register: 'هەژمارەکەت دروست کرا!',
        profileUpdate: 'پڕۆفایلەکەت نوێ کرایەوە!',
        tokenEarned: 'تۆکن بەدەست هێنا!',
        powerupPurchased: 'توانا کڕدرا!',
        questionAdded: 'پرسیار زیاد کرا!',
        dailyReward: 'سوپاس بۆ گەڕانەوەت!'
    },
    
    // Error messages
    error: {
        fillAllFields: 'تکایە هەموو خانەکان پڕبکەرەوە!',
        passwordMismatch: 'پاسۆردەکان یەک ناگونجێن!',
        passwordTooShort: 'پاسۆرد دەبێت کەمینە ٨ نووسە بێت!',
        invalidEmail: 'ئیمەیڵەکە نادروستە',
        userNotFound: 'هەژمارەکە نەدۆزرایەوە',
        wrongPassword: 'پاسۆرد هەڵەیە',
        emailInUse: 'ئیمەیڵەکە پێشتر تۆمار کراوە',
        networkError: 'کێشەی هاتووچۆ',
        notEnoughTokens: 'تۆکنی پێویستت نیە!',
        noPowerup: 'ئەم توانایەت نیە!',
        loginFirst: 'تکایە یەکەم چوونەژوورەوە بکە!',
        adminOnly: 'تەنها ئەدمینەکان دەتوانن بچنە ئەم بەشەوە!'
    },
    
    // Info messages
    info: {
        gameStartsSoon: 'یاری سەرەکی بەم زووانە دەست پێ دەکات!',
        watchAdForTokens: 'سەیری ڕیکلام بکە بۆ بەدەستهێنانی تۆکن!',
        gamePaused: 'یاریەکە ڕاگرا',
        adWatched: 'سوپاس بۆ سەیرکردنی ڕیکلام!',
        profileImageComing: 'وێنەی پڕۆفایل لە بەشی داھاتوودا بەردەستدەبێت!'
    },
    
    // Confirm messages
    confirm: {
        deleteAccount: 'دڵنیایت دەتەوێت هەژمارەکەت بسڕیتەوە؟\nهەموو زانیاریەکانت لەناو دەچێت و ناتوانیت بیگەڕێنیتەوە!',
        deleteQuestion: 'دڵنیایت دەتەوێت ئەم پرسیارە بسڕیتەوە؟',
        logoutAdmin: 'دڵنیایت دەتەوێت لە ئەدمین دەرچیت؟'
    }
};

// ==================== EXPORT ====================
// Make configurations available globally
window.APP_CONFIG = {
    firebase: firebaseConfig,
    adminEmails: ADMIN_EMAILS,
    game: GAME_CONFIG,
    avatars: AVATAR_OPTIONS,
    messages: MESSAGES
};

console.log('✅ Configuration loaded successfully');
