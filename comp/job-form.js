class JobForm extends HTMLElement {
  connectedCallback() {
    this.classList.add("form-section");

    this.innerHTML = `
      <form class="job-form">
        <h2>Зар нэмэх</h2>

        <label>Ажлын нэр <span>*</span></label>
        <input type="text" placeholder="Жишээ: Агуулахын ажилтан" required />

        <label>Ажлын байршил <span>*</span></label>
        <input type="text" placeholder="Жишээ: Улаанбаатар, Чингэлтэй дүүрэг" required />

        <label>Ажлын газрын байршил (google map link) - сонголттой</label>
        <input type="url" placeholder="Google Map хаяг холбоос (заавал биш)" />

        <div class="form-row">
          <div class="form-group">
            <label>Хүйс <span>*</span></label>
            <select required>
              <option>Сонгох</option>
              <option>Эр</option>
              <option>Эм</option>
            </select>
          </div>
        </div>

        <label>Ажлын тайлбар <span>*</span></label>
        <textarea placeholder="Ажлын дэлгэрэнгүй тайлбар бичнэ үү..." required></textarea>

        <div class="form-row">
          <div class="form-group">
            <label>Цалин (₮) <span>*</span></label>
            <input type="number" placeholder="Жишээ: 10000" required />
          </div>

          <div class="form-group">
            <label>Цалингийн төрөл <span>*</span></label>
            <select required>
              <option>Сонгох</option>
              <option>Сард</option>
              <option>7 хоногт</option>
              <option>Өдөрт</option>
            </select>
          </div>
        </div>

        <label>Календар</label>
        <div class="calendar-box" id="calendarBtn">
          📅 Цаг оруулах
        </div>

        <label>Зураг оруулах</label>
        <div class="upload-box">
          <img src="camera-icon.png" alt="camera" />
          <p>Зураг оруулах бол энд дарна уу<br />
            PNG, JPG хэлбэрээр (хамгийн ихдээ 5MB)
          </p>
        </div>

        <div class="button-row">
          <button type="reset" class="gray-btn">Цуцлах</button>
          <button type="submit" class="black-btn">Нэмэх</button>
        </div>
      </form>
    `;

    // Calendar handler
    this.querySelector("#calendarBtn").addEventListener("click", () => {
      // Store current form data before going to calendar
      this.saveFormData();
      sessionStorage.setItem('returnToJobForm', 'true');
      location.href = "Calendar.html";
    });

    // Form submission handler
    this.querySelector(".job-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleJobSubmission();
    });

    // Load saved form data if returning from calendar
    this.loadFormData();
  }

  saveFormData() {
    const formData = {
      title: this.querySelector('input[placeholder*="Агуулахын ажилтан"]').value,
      location: this.querySelector('input[placeholder*="Чингэлтэй дүүрэг"]').value,
      mapLink: this.querySelector('input[type="url"]').value,
      gender: this.querySelector('select').value,
      description: this.querySelector('textarea').value,
      salary: this.querySelector('input[type="number"]').value,
      salaryType: this.querySelectorAll('select')[1].value
    };
    sessionStorage.setItem('jobFormData', JSON.stringify(formData));
  }

  loadFormData() {
    const savedData = sessionStorage.getItem('jobFormData');
    if (savedData) {
      const formData = JSON.parse(savedData);
      this.querySelector('input[placeholder*="Агуулахын ажилтан"]').value = formData.title || '';
      this.querySelector('input[placeholder*="Чингэлтэй дүүрэг"]').value = formData.location || '';
      this.querySelector('input[type="url"]').value = formData.mapLink || '';
      this.querySelector('select').value = formData.gender || 'Сонгох';
      this.querySelector('textarea').value = formData.description || '';
      this.querySelector('input[type="number"]').value = formData.salary || '';
      this.querySelectorAll('select')[1].value = formData.salaryType || 'Сонгох';
    }

    // Update calendar button text if schedule exists
    const jobSchedule = sessionStorage.getItem('jobSchedule');
    if (jobSchedule) {
      const schedule = JSON.parse(jobSchedule);
      const scheduleText = this.getScheduleDisplayText(schedule);
      this.querySelector("#calendarBtn").innerHTML = `📅 ${scheduleText}`;
    }
  }

  handleJobSubmission() {
    const currentUser = DataManager.getCurrentUser();
    if (!currentUser || currentUser.type !== 'company') {
      console.log('Only company users can create job posts');
      return;
    }

    // Get form data
    const title = this.querySelector('input[placeholder*="Агуулахын ажилтан"]').value.trim();
    const location = this.querySelector('input[placeholder*="Чингэлтэй дүүрэг"]').value.trim();
    const mapLink = this.querySelector('input[type="url"]').value.trim();
    const gender = this.querySelector('select').value;
    const description = this.querySelector('textarea').value.trim();
    const salary = parseInt(this.querySelector('input[type="number"]').value);
    const salaryType = this.querySelectorAll('select')[1].value;

    // Validation
    if (!title || !location || !description || !salary || gender === 'Сонгох' || salaryType === 'Сонгох') {
      console.log('Please fill in all required fields');
      return;
    }

    // Get schedule from session storage
    const jobSchedule = sessionStorage.getItem('jobSchedule');
    if (!jobSchedule) {
      console.log('Please set job schedule');
      return;
    }

    const schedule = JSON.parse(jobSchedule);

    // Convert salary type
    let salaryTypeKey = 'hourly';
    switch (salaryType) {
      case 'Сард': salaryTypeKey = 'monthly'; break;
      case '7 хоногт': salaryTypeKey = 'weekly'; break;
      case 'Өдөрт': salaryTypeKey = 'daily'; break;
      default: salaryTypeKey = 'hourly';
    }

    // Create new job
    const jobData = {
      companyId: currentUser.id,
      title: title,
      description: description,
      location: location,
      salary: salary,
      salaryType: salaryTypeKey,
      schedule: schedule,
      requirements: gender !== 'Сонгох' ? [`Хүйс: ${gender}`] : [],
      benefits: [],
      category: 'Ерөнхий',
      status: 'active',
      maxPositions: 1
    };

    if (mapLink) {
      jobData.mapLink = mapLink;
    }

    const job = new Job(jobData);
    console.log('Created job:', job);
    DataManager.saveJob(job.toJSON());

    // Update company's posted jobs
    const company = DataManager.getCompanyById(currentUser.id);
    if (company) {
      company.postedJobs.push(job.id);
      company.updatedAt = new Date().toISOString();
      DataManager.saveCompany(company);
      console.log('Updated company:', company);
    } else {
      console.error('Company not found:', currentUser.id);
    }

    // Clear form and session data
    this.querySelector(".job-form").reset();
    sessionStorage.removeItem('jobFormData');
    sessionStorage.removeItem('jobSchedule');

    console.log('Job created successfully');
    
    // Redirect to company dashboard
    window.location.href = 'Main_company.html';
  }

  getScheduleDisplayText(schedule) {
    if (!schedule || Object.keys(schedule).length === 0) {
      return 'Цаг оруулах';
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
    
    const activeDays = [];
    days.forEach((day, index) => {
      if (schedule[day] && Object.keys(schedule[day]).length > 0) {
        activeDays.push(dayNames[index]);
      }
    });
    
    return activeDays.length > 0 ? `${activeDays.join(', ')} - Засах` : 'Цаг оруулах';
  }
}

customElements.define("job-form", JobForm);
