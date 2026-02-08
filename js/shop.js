/**
 * Shop Module - Enhanced Fixed Version
 */

/**
 * Initialize shop
 */
async function initShop() {
    await loadShopItems();
    await loadUserPowerups();
    updateShopUI();
    checkTokenBalance();
}

/**
 * Check token balance and show suggestion
 */
async function checkTokenBalance() {
    if (!currentUser) return;
    
    try {
        const userData = await getCurrentUserData();
        const tokens = userData?.tokens || 0;
        
        // Show suggestion if tokens are low
        if (tokens < 500) {
            showTokenSuggestion();
        }
    } catch (error) {
        console.error('Error checking token balance:', error);
    }
}

/**
 * Show token suggestion popup
 */
function showTokenSuggestion() {
    const suggestionHTML = `
        <div class="token-suggestion">
            <div class="suggestion-icon">💡</div>
            <div class="suggestion-title">تۆکنەکانت کەمن!</div>
            <div class="suggestion-text">سەیری ڕیکلام بکە بۆ بەدەستهێنانی ١٠٠ تۆکن</div>
            <button class="btn btn-primary" onclick="watchAdForTokens()">
                <i class="fas fa-play"></i>
                سەیری ڕیکلام بکە
            </button>
        </div>
    `;
    
    const container = document.getElementById('purchasePowerInfo');
    if (container) {
        container.innerHTML = suggestionHTML;
    }
}

/**
 * Load shop items
 */
async function loadShopItems() {
    const shopGrid = document.getElementById('shopGrid');
    if (!shopGrid) return;
    
    const items = [
        {
            id: '5050',
            name: '50-50',
            description: 'سڕینەوەی دوو وەڵامی هەڵە',
            price: APP_CONFIG.game.powerupPrices['5050'],
            icon: '🎯',
            color: '#3b82f6'
        },
        {
            id: 'skip',
            name: 'تێپەڕاندن',
            description: 'تێپەڕاندنی پرسیارێک',
            price: APP_CONFIG.game.powerupPrices.skip,
            icon: '⏭️',
            color: '#8b5cf6'
        },
        {
            id: 'time',
            name: 'کاتی زیادە',
            description: '+10 چرکەی کات',
            price: APP_CONFIG.game.powerupPrices.time,
            icon: '⏰',
            color: '#f59e0b'
        },
        {
            id: 'double',
            name: 'دوو هێندە',
            description: 'دوو هێندە خاڵ بۆ پرسیاری داهاتوو',
            price: APP_CONFIG.game.powerupPrices.double,
            icon: '✨',
            color: '#10b981'
        }
    ];
    
    shopGrid.innerHTML = items.map(item => `
        <div class="shop-item" style="border-color: ${item.color}">
            <div class="shop-item-icon" style="background: ${item.color}">${item.icon}</div>
            <div class="shop-item-info">
                <h3 class="shop-item-name">${item.name}</h3>
                <p class="shop-item-description">${item.description}</p>
            </div>
            <div class="shop-item-footer">
                <div class="shop-item-price">
                    <i class="fas fa-coins"></i>
                    <span>${item.price}</span>
                </div>
                <button class="btn btn-small btn-primary" onclick="buyPowerup('${item.id}')">
                    کڕین
                </button>
            </div>
            <div class="shop-item-owned" id="owned-${item.id}">
                <i class="fas fa-box"></i>
                <span id="count-${item.id}">0</span>
            </div>
        </div>
    `).join('');
}

/**
 * Buy powerup with confirmation and precise token deduction
 */
