const express = require('express');
const { supabase } = require('../database/supabase');

const router = express.Router();

// Middleware 
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Нэвтрэх шаардлагатай' 
        });
    }
    next();
};

// Get dashboard statistics
router.get('/dashboard/stats', requireAuth, async (req, res) => {
    const userType = req.session.user.type;
    
    try {
        if (userType === 'student') {
            // Student dashboard stats
            const [
                totalApplicationsResult,
                pendingApplicationsResult,
                acceptedApplicationsResult,
                workHistoryResult
            ] = await Promise.all([
                supabase.from('job_applications').select('id', { count: 'exact' }).eq('student_id', req.session.user.id),
                supabase.from('job_applications').select('id', { count: 'exact' }).eq('student_id', req.session.user.id).eq('status', 'pending'),
                supabase.from('job_applications').select('id', { count: 'exact' }).eq('student_id', req.session.user.id).eq('status', 'accepted'),
                supabase.from('work_history').select('id', { count: 'exact' }).eq('student_id', req.session.user.id)
            ]);

            res.json({
                success: true,
                stats: {
                    total_applications: totalApplicationsResult.count || 0,
                    pending_applications: pendingApplicationsResult.count || 0,
                    accepted_applications: acceptedApplicationsResult.count || 0,
                    work_history_count: workHistoryResult.count || 0
                }
            });
            
        } else if (userType === 'company') {
            // Company dashboard stats
            const [
                totalJobsResult,
                activeJobsResult,
                totalApplicationsResult,
                pendingApplicationsResult
            ] = await Promise.all([
                supabase.from('jobs').select('id', { count: 'exact' }).eq('company_id', req.session.user.id),
                supabase.from('jobs').select('id', { count: 'exact' }).eq('company_id', req.session.user.id).eq('status', 'active'),
                supabase.from('job_applications').select('id', { count: 'exact' }).eq('jobs.company_id', req.session.user.id),
                supabase.from('job_applications').select('id', { count: 'exact' }).eq('jobs.company_id', req.session.user.id).eq('status', 'pending')
            ]);

            res.json({
                success: true,
                stats: {
                    total_jobs: totalJobsResult.count || 0,
                    active_jobs: activeJobsResult.count || 0,
                    total_applications: totalApplicationsResult.count || 0,
                    pending_applications: pendingApplicationsResult.count || 0
                }
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Буруу хэрэглэгчийн төрөл' 
            });
        }
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

// Search jobs
router.get('/search/jobs', requireAuth, async (req, res) => {
    const { q, location, salary_min, salary_max, salary_type } = req.query;
  
    try {
        let query = supabase
            .from('jobs')
            .select(`
                *,
                companies (
                    company_name
                )
            `)
            .eq('status', 'active');

        if (q) {
            query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
        }
        
        if (location) {
            query = query.ilike('location', `%${location}%`);
        }
        
        if (salary_min) {
            query = query.gte('salary', salary_min);
        }
        
        if (salary_max) {
            query = query.lte('salary', salary_max);
        }
        
        if (salary_type) {
            query = query.eq('salary_type', salary_type);
        }
        
        const { data: jobs, error } = await query
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Search error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Серверийн алдаа' 
            });
        }

        res.json({
            success: true,
            jobs: jobs || []
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

// Get recent activities
router.get('/activities/recent', requireAuth, async (req, res) => {
    const userType = req.session.user.type;
    const limit = parseInt(req.query.limit) || 10;
    
    try {
        if (userType === 'student') {
            // Recent activities for student
            const { data: activities, error } = await supabase
                .from('job_applications')
                .select(`
                    applied_at,
                    status,
                    jobs (
                        title,
                        companies (
                            company_name
                        )
                    )
                `)
                .eq('student_id', req.session.user.id)
                .order('applied_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Activities error:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Серверийн алдаа' 
                });
            }

            const formattedActivities = activities.map(activity => ({
                type: 'application',
                timestamp: activity.applied_at,
                job_title: activity.jobs?.title,
                company_name: activity.jobs?.companies?.company_name,
                status: activity.status
            }));

            res.json({
                success: true,
                activities: formattedActivities
            });
            
        } else if (userType === 'company') {
            // Recent activities for company
            const { data: activities, error } = await supabase
                .from('job_applications')
                .select(`
                    applied_at,
                    status,
                    jobs!inner (
                        title,
                        company_id
                    ),
                    students (
                        name
                    )
                `)
                .eq('jobs.company_id', req.session.user.id)
                .order('applied_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Activities error:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Серверийн алдаа' 
                });
            }

            const formattedActivities = activities.map(activity => ({
                type: 'application',
                timestamp: activity.applied_at,
                job_title: activity.jobs?.title,
                student_name: activity.students?.name,
                status: activity.status
            }));

            res.json({
                success: true,
                activities: formattedActivities
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Буруу хэрэглэгчийн төрөл' 
            });
        }
    } catch (error) {
        console.error('Activities error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running with Supabase',
        timestamp: new Date().toISOString(),
        database: 'Supabase'
    });
});

// ===== WORK EXPERIENCE ROUTES =====

// Add work experience
router.post('/work-experience', requireAuth, async (req, res) => {
    const { student_id, job_id, company_id, job_title, company_name, start_date, end_date, rating, salary, review } = req.body;
    
    // Validate required fields
    if (!student_id || !job_id || !company_id || !job_title || !company_name || !start_date || !end_date) {
        return res.status(400).json({ 
            success: false, 
            message: 'Бүх шаардлагатай талбарыг бөглөнө үү' 
        });
    }
    
    try {
        const { data: workExperience, error } = await supabase
            .from('work_history')
            .insert({
                student_id,
                job_id,
                company_id,
                job_title,
                company_name,
                start_date,
                end_date,
                rating: rating !== undefined ? rating : 5, // Only default to 5 if rating is undefined
                salary,
                review
            })
            .select()
            .single();

        if (error) {
            console.error('Work experience creation error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Ажлын туршлага нэмэхэд алдаа гарлаа' 
            });
        }

        res.json({
            success: true,
            message: 'Ажлын туршлага амжилттай нэмэгдлээ',
            work_experience: workExperience
        });
    } catch (error) {
        console.error('Work experience creation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

module.exports = router;