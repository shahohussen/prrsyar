/**
 * Firebase Initialization and Core Functions
 */

let auth, db, googleProvider;
let currentUser = null;
let isAdmin = false;

// Initialize Firebase
function initFirebase() {
    try {
        firebase.initializeApp(APP_CONFIG.firebase);
        auth = firebase.auth();
        db = firebase.firestore();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        
        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        showNotification('کێشە لە گرێدانی Firebase', 'error');
        return false;
    }
}

// Auth state observer
function initAuthObserver() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            isAdmin = APP_CONFIG.adminEmails.includes(user.email);
            
            await createOrUpdateUser(user);
            updateUserUI();
            showApp();
        } else {
            currentUser = null;
            isAdmin = false;
            showAuth();
        }
    });
}

// Create or update user in Firestore
async function createOrUpdateUser(firebaseUser) {
    const userRef = db.collection('users').doc(firebaseUser.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
        // Create new user
        const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || `یاریزان_${Math.floor(Math.random() * 10000)}`,
            avatar: getRandomAvatar(),
            level: 1,
            xp: 0,
            xpNeeded: APP_CONFIG.game.levelSystem.xpPerLevel,
            tokens: APP_CONFIG.game.settings.startingTokens,
            points: 0,
            wins: 0,
            totalGames: 0,
            isAdmin: isAdmin,
            role: isAdmin ? 'admin' : 'user',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            dailyLogin: new Date().toDateString(),
            powerups: { time: 0, '5050': 0, skip: 0, double: 0 }
        };
        
        await userRef.set(userData);
        window.currentUserData = userData;
    } else {
        // Update last login
        const userData = userDoc.data();
        await userRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            isActive: true
        });
        
        // Check for daily login reward
        const today = new Date().toDateString();
        if (userData.dailyLogin !== today) {
            await userRef.update({
                dailyLogin: today,
                tokens: firebase.firestore.FieldValue.increment(APP_CONFIG.game.tokenRewards.dailyLogin)
            });
            showNotification(
                `${APP_CONFIG.messages.success.dailyReward} ${APP_CONFIG.game.tokenRewards.dailyLogin} تۆکن وەرگرت!`,
                'success'
            );
        }
        
        window.currentUserData = userData;
    }
}

// Get random avatar
function getRandomAvatar() {
    const avatars = APP_CONFIG.avatars;
    return avatars[Math.floor(Math.random() * avatars.length)];
}

// Get current user data
async function getCurrentUserData() {
    if (!currentUser) return null;
    
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    if (userDoc.exists) {
        window.currentUserData = userDoc.data();
        return userDoc.data();
    }
    return null;
}

// Update user data
async function updateUserData(updates) {
    if (!currentUser) return false;
    
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        await userRef.update(updates);
        return true;
    } catch (error) {
        console.error('Error updating user data:', error);
        return false;
    }
}

// Add tokens to user
async function addTokens(amount) {
    if (!currentUser || amount <= 0) return false;
    
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        await userRef.update({
            tokens: firebase.firestore.FieldValue.increment(amount)
        });
        
        await getCurrentUserData();
        updateUserUI();
        return true;
    } catch (error) {
        console.error('Error adding tokens:', error);
        return false;
    }
}

// Deduct tokens from user
async function deductTokens(amount) {
    if (!currentUser || amount <= 0) return false;
    
    const userData = await getCurrentUserData();
    if (userData.tokens < amount) {
        return false;
    }
    
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        await userRef.update({
            tokens: firebase.firestore.FieldValue.increment(-amount)
        });
        
        await getCurrentUserData();
        updateUserUI();
        return true;
    } catch (error) {
        console.error('Error deducting tokens:', error);
        return false;
    }
}

console.log('✅ Firebase module loaded');
