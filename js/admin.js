/**

- Admin Module - Complete Full-Featured Version
  */

let adminData = {
totalUsers: 0,
totalQuestions: 0,
totalGames: 0,
activeUsers: 0,
onlineUsers: 0,
totalTokensDistributed: 0
};

let currentAdminTab = ‘dashboard’;

/**

- Initialize admin panel
  */
  async function initAdminPanel() {
  if (!isAdmin) {
  showNotification(‘تەنها ئەدمینەکان دەتوانن بچنە ئەم بەشەوە!’, ‘error’);
  showScreen(‘home’);
  return;
  }
  
  showLoadingOverlay(‘بارکردنی پەنەلی ئەدمین…’);
  
  try {
  await loadAdminData();
  renderAdminDashboard();
  setupAdminEventListeners();
  
  ```
   hideLoadingOverlay();
  ```
  
  } catch (error) {
  console.error(‘Error initializing admin panel:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە بارکردنی پەنەلی ئەدمین!’, ‘error’);
  }
  }

/**

- Load admin statistics
  */
  async function loadAdminData() {
  try {
  // Get all users
  const usersSnapshot = await db.collection(‘users’).get();
  adminData.totalUsers = usersSnapshot.size;
  
  ```
   // Calculate online users and total tokens
   let onlineCount = 0;
   let totalTokens = 0;
   usersSnapshot.docs.forEach(doc => {
       const data = doc.data();
       if (data.isOnline) onlineCount++;
       totalTokens += data.tokens || 0;
   });
   adminData.onlineUsers = onlineCount;
   adminData.totalTokensDistributed = totalTokens;
   
   // Get total questions
   const questionsSnapshot = await db.collection('questions').get();
   adminData.totalQuestions = questionsSnapshot.size;
   
   // Get total games
   let totalGames = 0;
   usersSnapshot.docs.forEach(doc => {
       totalGames += doc.data().gamesPlayed || 0;
   });
   adminData.totalGames = totalGames;
   
   // Get active users (last 7 days)
   const sevenDaysAgo = new Date();
   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
   
   const activeSnapshot = await db.collection('users')
       .where('lastLogin', '>=', sevenDaysAgo)
       .get();
   adminData.activeUsers = activeSnapshot.size;
  ```
  
  } catch (error) {
  console.error(‘Error loading admin data:’, error);
  throw error;
  }
  }

/**

- Render admin dashboard
  */
  function renderAdminDashboard() {
  const adminScreen = document.getElementById(‘adminScreen’);
  if (!adminScreen) return;
  
  adminScreen.innerHTML = `
  <div class="admin-header">
  <button class="btn btn-icon" data-back>
  <i class="fas fa-arrow-right"></i>
  </button>
  <div class="admin-title">
  <i class="fas fa-shield-alt"></i>
  پەنەلی ئەدمین
  </div>
  <button class="btn btn-icon btn-danger" onclick="logout()">
  <i class="fas fa-sign-out-alt"></i>
  </button>
  </div>
  
  ```
   <!-- Admin Tabs -->
   <div class="admin-tabs">
       <button class="admin-tab active" data-tab="dashboard">
           <i class="fas fa-chart-line"></i>
           داشبۆرد
       </button>
       <button class="admin-tab" data-tab="questions">
           <i class="fas fa-question-circle"></i>
           پرسیارەکان
       </button>
       <button class="admin-tab" data-tab="users">
           <i class="fas fa-users"></i>
           یاریزانەکان
       </button>
       <button class="admin-tab" data-tab="shop">
           <i class="fas fa-store"></i>
           کۆگا
       </button>
       <button class="admin-tab" data-tab="settings">
           <i class="fas fa-cog"></i>
           ڕێکخستنەکان
       </button>
   </div>
   
   <!-- Admin Content -->
   <div id="adminContent"></div>
  ```
  
  `;
  
  renderDashboardTab();
  }

