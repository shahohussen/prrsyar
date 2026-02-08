/**
 * Leaderboard Module
 */

/**
 * Load and display leaderboard
 */
async function loadLeaderboard(timeframe = 'all') {
    showLoadingOverlay('بارکردنی لیدەربۆرد...');
    
    try {
        let query = db.collection('users')
            .where('totalScore', '>', 0)
            .orderBy('totalScore', 'desc')
            .limit(100);
        
        // Apply time filter if needed
        if (timeframe === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            query = query.where('lastPlayed', '>=', weekAgo);
        } else if (timeframe === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            query = query.where('lastPlayed', '>=', monthAgo);
        }
        
        const snapshot = await query.get();
        
        const leaderboardHTML = snapshot.docs.map((doc, index) => {
            const data = doc.data();
            const isCurrentUser = doc.id === currentUser?.uid;
            
            let rankClass = '';
            let rankIcon = '';
            
            if (index === 0) {
                rankClass = 'gold';
                rankIcon = '🥇';
            } else if (index === 1) {
                rankClass = 'silver';
                rankIcon = '🥈';
            } else if (index === 2) {
                rankClass = 'bronze';
                rankIcon = '🥉';
            }
            
            return `
                <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''} ${rankClass}">
                    <div class="rank-badge">
                        ${rankIcon || `#${index + 1}`}
                    </div>
                    
                    <div class="player-avatar-wrapper">
                        <div class="player-avatar">${data.avatar || '👤'}</div>
                        ${data.level ? `<div class="player-level">Lv.${data.level}</div>` : ''}
                    </div>
                    
                    <div class="player-info">
                        <div class="player-name">
                            ${data.name || data.displayName || 'یاریزان'}
                            ${isCurrentUser ? '<span class="you-badge">تۆ</span>' : ''}
                        </div>
                        <div class="player-stats-mini">
                            <span><i class="fas fa-gamepad"></i> ${data.gamesPlayed || 0}</span>
                            <span><i class="fas fa-trophy"></i> ${data.wins || 0}</span>
                        </div>
                    </div>
                    
                    <div class="player-score">
                        <div class="score-value">${formatNumber(data.totalScore || 0)}</div>
                        <div class="score-label">خاڵ</div>
                    </div>
                </div>
            `;
        }).join('');
        
        const leaderboardContainer = document.getElementById('leaderboardList');
        if (leaderboardContainer) {
            leaderboardContainer.innerHTML = leaderboardHTML || 
                '<div class="empty-state"><i class="fas fa-users"></i><p>هیچ یاریزانێک نییە</p></div>';
        }
        
        // Show current user's rank if not in top 100
        if (currentUser) {
            await showCurrentUserRank(snapshot.docs);
        }
        
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        hideLoadingOverlay();
        showNotification('هەڵە لە بارکردنی لیدەربۆرد!', 'error');
    }
}

/**
 * Show current user's rank
 */
async function showCurrentUserRank(topUsers) {
    if (!currentUser) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        // Check if user is in top 100
        const userInTop = topUsers.find(doc => doc.id === currentUser.uid);
        
        if (!userInTop) {
            // Calculate user's actual rank
            const higherScores = await db.collection('users')
                .where('totalScore', '>', userData.totalScore || 0)
                .get();
            
            const rank = higherScores.size + 1;
            
            const currentUserRankHTML = `
                <div class="current-user-rank">
                    <div class="rank-info">
                        <span class="rank-label">پلەی تۆ:</span>
                        <span class="rank-value">#${rank}</span>
                    </div>
                    <div class="score-info">
                        <span class="score-value">${formatNumber(userData.totalScore || 0)}</span>
                        <span class="score-label">خاڵ</span>
                    </div>
                </div>
            `;
            
            const container = document.getElementById('currentUserRank');
            if (container) {
                container.innerHTML = currentUserRankHTML;
            }
        }
        
    } catch (error) {
        console.error('Error showing user rank:', error);
    }
}

/**
 * Change leaderboard timeframe
 */
function changeLeaderboardTimeframe(timeframe) {
    // Update active tab
    document.querySelectorAll('.timeframe-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.timeframe === timeframe) {
            tab.classList.add('active');
        }
    });
    
    // Reload leaderboard
    loadLeaderboard(timeframe);
}

/**
 * Search in leaderboard
 */
async function searchLeaderboard(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        loadLeaderboard();
        return;
    }
    
    showLoadingOverlay('گەڕان...');
    
    try {
        const snapshot = await db.collection('users')
            .orderBy('name')
            .startAt(searchTerm)
            .endAt(searchTerm + '\uf8ff')
            .limit(20)
            .get();
        
        const resultsHTML = snapshot.docs.map((doc, index) => {
            const data = doc.data();
            const isCurrentUser = doc.id === currentUser?.uid;
            
            return `
                <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                    <div class="rank-badge">#?</div>
                    <div class="player-avatar">${data.avatar || '👤'}</div>
                    <div class="player-info">
                        <div class="player-name">${data.name || 'یاریزان'}</div>
                        <div class="player-stats-mini">
                            <span><i class="fas fa-star"></i> ${formatNumber(data.totalScore || 0)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        const leaderboardContainer = document.getElementById('leaderboardList');
        if (leaderboardContainer) {
            leaderboardContainer.innerHTML = resultsHTML || 
                '<div class="empty-state"><i class="fas fa-search"></i><p>هیچ ئەنجامێک نەدۆزرایەوە</p></div>';
        }
        
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Error searching leaderboard:', error);
        hideLoadingOverlay();
        showNotification('هەڵە لە گەڕان!', 'error');
    }
}

/**
 * Load user comparison
 */
async function loadUserComparison(userId) {
    if (!currentUser) return;
    
    try {
        const [currentUserDoc, otherUserDoc] = await Promise.all([
            db.collection('users').doc(currentUser.uid).get(),
            db.collection('users').doc(userId).get()
        ]);
        
        const currentUserData = currentUserDoc.data();
        const otherUserData = otherUserDoc.data();
        
        const comparisonHTML = `
            <div class="comparison-modal">
                <h2>بەراوردکردن</h2>
                <div class="comparison-grid">
                    <div class="comparison-user">
                        <div class="user-avatar">${currentUserData.avatar || '👤'}</div>
                        <div class="user-name">${currentUserData.name}</div>
                        <div class="user-stat">
                            <div class="stat-label">خاڵ</div>
                            <div class="stat-value">${formatNumber(currentUserData.totalScore || 0)}</div>
                        </div>
                        <div class="user-stat">
                            <div class="stat-label">یاری</div>
                            <div class="stat-value">${currentUserData.gamesPlayed || 0}</div>
                        </div>
                    </div>
                    
                    <div class="comparison-vs">VS</div>
                    
                    <div class="comparison-user">
                        <div class="user-avatar">${otherUserData.avatar || '👤'}</div>
                        <div class="user-name">${otherUserData.name}</div>
                        <div class="user-stat">
                            <div class="stat-label">خاڵ</div>
                            <div class="stat-value">${formatNumber(otherUserData.totalScore || 0)}</div>
                        </div>
                        <div class="user-stat">
                            <div class="stat-label">یاری</div>
                            <div class="stat-value">${otherUserData.gamesPlayed || 0}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Show in modal
        showModal('comparisonModal', comparisonHTML);
        
    } catch (error) {
        console.error('Error loading comparison:', error);
        showNotification('هەڵە!', 'error');
    }
}

/**
 * Show modal
 */
function showModal(modalId, content) {
    let modal = document.getElementById(modalId);
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal('${modalId}')"></div>
        <div class="modal-content">${content}</div>
    `;
    
    modal.classList.add('active');
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

console.log('✅ Leaderboard module loaded');