async function buyPowerup(type) {
    if (!currentUser) {
        showNotification(APP_CONFIG.messages.error.loginFirst, 'error');
        return;
    }
    
    const price = APP_CONFIG.game.powerupPrices[type];
    
    if (!price) {
        showNotification('توانای نادروست!', 'error');
        return;
    }
    
    // Get current user data
    const userData = await getCurrentUserData();
    const currentTokens = userData?.tokens || 0;
    
    // Check if user has enough tokens
    if (currentTokens < price) {
        showNotification(`تۆکنی پێویستت نیە! پێویستە ${price} تۆکن`, 'error');
        
        // Offer to watch ad
        setTimeout(() => {
            if (confirm('دەتەوێت سەیری ڕیکلام بکەیت بۆ بەدەستهێنانی ١٠٠ تۆکن؟')) {
                watchAdForTokens();
            }
        }, 1000);
        return;
    }
    
    // Show confirmation
    if (!confirm(`دڵنیایت لە کڕینی ${getPowerupName(type)} بە ${price} تۆکن؟`)) {
        return;
    }
    
    showLoadingOverlay('کڕینی توانا...');
    
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        
        // Use precise token deduction
        const success = await deductTokens(price);
        
        if (!success) {
            hideLoadingOverlay();
            showNotification('کێشە لە کەمکردنەوەی تۆکن!', 'error');
            return;
        }
        
        // Add powerup
        await userRef.update({
            [`powerups.${type}`]: firebase.firestore.FieldValue.increment(1)
        });
        
        // Add to purchase history
        await db.collection('purchases').add({
            userId: currentUser.uid,
            userName: userData.displayName,
            type: 'powerup',
            item: type,
            price: price,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoadingOverlay();
        
        // Show success with animation
        const newTokens = currentTokens - price;
        showNotification(`توانا کڕدرا! ماوەی تۆکن: ${newTokens} ✅`, 'success');
        
        // Update UI
        await loadUserPowerups();
        await updateUserUI();
        checkTokenBalance();
        
    } catch (error) {
        console.error('Error buying powerup:', error);
        hideLoadingOverlay();
        showNotification('هەڵە لە کڕین!', 'error');
    }
}

/**
 * Load user powerups
 */
async function loadUserPowerups() {
    if (!currentUser) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        const powerups = userData?.powerups || {};
        
        // Update powerup counts
        Object.keys(APP_CONFIG.game.powerupPrices).forEach(type => {
            const countEl = document.getElementById(`count-${type}`);
            if (countEl) {
                countEl.textContent = powerups[type] || 0;
            }
        });
        
    } catch (error) {
        console.error('Error loading powerups:', error);
    }
}

/**
 * Update shop UI
 */
function updateShopUI() {
    loadUserPowerups();
}

/**
 * Watch ad for tokens - Enhanced version with cooldown
 */
