const express = require('express');
const { supabase } = require('../database/supabase');

const router = express.Router();

/**
 * Оюутны маршрут ажиллаж байгааг шалгах тест маршрут
 * @route GET /test
 * @access Нийтийн
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Students router is working',
        timestamp: new Date().toISOString()
    });
});

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
 * Одоогийн оюутны профайл авах
 * @route GET /profile
 * @access Оюутны хэрэглэгч
 */
router.get('/profile', requireStudentAuth, async (req, res) => {
    try {
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', req.session.user.id)
            .single();

        if (error || !student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Оюутны мэдээлэл олдсонгүй' 
            });
        }

        res.json({
            success: true,
            student: student
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
 * Оюутны профайл шинэчлэх
 * @route PUT /profile
 * @access Оюутны хэрэглэгч
 */
router.put('/profile', requireStudentAuth, async (req, res) => {
    const { name, email, phone, gender, age } = req.body;
    
    if (!name || !email || !phone) {
        return res.status(400).json({ 
            success: false, 
            message: 'Нэр, и-мэйл, утасны дугаар заавал бөглөнө үү' 
        });
    }

    try {
        const { data, error } = await supabase
            .from('students')
            .update({
                name,
                email,
                phone,
                gender,
                age,
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
        req.session.user.name = name;
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
 * Оюутны ажлын түүх авах
 * @route GET /work-history
 * @access Оюутны хэрэглэгч
 */
router.get('/work-history', requireStudentAuth, async (req, res) => {
    try {
        const { data: workHistory, error } = await supabase
            .from('work_history')
            .select('*')
            .eq('student_id', req.session.user.id)
            .order('start_date', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Серверийн алдаа' 
            });
        }

        res.json({
            success: true,
            workHistory: workHistory || []
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
 * Оюутны ажлын хүсэлтүүд авах
 * @route GET /applications
 * @access Оюутны хэрэглэгч
 */
router.get('/applications', requireStudentAuth, async (req, res) => {
    try {
        const { data: applications, error } = await supabase
            .from('job_applications')
            .select(`
                *,
                jobs (
                    title,
                    location,
                    salary,
                    salary_type,
                    companies (
                        company_name
                    )
                )
            `)
            .eq('student_id', req.session.user.id)
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
 * Оюутны цагийн хуваарь шинэчлэх
 * @route PUT /schedule
 * @access Оюутны хэрэглэгч
 */
router.put('/schedule', requireStudentAuth, async (req, res) => {
    const { schedule } = req.body;
    
    if (!schedule || typeof schedule !== 'object') {
        return res.status(400).json({ 
            success: false, 
            message: 'Цагийн хуваарь буруу форматтай байна' 
        });
    }

    try {
        const { error } = await supabase
            .from('students')
            .update({
                schedule,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.session.user.id);

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Цагийн хуваарь шинэчлэхэд алдаа гарлаа' 
            });
        }

        res.json({
            success: true,
            message: 'Цагийн хуваарь амжилттай шинэчлэгдлээ'
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
 * Оюутанд үнэлгээ өгөх (компаниудад зориулсан)
 * @route POST /rate
 * @access Компанийн хэрэглэгч
 */
router.post('/rate', async (req, res) => {
    // Энэ endpoint нь компаниудад хандах боломжтой байх ёстой, зөвхөн оюутанд биш
    if (!req.session.user || req.session.user.type !== 'company') {
        return res.status(401).json({ 
            success: false, 
            message: 'Зөвхөн компанийн хэрэглэгч үнэлгээ өгөх боломжтой' 
        });
    }
    
    const { student_id, application_id, rating, review } = req.body;
    
    // Шаардлагатай талбаруудыг шалгах
    if (!student_id || !application_id || !rating) {
        return res.status(400).json({ 
            success: false, 
            message: 'Шаардлагатай талбарууд дутуу байна' 
        });
    }
    
    // Үнэлгээний хүрээг шалгах
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
            success: false, 
            message: 'Үнэлгээ 1-5 хооронд байх ёстой' 
        });
    }
    
    try {
        // Эхлээд үнэлгээг тодорхой ажлын хүсэлтэд хадгалах
        const { error: applicationError } = await supabase
            .from('job_applications')
            .update({
                rating: rating,
                review: review || null,
                rated_at: new Date().toISOString(),
                rated_by: req.session.user.id
            })
            .eq('id', application_id)
            .eq('student_id', student_id); // Нэмэлт аюулгүй байдлын шалгалт

        if (applicationError) {
            console.error('Application rating update error:', applicationError);
            return res.status(500).json({ 
                success: false, 
                message: 'Хүсэлтийн үнэлгээ хадгалахад алдаа гарлаа' 
            });
        }

        // Дараа нь оюутны ерөнхий үнэлгээг шинэчлэх
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('rating, total_ratings')
            .eq('id', student_id)
            .single();

        if (studentError || !student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Оюутан олдсонгүй' 
            });
        }

        // Шинэ дундаж үнэлгээ тооцоолох
        const currentTotal = student.rating * student.total_ratings;
        const newTotalRatings = student.total_ratings + 1;
        const newAverageRating = (currentTotal + rating) / newTotalRatings;

        // Оюутны ерөнхий үнэлгээг шинэчлэх
        const { error: updateError } = await supabase
            .from('students')
            .update({
                rating: newAverageRating,
                total_ratings: newTotalRatings
            })
            .eq('id', student_id);

        if (updateError) {
            console.error('Student rating update error:', updateError);
            return res.status(500).json({ 
                success: false, 
                message: 'Оюутны үнэлгээ шинэчлэхэд алдаа гарлаа' 
            });
        }

        res.json({
            success: true,
            message: 'Үнэлгээ амжилттай хадгалагдлаа',
            new_rating: newAverageRating.toFixed(1),
            total_ratings: newTotalRatings,
            application_rating: rating
        });
    } catch (error) {
        console.error('Rating error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

module.exports = router;