class StudentPopup extends HTMLElement {
  constructor() {
    super();
    this.currentStudent = null;
    this.currentJobId = null;
  }

  connectedCallback() {
    console.log('StudentPopup connectedCallback called');
    
    // Initialize with empty overlay that's hidden
    this.innerHTML = `
      <div class="popup-overlay" id="studentPopup" style="display: none;">
        <div class="popup">
          <!-- Content will be loaded dynamically -->
        </div>
      </div>
    `;

    // Get initial overlay reference
    this.overlay = this.querySelector("#studentPopup");
    console.log('Overlay element found:', this.overlay);
  }

  showStudentDetails(student, jobId) {
    this.currentStudent = student;
    this.currentJobId = jobId;

    // Update the popup content for company view
    this.overlay.innerHTML = `
        <div class="popup">
          <button class="popup-close">✕</button>

          <div class="popup-header-large">
            <img id="popupImg" src="../pics/profile.jpg" alt="profile">
            <div class="popup-info">
              <h2 id="popupName">${student.name}</h2>
              <p><strong>И-мэйл:</strong> <span id="popupEmail">${student.email}</span></p>
              <p><strong>Утас:</strong> <span id="popupPhone">${student.phone}</span></p>
              <p><strong>Хүйс:</strong> <span id="popupGender">${student.gender || '-'}</span></p>
              <p><strong>Нас:</strong> <span id="popupAge">${student.age || '-'}</span></p>
            </div>
          </div>

          <div class="popup-stats-large">
            <div>
              <h3 id="popupTotalJobs">${student.workHistory ? student.workHistory.length : 0}</h3>
              <p>Нийт туршлага</p>
            </div>
            <div>
              <h3 id="popupAvgRating">${student.getAverageRating()}★</h3>
              <p>Дундаж үнэлгээ</p>
            </div>
            <div>
              <h3 id="popupCompletionRate">${student.getCompletionRate()}%</h3>
              <p>Ажил дүүргэлт</p>
            </div>
          </div>

          <div class="popup-work-history-large">
            <h4>🧳 Өмнө хийсэн ажил</h4>
            <div class="job-grid" id="popupWorkHistory">
              <!-- Work history will be loaded dynamically -->
            </div>
          </div>

          <div class="popup-actions">
            <button class="approve-btn" id="popupApproveBtn">✓ Хүлээж авах</button>
            <button class="reject-btn" id="popupRejectBtn">✕ Татгалзах</button>
          </div>
        </div>
    `;

    // Setup event listeners for company view
    this.setupCompanyEventListeners();

    // Update work history
    this.updateWorkHistory(student);

    this.overlay.style.display = "flex";
  }

  showProfileEditor(student) {
    console.log('showProfileEditor called with student:', student);
    console.log('Overlay element:', this.overlay);
    
    if (!this.overlay) {
      console.error('Overlay element not found!');
      return;
    }
    
    this.currentStudent = student;
    this.currentJobId = null;

    // Update the popup content
    this.overlay.innerHTML = `
        <div class="popup">
          <button class="popup-close">✕</button>

          <div class="popup-header-large">
            <img id="popupImg" src="../pics/profile.jpg" alt="profile">
            <div class="popup-info">
              <h2>Профайл засах</h2>
              <div class="edit-form">
                <div class="form-group">
                  <label><strong>Нэр:</strong></label>
                  <input type="text" id="editName" value="${student.name}" />
                </div>
                <div class="form-group">
                  <label><strong>И-мэйл:</strong></label>
                  <input type="email" id="editEmail" value="${student.email}" />
                </div>
                <div class="form-group">
                  <label><strong>Утас:</strong></label>
                  <input type="tel" id="editPhone" value="${student.phone}" />
                </div>
                <div class="form-group">
                  <label><strong>Хүйс:</strong></label>
                  <select id="editGender">
                    <option value="Эрэгтэй" ${student.gender === 'Эрэгтэй' ? 'selected' : ''}>Эрэгтэй</option>
                    <option value="Эмэгтэй" ${student.gender === 'Эмэгтэй' ? 'selected' : ''}>Эмэгтэй</option>
                  </select>
                </div>
                <div class="form-group">
                  <label><strong>Нас:</strong></label>
                  <input type="number" id="editAge" value="${student.age || ''}" min="16" max="100" />
                </div>
              </div>
            </div>
          </div>

          <div class="popup-stats-large">
            <div>
              <h3>${student.workHistory ? student.workHistory.length : 0}</h3>
              <p>Нийт туршлага</p>
            </div>
            <div>
              <h3>${student.getAverageRating()}★</h3>
              <p>Дундаж үнэлгээ</p>
            </div>
            <div>
              <h3>${student.getCompletionRate()}%</h3>
              <p>Ажил дүүргэлт</p>
            </div>
          </div>

          <div class="popup-actions">
            <button class="approve-btn" id="saveProfileBtn">💾 Хадгалах</button>
            <button class="reject-btn" id="cancelEditBtn">❌ Цуцлах</button>
          </div>
        </div>
    `;

    // Re-attach event listeners
    this.setupEventListeners();

    console.log('Setting profile editor overlay display to flex');
    this.overlay.style.display = "flex";
    this.overlay.style.position = "fixed";
    this.overlay.style.top = "0";
    this.overlay.style.left = "0";
    this.overlay.style.width = "100vw";
    this.overlay.style.height = "100vh";
    this.overlay.style.background = "rgba(0, 0, 0, 0.7)";
    this.overlay.style.zIndex = "99999";
    this.overlay.style.justifyContent = "center";
    this.overlay.style.alignItems = "center";
    console.log('Profile editor overlay style after setting:', this.overlay.style.display);
  }

