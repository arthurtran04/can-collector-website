// Biến toàn cục
let currentUser = null;
let currentToken = null;
let isCollecting = false;
let sessionCans = 0;
let sessionPoints = 0;

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

// API Base URL
const API_BASE = '';

// Utility Functions
function showMessage(message, type = 'info') {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.classList.remove('hidden');
    
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 5000);
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span> Đang xử lý...';
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || button.textContent;
    }
}

function switchForm() {
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
}

function updateUserStats() {
    if (currentUser) {
        document.getElementById('username-display').textContent = `Xin chào, ${currentUser.username}!`;
        document.getElementById('total-cans').textContent = currentUser.totalCans;
        document.getElementById('total-points').textContent = currentUser.points;
    }
}

function updateVoucherList() {
    const voucherContainer = document.getElementById('user-vouchers');
    
    if (!currentUser.vouchers || currentUser.vouchers.length === 0) {
        voucherContainer.innerHTML = '<p class="no-vouchers">Chưa có voucher nào</p>';
        return;
    }
    
    voucherContainer.innerHTML = currentUser.vouchers.map(voucher => `
        <div class="voucher-item">
            <div class="voucher-info">
                <span class="voucher-value">Voucher ${voucher.value.toLocaleString()} VND</span>
                <span class="voucher-date">${new Date(voucher.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
        </div>
    `).join('');
}

// API Functions
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
        },
        ...options
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Có lỗi xảy ra');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

async function register(username, password) {
    return await apiCall('/api/register', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

async function login(username, password) {
    const data = await apiCall('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    
    currentToken = data.token;
    currentUser = data.user;
    
    // Lưu token vào localStorage
    localStorage.setItem('token', currentToken);
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    return data;
}

async function getUserInfo() {
    const data = await apiCall('/api/user');
    currentUser = data;
    return data;
}

async function startCollection() {
    const data = await apiCall('/api/start-collection', {
        method: 'POST'
    });
    
    isCollecting = true;
    sessionCans = 0;
    sessionPoints = 0;
    
    return data;
}

async function endCollection() {
    const data = await apiCall('/api/end-collection', {
        method: 'POST'
    });
    
    isCollecting = false;
    
    // Cập nhật thông tin người dùng
    await getUserInfo();
    updateUserStats();
    
    return data;
}

async function redeemVoucher(voucherType) {
    const data = await apiCall('/api/redeem-voucher', {
        method: 'POST',
        body: JSON.stringify({ voucherType })
    });
    
    // Cập nhật thông tin người dùng
    await getUserInfo();
    updateUserStats();
    updateVoucherList();
    
    return data;
}

// Event Listeners
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchForm();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchForm();
});

// Login Form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
        setLoading(submitBtn, true);
        await login(username, password);
        
        // Chuyển sang dashboard
        authScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
        
        // Cập nhật thông tin
        updateUserStats();
        updateVoucherList();
        
        showMessage('Đăng nhập thành công!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoading(submitBtn, false);
    }
});

// Register Form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (password !== confirmPassword) {
        showMessage('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    try {
        setLoading(submitBtn, true);
        await register(username, password);
        
        showMessage('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        switchForm(); // Chuyển về form đăng nhập
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoading(submitBtn, false);
    }
});

// Dashboard Controls
document.getElementById('start-collection-btn').addEventListener('click', async () => {
    const btn = document.getElementById('start-collection-btn');
    const endBtn = document.getElementById('end-collection-btn');
    
    try {
        setLoading(btn, true);
        await startCollection();
        
        btn.classList.add('hidden');
        endBtn.classList.remove('hidden');
        
        showMessage('Đã bắt đầu thu gom! Máy đang hoạt động...', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoading(btn, false);
    }
});

document.getElementById('end-collection-btn').addEventListener('click', async () => {
    const btn = document.getElementById('end-collection-btn');
    const startBtn = document.getElementById('start-collection-btn');
    const resultDiv = document.getElementById('collection-result');
    
    try {
        setLoading(btn, true);
        const result = await endCollection();
        
        btn.classList.add('hidden');
        endBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        
        // Hiển thị kết quả
        document.getElementById('session-cans').textContent = result.totalCans;
        document.getElementById('session-points').textContent = result.points;
        resultDiv.classList.remove('hidden');
        
        showMessage('Đã kết thúc thu gom!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoading(btn, false);
    }
});

document.getElementById('confirm-btn').addEventListener('click', () => {
    document.getElementById('collection-result').classList.add('hidden');
    showMessage('Đã cập nhật thông tin thành công!', 'success');
});

// Voucher Redemption
document.getElementById('redeem-10k').addEventListener('click', async () => {
    const btn = document.getElementById('redeem-10k');
    
    try {
        setLoading(btn, true);
        await redeemVoucher('10k');
        showMessage('Đã đổi thành công voucher 10k VND!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoading(btn, false);
    }
});

document.getElementById('redeem-25k').addEventListener('click', async () => {
    const btn = document.getElementById('redeem-25k');
    
    try {
        setLoading(btn, true);
        await redeemVoucher('25k');
        showMessage('Đã đổi thành công voucher 25k VND!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoading(btn, false);
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    // Xóa token và thông tin người dùng
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    currentUser = null;
    currentToken = null;
    isCollecting = false;
    
    // Chuyển về màn hình đăng nhập
    dashboard.classList.add('hidden');
    authScreen.classList.remove('hidden');
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    
    showMessage('Đã đăng xuất thành công!', 'info');
});

// Lưu text gốc của các button
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.setAttribute('data-original-text', btn.textContent);
    });
    
    // Kiểm tra token đã lưu
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        try {
            currentToken = savedToken;
            currentUser = JSON.parse(savedUser);
            
            // Chuyển sang dashboard
            authScreen.classList.add('hidden');
            dashboard.classList.remove('hidden');
            
            // Cập nhật thông tin
            updateUserStats();
            updateVoucherList();
            
            // Kiểm tra token còn hợp lệ không
            getUserInfo().catch(() => {
                // Token không hợp lệ, xóa và chuyển về đăng nhập
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                dashboard.classList.add('hidden');
                authScreen.classList.remove('hidden');
            });
        } catch (error) {
            // Dữ liệu không hợp lệ, xóa
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
});

// Simulate IoT Integration (for testing)
// Trong thực tế, các API này sẽ được gọi từ hệ thống IoT
window.simulateCanDetection = async () => {
    if (!isCollecting) return;
    
    try {
        const response = await fetch('/api/can-detected', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ sessionId: Date.now() })
        });
        
        if (response.ok) {
            sessionCans++;
            sessionPoints++;
            showMessage(`Đã nhận lon nhôm! Tổng: ${sessionCans} lon`, 'success');
        }
    } catch (error) {
        console.error('Lỗi khi nhận lon:', error);
    }
};

window.simulateInvalidItem = async () => {
    if (!isCollecting) return;
    
    try {
        const response = await fetch('/api/invalid-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            showMessage('Vật không phải lon nhôm, đã nhả lại!', 'error');
        }
    } catch (error) {
        console.error('Lỗi khi xử lý vật không hợp lệ:', error);
    }
};

// Thêm console log để test
console.log('Để test IoT integration, sử dụng:');
console.log('window.simulateCanDetection() - Mô phỏng nhận lon nhôm');
console.log('window.simulateInvalidItem() - Mô phỏng vật không hợp lệ'); 