/**
 * Authentication Module
 */

// Login with email
async function loginWithEmail(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Register with email
async function registerWithEmail(name, email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        return { success: true };
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Login with Google
async function loginWithGoogle() {
    try {
        await auth.signInWithPopup(googleProvider);
        return { success: true };
    } catch (error) {
        console.error('Google login error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Logout
async function logout() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Get error message in Kurdish
function getErrorMessage(errorCode) {
    const messages = {
        'auth/invalid-email': 'ئیمەیڵەکە نادروستە',
        'auth/user-disabled': 'هەژمارەکەت ناچالاک کراوە',
        'auth/user-not-found': 'هەژمارەکە نەدۆزرایەوە',
        'auth/wrong-password': 'پاسۆرد هەڵەیە',
        'auth/email-already-in-use': 'ئیمەیڵەکە پێشتر تۆمار کراوە',
        'auth/weak-password': 'پاسۆرد دەبێت کەمینە ٨ نووسە بێت',
        'auth/operation-not-allowed': 'ئەم کردارە ڕێگەپێنەدراوە',
        'auth/network-request-failed': 'کێشەی هاتووچۆ',
        'auth/too-many-requests': 'زۆر هەوڵی سەرنەکەوتوو - تکایە دواتر هەوڵبدەرەوە',
        'auth/invalid-credential': 'زانیاریەکان هەڵەن',
        'auth/missing-email': 'تکایە ئیمەیڵ بنووسە'
    };
    
    return messages[errorCode] || 'هەڵەیەک ڕوویدا: ' + errorCode;
}

// Update profile
async function updateProfile(name, email, password) {
    if (!currentUser) return { success: false, error: 'چوونەژوورەوە پێویستە' };
    
    try {
        if (name && name !== currentUser.displayName) {
            await currentUser.updateProfile({ displayName: name });
        }
        
        if (email && email !== currentUser.email) {
            await currentUser.updateEmail(email);
        }
        
        if (password) {
            await currentUser.updatePassword(password);
        }
        
        await updateUserData({
            displayName: name || currentUser.displayName,
            email: email || currentUser.email
        });
        
        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Delete account
async function deleteAccount(password) {
    if (!currentUser) return { success: false, error: 'چوونەژوورەوە پێویستە' };
    
    try {
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            password
        );
        
        await currentUser.reauthenticateWithCredential(credential);
        await db.collection('users').doc(currentUser.uid).delete();
        await currentUser.delete();
        
        return { success: true };
    } catch (error) {
        console.error('Delete account error:', error);
        return { success: false, error: 'پاسۆرد هەڵەیە یان کێشەیەک هەیە!' };
    }
}

console.log('✅ Auth module loaded');