/**

- Render Dashboard Tab
  */
  function renderDashboardTab() {
  const content = document.getElementById(‘adminContent’);
  if (!content) return;
  
  content.innerHTML = `
  <!-- Stats Grid -->
  <div class="admin-stats-grid">
  <div class="admin-stat-card">
  <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb)">
  <i class="fas fa-users"></i>
  </div>
  <div class="stat-details">
  <div class="stat-value">${adminData.totalUsers}</div>
  <div class="stat-label">کۆی یاریزانەکان</div>
  <div class="stat-change positive">
  <i class="fas fa-arrow-up"></i>
  <span>${adminData.activeUsers} چالاک</span>
  </div>
  </div>
  </div>
  
  ```
       <div class="admin-stat-card">
           <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669)">
               <i class="fas fa-wifi"></i>
           </div>
           <div class="stat-details">
               <div class="stat-value">${adminData.onlineUsers}</div>
               <div class="stat-label">ئۆنڵاین ئێستا</div>
               <div class="stat-change">
                   <div class="pulse-indicator"></div>
                   <span>زیندوو</span>
               </div>
           </div>
       </div>
       
       <div class="admin-stat-card">
           <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">
               <i class="fas fa-question-circle"></i>
           </div>
           <div class="stat-details">
               <div class="stat-value">${adminData.totalQuestions}</div>
               <div class="stat-label">کۆی پرسیارەکان</div>
           </div>
       </div>
       
       <div class="admin-stat-card">
           <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed)">
               <i class="fas fa-gamepad"></i>
           </div>
           <div class="stat-details">
               <div class="stat-value">${adminData.totalGames}</div>
               <div class="stat-label">کۆی یاریەکان</div>
           </div>
       </div>
       
       <div class="admin-stat-card">
           <div class="stat-icon" style="background: linear-gradient(135deg, #fbbf24, #f59e0b)">
               <i class="fas fa-coins"></i>
           </div>
           <div class="stat-details">
               <div class="stat-value">${formatNumber(adminData.totalTokensDistributed)}</div>
               <div class="stat-label">کۆی تۆکنەکان</div>
           </div>
       </div>
       
       <div class="admin-stat-card clickable" onclick="showQuickAction('add-question')">
           <div class="stat-icon" style="background: linear-gradient(135deg, #06b6d4, #0891b2)">
               <i class="fas fa-plus"></i>
           </div>
           <div class="stat-details">
               <div class="stat-label">زیادکردنی پرسیار</div>
               <div class="quick-action-btn">
                   <i class="fas fa-arrow-left"></i>
               </div>
           </div>
       </div>
   </div>
   
   <!-- Quick Actions -->
   <div class="admin-card">
       <div class="card-header">
           <h3><i class="fas fa-bolt"></i> کردارە خێراکان</h3>
       </div>
       <div class="quick-actions-grid">
           <button class="quick-action-card" onclick="loadQuestionsTab()">
               <i class="fas fa-question"></i>
               <span>بەڕێوەبردنی پرسیارەکان</span>
           </button>
           <button class="quick-action-card" onclick="loadUsersTab()">
               <i class="fas fa-users-cog"></i>
               <span>بەڕێوەبردنی یاریزانەکان</span>
           </button>
           <button class="quick-action-card" onclick="loadShopTab()">
               <i class="fas fa-shopping-bag"></i>
               <span>بەڕێوەبردنی کۆگا</span>
           </button>
           <button class="quick-action-card" onclick="loadSettingsTab()">
               <i class="fas fa-calendar-alt"></i>
               <span>کاتی یاری سەرەکی</span>
           </button>
       </div>
   </div>
   
   <!-- Recent Activity -->
   <div class="admin-card">
       <div class="card-header">
           <h3><i class="fas fa-history"></i> چالاکیە دوایەکان</h3>
           <button class="btn btn-small" onclick="loadRecentActivity()">
               <i class="fas fa-sync"></i>
           </button>
       </div>
       <div id="recentActivity" class="activity-list">
           <div class="loading-placeholder">بارکردن...</div>
       </div>
   </div>
  ```
  
  `;
  
  loadRecentActivity();
  }

/**

- Load Recent Activity
  */
  async function loadRecentActivity() {
  const container = document.getElementById(‘recentActivity’);
  if (!container) return;
  
  try {
  const activities = [];
  
  ```
   // Get recent users
   const recentUsers = await db.collection('users')
       .orderBy('createdAt', 'desc')
       .limit(5)
       .get();
   
   recentUsers.docs.forEach(doc => {
       const data = doc.data();
       activities.push({
           type: 'user',
           icon: 'fa-user-plus',
           color: '#3b82f6',
           text: `یاریزانی نوێ: ${data.displayName}`,
           time: data.createdAt?.toDate()
       });
   });
   
   // Sort by time
   activities.sort((a, b) => (b.time || 0) - (a.time || 0));
   
   container.innerHTML = activities.slice(0, 10).map(activity => `
       <div class="activity-item">
           <div class="activity-icon" style="background: ${activity.color}">
               <i class="fas ${activity.icon}"></i>
           </div>
           <div class="activity-details">
               <div class="activity-text">${activity.text}</div>
               <div class="activity-time">${activity.time ? formatTimeAgo(activity.time) : 'ئێستا'}</div>
           </div>
       </div>
   `).join('') || '<div class="empty-state">هیچ چالاکییەک نییە</div>';
  ```
  
  } catch (error) {
  console.error(‘Error loading activity:’, error);
  container.innerHTML = ‘<div class="error-state">هەڵە لە بارکردن</div>’;
  }
  }

