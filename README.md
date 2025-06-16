# 🗑️ Thùng Rác Thông Minh

Website quản lý hệ thống IoT thu gom lon nhôm thông minh.

## 📋 Tính năng

- ✅ Đăng ký và đăng nhập người dùng
- ✅ Dashboard hiển thị thông tin người dùng
- ✅ Điều khiển thu gom lon nhôm
- ✅ Hệ thống điểm tích lũy (1 lon = 1 điểm)
- ✅ Đổi điểm lấy voucher (40 điểm = 10k VND, 80 điểm = 25k VND)
- ✅ API tương thích với hệ thống IoT
- ✅ Giao diện responsive, hiện đại

## 🛠️ Công nghệ sử dụng

- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Authentication**: JWT
- **Password Hashing**: bcryptjs

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js (version 14 trở lên)
- MongoDB (local hoặc cloud)

### Bước 1: Clone dự án
```bash
git clone <repository-url>
cd thung-rac-thong-minh
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình môi trường
Tạo file `.env` trong thư mục gốc:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/thung-rac-thong-minh
JWT_SECRET=your-secret-key-here
```

### Bước 4: Khởi động MongoDB
```bash
# Nếu sử dụng MongoDB local
mongod

# Hoặc sử dụng MongoDB Atlas (cloud)
# Cập nhật MONGODB_URI trong file .env
```

### Bước 5: Chạy ứng dụng
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Truy cập website tại: `http://localhost:3000`

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Đăng ký người dùng mới
- `POST /api/login` - Đăng nhập
- `GET /api/user` - Lấy thông tin người dùng (cần JWT)

### IoT Integration
- `POST /api/start-collection` - Bắt đầu thu gom
- `POST /api/can-detected` - Nhận lon nhôm
- `POST /api/invalid-item` - Vật không hợp lệ
- `POST /api/end-collection` - Kết thúc thu gom

### Voucher System
- `POST /api/redeem-voucher` - Đổi điểm lấy voucher

## 🤖 Tích hợp IoT

Website được thiết kế để tương thích cao với hệ thống IoT. Các API sau có thể được gọi từ hệ thống IoT:

### Bắt đầu thu gom
```javascript
fetch('/api/start-collection', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <user-token>'
    }
});
```

### Nhận lon nhôm
```javascript
fetch('/api/can-detected', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <user-token>'
    },
    body: JSON.stringify({ sessionId: 'session-id' })
});
```

### Vật không hợp lệ
```javascript
fetch('/api/invalid-item', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <user-token>'
    }
});
```

## 🧪 Testing

Để test các tính năng IoT, sử dụng các hàm mô phỏng trong console:

```javascript
// Mô phỏng nhận lon nhôm
window.simulateCanDetection();

// Mô phỏng vật không hợp lệ
window.simulateInvalidItem();
```

## 📱 Giao diện

- **Responsive Design**: Tương thích với mọi thiết bị
- **Modern UI**: Thiết kế hiện đại với gradient và animation
- **User-friendly**: Giao diện trực quan, dễ sử dụng

## 🔒 Bảo mật

- Mật khẩu được mã hóa bằng bcryptjs
- JWT token cho xác thực
- CORS được cấu hình
- Input validation

## 📊 Database Schema

### User Collection
```javascript
{
    username: String (unique),
    password: String (hashed),
    totalCans: Number,
    points: Number,
    vouchers: [{
        type: String ('10k' | '25k'),
        value: Number,
        createdAt: Date
    }]
}
```

## 🚀 Deployment

### Heroku
1. Tạo app trên Heroku
2. Kết nối với MongoDB Atlas
3. Deploy code
4. Cấu hình environment variables

### VPS
1. Upload code lên server
2. Cài đặt Node.js và MongoDB
3. Cấu hình PM2 hoặc systemd
4. Setup reverse proxy với Nginx

## 📝 Lưu ý

- Đảm bảo MongoDB đang chạy trước khi khởi động ứng dụng
- Cập nhật JWT_SECRET trong production
- Backup database thường xuyên
- Monitor logs để phát hiện lỗi

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 📞 Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub. 