async function watchAdForTokens() {
    if (!currentUser) {
        showNotification(APP_CONFIG.messages.error.loginFirst, 'error');
        return;
    }
    
    try {
        const userData = await getCurrentUserData();
        const lastAdWatch = userData?.lastAdWatch?.toDate();
        const now = new Date();
        
        // Check cooldown (5 minutes)
        if (lastAdWatch) {
            const timeSince = (now - lastAdWatch) / 1000; // in seconds
            const cooldown = APP_CONFIG.game.settings.adCooldown;
            
            if (timeSince < cooldown) {
                const minutesLeft = Math.ceil((cooldown - timeSince) / 60);
                showNotification(`تکایە چاوەڕێبە ${minutesLeft} خولەک دیکە!`, 'info');
                return;
            }
        }
        
        // Show ad watching simulation
        showLoadingOverlay('سەیرکردنی ڕیکلام...');
        
        // Simulate ad duration (30 seconds)
        let adProgress = 0;
        const adInterval = setInterval(() => {
            adProgress += 10;
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.querySelector('.loading-message').textContent = 
                    `سەیرکردنی ڕیکلام... ${adProgress}%`;
            }
        }, 3000);
        
        setTimeout(async () => {
            clearInterval(adInterval);
            
            try {
                const tokensEarned = APP_CONFIG.game.tokenRewards.watchAd; // 100 tokens
                
                // Add tokens precisely
                await addTokens(tokensEarned);
                
                // Update last ad watch time
                await updateUserData({
                    lastAdWatch: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                hideLoadingOverlay();
                showNotification(`سوپاس! +${tokensEarned} تۆکن وەرگرت! 🎁`, 'success');
                
                await updateUserUI();
                checkTokenBalance();
                
            } catch (error) {
                console.error('Error giving ad tokens:', error);
                hideLoadingOverlay();
                showNotification('هەڵە لە پێدانی تۆکن!', 'error');
            }
        }, 30000); // 30 seconds
        
    } catch (error) {
        console.error('Error in watchAdForTokens:', error);
        hideLoadingOverlay();
        showNotification('هەڵە!', 'error');
    }
}

/**
 * Show purchase history
 */
async function showPurchaseHistory() {
    if (!currentUser) {
        showNotification(APP_CONFIG.messages.error.loginFirst, 'error');
        return;
    }
    
    showLoadingOverlay('بارکردنی مێژوو...');
    
    try {
        const purchases = await db.collection('purchases')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();
        
        const historyHTML = `
            <div class="purchase-history">
                <h2>مێژووی کڕین</h2>
                <div class="purchase-list">
                    ${purchases.docs.map(doc => {
                        const data = doc.data();
                        const date = data.timestamp?.toDate();
                        return `
                            <div class="purchase-item">
                                <div class="purchase-info">
                                    <span class="purchase-name">${getPowerupName(data.item)}</span>
                                    <span class="purchase-date">${date ? formatDate(date) : 'ئێستا'}</span>
                                </div>
                                <div class="purchase-price">
                                    <i class="fas fa-coins"></i>
                                    ${data.price}
                                </div>
                            </div>
                        `;
                    }).join('') || '<p class="empty-message">هیچ کڕینێکت نەکردووە</p>'}
                </div>
                <button class="btn btn-secondary" onclick="hideModal('purchaseHistory')">
                    داخستن
                </button>
            </div>
        `;
        
        const modal = document.getElementById('purchaseHistoryModal');
        if (modal) {
            modal.innerHTML = historyHTML;
            modal.classList.add('active');
        }
        
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Error loading purchase history:', error);
        hideLoadingOverlay();
        showNotification('هەڵە لە بارکردنی مێژوو!', 'error');
    }
}

/**
 * Get powerup name in Kurdish
 */
function getPowerupName(type) {
    const names = {
        '5050': '50-50',
        'skip': 'تێپەڕاندن',
        'time': 'کاتی زیادە',
        'double': 'دوو هێندە'
    };
    return names[type] || type;
}

/**
 * Format date
 */
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'ئێستا';
    if (minutes < 60) return `${minutes} خولەک پێش ئێستا`;
    if (hours < 24) return `${hours} کاتژمێر پێش ئێستا`;
    if (days < 7) return `${days} ڕۆژ پێش ئێستا`;
    
    return date.toLocaleDateString('ckb');
}

/**
 * Hide modal
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Daily reward
 */
async function claimDailyReward() {
    if (!currentUser) {
        showNotification(APP_CONFIG.messages.error.loginFirst, 'error');
        return;
    }
    
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        const lastClaim = userData.lastDailyClaim?.toDate();
        const now = new Date();
        
        // Check if already claimed today
        if (lastClaim) {
            const daysSince = Math.floor((now - lastClaim) / 86400000);
            if (daysSince < 1) {
                const hoursLeft = 24 - Math.floor((now - lastClaim) / 3600000);
                showNotification(`دووبارە وەرە دوای ${hoursLeft} کاتژمێر!`, 'info');
                return;
            }
        }
        
        showLoadingOverlay('وەرگرتنی پاداشت...');
        
        const tokensEarned = APP_CONFIG.game.tokenRewards.dailyLogin;
        
        // Use precise token addition
        await addTokens(tokensEarned);
        
        await userRef.update({
            lastDailyClaim: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoadingOverlay();
        showNotification(`پاداشتی ڕۆژانە: +${tokensEarned} تۆکن! 🎁`, 'success');
        await updateUserUI();
        
    } catch (error) {
        console.error('Error claiming daily reward:', error);
        hideLoadingOverlay();
        showNotification('هەڵە!', 'error');
    }
}

console.log('✅ Shop module loaded');
