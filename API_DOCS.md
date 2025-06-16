# 📚 Tài liệu API - Thùng Rác Thông Minh

## 🔐 Authentication

Tất cả API (trừ đăng ký và đăng nhập) đều yêu cầu JWT token trong header:
```
Authorization: Bearer <jwt-token>
```

## 📋 Danh sách API

### 1. Đăng ký người dùng
```
POST /api/register
```

**Request Body:**
```json
{
    "username": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "message": "Đăng ký thành công"
}
```

### 2. Đăng nhập
```
POST /api/login
```

**Request Body:**
```json
{
    "username": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "token": "jwt-token-string",
    "user": {
        "id": "user-id",
        "username": "string",
        "totalCans": 0,
        "points": 0
    }
}
```

### 3. Lấy thông tin người dùng
```
GET /api/user
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
    "id": "user-id",
    "username": "string",
    "totalCans": 10,
    "points": 15,
    "vouchers": [
        {
            "type": "10k",
            "value": 10000,
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

## 🤖 IoT Integration APIs

### 4. Bắt đầu thu gom
```
POST /api/start-collection
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
    "sessionId": "1704067200000",
    "message": "Bắt đầu thu gom thành công",
    "status": "collecting"
}
```

### 5. Nhận lon nhôm
```
POST /api/can-detected
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
    "sessionId": "1704067200000"
}
```

**Response:**
```json
{
    "message": "Đã nhận lon nhôm thành công",
    "totalCans": 11,
    "points": 16,
    "canCount": 1
}
```

### 6. Vật không hợp lệ
```
POST /api/invalid-item
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
    "message": "Vật không phải lon nhôm, đã nhả lại",
    "error": "invalid_item"
}
```

### 7. Kết thúc thu gom
```
POST /api/end-collection
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
    "message": "Kết thúc thu gom thành công",
    "totalCans": 11,
    "points": 16
}
```

### 8. Đổi điểm lấy voucher
```
POST /api/redeem-voucher
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
    "voucherType": "10k"  // hoặc "25k"
}
```

**Response:**
```json
{
    "message": "Đã đổi thành công voucher 10k",
    "points": 6,
    "voucher": {
        "type": "10k",
        "value": 10000
    }
}
```

## 🔄 Luồng hoạt động IoT

### Bước 1: Người dùng đăng nhập
1. Gọi API `/api/login` để lấy JWT token
2. Lưu token để sử dụng cho các API khác

### Bước 2: Bắt đầu thu gom
1. Người dùng nhấn "Bắt đầu thu gom" trên website
2. Website gọi API `/api/start-collection`
3. Hệ thống IoT nhận được thông báo và bắt đầu hoạt động

### Bước 3: Xử lý vật phẩm
Khi có vật được đưa vào thùng rác:

**Nếu là lon nhôm:**
```javascript
// Gọi API từ hệ thống IoT
fetch('/api/can-detected', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <user-token>'
    },
    body: JSON.stringify({ sessionId: 'session-id' })
});
```

**Nếu không phải lon nhôm:**
```javascript
// Gọi API từ hệ thống IoT
fetch('/api/invalid-item', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <user-token>'
    }
});
```

### Bước 4: Kết thúc thu gom
1. Người dùng nhấn "Kết thúc" trên website
2. Website gọi API `/api/end-collection`
3. Hệ thống IoT dừng hoạt động

## 📊 Hệ thống điểm

- **1 lon nhôm = 1 điểm**
- **40 điểm = Voucher 10,000 VND**
- **80 điểm = Voucher 25,000 VND**

## 🚨 Error Handling

### HTTP Status Codes
- `200` - Thành công
- `400` - Lỗi dữ liệu đầu vào
- `401` - Chưa xác thực hoặc token không hợp lệ
- `403` - Không có quyền truy cập
- `404` - Không tìm thấy tài nguyên
- `500` - Lỗi server

### Error Response Format
```json
{
    "message": "Mô tả lỗi"
}
```

## 🔧 Testing

### Sử dụng cURL

**Đăng ký:**
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

**Đăng nhập:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

**Bắt đầu thu gom:**
```bash
curl -X POST http://localhost:3000/api/start-collection \
  -H "Authorization: Bearer <your-token>"
```

### Sử dụng JavaScript (Browser)

```javascript
// Đăng nhập
const loginResponse = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'test', password: '123456' })
});
const { token } = await loginResponse.json();

// Bắt đầu thu gom
const startResponse = await fetch('/api/start-collection', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});
```

## 📝 Lưu ý quan trọng

1. **Token Expiration**: JWT token có thời hạn 24 giờ
2. **Session Management**: Mỗi phiên thu gom có sessionId riêng
3. **Concurrent Sessions**: Không hỗ trợ nhiều phiên thu gom đồng thời
4. **Error Recovery**: Hệ thống tự động xử lý lỗi và rollback nếu cần
5. **Rate Limiting**: Giới hạn 100 requests/phút cho mỗi IP

## 🔗 WebSocket (Tương lai)

Trong phiên bản tương lai, hệ thống sẽ hỗ trợ WebSocket để:
- Cập nhật real-time số lon và điểm
- Thông báo trạng thái máy
- Điều khiển từ xa

## 📞 Hỗ trợ

Nếu có vấn đề với API, vui lòng:
1. Kiểm tra logs server
2. Xác nhận token còn hợp lệ
3. Kiểm tra kết nối MongoDB
4. Liên hệ team phát triển 