/**

- Load Questions Tab
  */
  async function loadQuestionsTab() {
  currentAdminTab = ‘questions’;
  switchAdminTab(‘questions’);
  
  const content = document.getElementById(‘adminContent’);
  if (!content) return;
  
  showLoadingOverlay(‘بارکردنی پرسیارەکان…’);
  
  try {
  const questionsSnapshot = await db.collection(‘questions’).get();
  const questions = questionsSnapshot.docs.map(doc => ({
  id: doc.id,
  …doc.data()
  }));
  
  ```
   content.innerHTML = `
       <div class="admin-card">
           <div class="card-header">
               <h3><i class="fas fa-question-circle"></i> بەڕێوەبردنی پرسیارەکان (${questions.length})</h3>
               <button class="btn btn-primary" onclick="showAddQuestionModal()">
                   <i class="fas fa-plus"></i>
                   زیادکردنی پرسیار
               </button>
           </div>
           
           <div class="admin-table-container">
               <table class="admin-table">
                   <thead>
                       <tr>
                           <th>پرسیار</th>
                           <th>جۆر</th>
                           <th>ئاستی سەختی</th>
                           <th>دۆخ</th>
                           <th>کردارەکان</th>
                       </tr>
                   </thead>
                   <tbody>
                       ${questions.map(q => `
                           <tr>
                               <td class="question-text">${q.question}</td>
                               <td><span class="category-badge">${q.category || 'گشتی'}</span></td>
                               <td><span class="difficulty-badge ${q.difficulty}">${getDifficultyText(q.difficulty)}</span></td>
                               <td>
                                   <label class="toggle-switch">
                                       <input type="checkbox" ${q.active ? 'checked' : ''} 
                                           onchange="toggleQuestionStatus('${q.id}', this.checked)">
                                       <span class="toggle-slider"></span>
                                   </label>
                               </td>
                               <td class="actions">
                                   <button class="btn-icon-small btn-edit" onclick='editQuestion(${JSON.stringify(q)})'>
                                       <i class="fas fa-edit"></i>
                                   </button>
                                   <button class="btn-icon-small btn-delete" onclick="deleteQuestion('${q.id}')">
                                       <i class="fas fa-trash"></i>
                                   </button>
                               </td>
                           </tr>
                       `).join('') || '<tr><td colspan="5" class="empty-cell">هیچ پرسیارێک نییە</td></tr>'}
                   </tbody>
               </table>
           </div>
       </div>
   `;
   
   hideLoadingOverlay();
  ```
  
  } catch (error) {
  console.error(‘Error loading questions:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە بارکردنی پرسیارەکان!’, ‘error’);
  }
  }

