-- Student Job Platform Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable Row Level Security (RLS) for all tables
-- This ensures data security in Supabase

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    name TEXT NOT NULL,
    gender TEXT,
    age INTEGER,
    profile_picture TEXT DEFAULT 'pics/profile.jpg',
    schedule JSONB DEFAULT '{}',
    rating REAL DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    company_name TEXT NOT NULL,
    address TEXT,
    description TEXT,
    registration_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    salary REAL NOT NULL,
    salary_type TEXT NOT NULL DEFAULT 'hourly',
    schedule JSONB DEFAULT '{}',
    max_students INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, student_id)
);

-- Work History table
CREATE TABLE IF NOT EXISTS work_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rating INTEGER DEFAULT 0,
    review TEXT,
    salary REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_companies_username ON companies(username);
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_student_id ON job_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_work_history_student_id ON work_history(student_id);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Students
CREATE POLICY "Students can view their own data" ON students
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Students can update their own data" ON students
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for Companies
CREATE POLICY "Companies can view their own data" ON companies
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Companies can update their own data" ON companies
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for Jobs
CREATE POLICY "Anyone can view active jobs" ON jobs
    FOR SELECT USING (status = 'active');

CREATE POLICY "Companies can manage their own jobs" ON jobs
    FOR ALL USING (auth.uid()::text = company_id::text);

-- RLS Policies for Job Applications
CREATE POLICY "Students can view their own applications" ON job_applications
    FOR SELECT USING (auth.uid()::text = student_id::text);

CREATE POLICY "Companies can view applications for their jobs" ON job_applications
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT company_id::text FROM jobs WHERE id = job_id
        )
    );

CREATE POLICY "Students can create applications" ON job_applications
    FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);

CREATE POLICY "Students can delete their own applications" ON job_applications
    FOR DELETE USING (auth.uid()::text = student_id::text);

CREATE POLICY "Companies can update application status" ON job_applications
    FOR UPDATE USING (
        auth.uid()::text IN (
            SELECT company_id::text FROM jobs WHERE id = job_id
        )
    );

-- RLS Policies for Work History
CREATE POLICY "Students can view their own work history" ON work_history
    FOR SELECT USING (auth.uid()::text = student_id::text);

CREATE POLICY "Companies can view work history for their jobs" ON work_history
    FOR SELECT USING (auth.uid()::text = company_id::text);

-- Insert sample data
INSERT INTO students (id, username, password, email, phone, name, gender, age, schedule) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Student',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', -- password: password123
    'student@example.com',
    '88998899',
    'Бат Сараа',
    'Эрэгтэй',
    20,
    '{"monday": {"9-10": 1, "10-11": 1, "11-12": 1, "13-14": 1, "14-15": 1, "15-16": 1, "16-17": 1}, "tuesday": {"9-10": 1, "10-11": 1, "11-12": 1, "13-14": 1, "14-15": 1, "15-16": 1, "16-17": 1}, "wednesday": {"9-10": 1, "10-11": 1, "11-12": 1, "13-14": 1, "14-15": 1, "15-16": 1, "16-17": 1}, "thursday": {"9-10": 1, "10-11": 1, "11-12": 1, "13-14": 1, "14-15": 1, "15-16": 1, "16-17": 1}, "friday": {"9-10": 1, "10-11": 1, "11-12": 1, "13-14": 1, "14-15": 1, "15-16": 1, "16-17": 1}}'::jsonb
) ON CONFLICT (username) DO NOTHING;

INSERT INTO companies (id, username, password, email, phone, company_name, address, description) VALUES
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Company',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', -- password: password123
    'company@example.com',
    '77887788',
    'Мега Маркет',
    'Улаанбаатар хот',
    'Томоохон худалдааны төв'
) ON CONFLICT (username) DO NOTHING;

INSERT INTO jobs (id, company_id, title, description, location, salary, salary_type, schedule, max_students) VALUES
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    'Агуулахын цагийн ажилтан',
    'Агуулахын ажил, бараа эмхэх, тоолох',
    'Чингэлтэй дүүрэг',
    10000,
    'hourly',
    '{"monday": {"10-11": 1, "11-12": 1, "12-13": 1, "13-14": 1, "14-15": 1, "15-16": 1, "16-17": 1, "17-18": 1}, "tuesday": {"10-11": 1, "11-12": 1, "12-13": 1, "13-14": 1, "14-15": 1, "15-16": 1, "16-17": 1, "17-18": 1}, "wednesday": {"10-11": 1, "11-12": 1, "12-13": 1, "13-14": 1, "14-15": 1, "15-16": 1, "16-17": 1, "17-18": 1}, "thursday": {"10-11": 1, "11-12": 1, "12-13": 1, "13-14": 1, "14-15": 1, "15-16": 1, "16-17": 1, "17-18": 1}, "friday": {"10-11": 1, "11-12": 1, "12-13": 1, "13-14": 1, "14-15": 1, "15-16": 1, "16-17": 1, "17-18": 1}}'::jsonb,
    2
) ON CONFLICT (id) DO NOTHING;