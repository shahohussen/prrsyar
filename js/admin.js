/**

- Admin Module - Complete Version
  */

let adminData = {
totalUsers: 0,
totalQuestions: 0,
totalGames: 0,
activeUsers: 0
};

/**

- Check if user is admin
  */
  function checkAdminStatus(email) {
  return APP_CONFIG.adminEmails.includes(email);
  }

/**

- Show admin login screen
  */
  function showAdminLogin() {
  const screen = document.getElementById(‘adminLoginScreen’);
  if (screen) {
  screen.classList.add(‘active’);
  }
  }

/**

- Hide admin login screen
  */
  function hideAdminLogin() {
  const screen = document.getElementById(‘adminLoginScreen’);
  if (screen) {
  screen.classList.remove(‘active’);
  }
  }

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
  await loadAllQuestions();
  await loadAllUsers();
  updateAdminUI();
  
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
  // Get total users
  const usersSnapshot = await db.collection(‘users’).get();
  adminData.totalUsers = usersSnapshot.size;
  
  ```
   // Get total questions
   const questionsSnapshot = await db.collection('questions').get();
   adminData.totalQuestions = questionsSnapshot.size;
   
   // Get total games played
   let totalGames = 0;
   usersSnapshot.docs.forEach(doc => {
       totalGames += doc.data().gamesPlayed || 0;
   });
   adminData.totalGames = totalGames;
   
   // Get active users (played in last 7 days)
   const sevenDaysAgo = new Date();
   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
   
   const activeSnapshot = await db.collection('users')
       .where('lastPlayed', '>=', sevenDaysAgo)
       .get();
   adminData.activeUsers = activeSnapshot.size;
  ```
  
  } catch (error) {
  console.error(‘Error loading admin data:’, error);
  throw error;
  }
  }

/**

- Update admin UI
  */
  function updateAdminUI() {
  // Update statistics
  const statsHTML = `
  <div class="admin-stats-grid">
  <div class="stat-card">
  <div class="stat-icon" style="background: #3b82f6">
  <i class="fas fa-users"></i>
  </div>
  <div class="stat-info">
  <div class="stat-value">${adminData.totalUsers}</div>
  <div class="stat-label">کۆی یاریزانەکان</div>
  </div>
  </div>
  
  ```
       <div class="stat-card">
           <div class="stat-icon" style="background: #10b981">
               <i class="fas fa-question-circle"></i>
           </div>
           <div class="stat-info">
               <div class="stat-value">${adminData.totalQuestions}</div>
               <div class="stat-label">کۆی پرسیارەکان</div>
           </div>
       </div>
       
       <div class="stat-card">
           <div class="stat-icon" style="background: #f59e0b">
               <i class="fas fa-gamepad"></i>
           </div>
           <div class="stat-info">
               <div class="stat-value">${adminData.totalGames}</div>
               <div class="stat-label">کۆی یاریەکان</div>
           </div>
       </div>
       
       <div class="stat-card">
           <div class="stat-icon" style="background: #8b5cf6">
               <i class="fas fa-fire"></i>
           </div>
           <div class="stat-info">
               <div class="stat-value">${adminData.activeUsers}</div>
               <div class="stat-label">یاریزانی چالاک</div>
           </div>
       </div>
   </div>
  ```
  
  `;
  
  const statsContainer = document.getElementById(‘adminStats’);
  if (statsContainer) {
  statsContainer.innerHTML = statsHTML;
  }
  }