  showWorkHistoryOnly(student) {
    console.log('showWorkHistoryOnly called with student:', student);
    this.currentStudent = student;
    this.currentJobId = null;

    // Update the popup content
    this.overlay.innerHTML = `
        <div class="popup">
          <button class="popup-close">✕</button>

          <div class="popup-header-large">
            <img id="popupImg" src="../pics/profile.jpg" alt="profile">
            <div class="popup-info">
              <h2>${student.name}</h2>
              <p>Ажлын туршлагын дэлгэрэнгүй</p>
            </div>
          </div>

          <div class="popup-stats-large">
            <div>
              <h3>${student.workHistory ? student.workHistory.length : 0}</h3>
              <p>Нийт туршлага</p>
            </div>
            <div>
              <h3>${student.getAverageRating()}★</h3>
              <p>Дундаж үнэлгээ</p>
            </div>
            <div>
              <h3>${student.getCompletionRate()}%</h3>
              <p>Ажил дүүргэлт</p>
            </div>
          </div>

          <div class="popup-work-history-large">
            <h4>🧳 Өмнө хийсэн ажил</h4>
            <div class="job-grid" id="popupWorkHistory">
              <!-- Work history will be loaded dynamically -->
            </div>
          </div>

          <div class="popup-actions">
            <button class="reject-btn" id="closeWorkHistoryBtn">Хаах</button>
          </div>
        </div>
    `;

    // Re-attach event listeners
    this.setupEventListeners();

    // Update work history
    this.updateWorkHistory(student);

    console.log('Setting work history overlay display to flex');
    this.overlay.style.display = "flex";
    this.overlay.style.position = "fixed";
    this.overlay.style.top = "0";
    this.overlay.style.left = "0";
    this.overlay.style.width = "100vw";
    this.overlay.style.height = "100vh";
    this.overlay.style.background = "rgba(0, 0, 0, 0.7)";
    this.overlay.style.zIndex = "99999";
    this.overlay.style.justifyContent = "center";
    this.overlay.style.alignItems = "center";
    console.log('Work history overlay style after setting:', this.overlay.style.display);
    console.log('Overlay computed style:', window.getComputedStyle(this.overlay));
    console.log('Overlay position:', this.overlay.getBoundingClientRect());
  }

