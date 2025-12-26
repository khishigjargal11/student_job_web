const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase } = require('../database/supabase');

const router = express.Router();

/**
 * Нэвтрэх маршрутууд ажиллаж байгааг шалгах тест маршрут
 * @route GET /test
 * @access Нийтийн
 */
router.get('/test', (req, res) => {
    console.log('AUTH ROUTE: Test endpoint called');
    res.json({ success: true, message: 'Auth routes are working' });
});

/**
 * Хэрэглэгч нэвтрэх endpoint
 * @route POST /login
 * @access Нийтийн
 */
router.post('/login', async (req, res) => {
    console.log('AUTH ROUTE: Login endpoint called with:', req.body);
    
    const { username, password, userType } = req.body;

    if (!username || !password || !userType) {
        console.log('AUTH ROUTE: Missing required fields');
        return res.status(400).json({ 
            success: false, 
            message: 'Хэрэглэгчийн нэр, нууц үг, хэрэглэгчийн төрөл заавал бөглөнө үү' 
        });
    }

    try {
        const table = userType === 'student' ? 'students' : 'companies';
        console.log('Login attempt:', { username, userType, table });
        
        const { data: user, error } = await supabase
            .from(table)
            .select('*')
            .eq('username', username)
            .single();

        console.log('Database query result:', { user: user ? 'found' : 'not found', error });

        if (error || !user) {
            console.log('User not found:', error);
            return res.status(401).json({ 
                success: false, 
                message: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу' 
            });
        }

        // Нууц үгийг шалгах - энгийн текст болон hash хоёуланг дэмжих
        let isValidPassword = false;
        
        if (user.password) {
            const cleanStoredPassword = user.password.trim();
            const cleanInputPassword = password.trim();
            
            console.log('Password debug:', {
                stored: JSON.stringify(user.password),
                storedCleaned: JSON.stringify(cleanStoredPassword),
                input: JSON.stringify(password),
                inputCleaned: JSON.stringify(cleanInputPassword)
            });
            
            // Нууц үг bcrypt hash шиг харагдаж байгааг шалгах ($2a$, $2b$, гэх мэт)
            if (cleanStoredPassword.startsWith('$2')) {
                // Энэ бол hash хийгдсэн нууц үг, bcrypt ашиглах
                try {
                    isValidPassword = await bcrypt.compare(cleanInputPassword, cleanStoredPassword);
                    console.log('Used bcrypt comparison');
                } catch (error) {
                    console.log('Bcrypt comparison failed:', error.message);
                    isValidPassword = false;
                }
            } else {
                // Энэ бол энгийн текст нууц үг (хөгжүүлэлтийн хувьд)
                isValidPassword = cleanInputPassword === cleanStoredPassword;
                console.log('Used plain text comparison, result:', isValidPassword);
            }
        } else {
            // Тестийн хувьд fallback
            isValidPassword = password === 'password123';
            console.log('Used fallback comparison');
        }

        if (!isValidPassword) {
            console.log('Password validation failed for user:', username);
            console.log('Expected:', JSON.stringify(cleanStoredPassword));
            console.log('Got:', JSON.stringify(cleanInputPassword));
            console.log('Expected length:', cleanStoredPassword?.length);
            console.log('Got length:', cleanInputPassword?.length);
            return res.status(401).json({ 
                success: false, 
                message: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу' 
            });
        }

        // Сессийн мэдээлэл үүсгэх
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            type: userType,
            name: userType === 'student' ? user.name : user.company_name
        };

        res.json({
            success: true,
            message: 'Амжилттай нэвтэрлээ',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                type: userType,
                name: userType === 'student' ? user.name : user.company_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

/**
 * Оюутан бүртгэх endpoint
 * @route POST /register/student
 * @access Нийтийн
 */
router.post('/register/student', async (req, res) => {
    const { username, password, email, phone, name, gender, age } = req.body;

    if (!username || !password || !email || !phone || !name) {
        return res.status(400).json({ 
            success: false, 
            message: 'Бүх шаардлагатай талбарыг бөглөнө үү' 
        });
    }

    try {
        // Хэрэглэгчийн нэр эсвэл и-мэйл аль хэдийн байгаа эсэхийг шалгах
        const { data: existingUser } = await supabase
            .from('students')
            .select('id')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();

        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                message: 'Хэрэглэгчийн нэр эсвэл и-мэйл аль хэдийн бүртгэгдсэн байна' 
            });
        }

        // Нууц үгийг hash хийх
        const hashedPassword = await bcrypt.hash(password, 12);

        const { data: newStudent, error } = await supabase
            .from('students')
            .insert([{
                username,
                password: hashedPassword,
                email,
                phone,
                name,
                gender,
                age
            }])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Бүртгэл үүсгэхэд алдаа гарлаа' 
            });
        }

        res.json({
            success: true,
            message: 'Амжилттай бүртгэгдлээ',
            userId: newStudent.id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

/**
 * Компани бүртгэх endpoint
 * @route POST /register/company
 * @access Нийтийн
 */
router.post('/register/company', async (req, res) => {
    console.log('Company registration request body:', req.body);
    
    const { username, password, email, phone, company_name, address, registration_number } = req.body;
    
    console.log('Extracted fields:', {
        username,
        password: password ? '[PROVIDED]' : '[MISSING]',
        email,
        phone,
        company_name,
        address,
        registration_number
    });

    if (!username || !password || !email || !phone || !company_name) {
        console.log('Validation failed - missing required fields');
        return res.status(400).json({ 
            success: false, 
            message: 'Бүх шаардлагатай талбарыг бөглөнө үү' 
        });
    }

    try {
        // Хэрэглэгчийн нэр эсвэл и-мэйл аль хэдийн байгаа эсэхийг шалгах
        const { data: existingUser } = await supabase
            .from('companies')
            .select('id')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();

        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                message: 'Хэрэглэгчийн нэр эсвэл и-мэйл аль хэдийн бүртгэгдсэн байна' 
            });
        }

        // Нууц үгийг hash хийх
        const hashedPassword = await bcrypt.hash(password, 12);

        const { data: newCompany, error } = await supabase
            .from('companies')
            .insert([{
                username,
                password: hashedPassword,
                email,
                phone,
                company_name,
                address,
                registration_number
            }])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Бүртгэл үүсгэхэд алдаа гарлаа: ' + error.message 
            });
        }

        res.json({
            success: true,
            message: 'Амжилттай бүртгэгдлээ',
            userId: newCompany.id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Серверийн алдаа' 
        });
    }
});

/**
 * Хэрэглэгч гарах endpoint
 * @route POST /logout
 * @access Нэвтэрсэн хэрэглэгч
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Гарахад алдаа гарлаа' 
            });
        }

        res.json({
            success: true,
            message: 'Амжилттай гарлаа'
        });
    });
});

/**
 * Нэвтрэх статусыг шалгах
 * @route GET /status
 * @access Нийтийн
 */
router.get('/status', (req, res) => {
    if (req.session.user) {
        res.json({
            success: true,
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

module.exports = router;