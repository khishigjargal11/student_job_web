const express = require('express');
const { supabase } = require('../database/supabase');

const router = express.Router();

/**
 * Хэрэглэгч нэвтэрсэн эсэхийг шалгах middleware
 * @param {Object} req - HTTP хүсэлт
 * @param {Object} res - HTTP хариу
 * @param {Function} next - Дараагийн middleware руу шилжих функц
 */
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Нэвтрэх шаардлагатай' 
        });
    }
    next();
};

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
 * Оюутны хэрэглэгч эсэхийг шалгах middleware
 * @param {Object} req - HTTP хүсэлт
 * @param {Object} res - HTTP хариу
 * @param {Function} next - Дараагийн middleware руу шилжих функц
 */
const requireStudentAuth = (req, res, next) => {
    if (!req.session.user || req.session.user.type !== 'student') {
        return res.status(401).json({ 
            success: false, 
            message: 'Зөвхөн оюутан хэрэглэгч хандах боломжтой' 
        });
    }
    next();
};

/**
 * Бүх идэвхтэй ажлын байрны жагсаалт авах (оюутнуудад зориулсан)
 * @route GET /
 * @access Нэвтэрсэн хэрэглэгч
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select(`
                *,
                companies (
                    company_name
                )
            `)
            .eq('status', 'active')
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
 * Одоогийн оюутанд тохирох ажлын байрны жагсаалт авах (цагийн хуваарийн зөрчилгүй)
 * @route GET /available
 * @access Оюутан хэрэглэгч
 */
