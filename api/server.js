const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://can-collector-website.vercel.app'
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Thêm validation cho MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not defined');
    throw new Error('MONGODB_URI must be defined');
}

console.log('Connecting to MongoDB...');
console.log('Environment:', process.env.NODE_ENV);
console.log('MONGODB_URI exists:', !!MONGODB_URI);

// Kết nối MongoDB với error handling tốt hơn
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
    throw error;
});

// Schema người dùng
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalCans: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    vouchers: [{
        type: { type: String, enum: ['10k', '25k'] },
        value: { type: Number },
        createdAt: { type: Date, default: Date.now }
    }]
});

const User = mongoose.model('User', userSchema);

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token không được cung cấp' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ' });
        }
        req.user = user;
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Đăng ký
app.post('/api/register', async (req, res) => {
    try {
        console.log('Bắt đầu quá trình đăng ký');
        const { username, password } = req.body;

        // Kiểm tra người dùng đã tồn tại
        console.log('Kiểm tra người dùng đã tồn tại...');
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Tên đăng nhập đã tồn tại');
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        // Mã hóa mật khẩu
        console.log('Mã hóa mật khẩu...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        console.log('Tạo người dùng mới...');
        const user = new User({
            username,
            password: hashedPassword
        });

        console.log('Lưu người dùng vào cơ sở dữ liệu...');
        await user.save();
        console.log('Đăng ký thành công');
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        console.error('Lỗi trong quá trình đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Tìm người dùng
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Kiểm tra mật khẩu
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                totalCans: user.totalCans,
                points: user.points
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Lấy thông tin người dùng
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        
        res.json({
            id: user._id,
            username: user.username,
            totalCans: user.totalCans,
            points: user.points,
            vouchers: user.vouchers
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API cho IoT - Bắt đầu thu gom
app.post('/api/start-collection', authenticateToken, async (req, res) => {
    try {
        // API này sẽ được gọi từ hệ thống IoT
        // Trả về session ID để theo dõi phiên thu gom
        const sessionId = Date.now().toString();
        res.json({ 
            sessionId,
            message: 'Bắt đầu thu gom thành công',
            status: 'collecting'
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API cho IoT - Nhận lon nhôm
app.post('/api/can-detected', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        // Cập nhật số lon và điểm cho người dùng
        const user = await User.findById(req.user.userId);
        user.totalCans += 1;
        user.points += 1;
        await user.save();

        res.json({
            message: 'Đã nhận lon nhôm thành công',
            totalCans: user.totalCans,
            points: user.points,
            canCount: 1
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API cho IoT - Vật không phải lon nhôm
app.post('/api/invalid-item', authenticateToken, async (req, res) => {
    try {
        res.json({
            message: 'Vật không phải lon nhôm, đã nhả lại',
            error: 'invalid_item'
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Kết thúc thu gom
app.post('/api/end-collection', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json({
            message: 'Kết thúc thu gom thành công',
            totalCans: user.totalCans,
            points: user.points
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Đổi điểm lấy voucher
app.post('/api/redeem-voucher', authenticateToken, async (req, res) => {
    try {
        const { voucherType } = req.body; // '10k' hoặc '25k'
        const user = await User.findById(req.user.userId);
        
        let requiredPoints, voucherValue;
        
        if (voucherType === '10k') {
            requiredPoints = 40;
            voucherValue = 10000;
        } else if (voucherType === '25k') {
            requiredPoints = 80;
            voucherValue = 25000;
        } else {
            return res.status(400).json({ message: 'Loại voucher không hợp lệ' });
        }

        if (user.points < requiredPoints) {
            return res.status(400).json({ message: 'Điểm không đủ để đổi voucher' });
        }

        // Trừ điểm và tạo voucher
        user.points -= requiredPoints;
        user.vouchers.push({
            type: voucherType,
            value: voucherValue
        });
        
        await user.save();

        res.json({
            message: `Đã đổi thành công voucher ${voucherType}`,
            points: user.points,
            voucher: {
                type: voucherType,
                value: voucherValue
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = app; 