/**

- Show Add Question Modal
  */
  function showAddQuestionModal() {
  const modal = document.createElement(‘div’);
  modal.className = ‘admin-modal active’;
  modal.innerHTML = `
  <div class="modal-content modal-large">
  <div class="modal-header">
  <h3><i class="fas fa-plus"></i> زیادکردنی پرسیاری نوێ</h3>
  <button class="btn-close" onclick="this.closest('.admin-modal').remove()">
  <i class="fas fa-times"></i>
  </button>
  </div>
  <form id="addQuestionForm" class="modal-body">
  <div class="form-group">
  <label>پرسیار</label>
  <textarea id="questionText" class="form-input" rows="3" required 
placeholder="پرسیارەکەت لێرە بنووسە..."></textarea>
  </div>
  
  ```
           <div class="form-row">
               <div class="form-group">
                   <label>جۆر</label>
                   <select id="questionCategory" class="form-input">
                       <option value="گشتی">گشتی</option>
                       <option value="جوگرافیا">جوگرافیا</option>
                       <option value="زانست">زانست</option>
                       <option value="تەکنەلۆژیا">تەکنەلۆژیا</option>
                       <option value="مێژوو">مێژوو</option>
                       <option value="ئەدەبیات">ئەدەبیات</option>
                       <option value="وەرزش">وەرزش</option>
                   </select>
               </div>
               
               <div class="form-group">
                   <label>ئاستی سەختی</label>
                   <select id="questionDifficulty" class="form-input">
                       <option value="easy">ئاسان</option>
                       <option value="medium">مامناوەند</option>
                       <option value="hard">سەخت</option>
                   </select>
               </div>
           </div>
           
           <div class="answers-section">
               <label>وەڵامەکان</label>
               <div class="form-group">
                   <input type="text" id="answer1" class="form-input" placeholder="وەڵامی ١" required>
               </div>
               <div class="form-group">
                   <input type="text" id="answer2" class="form-input" placeholder="وەڵامی ٢" required>
               </div>
               <div class="form-group">
                   <input type="text" id="answer3" class="form-input" placeholder="وەڵامی ٣" required>
               </div>
               <div class="form-group">
                   <input type="text" id="answer4" class="form-input" placeholder="وەڵامی ٤" required>
               </div>
           </div>
           
           <div class="form-group">
               <label>وەڵامی ڕاست</label>
               <select id="correctAnswer" class="form-input" required>
                   <option value="0">وەڵامی ١</option>
                   <option value="1">وەڵامی ٢</option>
                   <option value="2">وەڵامی ٣</option>
                   <option value="3">وەڵامی ٤</option>
               </select>
           </div>
           
           <div class="modal-footer">
               <button type="button" class="btn btn-secondary" onclick="this.closest('.admin-modal').remove()">
                   پاشگەزبوونەوە
               </button>
               <button type="submit" class="btn btn-primary">
                   <i class="fas fa-save"></i>
                   پاشەکەوتکردن
               </button>
           </div>
       </form>
   </div>
  ```
  
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById(‘addQuestionForm’).addEventListener(‘submit’, async (e) => {
  e.preventDefault();
  await saveNewQuestion();
  });
  }

/**

- Save New Question
  */
  async function saveNewQuestion() {
  const questionData = {
  question: document.getElementById(‘questionText’).value.trim(),
  category: document.getElementById(‘questionCategory’).value,
  difficulty: document.getElementById(‘questionDifficulty’).value,
  answers: [
  document.getElementById(‘answer1’).value.trim(),
  document.getElementById(‘answer2’).value.trim(),
  document.getElementById(‘answer3’).value.trim(),
  document.getElementById(‘answer4’).value.trim()
  ],
  correct: parseInt(document.getElementById(‘correctAnswer’).value),
  active: true,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  createdBy: currentUser.uid
  };
  
  showLoadingOverlay(‘زیادکردنی پرسیار…’);
  
  try {
  await db.collection(‘questions’).add(questionData);
  
  ```
   hideLoadingOverlay();
   showNotification('پرسیار بە سەرکەوتوویی زیاد کرا!', 'success');
   
   document.querySelector('.admin-modal').remove();
   loadQuestionsTab();
  ```
  
  } catch (error) {
  console.error(‘Error adding question:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە زیادکردنی پرسیار!’, ‘error’);
  }
  }

/**

- Edit Question
  */
  function editQuestion(question) {
  const modal = document.createElement(‘div’);
  modal.className = ‘admin-modal active’;
  modal.innerHTML = `
  <div class="modal-content modal-large">
  <div class="modal-header">
  <h3><i class="fas fa-edit"></i> دەستکاری پرسیار</h3>
  <button class="btn-close" onclick="this.closest('.admin-modal').remove()">
  <i class="fas fa-times"></i>
  </button>
  </div>
  <form id="editQuestionForm" class="modal-body">
  <div class="form-group">
  <label>پرسیار</label>
  <textarea id="editQuestionText" class="form-input" rows="3" required>${question.question}</textarea>
  </div>
  
  ```
           <div class="form-row">
               <div class="form-group">
                   <label>جۆر</label>
                   <select id="editQuestionCategory" class="form-input">
                       <option value="گشتی" ${question.category === 'گشتی' ? 'selected' : ''}>گشتی</option>
                       <option value="جوگرافیا" ${question.category === 'جوگرافیا' ? 'selected' : ''}>جوگرافیا</option>
                       <option value="زانست" ${question.category === 'زانست' ? 'selected' : ''}>زانست</option>
                       <option value="تەکنەلۆژیا" ${question.category === 'تەکنەلۆژیا' ? 'selected' : ''}>تەکنەلۆژیا</option>
                   </select>
               </div>
               
               <div class="form-group">
                   <label>ئاستی سەختی</label>
                   <select id="editQuestionDifficulty" class="form-input">
                       <option value="easy" ${question.difficulty === 'easy' ? 'selected' : ''}>ئاسان</option>
                       <option value="medium" ${question.difficulty === 'medium' ? 'selected' : ''}>مامناوەند</option>
                       <option value="hard" ${question.difficulty === 'hard' ? 'selected' : ''}>سەخت</option>
                   </select>
               </div>
           </div>
           
           <div class="answers-section">
               <label>وەڵامەکان</label>
               ${question.answers.map((ans, i) => `
                   <div class="form-group">
                       <input type="text" id="editAnswer${i+1}" class="form-input" value="${ans}" required>
                   </div>
               `).join('')}
           </div>
           
           <div class="form-group">
               <label>وەڵامی ڕاست</label>
               <select id="editCorrectAnswer" class="form-input" required>
                   <option value="0" ${question.correct === 0 ? 'selected' : ''}>وەڵامی ١</option>
                   <option value="1" ${question.correct === 1 ? 'selected' : ''}>وەڵامی ٢</option>
                   <option value="2" ${question.correct === 2 ? 'selected' : ''}>وەڵامی ٣</option>
                   <option value="3" ${question.correct === 3 ? 'selected' : ''}>وەڵامی ٤</option>
               </select>
           </div>
           
           <div class="modal-footer">
               <button type="button" class="btn btn-secondary" onclick="this.closest('.admin-modal').remove()">
                   پاشگەزبوونەوە
               </button>
               <button type="submit" class="btn btn-primary">
                   <i class="fas fa-save"></i>
                   پاشەکەوتکردن
               </button>
           </div>
       </form>
   </div>
  ```
  
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById(‘editQuestionForm’).addEventListener(‘submit’, async (e) => {
  e.preventDefault();
  await updateQuestion(question.id);
  });
  }