router.get('/available', requireStudentAuth, async (req, res) => {
    try {
        // Эхлээд оюутны цагийн хуваарийг авах
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('schedule')
            .eq('id', req.session.user.id)
            .single();

        if (studentError || !student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Оюутны мэдээлэл олдсонгүй' 
            });
        }

        const studentSchedule = student.schedule || {};

        // Бүх идэвхтэй ажлын байрыг авах
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select(`
                *,
                companies (
                    company_name
                )
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (jobsError) {
            console.error('Database error:', jobsError);
            return res.status(500).json({ 
                success: false, 
                message: 'Серверийн алдаа' 
            });
        }

        // Цагийн хуваарийн зөрчлийн дагуу ажлын байруудыг шүүх
        const availableJobs = jobs.filter(job => {
            const jobSchedule = job.schedule || {};
            return !hasScheduleConflict(studentSchedule, jobSchedule);
        });

        res.json({
            success: true,
            jobs: availableJobs
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
 * Оюутан ажлын цагийн хуваарьт тохирох эсэхийг шалгах туслах функц
 * @param {Object} studentSchedule - Оюутны цагийн хуваарь
 * @param {Object} jobSchedule - Ажлын цагийн хуваарь
 * @returns {boolean} Зөрчил байгаа эсэх
 */
function hasScheduleConflict(studentSchedule, jobSchedule) {
    // Хэрэв ажилд цагийн хуваарь байхгүй эсвэл хоосон бол бүх хүнд тохирно
    if (!jobSchedule || Object.keys(jobSchedule).length === 0) {
        return false; // Зөрчилгүй - ажил үргэлж боломжтой
    }
    
    // Хэрэв оюутанд цагийн хуваарь байхгүй бол ямар ч ажилд тохирно
    if (!studentSchedule || Object.keys(studentSchedule).length === 0) {
        return false; // Зөрчилгүй - оюутан үргэлж боломжтой
    }
    
    // Оюутан ажлын цагт боломжтой эсэхийг шалгах
    for (const day in jobSchedule) {
        if (jobSchedule[day] && Object.keys(jobSchedule[day]).length > 0) {
            // Хэрэв оюутанд энэ өдрийн цагийн хуваарь байхгүй бол боломжтой
            if (!studentSchedule[day] || Object.keys(studentSchedule[day]).length === 0) {
                continue; // Оюутан энэ өдөр боломжтой
            }
            
            // Ажлын цаг тус бүрийг шалгах
            for (const timeSlot in jobSchedule[day]) {
                if (jobSchedule[day][timeSlot]) {
                    // Хэрэв оюутан энэ цагт боломжгүй бол зөрчилтэй
                    if (!studentSchedule[day][timeSlot]) {
                        return true; // Оюутан боломжгүй = зөрчилтэй
                    }
                }
            }
        }
    }
    return false; // Зөрчил олдсонгүй
}

/**
 * ID-аар тодорхой ажлын байрны мэдээлэл авах
 * @route GET /:id
 * @access Нэвтэрсэн хэрэглэгч
 */
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { data: job, error } = await supabase
            .from('jobs')
            .select(`
                *,
                companies (
                    company_name,
                    address,
                    description
                )
            `)
            .eq('id', req.params.id)
            .single();

        if (error || !job) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ажил олдсонгүй' 
            });
        }

        res.json({
            success: true,
            job: job
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
 * Шинэ ажлын байр үүсгэх (зөвхөн компани)
 * @route POST /
 * @access Компанийн хэрэглэгч
 */
router.post('/', requireCompanyAuth, async (req, res) => {
    const { title, description, location, salary, salary_type, schedule, max_students } = req.body;
    
    if (!title || !description || !location || !salary || !salary_type) {
        return res.status(400).json({ 
            success: false, 
            message: 'Бүх шаардлагатай талбарыг бөглөнө үү' 
        });
    }

    try {
        const { data: newJob, error } = await supabase
            .from('jobs')
            .insert([{
                company_id: req.session.user.id,
                title,
                description,
                location,
                salary,
                salary_type,
                schedule: schedule || {},
                max_students: max_students || 1
            }])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Ажил үүсгэхэд алдаа гарлаа' 
            });
        }

        res.json({
            success: true,
            message: 'Ажил амжилттай үүсгэгдлээ',
            jobId: newJob.id
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
 * Ажлын байранд хүсэлт илгээх (зөвхөн оюутан)
 * @route POST /:id/apply
 * @access Оюутны хэрэглэгч
 */
router.post('/:id/apply', requireStudentAuth, async (req, res) => {
    const { message } = req.body;
    const jobId = req.params.id;
    const studentId = req.session.user.id;
    
    try {
        // Ажил байгаа болон идэвхтэй эсэхийг шалгах
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .eq('status', 'active')
            .single();

        if (jobError || !job) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ажил олдсонгүй эсвэл идэвхгүй байна' 
            });
        }

        // Аль хэдийн хүсэлт илгээсэн эсэхийг шалгах
        const { data: existingApplication, error: checkError } = await supabase
            .from('job_applications')
            .select('id')
            .eq('job_id', jobId)
            .eq('student_id', studentId)
            .single();

        if (existingApplication) {
            return res.status(409).json({ 
                success: false, 
                message: 'Та энэ ажилд аль хэдийн хүсэлт илгээсэн байна' 
            });
        }

        // Хүсэлт үүсгэх
        const { data: newApplication, error: insertError } = await supabase
            .from('job_applications')
            .insert([{
                job_id: jobId,
                student_id: studentId,
                message: message || '',
                status: 'pending'
            }])
            .select()
            .single();

        if (insertError) {
            console.error('Database error:', insertError);
            return res.status(500).json({ 
                success: false, 
                message: 'Хүсэлт илгээхэд алдаа гарлаа' 
            });
        }

        res.json({
            success: true,
            message: 'Хүсэлт амжилттай илгээгдлээ',
            applicationId: newApplication.id
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
 * Ажлын хүсэлтийг цуцлах (зөвхөн оюутан)
 * @route DELETE /:id/apply
 * @access Оюутны хэрэглэгч
 */
router.delete('/:id/apply', requireStudentAuth, async (req, res) => {
    const jobId = req.params.id;
    const studentId = req.session.user.id;
    
    try {
        // Хүсэлт байгаа эсэхийг шалгах
        const { data: application, error: checkError } = await supabase
            .from('job_applications')
            .select('id')
            .eq('job_id', jobId)
            .eq('student_id', studentId)
            .single();

        if (checkError || !application) {
            return res.status(404).json({ 
                success: false, 
                message: 'Хүсэлт олдсонгүй' 
            });
        }

        const { error: deleteError } = await supabase
            .from('job_applications')
            .delete()
            .eq('job_id', jobId)
            .eq('student_id', studentId);

        if (deleteError) {
            console.error('Database error:', deleteError);
            return res.status(500).json({ 
                success: false, 
                message: 'Хүсэлт цуцлахад алдаа гарлаа' 
            });
        }

        res.json({
            success: true,
            message: 'Хүсэлт амжилттай цуцлагдлаа'
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
 * Ажлын байрыг шинэчлэх (зөвхөн компани)
 * @route PUT /:id
 * @access Компанийн хэрэглэгч
 */
router.put('/:id', requireCompanyAuth, async (req, res) => {
    const jobId = req.params.id;
    const updateData = req.body;
    
    try {
        // Эхлээд ажил энэ компанид харьяалагдаж байгааг шалгах
        const { data: existingJob, error: checkError } = await supabase
            .from('jobs')
            .select('id')
            .eq('id', jobId)
            .eq('company_id', req.session.user.id)
            .single();

        if (checkError || !existingJob) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ажил олдсонгүй эсвэл хандах эрх байхгүй' 
            });
        }

        // Ажлыг шинэчлэх
        const { data: updatedJob, error: updateError } = await supabase
            .from('jobs')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId)
            .select()
            .single();

        if (updateError) {
            console.error('Database error:', updateError);
            return res.status(500).json({ 
                success: false, 
                message: 'Ажил шинэчлэхэд алдаа гарлаа' 
            });
        }

        res.json({
            success: true,
            message: 'Ажил амжилттай шинэчлэгдлээ',
            job: updatedJob
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