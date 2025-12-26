const express = require('express');
const { supabase } = require('../database/supabase');

const router = express.Router();

/**
 * Компанийн хэрэглэгч эсэхийг шалгах middleware
 * @param {Object} req - HTTP хүсэлт
 * @param {Object} res - HTTP хариу
 * @param {Function} next - Дараагийн middleware руу шилжих функц
 */
const requireCompanyAuth = (req, res, next) => {
    if (!req.session.user || req.session.user.type !== 'company') {
        return res.status(401).json({ 
            success: false, 
            message: 'Зөвхөн компанийн хэрэглэгч хандах боломжтой' 
        });
    }
    next();
};

/**
 * Одоогийн компанийн профайл авах
 * @route GET /profile
 * @access Компанийн хэрэглэгч
 */
router.get('/profile', requireCompanyAuth, async (req, res) => {
    try {
        const { data: company, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', req.session.user.id)
            .single();

        if (error || !company) {
            return res.status(404).json({ 
                success: false, 
                message: 'Компанийн мэдээлэл олдсонгүй' 
            });
        }

        res.json({
            success: true,
            company: company
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

/**
 * Компанийн профайл шинэчлэх
 * @route PUT /profile
 * @access Компанийн хэрэглэгч
 */
router.put('/profile', requireCompanyAuth, async (req, res) => {
    const { company_name, email, phone, address, description } = req.body;
    
    if (!company_name || !email || !phone) {
        return res.status(400).json({ 
            success: false, 
            message: 'Компанийн нэр, и-мэйл, утасны дугаар заавал бөглөнө үү' 
        });
    }

    try {
        const { data, error } = await supabase
            .from('companies')
            .update({
                company_name,
                email,
                phone,
                address,
                description,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.session.user.id)
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Профайл шинэчлэхэд алдаа гарлаа' 
            });
        }

        // Сессийн мэдээллийг шинэчлэх
        req.session.user.name = company_name;
        req.session.user.email = email;

        res.json({
            success: true,
            message: 'Профайл амжилттай шинэчлэгдлээ'
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

/**
 * Компанийн ажлын байрууд авах
 * @route GET /jobs
 * @access Компанийн хэрэглэгч
 */
router.get('/jobs', requireCompanyAuth, async (req, res) => {
    try {
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('company_id', req.session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
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
        console.error('Database error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

/**
 * Компанийн ажлын байрны хүсэлтүүд авах
 * @route GET /applications
 * @access Компанийн хэрэглэгч
 */
router.get('/applications', requireCompanyAuth, async (req, res) => {
    try {
        const { data: applications, error } = await supabase
            .from('job_applications')
            .select(`
                *,
                jobs!inner (
                    title,
                    company_id
                ),
                students (
                    name,
                    email,
                    phone
                )
            `)
            .eq('jobs.company_id', req.session.user.id)
            .order('applied_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Серверийн алдаа' 
            });
        }

        res.json({
            success: true,
            applications: applications || []
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

/**
 * Хүсэлтийн статус шинэчлэх
 * @route PUT /applications/:applicationId
 * @access Компанийн хэрэглэгч
 */
router.put('/applications/:applicationId', requireCompanyAuth, async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Буруу статус' 
        });
    }

    try {
        // Эхлээд хүсэлт энэ компанид харьяалагдаж байгааг шалгах
        const { data: application, error: checkError } = await supabase
            .from('job_applications')
            .select(`
                id,
                jobs!inner (
                    company_id
                )
            `)
            .eq('id', applicationId)
            .eq('jobs.company_id', req.session.user.id)
            .single();

        if (checkError || !application) {
            return res.status(404).json({ 
                success: false, 
                message: 'Хүсэлт олдсонгүй эсвэл хандах эрх байхгүй' 
            });
        }

        const { error: updateError } = await supabase
            .from('job_applications')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', applicationId);

        if (updateError) {
            console.error('Database error:', updateError);
            return res.status(500).json({ 
                success: false, 
                message: 'Хүсэлтийн статус шинэчлэхэд алдаа гарлаа' 
            });
        }

        res.json({
            success: true,
            message: 'Хүсэлтийн статус амжилттай шинэчлэгдлээ'
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

/**
 * Тодорхой ажлын байрны хүсэлтүүд авах
 * @route GET /jobs/:jobId/applications
 * @access Компанийн хэрэглэгч
 */
router.get('/jobs/:jobId/applications', requireCompanyAuth, async (req, res) => {
    const { jobId } = req.params;
    
    try {
        // Эхлээд ажил энэ компанид харьяалагдаж байгааг шалгах
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('id')
            .eq('id', jobId)
            .eq('company_id', req.session.user.id)
            .single();

        if (jobError || !job) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ажил олдсонгүй эсвэл хандах эрх байхгүй' 
            });
        }

        const { data: applications, error } = await supabase
            .from('job_applications')
            .select(`
                *,
                students (
                    id,
                    name,
                    email,
                    phone,
                    gender,
                    age,
                    rating,
                    total_ratings
                )
            `)
            .eq('job_id', jobId)
            .order('applied_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Серверийн алдаа' 
            });
        }

        res.json({
            success: true,
            applications: applications || []
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

module.exports = router;