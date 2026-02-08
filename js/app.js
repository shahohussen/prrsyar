/**
 * Main Application
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
                showNotification('تکایە هەموو خانەکان پڕبکەرەوە!', 'error');
                return;
            }
            
            console.log('Attempting login...');
            const result = await loginWithEmail(email, password);
            
            if (!result.success) {
                showNotification(result.error, 'error');
            } else {
                showNotification('بەخێربێیت!', 'success');
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
                showNotification('تکایە هەموو خانەکان پڕبکەرەوە!', 'error');
                return;
            }
            
            if (password.length < 8) {
                showNotification('پاسۆرد دەبێت کەمینە ٨ نووسە بێت!', 'error');
                return;
            }
            
            if (password !== confirm) {
                showNotification('پاسۆردەکان یەک ناگونجێن!', 'error');
                return;
            }
            
            console.log('Attempting registration...');
            const result = await registerWithEmail(name, email, password);
            
            if (!result.success) {
                showNotification(result.error, 'error');
            } else {
                showNotification('هەژمارەکەت دروست کرا!', 'success');
            }
        });
    }
    
    // Google login button
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Attempting Google login...');
            
            const result = await loginWithGoogle();
            
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
                showNotification('تەنها ئەدمینەکان دەتوانن بچنە ئەم بەشەوە!', 'error');
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
            
            const result = await updateProfile(name, email, password);
            
            if (result.success) {
                showNotification('پڕۆفایلەکەت نوێ کرایەوە!', 'success');
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
            
            if (confirm('دڵنیایت دەتەوێت هەژمارەکەت بسڕیتەوە؟')) {
                const result = await deleteAccount(password);
                
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
            startGame('scheduled');
        });
    }
    
    const startQuickGameBtn = document.getElementById('startQuickGame');
    if (startQuickGameBtn) {
        startQuickGameBtn.addEventListener('click', () => {
            if (!currentUser) {
                showNotification('تکایە یەکەم چوونەژوورەوە بکە!', 'error');
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
}

window.addEventListener('DOMContentLoaded', initApp);

console.log('✅ App module loaded');
