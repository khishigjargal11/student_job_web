// Sample data for development and testing

const sampleStudents = [
    {
        id: 'student_1',
        username: 'Student',
        password: '123',
        email: 'student@example.com',
        phone: '88998899',
        name: 'Бат Сараа',
        profilePicture: 'pics/profile.jpg',
        schedule: {
            monday: { '9-10': 1, '10-11': 1, '14-15': 1, '15-16': 1 },
            tuesday: { '10-11': 1, '11-12': 1, '16-17': 1 },
            wednesday: { '9-10': 1, '13-14': 1, '14-15': 1 },
            thursday: { '11-12': 1, '12-13': 1, '15-16': 1 },
            friday: { '9-10': 1, '10-11': 1, '17-18': 1 },
            saturday: { '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1 },
            sunday: { '14-15': 1, '15-16': 1 }
        },
        workHistory: [
            {
                id: 'work_1',
                jobId: 'job_completed_1',
                jobTitle: 'Англи хэлний цагийн багш',
                companyName: 'Боловсролын төв',
                startDate: '2025-07-20',
                endDate: '2025-08-01',
                rating: 5,
                review: 'Маш сайн ажилласан',
                salary: 15000,
                addedAt: '2025-08-01T10:00:00Z'
            }
        ],
        applications: ['job_1', 'job_2'],
        rating: 25,
        totalRatings: 5,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T12:00:00Z'
    },
    {
        id: 'student_2',
        username: 'boldoo',
        password: 'pass123',
        email: 'boldoo@student.edu.mn',
        phone: '99887766',
        name: 'Болдбаатар',
        profilePicture: 'pics/profile.jpg',
        schedule: {
            monday: { '8-9': 1, '9-10': 1, '16-17': 1, '17-18': 1 },
            tuesday: { '8-9': 1, '14-15': 1, '15-16': 1, '16-17': 1 },
            wednesday: { '10-11': 1, '11-12': 1, '18-19': 1 },
            thursday: { '8-9': 1, '9-10': 1, '13-14': 1 },
            friday: { '14-15': 1, '15-16': 1, '16-17': 1 },
            saturday: { '9-10': 1, '10-11': 1, '15-16': 1, '16-17': 1 },
            sunday: { '13-14': 1, '14-15': 1, '15-16': 1 }
        },
        workHistory: [],
        applications: ['job_3'],
        rating: 0,
        totalRatings: 0,
        createdAt: '2025-01-05T00:00:00Z',
        updatedAt: '2025-01-05T00:00:00Z'
    }
];

const sampleCompanies = [
    {
        id: 'company_1',
        username: 'Company',
        password: '123',
        email: 'company@example.com',
        phone: '70001234',
        companyName: 'Мега Маркет',
        description: 'Том худалдааны сүлжээ',
        address: 'Улаанбаатар, Сүхбаатар дүүрэг',
        website: 'www.megamarket.mn',
        logo: '',
        postedJobs: ['job_1', 'job_2'],
        rating: 22,
        totalRatings: 5,
        createdAt: '2024-12-01T00:00:00Z',
        updatedAt: '2025-01-10T15:30:00Z'
    },
    {
        id: 'company_2',
        username: 'coffeeshop',
        password: 'coffee123',
        email: 'info@coffeetime.mn',
        phone: '70005678',
        companyName: 'Coffee Time',
        description: 'Орчин үеийн кофе шоп',
        address: 'Улаанбаатар, Чингэлтэй дүүрэг',
        website: 'www.coffeetime.mn',
        logo: '',
        postedJobs: ['job_3'],
        rating: 18,
        totalRatings: 4,
        createdAt: '2024-11-15T00:00:00Z',
        updatedAt: '2025-01-08T09:15:00Z'
    }
];

const sampleJobs = [
    {
        id: 'job_1',
        companyId: 'company_1',
        title: 'Агуулахын цагийн ажилтан',
        description: 'Агуулахын ажил, барааны эрэмбэлэлт, тооллого хийх. Туршлага шаардлагагүй.',
        location: 'Чингэлтэй дүүрэг',
        salary: 10000,
        salaryType: 'hourly',
        schedule: {
            monday: { '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1, '17-18': 1 },
            tuesday: { '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1, '17-18': 1 },
            wednesday: { '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1, '17-18': 1 },
            thursday: { '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1, '17-18': 1 },
            friday: { '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1, '17-18': 1 }
        },
        requirements: ['Хүчтэй биетэй', 'Цагийн ажилд дуртай'],
        benefits: ['Цагийн хуваарь уян хатан', 'Хоолны цэг'],
        category: 'Агуулах',
        status: 'active',
        applications: [
            {
                studentId: 'student_1',
                appliedAt: '2025-01-10T14:30:00Z',
                status: 'pending',
                message: 'Би энэ ажилд маш их сонирхолтой байна.'
            }
        ],
        acceptedStudents: [],
        maxPositions: 3,
        rating: 23,
        totalRatings: 5,
        createdAt: '2025-01-08T10:00:00Z',
        updatedAt: '2025-01-10T14:30:00Z',
        deadline: '2025-01-25T23:59:59Z'
    },
    {
        id: 'job_2',
        companyId: 'company_1',
        title: 'Касс дээрх ажилтан',
        description: 'Худалдааны төвийн касс дээр ажиллах, харилцагчтай харьцах, мөнгөн тооцоо хийх.',
        location: 'Сүхбаатар дүүрэг',
        salary: 9000,
        salaryType: 'hourly',
        schedule: {
            tuesday: { '9-10': 1, '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1 },
            wednesday: { '9-10': 1, '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1 },
            thursday: { '9-10': 1, '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1 },
            friday: { '9-10': 1, '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1 },
            saturday: { '9-10': 1, '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1 }
        },
        requirements: ['Харилцааны чадвар сайн', 'Тооцооны мэдлэг'],
        benefits: ['Борлуулалтын урамшуулал', 'Ажлын дараах сургалт'],
        category: 'Борлуулалт',
        status: 'active',
        applications: [
            {
                studentId: 'student_1',
                appliedAt: '2025-01-09T16:20:00Z',
                status: 'pending',
                message: 'Харилцагчийн үйлчилгээний талаар сурах хүсэлтэй байна.'
            }
        ],
        acceptedStudents: [],
        maxPositions: 2,
        rating: 18,
        totalRatings: 4,
        createdAt: '2025-01-07T15:00:00Z',
        updatedAt: '2025-01-09T16:20:00Z',
        deadline: '2025-01-30T23:59:59Z'
    },
    {
        id: 'job_3',
        companyId: 'company_2',
        title: 'Кофе шопын ажилтан',
        description: 'Кофе бэлтгэх, харилцагч үйлчлэх, цэвэрлэгээ хийх. Кофе бэлтгэх туршлага давуу тал.',
        location: 'Чингэлтэй дүүрэг',
        salary: 12000,
        salaryType: 'hourly',
        schedule: {
            monday: { '8-9': 1, '9-10': 1, '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1 },
            tuesday: { '8-9': 1, '9-10': 1, '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1 },
            wednesday: { '8-9': 1, '9-10': 1, '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1 },
            thursday: { '8-9': 1, '9-10': 1, '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1 },
            friday: { '8-9': 1, '9-10': 1, '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1, '16-17': 1 },
            saturday: { '10-11': 1, '11-12': 1, '12-13': 1, '13-14': 1, '14-15': 1, '15-16': 1 }
        },
        requirements: ['Кофе бэлтгэх туршлага', 'Найрсаг зан чанар'],
        benefits: ['Үнэгүй кофе', 'Уян хатан цагийн хуваарь'],
        category: 'Үйлчилгээ',
        status: 'active',
        applications: [
            {
                studentId: 'student_2',
                appliedAt: '2025-01-11T11:45:00Z',
                status: 'pending',
                message: 'Кофе бэлтгэх сонирхолтой, сурах хүсэлтэй байна.'
            }
        ],
        acceptedStudents: [],
        maxPositions: 1,
        rating: 20,
        totalRatings: 4,
        createdAt: '2025-01-06T12:00:00Z',
        updatedAt: '2025-01-11T11:45:00Z',
        deadline: '2025-01-20T23:59:59Z'
    }
];

// Function to initialize sample data in localStorage
function initializeSampleData() {
    // Only initialize if no data exists
    if (!localStorage.getItem('students')) {
        localStorage.setItem('students', JSON.stringify(sampleStudents));
    }
    
    if (!localStorage.getItem('companies')) {
        localStorage.setItem('companies', JSON.stringify(sampleCompanies));
    }
    
    if (!localStorage.getItem('jobs')) {
        localStorage.setItem('jobs', JSON.stringify(sampleJobs));
    }
    
    console.log('Sample data initialized');
}

// Function to reset all data to sample data
function resetToSampleData() {
    localStorage.setItem('students', JSON.stringify(sampleStudents));
    localStorage.setItem('companies', JSON.stringify(sampleCompanies));
    localStorage.setItem('jobs', JSON.stringify(sampleJobs));
    console.log('Data reset to sample data');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sampleStudents,
        sampleCompanies,
        sampleJobs,
        initializeSampleData,
        resetToSampleData
    };
} else {
    window.SampleData = {
        sampleStudents,
        sampleCompanies,
        sampleJobs,
        initializeSampleData,
        resetToSampleData
    };
}