/**
 * Game Module - Complete Fixed Version
 */

let gameState = {
    score: 0,
    currentQuestion: 0,
    timeLeft: 15,
    questions: [],
    isPlaying: false,
    timerInterval: null,
    streak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    hintsUsed: {
        '5050': 0,
        skip: 0,
        time: 0,
        double: 0
    },
    powerups: {
        '5050': 0,
        skip: 0,
        time: 0,
        double: 0
    },
    isPowerupActive: {
        double: false
    },
    gameMode: 'quick', // quick, scheduled
    totalEarned: 0
};

/**
 * Check if it's time for main game
 */
function checkMainGameTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // یاری سەرەکی لە 20:00 (8 PM)
    const mainGameHour = 20;
    const mainGameMinute = 0;
    
    if (currentHour === mainGameHour && currentMinute === mainGameMinute) {
        return true;
    }
    
    return false;
}

/**
 * Get time until main game
 */
function getTimeUntilMainGame() {
    const now = new Date();
    const today = new Date();
    today.setHours(20, 0, 0, 0);
    
    let mainGameTime = today;
    if (now > today) {
        // ئەگەر کاتەکە تێپەڕیوە، بۆ بەیانی
        mainGameTime = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }
    
    const diff = mainGameTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, totalMs: diff };
}

/**
 * Update countdown to main game
 */