/**

- Load all questions for admin
  */
  async function loadAllQuestions() {
  try {
  const questionsSnapshot = await db.collection(‘questions’)
  .orderBy(‘createdAt’, ‘desc’)
  .get();
  
  ```
   const questionsHTML = questionsSnapshot.docs.map(doc => {
       const data = doc.data();
       const id = doc.id;
       
       return `
           <div class="question-item" data-id="${id}">
               <div class="question-header">
                   <h4>${data.question}</h4>
                   <div class="question-meta">
                       <span class="badge">${data.category || 'گشتی'}</span>
                       <span class="badge ${data.difficulty}">${getDifficultyText(data.difficulty)}</span>
                   </div>
               </div>
               <div class="question-answers">
                   ${data.answers.map((ans, idx) => `
                       <div class="answer-preview ${idx === data.correct ? 'correct' : ''}">
                           ${idx === data.correct ? '✓' : '○'} ${ans}
                       </div>
                   `).join('')}
               </div>
               <div class="question-actions">
                   <button class="btn btn-small btn-primary" onclick="editQuestion('${id}')">
                       <i class="fas fa-edit"></i> دەستکاری
                   </button>
                   <button class="btn btn-small btn-danger" onclick="deleteQuestion('${id}')">
                       <i class="fas fa-trash"></i> سڕینەوە
                   </button>
                   <button class="btn btn-small ${data.active ? 'btn-warning' : 'btn-success'}" 
                           onclick="toggleQuestion('${id}', ${!data.active})">
                       <i class="fas fa-${data.active ? 'eye-slash' : 'eye'}"></i>
                       ${data.active ? 'ناچالاککردن' : 'چالاککردن'}
                   </button>
               </div>
           </div>
       `;
   }).join('');
   
   const questionsContainer = document.getElementById('adminQuestions');
   if (questionsContainer) {
       questionsContainer.innerHTML = questionsHTML || '<p class="empty-message">هیچ پرسیارێک نییە</p>';
   }
  ```
  
  } catch (error) {
  console.error(‘Error loading questions:’, error);
  throw error;
  }
  }

/**

- Get difficulty text in Kurdish
  */
  function getDifficultyText(difficulty) {
  const texts = {
  easy: ‘ئاسان’,
  medium: ‘مامناوەند’,
  hard: ‘قورس’
  };
  return texts[difficulty] || ‘مامناوەند’;
  }

