/**
 * Achievements Module
 */

const ACHIEVEMENTS = {
    // Game achievements
    first_game: {
        id: 'first_game',
        name: 'یەکەم یاری',
        description: 'یەکەم یاریت کرد',
        icon: '🎮',
        reward: 50,
        condition: (userData) => userData.gamesPlayed >= 1
    },
    ten_games: {
        id: 'ten_games',
        name: '10 یاری',
        description: '10 یاری کرد',
        icon: '🎯',
        reward: 100,
        condition: (userData) => userData.gamesPlayed >= 10
    },
    fifty_games: {
        id: 'fifty_games',
        name: '50 یاری',
        description: '50 یاری کرد',
        icon: '🏅',
        reward: 200,
        condition: (userData) => userData.gamesPlayed >= 50
    },
    hundred_games: {
        id: 'hundred_games',
        name: '100 یاری',
        description: '100 یاری کرد',
        icon: '🏆',
        reward: 500,
        condition: (userData) => userData.gamesPlayed >= 100
    },
    
    // Score achievements
    hundred_points: {
        id: 'hundred_points',
        name: '100 خاڵ',
        description: '100 خاڵ بەدەست هێنا',
        icon: '⭐',
        reward: 20,
        condition: (userData) => userData.totalScore >= 100
    },
    thousand_points: {
        id: 'thousand_points',
        name: '1000 خاڵ',
        description: '1000 خاڵ بەدەست هێنا',
        icon: '🌟',
        reward: 100,
        condition: (userData) => userData.totalScore >= 1000
    },
    ten_thousand_points: {
        id: 'ten_thousand_points',
        name: '10000 خاڵ',
        description: '10000 خاڵ بەدەست هێنا',
        icon: '💫',
        reward: 500,
        condition: (userData) => userData.totalScore >= 10000
    },
    
    // Token achievements
    hundred_tokens: {
        id: 'hundred_tokens',
        name: '100 تۆکن',
        description: '100 تۆکن کۆکردەوە',
        icon: '🪙',
        reward: 50,
        condition: (userData) => userData.tokens >= 100
    },
    thousand_tokens: {
        id: 'thousand_tokens',
        name: '1000 تۆکن',
        description: '1000 تۆکن کۆکردەوە',
        icon: '💰',
        reward: 200,
        condition: (userData) => userData.tokens >= 1000
    },
    
    // Win achievements
    first_win: {
        id: 'first_win',
        name: 'یەکەم بردنەوە',
        description: 'یەکەم یاریت بردەوە',
        icon: '🥇',
        reward: 100,
        condition: (userData) => userData.wins >= 1
    },
    ten_wins: {
        id: 'ten_wins',
        name: '10 بردنەوە',
        description: '10 یاری بردتەوە',
        icon: '🏅',
        reward: 200,
        condition: (userData) => userData.wins >= 10
    },
    
    // Level achievements
    level_5: {
        id: 'level_5',
        name: 'ئاستی 5',
        description: 'گەیشتیت بە ئاستی 5',
        icon: '🔰',
        reward: 150,
        condition: (userData) => userData.level >= 5
    },
    level_10: {
        id: 'level_10',
        name: 'ئاستی 10',
        description: 'گەیشتیت بە ئاستی 10',
        icon: '💎',
        reward: 300,
        condition: (userData) => userData.level >= 10
    },
    
    // Special achievements
    perfect_game: {
        id: 'perfect_game',
        name: 'یاریی تەواو',
        description: 'هەموو پرسیارەکان وەڵامت داوەتەوە',
        icon: '💯',
        reward: 300,
        condition: (userData) => userData.perfectGames >= 1
    },
    speed_demon: {
        id: 'speed_demon',
        name: 'خێرا وەک با',
        description: 'یاری لە کەمتر لە 30 چرکە تەواو کرد',
        icon: '⚡',
        reward: 200,
        condition: (userData) => userData.fastGames >= 1
    },
    comeback_king: {
        id: 'comeback_king',
        name: 'گەڕانەوەی شاهانە',
        description: '5 یاری لە ڕیزدا بردتەوە',
        icon: '👑',
        reward: 400,
        condition: (userData) => userData.winStreak >= 5
    }
};

/**
 * Check and unlock achievements
 */