/**

- Update Question
  */
  async function updateQuestion(questionId) {
  const updatedData = {
  question: document.getElementById(‘editQuestionText’).value.trim(),
  category: document.getElementById(‘editQuestionCategory’).value,
  difficulty: document.getElementById(‘editQuestionDifficulty’).value,
  answers: [
  document.getElementById(‘editAnswer1’).value.trim(),
  document.getElementById(‘editAnswer2’).value.trim(),
  document.getElementById(‘editAnswer3’).value.trim(),
  document.getElementById(‘editAnswer4’).value.trim()
  ],
  correct: parseInt(document.getElementById(‘editCorrectAnswer’).value),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  showLoadingOverlay(‘نوێکردنەوەی پرسیار…’);
  
  try {
  await db.collection(‘questions’).doc(questionId).update(updatedData);
  
  ```
   hideLoadingOverlay();
   showNotification('پرسیار بە سەرکەوتوویی نوێ کرایەوە!', 'success');
   
   document.querySelector('.admin-modal').remove();
   loadQuestionsTab();
  ```
  
  } catch (error) {
  console.error(‘Error updating question:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە نوێکردنەوەی پرسیار!’, ‘error’);
  }
  }

/**

- Delete Question
  */
  async function deleteQuestion(questionId) {
  if (!confirm(‘دڵنیایت دەتەوێت ئەم پرسیارە بسڕیتەوە؟’)) {
  return;
  }
  
  showLoadingOverlay(‘سڕینەوەی پرسیار…’);
  
  try {
  await db.collection(‘questions’).doc(questionId).delete();
  
  ```
   hideLoadingOverlay();
   showNotification('پرسیار بە سەرکەوتوویی سڕدرایەوە!', 'success');
   
   loadQuestionsTab();
  ```
  
  } catch (error) {
  console.error(‘Error deleting question:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە سڕینەوەی پرسیار!’, ‘error’);
  }
  }

/**

- Toggle Question Status
  */
  async function toggleQuestionStatus(questionId, active) {
  try {
  await db.collection(‘questions’).doc(questionId).update({ active });
  showNotification(active ? ‘پرسیار چالاک کرا’ : ‘پرسیار ناچالاک کرا’, ‘success’);
  } catch (error) {
  console.error(‘Error toggling question:’, error);
  showNotification(‘هەڵە!’, ‘error’);
  }
  }

/**

- Load Users Tab
  */
  async function loadUsersTab() {
  currentAdminTab = ‘users’;
  switchAdminTab(‘users’);
  
  const content = document.getElementById(‘adminContent’);
  if (!content) return;
  
  showLoadingOverlay(‘بارکردنی یاریزانەکان…’);
  
  try {
  const usersSnapshot = await db.collection(‘users’).orderBy(‘createdAt’, ‘desc’).get();
  const users = usersSnapshot.docs.map(doc => ({
  id: doc.id,
  …doc.data()
  }));
  
  ```
   content.innerHTML = `
       <div class="admin-card">
           <div class="card-header">
               <h3><i class="fas fa-users"></i> بەڕێوەبردنی یاریزانەکان (${users.length})</h3>
               <div class="header-actions">
                   <button class="btn btn-secondary" onclick="exportUsers()">
                       <i class="fas fa-download"></i>
                       ناردنی دەرەوە
                   </button>
                   <button class="btn btn-primary" onclick="showAddAdminModal()">
                       <i class="fas fa-user-shield"></i>
                       زیادکردنی ئەدمین
                   </button>
               </div>
           </div>
           
           <div class="filter-tabs">
               <button class="filter-tab active" onclick="filterUsers('all')">
                   هەموو (${users.length})
               </button>
               <button class="filter-tab" onclick="filterUsers('online')">
                   ئۆنڵاین (${users.filter(u => u.isOnline).length})
               </button>
               <button class="filter-tab" onclick="filterUsers('admins')">
                   ئەدمینەکان (${users.filter(u => u.role === 'admin').length})
               </button>
           </div>
           
           <div class="admin-table-container">
               <table class="admin-table" id="usersTable">
                   <thead>
                       <tr>
                           <th>یاریزان</th>
                           <th>ئیمەیڵ</th>
                           <th>ڕۆڵ</th>
                           <th>تۆکن</th>
                           <th>خاڵ</th>
                           <th>یاری</th>
                           <th>دۆخ</th>
                           <th>کردارەکان</th>
                       </tr>
                   </thead>
                   <tbody>
                       ${users.map(user => `
                           <tr data-filter="all ${user.isOnline ? 'online' : ''} ${user.role === 'admin' ? 'admins' : ''}">
                               <td class="user-cell">
                                   <div class="user-avatar">${user.avatar || '👤'}</div>
                                   <div class="user-info">
                                       <div class="user-name">${user.displayName || 'یاریزان'}</div>
                                       <div class="user-id">ID: ${user.uid.substring(0, 8)}</div>
                                   </div>
                               </td>
                               <td>${user.email}</td>
                               <td>
                                   <span class="role-badge ${user.role}">${user.role === 'admin' ? 'ئەدمین' : 'یاریزان'}</span>
                               </td>
                               <td class="number-cell">${formatNumber(user.tokens || 0)}</td>
                               <td class="number-cell">${formatNumber(user.totalScore || 0)}</td>
                               <td class="number-cell">${user.gamesPlayed || 0}</td>
                               <td>
                                   ${user.isOnline ? 
                                       '<span class="status-badge online"><i class="fas fa-circle"></i> ئۆنڵاین</span>' : 
                                       '<span class="status-badge offline"><i class="fas fa-circle"></i> ئۆفلاین</span>'}
                               </td>
                               <td class="actions">
                                   <button class="btn-icon-small btn-edit" onclick='viewUserDetails(${JSON.stringify(user)})'>
                                       <i class="fas fa-eye"></i>
                                   </button>
                                   ${user.role !== 'admin' ? `
                                       <button class="btn-icon-small btn-warning" onclick="makeAdmin('${user.id}', '${user.displayName}')">
                                           <i class="fas fa-user-shield"></i>
                                       </button>
                                   ` : ''}
                               </td>
                           </tr>
                       `).join('')}
                   </tbody>
               </table>
           </div>
       </div>
   `;
   
   hideLoadingOverlay();
  ```
  
  } catch (error) {
  console.error(‘Error loading users:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە بارکردنی یاریزانەکان!’, ‘error’);
  }
  }

/**

- Filter Users
  */
  function filterUsers(filter) {
  const tabs = document.querySelectorAll(’.filter-tab’);
  tabs.forEach(tab => tab.classList.remove(‘active’));
  event.target.classList.add(‘active’);
  
  const rows = document.querySelectorAll(’#usersTable tbody tr’);
  rows.forEach(row => {
  if (filter === ‘all’ || row.dataset.filter.includes(filter)) {
  row.style.display = ‘’;
  } else {
  row.style.display = ‘none’;
  }
  });
  }

/**

- Make Admin
  */
  async function makeAdmin(userId, userName) {
  if (!confirm(`دڵنیایت دەتەوێت ${userName} بکەیت بە ئەدمین؟`)) {
  return;
  }
  
  showLoadingOverlay(‘نوێکردنەوە…’);
  
  try {
  await db.collection(‘users’).doc(userId).update({
  role: ‘admin’,
  isAdmin: true
  });
  
  ```
   hideLoadingOverlay();
   showNotification('ئەدمینی نوێ زیاد کرا!', 'success');
   loadUsersTab();
  ```
  
  } catch (error) {
  console.error(‘Error making admin:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە!’, ‘error’);
  }
  }

/**

- Load Shop Tab
  */
  async function loadShopTab() {
  currentAdminTab = ‘shop’;
  switchAdminTab(‘shop’);
  
  const content = document.getElementById(‘adminContent’);
  if (!content) return;
  
  content.innerHTML = `
  <div class="admin-card">
  <div class="card-header">
  <h3><i class="fas fa-store"></i> بەڕێوەبردنی کۆگا</h3>
  </div>
  
  ```
       <div class="shop-management-grid">
           <div class="shop-section">
               <h4><i class="fas fa-coins"></i> نرخی تواناکان</h4>
               ${renderPowerupPrices()}
           </div>
           
           <div class="shop-section">
               <h4><i class="fas fa-gift"></i> پاداشتی تۆکنەکان</h4>
               ${renderTokenRewards()}
           </div>
           
           <div class="shop-section">
               <h4><i class="fas fa-ad"></i> ڕێکخستنی ڕیکلام</h4>
               ${renderAdSettings()}
           </div>
       </div>
   </div>
  ```
  
  `;
  }

/**

- Render Powerup Prices
  */
  function renderPowerupPrices() {
  const prices = APP_CONFIG.game.powerupPrices;
  return `<div class="settings-list"> ${Object.entries(prices).map(([key, value]) =>`
  <div class="setting-item">
  <div class="setting-info">
  <div class="setting-label">${getPowerupName(key)}</div>
  <div class="setting-desc">نرخی کڕین</div>
  </div>
  <div class="setting-control">
  <input type="number" class="form-input-small" value="${value}" 
onchange="updatePowerupPrice('${key}', this.value)">
  <span class="setting-unit">تۆکن</span>
  </div>
  </div>
  `).join('')} </div> `;
  }

/**

- Render Token Rewards
  */
  function renderTokenRewards() {
  const rewards = APP_CONFIG.game.tokenRewards;
  return `<div class="settings-list"> ${Object.entries(rewards).map(([key, value]) =>`
  <div class="setting-item">
  <div class="setting-info">
  <div class="setting-label">${getRewardName(key)}</div>
  </div>
  <div class="setting-control">
  <input type="number" class="form-input-small" value="${value}" 
onchange="updateTokenReward('${key}', this.value)">
  <span class="setting-unit">تۆکن</span>
  </div>
  </div>
  `).join('')} </div> `;
  }

/**

- Render Ad Settings
  */
  function renderAdSettings() {
  return `
  <div class="settings-list">
  <div class="setting-item">
  <div class="setting-info">
  <div class="setting-label">لینکی ڕیکلام (AdMob/Custom)</div>
  <div class="setting-desc">لینکی Ad Unit یان Custom Video</div>
  </div>
  <div class="setting-control">
  <input type="text" class="form-input" placeholder="ca-app-pub-xxx/xxx" 
value="${localStorage.getItem('adUnitId') || ''}"
onchange="updateAdUnit(this.value)">
  </div>
  </div>
  
  ```
       <div class="setting-item">
           <div class="setting-info">
               <div class="setting-label">ماوەی ڕیکلام</div>
               <div class="setting-desc">بە چرکە</div>
           </div>
           <div class="setting-control">
               <input type="number" class="form-input-small" 
                   value="${APP_CONFIG.game.settings.adDuration}"
                   onchange="updateAdDuration(this.value)">
               <span class="setting-unit">چرکە</span>
           </div>
       </div>
   </div>
  ```
  
  `;
  }

/**

- Load Settings Tab
  */
  async function loadSettingsTab() {
  currentAdminTab = ‘settings’;
  switchAdminTab(‘settings’);
  
  const content = document.getElementById(‘adminContent’);
  if (!content) return;
  
  content.innerHTML = `
  <div class="admin-card">
  <div class="card-header">
  <h3><i class="fas fa-cog"></i> ڕێکخستنەکانی گشتی</h3>
  </div>
  
  ```
       <div class="settings-sections">
           <div class="setting-section">
               <h4><i class="fas fa-calendar-alt"></i> کاتی یاری سەرەکی</h4>
               <div class="settings-list">
                   ${renderGameSchedules()}
               </div>
           </div>
           
           <div class="setting-section">
               <h4><i class="fas fa-gamepad"></i> ڕێکخستنەکانی یاری</h4>
               <div class="settings-list">
                   ${renderGameSettings()}
               </div>
           </div>
       </div>
   </div>
  ```
  
  `;
  }

/**

- Render Game Schedules
  */
  function renderGameSchedules() {
  const schedules = APP_CONFIG.game.schedules;
  return Object.entries(schedules).map(([key, schedule]) => `<div class="setting-item"> <div class="setting-info"> <div class="setting-label">${schedule.icon} ${schedule.name}</div> <div class="setting-desc">خاڵ: ${schedule.points}, تۆکن: ${schedule.tokens}</div> </div> <div class="setting-control"> <input type="time" class="form-input-small" value="${schedule.time}"  onchange="updateGameTime('${key}', this.value)"> </div> </div>`).join(’’);
  }

/**

- Render Game Settings
  */
  function renderGameSettings() {
  const settings = APP_CONFIG.game.settings;
  return `<div class="setting-item"> <div class="setting-info"> <div class="setting-label">کاتی هەر پرسیارێک</div> </div> <div class="setting-control"> <input type="number" class="form-input-small" value="${settings.questionTime}"  onchange="updateSetting('questionTime', this.value)"> <span class="setting-unit">چرکە</span> </div> </div> <div class="setting-item"> <div class="setting-info"> <div class="setting-label">ژمارەی پرسیارەکان</div> </div> <div class="setting-control"> <input type="number" class="form-input-small" value="${settings.totalQuestions}"  onchange="updateSetting('totalQuestions', this.value)"> </div> </div> <div class="setting-item"> <div class="setting-info"> <div class="setting-label">تۆکنی سەرەتایی</div> </div> <div class="setting-control"> <input type="number" class="form-input-small" value="${settings.startingTokens}"  onchange="updateSetting('startingTokens', this.value)"> <span class="setting-unit">تۆکن</span> </div> </div>`;
  }

/**

- Update Game Time
  */
  function updateGameTime(gameType, newTime) {
  APP_CONFIG.game.schedules[gameType].time = newTime;
  localStorage.setItem(‘gameSchedules’, JSON.stringify(APP_CONFIG.game.schedules));
  showNotification(‘کات نوێ کرایەوە!’, ‘success’);
  }

/**

- Update Setting
  */
  function updateSetting(key, value) {
  APP_CONFIG.game.settings[key] = parseInt(value);
  localStorage.setItem(‘gameSettings’, JSON.stringify(APP_CONFIG.game.settings));
  showNotification(‘ڕێکخستن نوێ کرایەوە!’, ‘success’);
  }

/**

- Update Powerup Price
  */
  function updatePowerupPrice(powerup, price) {
  APP_CONFIG.game.powerupPrices[powerup] = parseInt(price);
  localStorage.setItem(‘powerupPrices’, JSON.stringify(APP_CONFIG.game.powerupPrices));
  showNotification(‘نرخ نوێ کرایەوە!’, ‘success’);
  }

/**

- Update Token Reward
  */
  function updateTokenReward(reward, amount) {
  APP_CONFIG.game.tokenRewards[reward] = parseInt(amount);
  localStorage.setItem(‘tokenRewards’, JSON.stringify(APP_CONFIG.game.tokenRewards));
  showNotification(‘پاداشت نوێ کرایەوە!’, ‘success’);
  }

/**

- Update Ad Unit
  */
  function updateAdUnit(adUnitId) {
  localStorage.setItem(‘adUnitId’, adUnitId);
  showNotification(‘لینکی ڕیکلام نوێ کرایەوە!’, ‘success’);
  }

/**

- Update Ad Duration
  */
  function updateAdDuration(duration) {
  APP_CONFIG.game.settings.adDuration = parseInt(duration);
  localStorage.setItem(‘adDuration’, duration);
  showNotification(‘ماوەی ڕیکلام نوێ کرایەوە!’, ‘success’);
  }

/**

- Switch Admin Tab
  */
  function switchAdminTab(tabName) {
  const tabs = document.querySelectorAll(’.admin-tab’);
  tabs.forEach(tab => {
  if (tab.dataset.tab === tabName) {
  tab.classList.add(‘active’);
  } else {
  tab.classList.remove(‘active’);
  }
  });
  }

/**

- Setup Admin Event Listeners
  */
  function setupAdminEventListeners() {
  document.querySelectorAll(’.admin-tab’).forEach(tab => {
  tab.addEventListener(‘click’, function() {
  const tabName = this.dataset.tab;
  
  ```
       switch(tabName) {
           case 'dashboard':
               renderDashboardTab();
               break;
           case 'questions':
               loadQuestionsTab();
               break;
           case 'users':
               loadUsersTab();
               break;
           case 'shop':
               loadShopTab();
               break;
           case 'settings':
               loadSettingsTab();
               break;
       }
   });
  ```
  
  });
  }

/**

- Helper Functions
  */
  function getDifficultyText(difficulty) {
  const map = { easy: ‘ئاسان’, medium: ‘مامناوەند’, hard: ‘سەخت’ };
  return map[difficulty] || difficulty;
  }

function getPowerupName(key) {
const map = {
‘5050’: ‘50-50’,
‘skip’: ‘تێپەڕاندن’,
‘time’: ‘کاتی زیادە’,
‘double’: ‘دوو هێندە’
};
return map[key] || key;
}

function getRewardName(key) {
const map = {
‘correctAnswer’: ‘وەڵامی ڕاست’,
‘winGame’: ‘بردنەوەی یاری’,
‘watchAd’: ‘سەیری ڕیکلام’,
‘dailyLogin’: ‘چوونەژوورەوەی ڕۆژانە’,
‘gameCompletion’: ‘تەواوکردنی یاری’
};
return map[key] || key;
}

function formatNumber(num) {
return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, “,”);
}

function formatTimeAgo(date) {
const seconds = Math.floor((new Date() - date) / 1000);
const intervals = {
‘ساڵ’: 31536000,
‘مانگ’: 2592000,
‘هەفتە’: 604800,
‘ڕۆژ’: 86400,
‘کاتژمێر’: 3600,
‘خولەک’: 60
};

```
for (const [name, sec] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / sec);
    if (interval >= 1) {
        return `${interval} ${name} پێش ئێستا`;
    }
}
return 'ئێستا';
```

}

console.log(‘✅ Admin module loaded - Full Featured’);