  saveProfile() {
    console.log('saveProfile called');
    
    const name = this.overlay.querySelector("#editName").value.trim();
    const email = this.overlay.querySelector("#editEmail").value.trim();
    const phone = this.overlay.querySelector("#editPhone").value.trim();
    const gender = this.overlay.querySelector("#editGender").value;
    const age = parseInt(this.overlay.querySelector("#editAge").value);

    console.log('Form values:', { name, email, phone, gender, age });

    // Validation
    if (!name || !email || !phone) {
      alert('Нэр, и-мэйл, утасны дугаар заавал бөглөнө үү!');
      return;
    }

    console.log('Current student before update:', this.currentStudent);

    // Update student data
    this.currentStudent.name = name;
    this.currentStudent.email = email;
    this.currentStudent.phone = phone;
    this.currentStudent.gender = gender;
    this.currentStudent.age = age;
    this.currentStudent.updatedAt = new Date().toISOString();

    console.log('Current student after update:', this.currentStudent);

    // Save to DataManager
    const studentData = this.currentStudent.toJSON();
    console.log('Saving student data:', studentData);
    DataManager.saveStudent(studentData);
    
    // Verify save worked
    const savedStudent = DataManager.getStudentById(this.currentStudent.id);
    console.log('Verified saved student:', savedStudent);

    // Update current user session
    const currentUser = DataManager.getCurrentUser();
    console.log('Current user before update:', currentUser);
    
    if (currentUser && currentUser.id === this.currentStudent.id) {
      const updatedUser = { ...currentUser, ...studentData };
      console.log('Updated user data:', updatedUser);
      DataManager.setCurrentUser(updatedUser);
    }

    console.log('Profile updated successfully');
    
    // Hide popup and refresh page data
    this.hide();
    
    // Trigger a custom event to refresh the page
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  }

  updateWorkHistory(student) {
    const workHistoryContainer = this.overlay.querySelector("#popupWorkHistory");
    
    if (!workHistoryContainer) {
      console.log('Work history container not found');
      return;
    }
    
    if (!student.workHistory || student.workHistory.length === 0) {
      workHistoryContainer.innerHTML = `
        <div class="no-work-history">
          <p>Ажлын туршлага байхгүй</p>
        </div>
      `;
      return;
    }

    workHistoryContainer.innerHTML = student.workHistory.map(work => `
      <div class="job-card-large">
        <h5>${work.jobTitle}</h5>
        <p>⏱ Хугацаа: ${this.calculateDuration(work.startDate, work.endDate)}</p>
        <p>${this.renderStars(work.rating)}</p>
        <p class="work-period">${work.startDate} - ${work.endDate}</p>
      </div>
    `).join('');
  }

  calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} өдөр`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} сар`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0 ? `${years} жил ${remainingMonths} сар` : `${years} жил`;
    }
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '⭐';
    return stars;
  }

  handleApprove() {
    if (!this.currentStudent || !this.currentJobId) return;

    // Call the global handleApplication function
    if (typeof handleApplication === 'function') {
      handleApplication(this.currentJobId, this.currentStudent.id, 'accept');
      this.hide();
    } else {
      console.error('handleApplication function not found');
    }
  }

  handleReject() {
    if (!this.currentStudent || !this.currentJobId) return;

    // Call the global handleApplication function
    if (typeof handleApplication === 'function') {
      handleApplication(this.currentJobId, this.currentStudent.id, 'reject');
      this.hide();
    } else {
      console.error('handleApplication function not found');
    }
  }

  setupEventListeners() {
    const closeBtn = this.overlay.querySelector(".popup-close");
    const saveBtn = this.overlay.querySelector("#saveProfileBtn");
    const cancelBtn = this.overlay.querySelector("#cancelEditBtn");
    const closeWorkHistoryBtn = this.overlay.querySelector("#closeWorkHistoryBtn");

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }

    // Overlay click to close
    this.overlay.addEventListener("click", e => {
      if (e.target === this.overlay) this.hide();
    });

    // Profile editor buttons
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveProfile());
    }
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.hide());
    }

    // Work history close button
    if (closeWorkHistoryBtn) {
      closeWorkHistoryBtn.addEventListener("click", () => this.hide());
    }
  }

  setupCompanyEventListeners() {
    const closeBtn = this.overlay.querySelector(".popup-close");
    const approveBtn = this.overlay.querySelector("#popupApproveBtn");
    const rejectBtn = this.overlay.querySelector("#popupRejectBtn");

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }

    // Overlay click to close
    this.overlay.addEventListener("click", e => {
      if (e.target === this.overlay) this.hide();
    });

    // Action buttons
    if (approveBtn) {
      approveBtn.addEventListener("click", () => this.handleApprove());
    }
    if (rejectBtn) {
      rejectBtn.addEventListener("click", () => this.handleReject());
    }
  }

  hide() {
    if (this.overlay) {
      this.overlay.style.display = "none";
    }
    this.currentStudent = null;
    this.currentJobId = null;
  }
}

customElements.define("student-popup", StudentPopup);