async function checkAchievements() {
    if (!currentUser) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        if (!userData) return;
        
        const unlockedAchievements = userData.achievements || [];
        const newlyUnlocked = [];
        
        // Check each achievement
        for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
            if (!unlockedAchievements.includes(id) && achievement.condition(userData)) {
                newlyUnlocked.push(achievement);
                unlockedAchievements.push(id);
            }
        }
        
        // Update user data if new achievements unlocked
        if (newlyUnlocked.length > 0) {
            const totalReward = newlyUnlocked.reduce((sum, ach) => sum + ach.reward, 0);
            
            await db.collection('users').doc(currentUser.uid).update({
                achievements: unlockedAchievements,
                tokens: firebase.firestore.FieldValue.increment(totalReward)
            });
            
            // Show achievement notifications
            for (const achievement of newlyUnlocked) {
                showAchievementNotification(achievement);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            await updateUserUI();
        }
        
    } catch (error) {
        console.error('Error checking achievements:', error);
    }
}

/**
 * Show achievement notification
 */
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
            <div class="achievement-title">دەسکەوتی نوێ!</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-reward">+${achievement.reward} تۆکن</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

/**
 * Load all achievements for display
 */
async function loadAllAchievements() {
    if (!currentUser) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        const unlockedAchievements = userData?.achievements || [];
        
        const achievementsHTML = Object.values(ACHIEVEMENTS).map(achievement => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            const progress = getAchievementProgress(achievement, userData);
            
            return `
                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon-large">${achievement.icon}</div>
                    <div class="achievement-details">
                        <h4 class="achievement-name">${achievement.name}</h4>
                        <p class="achievement-description">${achievement.description}</p>
                        <div class="achievement-reward-info">
                            <i class="fas fa-coins"></i> ${achievement.reward} تۆکن
                        </div>
                        ${!isUnlocked && progress ? `
                            <div class="achievement-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                                </div>
                                <div class="progress-text">${progress.current}/${progress.target}</div>
                            </div>
                        ` : ''}
                    </div>
                    ${isUnlocked ? '<div class="achievement-check"><i class="fas fa-check-circle"></i></div>' : ''}
                </div>
            `;
        }).join('');
        
        const container = document.getElementById('achievementsList');
        if (container) {
            container.innerHTML = achievementsHTML;
        }
        
        // Update stats
        const totalAchievements = Object.keys(ACHIEVEMENTS).length;
        const unlockedCount = unlockedAchievements.length;
        const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100);
        
        const statsEl = document.getElementById('achievementsStats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="achievements-stat">
                    <span class="stat-value">${unlockedCount}/${totalAchievements}</span>
                    <span class="stat-label">دەسکەوت</span>
                </div>
                <div class="achievements-stat">
                    <span class="stat-value">${completionPercentage}%</span>
                    <span class="stat-label">تەواوکراو</span>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
}

/**
 * Get achievement progress
 */
function getAchievementProgress(achievement, userData) {
    if (!userData) return null;
    
    const id = achievement.id;
    
    // Game count achievements
    if (id.includes('games')) {
        const target = parseInt(id.match(/\d+/)?.[0]) || 1;
        return {
            current: userData.gamesPlayed || 0,
            target: target,
            percentage: Math.min(((userData.gamesPlayed || 0) / target) * 100, 100)
        };
    }
    
    // Points achievements
    if (id.includes('points')) {
        const target = parseInt(id.match(/\d+/)?.[0]) || 100;
        return {
            current: userData.totalScore || 0,
            target: target,
            percentage: Math.min(((userData.totalScore || 0) / target) * 100, 100)
        };
    }
    
    // Tokens achievements
    if (id.includes('tokens')) {
        const target = parseInt(id.match(/\d+/)?.[0]) || 100;
        return {
            current: userData.tokens || 0,
            target: target,
            percentage: Math.min(((userData.tokens || 0) / target) * 100, 100)
        };
    }
    
    // Win achievements
    if (id.includes('win')) {
        const target = parseInt(id.match(/\d+/)?.[0]) || 1;
        return {
            current: userData.wins || 0,
            target: target,
            percentage: Math.min(((userData.wins || 0) / target) * 100, 100)
        };
    }
    
    // Level achievements
    if (id.includes('level')) {
        const target = parseInt(id.match(/\d+/)?.[0]) || 5;
        return {
            current: userData.level || 1,
            target: target,
            percentage: Math.min(((userData.level || 1) / target) * 100, 100)
        };
    }
    
    return null;
}

/**
 * Track special achievement
 */
async function trackSpecialAchievement(type, value = true) {
    if (!currentUser) return;
    
    try {
        const updateData = {};
        updateData[type] = firebase.firestore.FieldValue.increment(value ? 1 : 0);
        
        await db.collection('users').doc(currentUser.uid).update(updateData);
        
        // Check achievements after tracking
        setTimeout(() => checkAchievements(), 1000);
        
    } catch (error) {
        console.error('Error tracking special achievement:', error);
    }
}

console.log('✅ Achievements module loaded');
