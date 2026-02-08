/**
 * Main Application - Enhanced Fixed Version
 */

async function initApp() {
    console.log('🚀 Initializing SURVIVOR ULTRA...');
    
    if (!initFirebase()) {
        showNotification('کێشە لە گرێدانی Firebase!', 'error');
        document.getElementById('loading').style.display = 'none';
        return;
    }
    
    initAuthObserver();
    setupEventListeners();
    
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.style.display = 'none', 500);
        }
    }, 1000);
    
    console.log('✅ App initialized successfully');
}

function setupEventListeners() {
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabName = this.dataset.tab;
            document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
            
            const form = document.getElementById(`${tabName}Form`);
            if (form) form.style.display = 'block';
        });
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showNotification(APP_CONFIG.messages.error.fillAllFields, 'error');
                return;
            }
            
            showLoadingOverlay('چوونەژوورەوە...');
            console.log('Attempting login...');
            const result = await loginWithEmail(email, password);
            hideLoadingOverlay();
            
            if (!result.success) {
                showNotification(result.error, 'error');
            } else {
                showNotification(APP_CONFIG.messages.success.login, 'success');
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirm = document.getElementById('registerConfirm').value;
            
            if (!name || !email || !password || !confirm) {
                showNotification(APP_CONFIG.messages.error.fillAllFields, 'error');
                return;
            }
            
            if (password.length < 8) {
                showNotification(APP_CONFIG.messages.error.passwordTooShort, 'error');
                return;
            }
            
            if (password !== confirm) {
                showNotification(APP_CONFIG.messages.error.passwordMismatch, 'error');
                return;
            }
            
            showLoadingOverlay('دروستکردنی هەژمار...');
            console.log('Attempting registration...');
            const result = await registerWithEmail(name, email, password);
            hideLoadingOverlay();
            
            if (!result.success) {
                showNotification(result.error, 'error');
            } else {
                showNotification(APP_CONFIG.messages.success.register, 'success');
            }
        });
    }
    
    // Google login button
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            showLoadingOverlay('چوونەژوورەوە لەگەڵ گووگڵ...');
            console.log('Attempting Google login...');
            
            const result = await loginWithGoogle();
            hideLoadingOverlay();
            
            if (!result.success) {
                showNotification(result.error, 'error');
            }
        });
    }
    
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = item.dataset.screen;
            
            if (screen === 'admin' && !isAdmin) {
                showNotification(APP_CONFIG.messages.error.adminOnly, 'error');
                return;
            }
            
            showScreen(screen);
        });
    });
    
    // Back buttons
    document.querySelectorAll('[data-back]').forEach(btn => {
        btn.addEventListener('click', () => showScreen('home'));
    });
    
    // Admin login
    const closeAdminLoginBtn = document.getElementById('closeAdminLogin');
    if (closeAdminLoginBtn) {
        closeAdminLoginBtn.addEventListener('click', () => {
            document.getElementById('adminLoginScreen').classList.remove('active');
        });
    }
    
    // Profile update form
    const profileUpdateForm = document.getElementById('profileUpdateForm');
    if (profileUpdateForm) {
        profileUpdateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('editName').value.trim();
            const email = document.getElementById('editEmail').value.trim();
            const password = document.getElementById('editPassword').value;
            
            showLoadingOverlay('نوێکردنەوەی پڕۆفایل...');
            const result = await updateProfile(name, email, password);
            hideLoadingOverlay();
            
            if (result.success) {
                showNotification(APP_CONFIG.messages.success.profileUpdate, 'success');
                await updateUserUI();
            } else {
                showNotification(result.error || 'هەڵەیەک ڕوویدا!', 'error');
            }
        });
    }
    
    // Delete account modal
    const showDeleteBtn = document.getElementById('showDeleteAccount');
    if (showDeleteBtn) {
        showDeleteBtn.addEventListener('click', () => {
            document.getElementById('deleteModal').classList.add('active');
        });
    }
    
    const closeDeleteBtn = document.getElementById('closeDeleteModal');
    if (closeDeleteBtn) {
        closeDeleteBtn.addEventListener('click', () => {
            document.getElementById('deleteModal').classList.remove('active');
        });
    }
    
    const deleteForm = document.getElementById('deleteAccountForm');
    if (deleteForm) {
        deleteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('deletePassword').value;
            
            if (confirm(APP_CONFIG.messages.confirm.deleteAccount)) {
                showLoadingOverlay('سڕینەوەی هەژمار...');
                const result = await deleteAccount(password);
                hideLoadingOverlay();
                
                if (result.success) {
                    showNotification('هەژمارەکەت سڕدرایەوە!', 'success');
                    document.getElementById('deleteModal').classList.remove('active');
                } else {
                    showNotification(result.error, 'error');
                }
            }
        });
    }
    
    // Start game buttons
    const startMainGameBtn = document.getElementById('startMainGame');
    if (startMainGameBtn) {
        startMainGameBtn.addEventListener('click', () => {
            if (!currentUser) {
                showNotification(APP_CONFIG.messages.error.loginFirst, 'error');
                return;
            }
            startGame('scheduled');
        });
    }
    
    const startQuickGameBtn = document.getElementById('startQuickGame');
    if (startQuickGameBtn) {
        startQuickGameBtn.addEventListener('click', () => {
            if (!currentUser) {
                showNotification(APP_CONFIG.messages.error.loginFirst, 'error');
                return;
            }
            startGame('quick');
        });
    }
    
    // Show leaderboard button
    const showLeaderboardBtn = document.getElementById('showLeaderboard');
    if (showLeaderboardBtn) {
        showLeaderboardBtn.addEventListener('click', () => {
            showScreen('leaderboard');
        });
    }
    
    // Watch ad button
    const watchAdBtn = document.getElementById('watchAdBtn');
    if (watchAdBtn) {
        watchAdBtn.addEventListener('click', () => {
            watchAdForTokens();
        });
    }
    
    // Refresh leaderboard button
    const refreshLeaderboardBtn = document.getElementById('refreshLeaderboard');
    if (refreshLeaderboardBtn) {
        refreshLeaderboardBtn.addEventListener('click', () => {
            loadLeaderboard();
        });
    }
    
    // Token click suggestion
    const tokenElements = document.querySelectorAll('#shopTokens, #homeCoins');
    tokenElements.forEach(el => {
        if (el) {
            el.addEventListener('click', async () => {
                const userData = await getCurrentUserData();
                const tokens = userData?.tokens || 0;
                
                if (tokens < 500) {
                    if (confirm(APP_CONFIG.messages.info.watchAdForTokens)) {
                        watchAdForTokens();
                    }
                }
            });
        }
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('دڵنیایت دەتەوێت دەرچیت؟')) {
                showLoadingOverlay('دەرچوون...');
                await logout();
                hideLoadingOverlay();
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', initApp);

console.log('✅ App module loaded');
