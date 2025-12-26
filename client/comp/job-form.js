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
          Цаг оруулах
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
      console.log('JobForm: Calendar button clicked');
      // Store current form data before going to calendar
      this.saveFormData();
      sessionStorage.setItem('returnToJobForm', 'true');
      console.log('JobForm: Set returnToJobForm flag and saved form data');
      console.log('JobForm: Navigating to calendar page...');
      location.href = "/student/calendar";
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
    console.log('JobForm: Loading form data...');
    
    const savedData = sessionStorage.getItem('jobFormData');
    if (savedData) {
      console.log('JobForm: Found saved form data:', savedData);
      const formData = JSON.parse(savedData);
      this.querySelector('input[placeholder*="Агуулахын ажилтан"]').value = formData.title || '';
      this.querySelector('input[placeholder*="Чингэлтэй дүүрэг"]').value = formData.location || '';
      this.querySelector('input[type="url"]').value = formData.mapLink || '';
      this.querySelector('select').value = formData.gender || 'Сонгох';
      this.querySelector('textarea').value = formData.description || '';
      this.querySelector('input[type="number"]').value = formData.salary || '';
      this.querySelectorAll('select')[1].value = formData.salaryType || 'Сонгох';
    } else {
      console.log('JobForm: No saved form data found');
    }

    // Update calendar button text if schedule exists
    const jobSchedule = sessionStorage.getItem('jobSchedule');
    console.log('JobForm: Checking for job schedule:', jobSchedule ? 'found' : 'not found');
    
    if (jobSchedule) {
      try {
        const schedule = JSON.parse(jobSchedule);
        console.log('JobForm: Parsed job schedule:', schedule);
        const scheduleText = this.getScheduleDisplayText(schedule);
        console.log('JobForm: Schedule display text:', scheduleText);
        this.querySelector("#calendarBtn").innerHTML = `${scheduleText}`;
      } catch (error) {
        console.error('JobForm: Error parsing job schedule:', error);
        this.querySelector("#calendarBtn").innerHTML = `Цаг оруулах`;
      }
    } else {
      console.log('JobForm: No job schedule found, showing default text');
      this.querySelector("#calendarBtn").innerHTML = `Цаг оруулах`;
    }
  }

  async handleJobSubmission() {
    const currentUser = ApiClient.getCurrentUser();
    if (!currentUser || currentUser.type !== 'company') {
      console.log('Only company users can create job posts');
      alert('Зөвхөн компанийн хэрэглэгч ажлын зар үүсгэх боломжтой');
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
      alert('Бүх шаардлагатай талбарыг бөглөнө үү');
      return;
    }

    // Get schedule from session storage
    const jobSchedule = sessionStorage.getItem('jobSchedule');
    if (!jobSchedule) {
      console.log('Please set job schedule');
      alert('Ажлын цагийн хуваарьг тохируулна уу');
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

    // Create job data
    const jobData = {
      title: title,
      description: description,
      location: location,
      salary: salary,
      salary_type: salaryTypeKey,
      schedule: schedule,
      max_students: 1
    };

    try {
      // Create job via API
      const response = await ApiClient.createJob(jobData);
      
      if (response.success) {
        console.log('Job created successfully');
        alert('Ажлын зар амжилттай үүсгэгдлээ!');
        
        // Clear form and session data
        this.querySelector(".job-form").reset();
        sessionStorage.removeItem('jobFormData');
        sessionStorage.removeItem('jobSchedule');
        
        // Redirect to company dashboard
        window.location.href = '/company/home';
      } else {
        console.error('Failed to create job:', response.message);
        alert(response.message || 'Ажлын зар үүсгэхэд алдаа гарлаа');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Ажлын зар үүсгэхэд алдаа гарлаа');
    }
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
