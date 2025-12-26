const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Supabase configuration
const { supabaseUrl, supabaseAnonKey } = require('./database/supabase');

// Import routes
console.log('Loading routes...');
const authRoutes = require('./api/auth');
const studentRoutes = require('./api/students');
const companyRoutes = require('./api/companies');
const jobRoutes = require('./api/jobs');
const apiRoutes = require('./api/api');
console.log('Routes loaded successfully');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'client/Css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/comp', express.static(path.join(__dirname, 'client/comp')));
app.use('/pics', express.static(path.join(__dirname, 'client/pics')));
app.use('/models', express.static(path.join(__dirname, 'models')));
app.use('/data', express.static(path.join(__dirname, 'data')));

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).send();
});

// Serve Supabase configuration to client
app.get('/config/supabase', (req, res) => {
    res.json({
        url: supabaseUrl,
        anonKey: supabaseAnonKey
    });
});

// Test Supabase connection
app.get('/test/supabase', async (req, res) => {
    try {
        // Debug environment variables
        console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
        console.log('SUPABASE_SERVICE_KEY length:', process.env.SUPABASE_SERVICE_KEY?.length);
        console.log('SUPABASE_ANON_KEY length:', process.env.SUPABASE_ANON_KEY?.length);
        
        const { supabase } = require('./database/supabase');
        
        // Try a simple query
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('Supabase error:', error);
            return res.json({
                success: false,
                error: error.message,
                message: 'Supabase connection failed',
                debug: {
                    url: process.env.SUPABASE_URL,
                    serviceKeyLength: process.env.SUPABASE_SERVICE_KEY?.length,
                    anonKeyLength: process.env.SUPABASE_ANON_KEY?.length
                }
            });
        }
        
        res.json({
            success: true,
            message: 'Supabase connection successful',
            data: data,
            count: data?.length || 0
        });
    } catch (error) {
        console.error('Connection error:', error);
        res.json({
            success: false,
            error: error.message,
            message: 'Supabase connection error'
        });
    }
});

// Run database migration for ratings
app.get('/migrate/ratings', async (req, res) => {
    try {
        console.log('🔄 Running rating migration...');
        const { supabase } = require('./database/supabase');
        
        // Add rating column to job_applications
        const migrations = [
            'ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5)',
            'ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS review TEXT',
            'ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS rated_at TIMESTAMP WITH TIME ZONE',
            'ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS rated_by UUID'
        ];
        
        const results = [];
        
        for (const migration of migrations) {
            try {
                console.log('Executing:', migration);
                const { data, error } = await supabase.rpc('exec_sql', { sql: migration });
                
                if (error) {
                    console.error('Migration error:', error);
                    results.push({ sql: migration, success: false, error: error.message });
                } else {
                    console.log('Migration success:', migration);
                    results.push({ sql: migration, success: true });
                }
            } catch (err) {
                console.error('Migration exception:', err);
                results.push({ sql: migration, success: false, error: err.message });
            }
        }
        
        res.json({
            success: true,
            message: 'Migration completed',
            results: results
        });
        
    } catch (error) {
        console.error('Migration failed:', error);
        res.json({
            success: false,
            error: error.message,
            message: 'Migration failed - please run SQL manually in Supabase dashboard'
        });
    }
});

// Remove company and job ratings migration
app.get('/migrate/remove-ratings', async (req, res) => {
    try {
        console.log('🔄 Removing company and job ratings...');
        const { supabase } = require('./database/supabase');
        
        // Remove rating columns from companies and jobs tables
        const migrations = [
            'ALTER TABLE companies DROP COLUMN IF EXISTS rating',
            'ALTER TABLE companies DROP COLUMN IF EXISTS total_ratings',
            'ALTER TABLE jobs DROP COLUMN IF EXISTS rating',
            'ALTER TABLE jobs DROP COLUMN IF EXISTS total_ratings'
        ];
        
        const results = [];
        
        for (const migration of migrations) {
            try {
                console.log('Executing:', migration);
                const { data, error } = await supabase.rpc('exec_sql', { sql: migration });
                
                if (error) {
                    console.error('Migration error:', error);
                    results.push({ sql: migration, success: false, error: error.message });
                } else {
                    console.log('Migration success:', migration);
                    results.push({ sql: migration, success: true });
                }
            } catch (err) {
                console.error('Migration exception:', err);
                results.push({ sql: migration, success: false, error: err.message });
            }
        }
        
        res.json({
            success: true,
            message: 'Company and job ratings removed successfully',
            results: results
        });
        
    } catch (error) {
        console.error('Migration failed:', error);
        res.json({
            success: false,
            error: error.message,
            message: 'Migration failed - please run SQL manually in Supabase dashboard'
        });
    }
});

// Routes
console.log('Setting up routes...');
app.use('/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', apiRoutes);
console.log('Routes setup complete');

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/Pages', 'Login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/Pages', 'Login.html'));
});

app.get('/student/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/Pages', 'studhome.html'));
});

app.get('/student/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/Pages', 'CreateAccStud.html'));
});

app.get('/company/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/Pages', 'Main_company.html'));
});

app.get('/company/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/Pages', 'CreateAccComp.html'));
});

app.get('/company/add-job', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/Pages', 'AddNews.html'));
});

app.get('/company/applications', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/Pages', 'ReqForMarket.html'));
});

app.get('/student/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/Pages', 'Calendar.html'));
});

app.get('/job/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/Pages', 'AdDetails.html'));
});

// Test login page (for debugging)
app.get('/test-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-login.html'));
});

// Test login browser page
app.get('/test-login-browser', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-login-browser.html'));
});

// Full flow test page
app.get('/test-full-flow', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-full-flow.html'));
});

// Debug test pages
app.get('/test-job-filtering', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-job-filtering.html'));
});

app.get('/test-rating-flow', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-rating-flow.html'));
});

app.get('/test-debug-issues', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-debug-issues.html'));
});

// AddNews calendar test page
app.get('/test-addnews-calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-addnews-calendar.html'));
});

// Debug AddNews page
app.get('/debug-addnews', (req, res) => {
    res.sendFile(path.join(__dirname, 'debug-addnews.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🗄️  Using Supabase database`);
    console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});