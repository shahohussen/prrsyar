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
            await updateUserUI();
            showApp();
            
            // Update online users count
            updateOnlinePresence(true);
        } else {
            currentUser = null;
            isAdmin = false;
            updateOnlinePresence(false);
            showAuth();
        }
    });
}

// Create or update user in Firestore
async function createOrUpdateUser(firebaseUser) {
    try {
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
                totalScore: 0,
                wins: 0,
                losses: 0,
                totalGames: 0,
                gamesPlayed: 0,
                isAdmin: isAdmin,
                role: isAdmin ? 'admin' : 'user',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                lastAdWatch: null,
                isActive: true,
                isOnline: true,
                dailyLogin: new Date().toDateString(),
                powerups: { time: 0, '5050': 0, skip: 0, double: 0 }
            };
            
            await userRef.set(userData);
            window.currentUserData = userData;
            
            showNotification('بەخێربێیت! ' + userData.displayName, 'success');
        } else {
            // Update last login
            const userData = userDoc.data();
            
            await userRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true,
                isOnline: true
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
    } catch (error) {
        console.error('Error creating/updating user:', error);
        showNotification('کێشە لە دروستکردنی هەژمار', 'error');
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
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            window.currentUserData = userDoc.data();
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Update user data
async function updateUserData(updates) {
    if (!currentUser) return false;
    
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        await userRef.update(updates);
        
        // Update local cache
        await getCurrentUserData();
        return true;
    } catch (error) {
        console.error('Error updating user data:', error);
        return false;
    }
}

// Add tokens to user with precise calculation
async function addTokens(amount) {
    if (!currentUser || amount <= 0) return false;
    
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        
        await userRef.update({
            tokens: firebase.firestore.FieldValue.increment(amount)
        });
        
        await getCurrentUserData();
        await updateUserUI();
        
        console.log(`✅ Added ${amount} tokens to user`);
        return true;
    } catch (error) {
        console.error('Error adding tokens:', error);
        return false;
    }
}

// Deduct tokens from user with precise calculation
async function deductTokens(amount) {
    if (!currentUser || amount <= 0) return false;
    
    try {
        const userData = await getCurrentUserData();
        
        if (!userData || userData.tokens < amount) {
            showNotification(APP_CONFIG.messages.error.notEnoughTokens, 'error');
            return false;
        }
        
        const userRef = db.collection('users').doc(currentUser.uid);
        await userRef.update({
            tokens: firebase.firestore.FieldValue.increment(-amount)
        });
        
        await getCurrentUserData();
        await updateUserUI();
        
        console.log(`✅ Deducted ${amount} tokens from user`);
        return true;
    } catch (error) {
        console.error('Error deducting tokens:', error);
        return false;
    }
}

// Update online presence
async function updateOnlinePresence(isOnline) {
    if (!currentUser) return;
    
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        await userRef.update({
            isOnline: isOnline,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update online count
        if (isOnline) {
            updateOnlineUsersCount();
        }
    } catch (error) {
        console.error('Error updating presence:', error);
    }
}

// Update online users count
async function updateOnlineUsersCount() {
    try {
        const onlineSnapshot = await db.collection('users')
            .where('isOnline', '==', true)
            .get();
        
        const count = onlineSnapshot.size;
        const onlineEl = document.getElementById('onlineUsers');
        
        if (onlineEl) {
            onlineEl.innerHTML = `
                <i class="fas fa-wifi"></i>
                <span>${count} ئۆنڵاین</span>
                <div class="pulse-dot"></div>
            `;
        }
    } catch (error) {
        console.error('Error getting online count:', error);
    }
}

// Set up presence system
function setupPresenceSystem() {
    if (!currentUser) return;
    
    // Update presence every 5 minutes
    setInterval(() => {
        updateOnlinePresence(true);
    }, 300000);
    
    // Update count every 30 seconds
    setInterval(() => {
        updateOnlineUsersCount();
    }, 30000);
    
    // Set offline on page unload
    window.addEventListener('beforeunload', () => {
        if (currentUser) {
            updateOnlinePresence(false);
        }
    });
}

console.log('✅ Firebase module loaded');