/**

- Add new question
  */
  async function addQuestion(questionData) {
  if (!isAdmin) {
  showNotification(‘تەنها ئەدمینەکان دەتوانن پرسیار زیاد بکەن!’, ‘error’);
  return;
  }
  
  // Validate question data
  if (!questionData.question || !questionData.answers || questionData.answers.length < 2) {
  showNotification(‘تکایە هەموو خانەکان پڕبکەرەوە!’, ‘error’);
  return;
  }
  
  if (questionData.correct === undefined || questionData.correct < 0) {
  showNotification(‘تکایە وەڵامی ڕاست دیاری بکە!’, ‘error’);
  return;
  }
  
  showLoadingOverlay(‘زیادکردنی پرسیار…’);
  
  try {
  await db.collection(‘questions’).add({
  question: questionData.question,
  answers: questionData.answers,
  correct: questionData.correct,
  category: questionData.category || ‘گشتی’,
  difficulty: questionData.difficulty || ‘medium’,
  active: true,
  createdBy: currentUser.uid,
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  ```
   hideLoadingOverlay();
   showNotification('پرسیار زیاد کرا! ✅', 'success');
   
   // Reload questions
   await loadAllQuestions();
   await loadAdminData();
   updateAdminUI();
   
   // Clear form
   document.getElementById('addQuestionForm')?.reset();
  ```
  
  } catch (error) {
  console.error(‘Error adding question:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە زیادکردنی پرسیار!’, ‘error’);
  }
  }

/**

- Edit question
  */
  async function editQuestion(questionId) {
  if (!isAdmin) return;
  
  try {
  const doc = await db.collection(‘questions’).doc(questionId).get();
  const data = doc.data();
  
  ```
   // Fill form with current data
   document.getElementById('editQuestionId').value = questionId;
   document.getElementById('editQuestion').value = data.question;
   document.getElementById('editAnswer1').value = data.answers[0] || '';
   document.getElementById('editAnswer2').value = data.answers[1] || '';
   document.getElementById('editAnswer3').value = data.answers[2] || '';
   document.getElementById('editAnswer4').value = data.answers[3] || '';
   document.getElementById('editCorrect').value = data.correct;
   document.getElementById('editCategory').value = data.category || 'گشتی';
   document.getElementById('editDifficulty').value = data.difficulty || 'medium';
   
   // Show edit modal
   document.getElementById('editQuestionModal').classList.add('active');
  ```
  
  } catch (error) {
  console.error(‘Error loading question for edit:’, error);
  showNotification(‘هەڵە لە بارکردنی پرسیار!’, ‘error’);
  }
  }

/**

- Update question
  */
  async function updateQuestion(questionId, questionData) {
  if (!isAdmin) return;
  
  showLoadingOverlay(‘نوێکردنەوەی پرسیار…’);
  
  try {
  await db.collection(‘questions’).doc(questionId).update({
  question: questionData.question,
  answers: questionData.answers,
  correct: questionData.correct,
  category: questionData.category,
  difficulty: questionData.difficulty,
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  ```
   hideLoadingOverlay();
   showNotification('پرسیار نوێ کرایەوە! ✅', 'success');
   
   // Reload questions
   await loadAllQuestions();
   
   // Hide modal
   document.getElementById('editQuestionModal').classList.remove('active');
  ```
  
  } catch (error) {
  console.error(‘Error updating question:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە نوێکردنەوەی پرسیار!’, ‘error’);
  }
  }

/**

- Delete question
  */
  async function deleteQuestion(questionId) {
  if (!isAdmin) return;
  
  if (!confirm(‘دڵنیایت دەتەوێت ئەم پرسیارە بسڕیتەوە؟’)) {
  return;
  }
  
  showLoadingOverlay(‘سڕینەوەی پرسیار…’);
  
  try {
  await db.collection(‘questions’).doc(questionId).delete();
  
  ```
   hideLoadingOverlay();
   showNotification('پرسیار سڕایەوە! ✅', 'success');
   
   // Reload questions
   await loadAllQuestions();
   await loadAdminData();
   updateAdminUI();
  ```
  
  } catch (error) {
  console.error(‘Error deleting question:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە سڕینەوەی پرسیار!’, ‘error’);
  }
  }

/**

- Toggle question active status
  */
  async function toggleQuestion(questionId, active) {
  if (!isAdmin) return;
  
  try {
  await db.collection(‘questions’).doc(questionId).update({
  active: active
  });
  
  ```
   showNotification(active ? 'پرسیار چالاک کرا!' : 'پرسیار ناچالاک کرا!', 'success');
   
   // Reload questions
   await loadAllQuestions();
  ```
  
  } catch (error) {
  console.error(‘Error toggling question:’, error);
  showNotification(‘هەڵە!’, ‘error’);
  }
  }

/**

- Load all users
  */
  async function loadAllUsers() {
  try {
  const usersSnapshot = await db.collection(‘users’)
  .orderBy(‘totalScore’, ‘desc’)
  .limit(50)
  .get();
  
  ```
   const usersHTML = usersSnapshot.docs.map((doc, index) => {
       const data = doc.data();
       const id = doc.id;
       
       return `
           <div class="user-item">
               <div class="user-rank">#${index + 1}</div>
               <div class="user-avatar">${data.avatar || '👤'}</div>
               <div class="user-info">
                   <div class="user-name">${data.name}</div>
                   <div class="user-email">${data.email}</div>
               </div>
               <div class="user-stats">
                   <div class="user-stat">
                       <i class="fas fa-star"></i>
                       ${data.totalScore || 0}
                   </div>
                   <div class="user-stat">
                       <i class="fas fa-coins"></i>
                       ${data.tokens || 0}
                   </div>
                   <div class="user-stat">
                       <i class="fas fa-gamepad"></i>
                       ${data.gamesPlayed || 0}
                   </div>
               </div>
               <div class="user-actions">
                   <button class="btn btn-small btn-primary" onclick="viewUserDetails('${id}')">
                       <i class="fas fa-eye"></i>
                   </button>
                   ${!APP_CONFIG.adminEmails.includes(data.email) ? `
                       <button class="btn btn-small btn-danger" onclick="deleteUser('${id}')">
                           <i class="fas fa-trash"></i>
                       </button>
                   ` : ''}
               </div>
           </div>
       `;
   }).join('');
   
   const usersContainer = document.getElementById('adminUsers');
   if (usersContainer) {
       usersContainer.innerHTML = usersHTML || '<p class="empty-message">هیچ یاریزانێک نییە</p>';
   }
  ```
  
  } catch (error) {
  console.error(‘Error loading users:’, error);
  throw error;
  }
  }

/**

- View user details
  */
  async function viewUserDetails(userId) {
  showLoadingOverlay(‘بارکردنی وردەکاری…’);
  
  try {
  const userDoc = await db.collection(‘users’).doc(userId).get();
  const userData = userDoc.data();
  
  ```
   const detailsHTML = `
       <div class="user-details-modal">
           <div class="modal-header">
               <h2>وردەکاری یاریزان</h2>
               <button class="btn btn-icon" onclick="closeUserDetails()">
                   <i class="fas fa-times"></i>
               </button>
           </div>
           <div class="modal-body">
               <div class="detail-item">
                   <span class="detail-label">ناو:</span>
                   <span class="detail-value">${userData.name}</span>
               </div>
               <div class="detail-item">
                   <span class="detail-label">ئیمەیڵ:</span>
                   <span class="detail-value">${userData.email}</span>
               </div>
               <div class="detail-item">
                   <span class="detail-label">کۆی خاڵ:</span>
                   <span class="detail-value">${userData.totalScore || 0}</span>
               </div>
               <div class="detail-item">
                   <span class="detail-label">تۆکنەکان:</span>
                   <span class="detail-value">${userData.tokens || 0}</span>
               </div>
               <div class="detail-item">
                   <span class="detail-label">ژمارەی یاری:</span>
                   <span class="detail-value">${userData.gamesPlayed || 0}</span>
               </div>
               <div class="detail-item">
                   <span class="detail-label">بەروار:</span>
                   <span class="detail-value">${userData.createdAt?.toDate().toLocaleDateString('ckb') || 'نەزانراو'}</span>
               </div>
           </div>
       </div>
   `;
   
   const modal = document.getElementById('userDetailsModal');
   if (modal) {
       modal.innerHTML = detailsHTML;
       modal.classList.add('active');
   }
   
   hideLoadingOverlay();
  ```
  
  } catch (error) {
  console.error(‘Error viewing user details:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە!’, ‘error’);
  }
  }

/**

- Close user details modal
  */
  function closeUserDetails() {
  const modal = document.getElementById(‘userDetailsModal’);
  if (modal) {
  modal.classList.remove(‘active’);
  }
  }

/**

- Delete user
  */
  async function deleteUser(userId) {
  if (!isAdmin) return;
  
  if (!confirm(‘دڵنیایت دەتەوێت ئەم یاریزانە بسڕیتەوە؟’)) {
  return;
  }
  
  showLoadingOverlay(‘سڕینەوەی یاریزان…’);
  
  try {
  await db.collection(‘users’).doc(userId).delete();
  
  ```
   hideLoadingOverlay();
   showNotification('یاریزان سڕایەوە!', 'success');
   
   // Reload users
   await loadAllUsers();
   await loadAdminData();
   updateAdminUI();
  ```
  
  } catch (error) {
  console.error(‘Error deleting user:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە سڕینەوەی یاریزان!’, ‘error’);
  }
  }

/**

- Export data
  */
  async function exportData(type) {
  if (!isAdmin) return;
  
  showLoadingOverlay(‘ئامادەکردنی داتا…’);
  
  try {
  let data = [];
  
  ```
   if (type === 'users') {
       const snapshot = await db.collection('users').get();
       data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
   } else if (type === 'questions') {
       const snapshot = await db.collection('questions').get();
       data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
   }
   
   // Convert to CSV
   const csv = convertToCSV(data);
   
   // Download
   downloadCSV(csv, `${type}-${new Date().toISOString()}.csv`);
   
   hideLoadingOverlay();
   showNotification('داتا هەناردە کرا!', 'success');
  ```
  
  } catch (error) {
  console.error(‘Error exporting data:’, error);
  hideLoadingOverlay();
  showNotification(‘هەڵە لە هەناردەکردن!’, ‘error’);
  }
  }

/**

- Convert data to CSV
  */
  function convertToCSV(data) {
  if (!data || data.length === 0) return ‘’;
  
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
  headers.map(header => JSON.stringify(item[header] || ‘’)).join(’,’)
  );
  
  return [headers.join(’,’), …rows].join(’\n’);
  }

/**

- Download CSV file
  */
  function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: ‘text/csv’ });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement(‘a’);
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  }

console.log(‘✅ Admin module loaded’);
