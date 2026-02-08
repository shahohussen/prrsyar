/**
 * Game Module - Complete Version
 */

let gameState = {
    score: 0,
    currentQuestion: 0,
    timeLeft: 15,
    questions: [],
    isPlaying: false,
    timerInterval: null,
    streak: 0,
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
 * Start a new game
 */
async function startGame(mode = 'quick') {
    if (!currentUser) {
        showNotification('تکایە یەکەم چوونەژوورەوە بکە!', 'error');
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
            question: "چەند وشە لە یەک کیلۆبایتدا هەیە؟",
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
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }
    
    // Move to next question or end game
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
 * Handle correct answer
 */
function handleCorrectAnswer() {
    let points = APP_CONFIG.game.settings.pointsPerAnswer;
    
    // Apply time bonus
    const timeBonus = Math.floor(gameState.timeLeft * 5);
    points += timeBonus;
    
    // Apply streak bonus
    gameState.streak++;
    const streakBonus = gameState.streak * 10;
    points += streakBonus;
    
    // Apply double powerup
    if (gameState.isPowerupActive.double) {
        points *= 2;
        gameState.isPowerupActive.double = false;
    }
    
    gameState.score += points;
    
    // Show feedback
    let message = `+${points} خاڵ! `;
    if (gameState.streak > 1) {
        message += `🔥 ${gameState.streak} لە ڕیزدا`;
    }
    
    showNotification(message, 'success');
    updateGameUI();
}

/**
 * Handle wrong answer
 */
function handleWrongAnswer() {
    gameState.streak = 0;
    showNotification('هەڵە! 😢', 'error');
}

/**
 * Handle time out
 */
function handleTimeOut() {
    gameState.streak = 0;
    showNotification('کاتەکەت تەواو بوو! ⏰', 'error');
    
    // Highlight correct answer
    const answerBtns = document.querySelectorAll('.answer-btn');
    const question = gameState.questions[gameState.currentQuestion];
    
    answerBtns.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === question.correct) {
            btn.classList.add('correct');
        }
    });
    
    // Move to next question
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
 * End game
 */
async function endGame() {
    gameState.isPlaying = false;
    stopTimer();
    
    showLoadingOverlay('ژمێردنی خاڵەکانت...');
    
    try {
        // Calculate rewards
        const tokensEarned = Math.floor(gameState.score / 10);
        gameState.totalEarned = tokensEarned;
        
        // Update user data
        await updateUserAfterGame(gameState.score, tokensEarned);
        
        hideLoadingOverlay();
        
        // Show results
        showGameResults();
        
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
function showGameResults() {
    const resultsHTML = `
        <div class="game-results">
            <div class="results-icon">🏆</div>
            <h2>یاریەکەت تەواو بوو!</h2>
            <div class="results-stats">
                <div class="stat-item">
                    <div class="stat-label">خاڵەکانت</div>
                    <div class="stat-value">${gameState.score}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">وەڵامی ڕاست</div>
                    <div class="stat-value">${gameState.questions.filter((q, i) => i < gameState.currentQuestion).length}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">تۆکنی بەدەستهێنراو</div>
                    <div class="stat-value">${gameState.totalEarned} 🪙</div>
                </div>
            </div>
            <div class="results-actions">
                <button class="btn btn-primary" onclick="startGame()">
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
        showNotification('ئەم توانایەت نیە! لە فرۆشگا بیکڕە.', 'error');
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
 * Update user after game
 */
async function updateUserAfterGame(score, tokensEarned) {
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        await userRef.update({
            tokens: firebase.firestore.FieldValue.increment(tokensEarned),
            totalScore: firebase.firestore.FieldValue.increment(score),
            gamesPlayed: firebase.firestore.FieldValue.increment(1),
            lastPlayed: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update leaderboard
        await updateLeaderboard(currentUser.uid, userData.name, score);
        
    } catch (error) {
        console.error('Error updating user after game:', error);
        throw error;
    }
}

/**
 * Update leaderboard
 */
async function updateLeaderboard(userId, userName, score) {
    try {
        const leaderboardRef = db.collection('leaderboard').doc(userId);
        const doc = await leaderboardRef.get();
        
        if (!doc.exists || score > (doc.data()?.highScore || 0)) {
            await leaderboardRef.set({
                userId,
                userName,
                highScore: score,
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
    showNotification('یاریەکە ڕاگرا', 'info');
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