function updateMainGameCountdown() {
    const countdownEl = document.getElementById('mainGameCountdown');
    if (!countdownEl) return;
    
    const time = getTimeUntilMainGame();
    
    if (time.totalMs <= 0) {
        countdownEl.innerHTML = `
            <div class="countdown-ready">
                <div class="countdown-icon">🏆</div>
                <div class="countdown-title">یاری سەرەکی ئامادەیە!</div>
                <button class="btn btn-primary btn-pulse" onclick="startGame('scheduled')">
                    <i class="fas fa-play"></i>
                    دەست پێبکە ئێستا!
                </button>
            </div>
        `;
    } else {
        countdownEl.innerHTML = `
            <div class="countdown-timer">
                <div class="countdown-icon">⏰</div>
                <div class="countdown-title">یاری سەرەکی دەست پێ دەکات لە:</div>
                <div class="countdown-time">
                    <div class="time-unit">
                        <div class="time-value">${String(time.hours).padStart(2, '0')}</div>
                        <div class="time-label">کاتژمێر</div>
                    </div>
                    <div class="time-separator">:</div>
                    <div class="time-unit">
                        <div class="time-value">${String(time.minutes).padStart(2, '0')}</div>
                        <div class="time-label">خولەک</div>
                    </div>
                    <div class="time-separator">:</div>
                    <div class="time-unit">
                        <div class="time-value">${String(time.seconds).padStart(2, '0')}</div>
                        <div class="time-label">چرکە</div>
                    </div>
                </div>
                <div class="countdown-info">
                    <div class="info-item">
                        <i class="fas fa-trophy"></i>
                        <span>٥٠٠ خاڵ</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-coins"></i>
                        <span>٥٠ تۆکن</span>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Start countdown update interval
 */
function startMainGameCountdownInterval() {
    updateMainGameCountdown();
    setInterval(updateMainGameCountdown, 1000);
}

/**
 * Start a new game
 */
async function startGame(mode = 'quick') {
    if (!currentUser) {
        showNotification(APP_CONFIG.messages.error.loginFirst, 'error');
        return;
    }
    
    showLoadingOverlay('بارکردنی پرسیارەکان...');
    
    try {
        const questions = await loadQuestions();
        
        if (!questions || questions.length === 0) {
            showNotification('هیچ پرسیارێک بەردەست نییە!', 'error');
            hideLoadingOverlay();
            return;
        }
        
        // Initialize game state
        gameState = {
            score: 0,
            currentQuestion: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            timeLeft: APP_CONFIG.game.settings.questionTime,
            questions: shuffleArray(questions).slice(0, APP_CONFIG.game.settings.totalQuestions),
            isPlaying: true,
            timerInterval: null,
            streak: 0,
            hintsUsed: { '5050': 0, skip: 0, time: 0, double: 0 },
            powerups: await getUserPowerups(),
            isPowerupActive: { double: false },
            gameMode: mode,
            totalEarned: 0
        };
        
        hideLoadingOverlay();
        showScreen('game');
        
        // Show countdown
        await showCountdown();
        
        // Start first question
        loadQuestion();
        startTimer();
        updateGameUI();
        updatePowerupsUI();
        
    } catch (error) {
        console.error('Error starting game:', error);
        showNotification('هەڵە لە دەستپێکردنی یاری!', 'error');
        hideLoadingOverlay();
    }
}

/**
 * Load questions from Firestore
 */
async function loadQuestions() {
    try {
        const questionsSnapshot = await db.collection('questions')
            .where('active', '==', true)
            .get();
        
        if (questionsSnapshot.empty) {
            return getSampleQuestions();
        }
        
        return questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
    } catch (error) {
        console.error('Error loading questions:', error);
        return getSampleQuestions();
    }
}

/**
 * Sample questions for testing
 */
function getSampleQuestions() {
    return [
        {
            question: "پایتەختی وڵاتی ژاپۆن کوێیە؟",
            answers: ["تۆکیۆ", "ئۆساکا", "کیۆتۆ", "سیۆل"],
            correct: 0,
            category: "جوگرافیا",
            difficulty: "easy"
        },
        {
            question: "کام لەمانە گەورەترین سەیارەیە لە کۆمەڵەی خۆرمان؟",
            answers: ["زوحەل", "مشتەری", "زەمین", "ئۆتورد"],
            correct: 1,
            category: "زانست",
            difficulty: "medium"
        },
        {
            question: "پایتەختی عێراق کوێیە؟",
            answers: ["بەغدا", "بەسرە", "هەولێر", "سلێمانی"],
            correct: 0,
            category: "جوگرافیا",
            difficulty: "easy"
        },
        {
            question: "کێ دامەزرێنەری شەریکەتی ئەپڵە؟",
            answers: ["بیل گەیتس", "ستیڤ جۆبز", "مارک زاکەربێرگ", "ئیلۆن ماسک"],
            correct: 1,
            category: "تەکنەلۆژیا",
            difficulty: "medium"
        },
        {
            question: "چەند ڕۆژ لە یەک ساڵدا هەیە؟",
            answers: ["364", "365", "366", "360"],
            correct: 1,
            category: "گشتی",
            difficulty: "easy"
        },
        {
            question: "کام لەمانە لە بەرهەمەکانی گووگڵە؟",
            answers: ["ئەندرۆید", "ئای‌فۆن", "ویندۆز", "لینکس"],
            correct: 0,
            category: "تەکنەلۆژیا",
            difficulty: "easy"
        },
        {
            question: "کام دەریا گەورەترین دەریای جیهانە؟",
            answers: ["ئەتڵەنتیک", "هیند", "ئارام", "باکوور"],
            correct: 2,
            category: "جوگرافیا",
            difficulty: "medium"
        },
        {
            question: "چەند بایت لە یەک کیلۆبایتدا هەیە؟",
            answers: ["512", "1024", "2048", "4096"],
            correct: 1,
            category: "تەکنەلۆژیا",
            difficulty: "hard"
        },
        {
            question: "کێ شاعیری کوردە؟",
            answers: ["نالی", "شێکسپیر", "فیردەوسی", "عومەر"],
            correct: 0,
            category: "ئەدەبیات",
            difficulty: "easy"
        },
        {
            question: "چەند خولەک لە ساتژمێرێکدا هەیە؟",
            answers: ["30", "60", "120", "24"],
            correct: 1,
            category: "گشتی",
            difficulty: "easy"
        },
        {
            question: "کێ یەکەم کەسی سەرنج هات کە چووە سەر مانگ؟",
            answers: ["نیل ئارمسترۆنگ", "باز ئۆڵدرین", "یوری گاگارین", "جۆن گلین"],
            correct: 0,
            category: "مێژوو",
            difficulty: "medium"
        },
        {
            question: "پایتەختی فەرەنسا کوێیە؟",
            answers: ["پاریس", "لەندەن", "ڕۆما", "بەرلین"],
            correct: 0,
            category: "جوگرافیا",
            difficulty: "easy"
        }
    ];
}

/**
 * Load current question
 */
function loadQuestion() {
    if (!gameState.isPlaying) return;
    
    const question = gameState.questions[gameState.currentQuestion];
    const questionEl = document.getElementById('question');
    const answersEl = document.getElementById('answers');
    const progressEl = document.getElementById('gameProgress');
    
    if (!questionEl || !answersEl) return;
    
    // Update question
    questionEl.textContent = question.question;
    
    // Update progress
    if (progressEl) {
        progressEl.textContent = `${gameState.currentQuestion + 1}/${gameState.questions.length}`;
    }
    
    // Clear and create answer buttons
    answersEl.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerHTML = `
            <span class="answer-text">${answer}</span>
            <i class="far fa-circle"></i>
        `;
        btn.onclick = () => selectAnswer(index);
        answersEl.appendChild(btn);
    });
    
    // Reset timer
    gameState.timeLeft = APP_CONFIG.game.settings.questionTime;
    updateTimerDisplay();
}

/**
 * Start question timer
 */
function startTimer() {
    stopTimer();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            stopTimer();
            handleTimeOut();
        }
    }, 1000);
}

/**
 * Stop timer
 */
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    const timerBarEl = document.querySelector('.timer-bar-fill');
    
    if (timerEl) {
        timerEl.textContent = gameState.timeLeft;
        
        // Change color based on time left
        if (gameState.timeLeft <= 5) {
            timerEl.style.color = '#ef4444';
        } else if (gameState.timeLeft <= 10) {
            timerEl.style.color = '#f59e0b';
        } else {
            timerEl.style.color = '#22c55e';
        }
    }
    
    if (timerBarEl) {
        const percentage = (gameState.timeLeft / APP_CONFIG.game.settings.questionTime) * 100;
        timerBarEl.style.width = percentage + '%';
    }
}

/**
 * Handle time out - FIXED: Added missing function
 */
function handleTimeOut() {
    const question = gameState.questions[gameState.currentQuestion];
    const answerBtns = document.querySelectorAll('.answer-btn');
    
    // Show correct answer
    answerBtns.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === question.correct) {
            btn.classList.add('correct');
        }
    });
    
    gameState.wrongAnswers++;
    gameState.streak = 0;
    
    showNotification('کات تەواو بوو! 😔', 'error');
    
    // Next question after delay
    setTimeout(() => {
        gameState.currentQuestion++;
        
        if (gameState.currentQuestion < gameState.questions.length) {
            loadQuestion();
            startTimer();
        } else {
            endGame();
        }
    }, 2000);
}

/**
 * Select an answer
 */
function selectAnswer(selectedIndex) {
    if (!gameState.isPlaying) return;
    
    stopTimer();
    const question = gameState.questions[gameState.currentQuestion];
    const isCorrect = selectedIndex === question.correct;
    
    // Highlight answers
    const answerBtns = document.querySelectorAll('.answer-btn');
    answerBtns.forEach((btn, idx) => {
        btn.disabled = true;
        
        if (idx === question.correct) {
            btn.classList.add('correct');
        } else if (idx === selectedIndex && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    
    // Calculate points
    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.streak++;
        
        let points = APP_CONFIG.game.settings.pointsPerAnswer;
        
        // Double points powerup
        if (gameState.isPowerupActive.double) {
            points *= 2;
            gameState.isPowerupActive.double = false;
        }
        
        // Streak bonus
        if (gameState.streak >= 3) {
            points += 50;
        }
        
        gameState.score += points;
        
        // Token reward for correct answer
        const tokenReward = APP_CONFIG.game.tokenRewards.correctAnswer;
        gameState.totalEarned += tokenReward;
        
        showNotification(`✓ ڕاستە! +${points} خاڵ، +${tokenReward} تۆکن`, 'success');
    } else {
        gameState.wrongAnswers++;
        gameState.streak = 0;
        showNotification('هەڵە! :(', 'error');
    }
    
    updateGameUI();
    
    // Next question after delay
    setTimeout(() => {
        gameState.currentQuestion++;
        
        if (gameState.currentQuestion < gameState.questions.length) {
            loadQuestion();
            startTimer();
        } else {
            endGame();
        }
    }, 1500);
}

/**
 * End game and save results
 */
async function endGame() {
    gameState.isPlaying = false;
    stopTimer();
    
    showLoadingOverlay('تۆمارکردنی ئەنجامەکان...');
    
    try {
        const userData = await getCurrentUserData();
        if (!userData) {
            throw new Error('User data not found');
        }
        
        // Calculate bonus tokens
        let bonusTokens = 0;
        
        // Win bonus
        const winPercentage = (gameState.correctAnswers / gameState.questions.length) * 100;
        if (winPercentage >= 70) {
            bonusTokens += APP_CONFIG.game.tokenRewards.winGame;
        }
        
        // Completion bonus
        bonusTokens += APP_CONFIG.game.tokenRewards.gameCompletion;
        
        // Scheduled game bonus
        if (gameState.gameMode === 'scheduled') {
            bonusTokens += APP_CONFIG.game.schedules.evening.tokens;
        }
        
        const totalTokens = gameState.totalEarned + bonusTokens;
        
        // Update user stats with batch write
        const userRef = db.collection('users').doc(currentUser.uid);
        
        await userRef.update({
            tokens: firebase.firestore.FieldValue.increment(totalTokens),
            totalScore: firebase.firestore.FieldValue.increment(gameState.score),
            points: firebase.firestore.FieldValue.increment(gameState.score),
            gamesPlayed: firebase.firestore.FieldValue.increment(1),
            totalGames: firebase.firestore.FieldValue.increment(1),
            wins: winPercentage >= 70 ? firebase.firestore.FieldValue.increment(1) : userData.wins,
            losses: winPercentage < 70 ? firebase.firestore.FieldValue.increment(1) : userData.losses,
            lastPlayed: firebase.firestore.FieldValue.serverTimestamp(),
            powerups: gameState.powerups
        });
        
        // Update leaderboard
        await updateLeaderboard(currentUser.uid, userData.displayName, gameState.score);
        
        // Refresh user data
        await getCurrentUserData();
        await updateUserUI();
        
        hideLoadingOverlay();
        
        // Show results
        showGameResults(totalTokens);
        
    } catch (error) {
        console.error('Error ending game:', error);
        hideLoadingOverlay();
        showNotification('هەڵە لە تۆمارکردنی ئەنجامەکان!', 'error');
        setTimeout(() => showScreen('home'), 2000);
    }
}

/**
 * Show game results
 */
function showGameResults(totalTokens) {
    const winPercentage = (gameState.correctAnswers / gameState.questions.length) * 100;
    const isWin = winPercentage >= 70;
    
    const resultsHTML = `
        <div class="game-results">
            <div class="results-icon">${isWin ? '🏆' : '💪'}</div>
            <h2>${isWin ? 'تەبریک! بردتەوە!' : 'باش بوو!'}</h2>
            <div class="results-stats">
                <div class="stat-item">
                    <div class="stat-label">خاڵەکانت</div>
                    <div class="stat-value">${gameState.score}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">وەڵامی ڕاست</div>
                    <div class="stat-value">${gameState.correctAnswers}/${gameState.questions.length}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">تۆکنی بەدەستهێنراو</div>
                    <div class="stat-value">${totalTokens} 🪙</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">ڕێژەی سەرکەوتن</div>
                    <div class="stat-value">${Math.round(winPercentage)}%</div>
                </div>
            </div>
            <div class="results-actions">
                <button class="btn btn-primary" onclick="startGame('${gameState.gameMode}')">
                    <i class="fas fa-redo"></i>
                    دووبارە یاری بکە
                </button>
                <button class="btn btn-secondary" onclick="showScreen('home')">
                    <i class="fas fa-home"></i>
                    گەڕانەوە بۆ دەستپێک
                </button>
            </div>
        </div>
    `;
    
    const gameScreen = document.getElementById('gameScreen');
    if (gameScreen) {
        gameScreen.innerHTML = resultsHTML;
    }
}

/**
 * Update game UI
 */
function updateGameUI() {
    const scoreEl = document.getElementById('currentScore');
    if (scoreEl) {
        scoreEl.textContent = gameState.score;
    }
}

/**
 * Use powerup
 */
async function usePowerup(type) {
    if (!gameState.isPlaying) {
        showNotification('یەکەم یاری دەست پێ بکە!', 'error');
        return;
    }
    
    if (gameState.powerups[type] <= 0) {
        showNotification('ئەم توانایەت نیە! لە کۆگا بیکڕە.', 'error');
        return;
    }
    
    gameState.powerups[type]--;
    gameState.hintsUsed[type]++;
    
    switch(type) {
        case '5050':
            apply5050();
            break;
        case 'skip':
            applySkip();
            break;
        case 'time':
            applyTime();
            break;
        case 'double':
            applyDouble();
            break;
    }
    
    updatePowerupsUI();
    
    // Save powerup usage to database
    await updateUserData({ powerups: gameState.powerups });
}

/**
 * Apply 50-50 powerup
 */
function apply5050() {
    const question = gameState.questions[gameState.currentQuestion];
    const answerBtns = document.querySelectorAll('.answer-btn');
    
    let wrongAnswers = [];
    question.answers.forEach((ans, idx) => {
        if (idx !== question.correct) {
            wrongAnswers.push(idx);
        }
    });
    
    // Remove 2 wrong answers
    const toRemove = shuffleArray(wrongAnswers).slice(0, 2);
    
    toRemove.forEach(idx => {
        answerBtns[idx].style.opacity = '0.3';
        answerBtns[idx].disabled = true;
    });
    
    showNotification('دوو وەڵامی هەڵە لابرا!', 'success');
}

/**
 * Apply skip powerup
 */
function applySkip() {
    showNotification('پرسیارەکە تێپەڕێنرا!', 'success');
    
    stopTimer();
    
    setTimeout(() => {
        gameState.currentQuestion++;
        
        if (gameState.currentQuestion < gameState.questions.length) {
            loadQuestion();
            startTimer();
        } else {
            endGame();
        }
    }, 1000);
}

/**
 * Apply time powerup
 */
function applyTime() {
    gameState.timeLeft += 10;
    updateTimerDisplay();
    showNotification('+10 چرکە کات!', 'success');
}

/**
 * Apply double points powerup
 */
function applyDouble() {
    gameState.isPowerupActive.double = true;
    showNotification('خاڵەکانت دوو هێندە دەبێت!', 'success');
}

/**
 * Update powerups UI
 */
function updatePowerupsUI() {
    Object.keys(gameState.powerups).forEach(type => {
        const el = document.getElementById(`powerup-${type}`);
        if (el) {
            el.textContent = gameState.powerups[type];
        }
    });
}

/**
 * Get user powerups
 */
async function getUserPowerups() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        return userData?.powerups || {
            '5050': 0,
            skip: 0,
            time: 0,
            double: 0
        };
    } catch (error) {
        console.error('Error getting powerups:', error);
        return { '5050': 0, skip: 0, time: 0, double: 0 };
    }
}

/**
 * Update leaderboard
 */
async function updateLeaderboard(userId, userName, score) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        const leaderboardRef = db.collection('leaderboard').doc(userId);
        const doc = await leaderboardRef.get();
        
        const currentHighScore = userData.totalScore || 0;
        
        if (!doc.exists || currentHighScore > (doc.data()?.highScore || 0)) {
            await leaderboardRef.set({
                userId,
                userName,
                highScore: currentHighScore,
                totalGames: userData.totalGames || 0,
                avatar: userData.avatar || '👤',
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

/**
 * Show countdown before game starts
 */
function showCountdown() {
    return new Promise((resolve) => {
        let count = 3;
        const countdownEl = document.getElementById('countdown');
        
        if (!countdownEl) {
            resolve();
            return;
        }
        
        countdownEl.style.display = 'flex';
        countdownEl.innerHTML = `<div class="countdown-number">${count}</div>`;
        
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.innerHTML = `<div class="countdown-number">${count}</div>`;
            } else {
                countdownEl.innerHTML = `<div class="countdown-number">دەست پێ بکە!</div>`;
                setTimeout(() => {
                    countdownEl.style.display = 'none';
                    resolve();
                }, 500);
                clearInterval(interval);
            }
        }, 1000);
    });
}

/**
 * Shuffle array
 */
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Pause game
 */
function pauseGame() {
    if (!gameState.isPlaying) return;
    
    stopTimer();
    showNotification(APP_CONFIG.messages.info.gamePaused, 'info');
}

/**
 * Resume game
 */
function resumeGame() {
    if (!gameState.isPlaying) return;
    
    startTimer();
    showNotification('یاریەکە درێژەی پێدرا', 'success');
}

console.log('✅ Game module loaded');
