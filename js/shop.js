/**
 * Shop Module - Complete Version
 */

/**
 * Initialize shop
 */
async function initShop() {
    await loadShopItems();
    await loadUserPowerups();
    updateShopUI();
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
 * Buy powerup
 */
async function buyPowerup(type) {
    if (!currentUser) {
        showNotification('تکایە یەکەم چوونەژوورەوە بکە!', 'error');
        return;
    }
    
    const price = APP_CONFIG.game.powerupPrices[type];
    
    if (!price) {
        showNotification('توانای نادروست!', 'error');
        return;
    }
    
    showLoadingOverlay('کڕینی توانا...');
    
    try {
        // Get user data
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        // Check tokens
        if (userData.tokens < price) {
            hideLoadingOverlay();
            showNotification(`تۆکنی پێویستت نیە! پێویستە ${price} تۆکن`, 'error');
            return;
        }
        
        // Update user data
        await userRef.update({
            tokens: firebase.firestore.FieldValue.increment(-price),
            [`powerups.${type}`]: firebase.firestore.FieldValue.increment(1)
        });
        
        // Add to purchase history
        await db.collection('purchases').add({
            userId: currentUser.uid,
            userName: userData.name,
            type: 'powerup',
            item: type,
            price: price,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoadingOverlay();
        showNotification('توانا کڕدرا! ✅', 'success');
        
        // Update UI
        await loadUserPowerups();
        await updateUserUI();
        
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
 * Show purchase history
 */
async function showPurchaseHistory() {
    if (!currentUser) {
        showNotification('تکایە یەکەم چوونەژوورەوە بکە!', 'error');
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
                    }).join('') || '<p>هیچ کڕینێکت نەکردووە</p>'}
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
 * Buy tokens (for future ads integration)
 */
async function watchAdForTokens() {
    if (!currentUser) {
        showNotification('تکایە یەکەم چوونەژوورەوە بکە!', 'error');
        return;
    }
    
    // Simulate watching ad
    showLoadingOverlay('چاوەڕوانی...');
    
    setTimeout(async () => {
        try {
            const tokensEarned = APP_CONFIG.game.tokenRewards.watchAd;
            
            await db.collection('users').doc(currentUser.uid).update({
                tokens: firebase.firestore.FieldValue.increment(tokensEarned)
            });
            
            hideLoadingOverlay();
            showNotification(`+${tokensEarned} تۆکن! 🎁`, 'success');
            await updateUserUI();
            
        } catch (error) {
            console.error('Error giving ad tokens:', error);
            hideLoadingOverlay();
            showNotification('هەڵە!', 'error');
        }
    }, 3000);
}

/**
 * Daily reward
 */
async function claimDailyReward() {
    if (!currentUser) {
        showNotification('تکایە یەکەم چوونەژوورەوە بکە!', 'error');
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
        
        await userRef.update({
            tokens: firebase.firestore.FieldValue.increment(tokensEarned),
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
