/**
 * UI Module - Enhanced Version
 */

/**
 * Show screen
 */
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Show selected screen
    const screen = document.getElementById(`${screenId}Screen`);
    if (screen) {
        screen.classList.add('active');
        
        // Initialize screen if needed
        if (screenId === 'admin' && isAdmin) {
            initAdminPanel();
        } else if (screenId === 'shop') {
            initShop();
        } else if (screenId === 'leaderboard') {
            loadLeaderboard();
        } else if (screenId === 'profile') {
            loadUserProfile();
        }
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.screen === screenId) {
            item.classList.add('active');
        }
    });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = {
        success: '✓',
        error: '✗',
        warning: '!',
        info: 'ℹ'
    }[type] || 'ℹ';
    
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * Show loading overlay
 */
function showLoadingOverlay(message = 'چاوەڕوانی...') {
    let overlay = document.getElementById('loadingOverlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-message">${message}</div>
    `;
    
    overlay.classList.add('active');
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * Show auth screen
 */
function showAuth() {
    const authScreen = document.getElementById('authScreen');
    const navBar = document.querySelector('.nav-bar');
    
    if (authScreen) authScreen.style.display = 'flex';
    if (navBar) navBar.style.display = 'none';
    
    // Hide all other screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
}

/**
 * Show app
 */
function showApp() {
    const authScreen = document.getElementById('authScreen');
    const navBar = document.querySelector('.nav-bar');
    const loading = document.getElementById('loading');
    
    if (authScreen) authScreen.style.display = 'none';
    if (loading) loading.style.display = 'none';
    if (navBar) navBar.style.display = 'flex';
    
    showScreen('home');
}

/**
 * Update user UI
 */
async function updateUserUI() {
    if (!currentUser) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        if (!userData) return;
        
        // Update all user data displays
        const updates = {
            'userName': userData.name,
            'userAvatar': userData.avatar || '👤',
            'userTokens': userData.tokens || 0,
            'userScore': userData.totalScore || 0,
            'userLevel': calculateLevel(userData.totalScore || 0),
            'userGames': userData.gamesPlayed || 0,
            'profileName': userData.name,
            'profileEmail': userData.email,
            'profileTokens': userData.tokens || 0,
            'profileScore': userData.totalScore || 0,
            'profileGames': userData.gamesPlayed || 0,
            'shopTokens': userData.tokens || 0,
            'homeCoins': userData.tokens || 0
        };
        
        Object.entries(updates).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                if (id.includes('Avatar')) {
                    el.textContent = value;
                } else {
                    el.textContent = value;
                }
            }
        });
        
        // Update progress bar if exists
        updateLevelProgress(userData.totalScore || 0);
        
    } catch (error) {
        console.error('Error updating user UI:', error);
    }
}

/**
 * Calculate user level
 */
function calculateLevel(score) {
    return Math.floor(score / 1000) + 1;
}

/**
 * Update level progress bar
 */
function updateLevelProgress(score) {
    const level = calculateLevel(score);
    const scoreInLevel = score % 1000;
    const progress = (scoreInLevel / 1000) * 100;
    
    const progressBar = document.getElementById('levelProgress');
    const levelText = document.getElementById('userLevel');
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    
    if (levelText) {
        levelText.textContent = level;
    }
}

/**
 * Load leaderboard
 */
async function loadLeaderboard() {
    showLoadingOverlay('بارکردنی لیستی بەرزترینەکان...');
    
    try {
        const leaderboardSnapshot = await db.collection('users')
            .orderBy('totalScore', 'desc')
            .limit(50)
            .get();
        
        const leaderboardHTML = leaderboardSnapshot.docs.map((doc, index) => {
            const data = doc.data();
            const isCurrentUser = doc.id === currentUser?.uid;
            
            let rankIcon = '';
            if (index === 0) rankIcon = '🥇';
            else if (index === 1) rankIcon = '🥈';
            else if (index === 2) rankIcon = '🥉';
            
            return `
                <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                    <div class="rank">${rankIcon || `#${index + 1}`}</div>
                    <div class="player-info">
                        <div class="player-avatar">${data.avatar || '👤'}</div>
                        <div class="player-details">
                            <div class="player-name">${data.name}</div>
                            <div class="player-stats">
                                <span><i class="fas fa-gamepad"></i> ${data.gamesPlayed || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div class="player-score">${data.totalScore || 0}</div>
                </div>
            `;
        }).join('');
        
        const leaderboardContainer = document.getElementById('leaderboardList');
        if (leaderboardContainer) {
            leaderboardContainer.innerHTML = leaderboardHTML || '<p class="empty-message">هیچ یاریزانێک نییە</p>';
        }
        
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        hideLoadingOverlay();
        showNotification('هەڵە لە بارکردنی لیدەربۆرد!', 'error');
    }
}

/**
 * Load user profile
 */
async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        if (!userData) return;
        
        // Update profile fields
        document.getElementById('editName').value = userData.name || '';
        document.getElementById('editEmail').value = userData.email || '';
        
        // Load achievements
        loadAchievements(userData);
        
        // Load stats
        loadUserStats(userData);
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

/**
 * Load achievements
 */
function loadAchievements(userData) {
    const achievements = [
        {
            id: 'first_game',
            name: 'یەکەم یاری',
            description: 'یەکەم یاریت کرد',
            icon: '🎮',
            unlocked: (userData.gamesPlayed || 0) >= 1
        },
        {
            id: 'ten_games',
            name: '10 یاری',
            description: '10 یاری کرد',
            icon: '🏅',
            unlocked: (userData.gamesPlayed || 0) >= 10
        },
        {
            id: 'hundred_games',
            name: '100 یاری',
            description: '100 یاری کرد',
            icon: '🏆',
            unlocked: (userData.gamesPlayed || 0) >= 100
        },
        {
            id: 'thousand_points',
            name: '1000 خاڵ',
            description: '1000 خاڵ بەدەست هێنا',
            icon: '⭐',
            unlocked: (userData.totalScore || 0) >= 1000
        },
        {
            id: 'rich',
            name: 'دەوڵەمەند',
            description: '1000 تۆکن کۆکردەوە',
            icon: '💰',
            unlocked: (userData.tokens || 0) >= 1000
        }
    ];
    
    const achievementsHTML = achievements.map(ach => `
        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-info">
                <h4>${ach.name}</h4>
                <p>${ach.description}</p>
            </div>
            ${ach.unlocked ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-lock"></i>'}
        </div>
    `).join('');
    
    const container = document.getElementById('achievementsList');
    if (container) {
        container.innerHTML = achievementsHTML;
    }
}

/**
 * Load user stats
 */
function loadUserStats(userData) {
    const stats = {
        totalGames: userData.gamesPlayed || 0,
        totalScore: userData.totalScore || 0,
        totalTokens: userData.tokens || 0,
        winRate: userData.gamesPlayed > 0 
            ? Math.round((userData.wins || 0) / userData.gamesPlayed * 100) 
            : 0
    };
    
    const statsHTML = `
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-icon" style="background: #3b82f6">
                    <i class="fas fa-gamepad"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${stats.totalGames}</div>
                    <div class="stat-label">کۆی یاری</div>
                </div>
            </div>
            
            <div class="stat-box">
                <div class="stat-icon" style="background: #f59e0b">
                    <i class="fas fa-star"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${stats.totalScore}</div>
                    <div class="stat-label">کۆی خاڵ</div>
                </div>
            </div>
            
            <div class="stat-box">
                <div class="stat-icon" style="background: #10b981">
                    <i class="fas fa-coins"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${stats.totalTokens}</div>
                    <div class="stat-label">تۆکنەکان</div>
                </div>
            </div>
            
            <div class="stat-box">
                <div class="stat-icon" style="background: #8b5cf6">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${stats.winRate}%</div>
                    <div class="stat-label">ڕێژەی بردنەوە</div>
                </div>
            </div>
        </div>
    `;
    
    const container = document.getElementById('userStats');
    if (container) {
        container.innerHTML = statsHTML;
    }
}

/**
 * Toggle theme (for future use)
 */
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showNotification(isDark ? 'ڕووناکی تاریک چالاک کرا' : 'ڕووناکی ڕووناک چالاک کرا', 'info');
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Copy to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('کۆپی کرا!', 'success');
    }).catch(() => {
        showNotification('هەڵە لە کۆپیکردن!', 'error');
    });
}

/**
 * Share score (for future social integration)
 */
function shareScore(score) {
    const text = `من لە SURVIVOR ULTRA ${score} خاڵم بەدەست هێنا! ئایا دەتوانیت باشترم لێ بکەیت؟`;
    
    if (navigator.share) {
        navigator.share({
            title: 'SURVIVOR ULTRA',
            text: text
        }).catch(() => {});
    } else {
        copyToClipboard(text);
    }
}

console.log('✅ UI module loaded');
