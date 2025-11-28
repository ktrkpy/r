// ข้อมูลผู้ใช้และระบบ
let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = localStorage.getItem('currentUser') || null;
let usedCodes = JSON.parse(localStorage.getItem('usedCodes')) || {};
let generatedCodes = JSON.parse(localStorage.getItem('generatedCodes')) || {};
let angpaos = JSON.parse(localStorage.getItem('angpaos')) || {};
let pendingPayments = JSON.parse(localStorage.getItem('pendingPayments')) || {};

// อัปเดต topupCodes ให้มีโค้ดใหม่
let topupCodes = JSON.parse(localStorage.getItem('topupCodes')) || {
    'CODE100': 100,
    'CODE500': 500,
    'CODE1000': 1000,
    '77฿': 77,
    'Aa': 10,
    'Bb': 20,
    '999i': 50
};

// ข้อมูลแอดมิน
const ADMIN_USERNAME = 'แอดมิน';
const ADMIN_PASSWORD = 'นุ';

// ข้อมูลไอดีสำหรับสุ่ม
const randomIds1 = [
    'เกลือ',
    'เกลือ',
    'เกลือ',
    'เกลือ',
    'เกลือ'
];

const randomIds2 = [
    'สินค้าหมด',
    'สินค้าหมด',
    'สินค้าหมด',
    'สินค้าหมด',
    'สินค้าหมด'
];

// ของดีพิเศษสำหรับไอดี 1฿
const specialItems = [
    '✨ LEGENDARY ACCOUNT - พิเศษสุดๆ ✨',
    '🌟 ULTRA RARE ACCOUNT - หายากมาก 🌟',
    '💎 DIAMOND ACCOUNT - มีค่ามาก 💎',
    '🔥 PREMIUM ACCOUNT - คุณภาพพรีเมียม 🔥',
    '🎯 PERFECT ACCOUNT - สมบูรณ์แบบ 🎯'
];

// เริ่มต้นระบบ
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    
    if (currentUser) {
        showUserInfo();
    } else {
        showLoginForm();
    }
});

// ฟังก์ชันเริ่มต้นแอป
function initializeApp() {
    if (!users[ADMIN_USERNAME]) {
        users[ADMIN_USERNAME] = {
            password: ADMIN_PASSWORD,
            balance: 999999,
            isAdmin: true
        };
        saveUsers();
    }
}

// ตั้งค่าตัวจัดการเหตุการณ์
function setupEventListeners() {
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('register-btn').addEventListener('click', showRegisterModal);
    document.getElementById('submit-register').addEventListener('click', register);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('topup-btn').addEventListener('click', showTopupModal);
    document.getElementById('submit-topup').addEventListener('click', processTopup);
    document.getElementById('angpao-btn').addEventListener('click', showAngpaoModal);
    document.getElementById('create-angpao').addEventListener('click', createAngpao);
    document.getElementById('cancel-payment').addEventListener('click', cancelPayment);
    document.getElementById('open-angpao').addEventListener('click', openAngpao);

    document.querySelectorAll('.topup-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.topup-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('topup-code').value = '';
        });
    });
    
    document.querySelectorAll('.angpao-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.angpao-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('custom-amount').value = '';
        });
    });
    
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const price = parseInt(this.getAttribute('data-price'));
            const type = this.getAttribute('data-type');
            purchaseItem(price, type);
        });
    });
    
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').classList.add('hidden');
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.add('hidden');
        }
    });
    
    document.getElementById('topup-code').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            processTopup();
        }
    });
    
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    document.getElementById('topup-modal').addEventListener('click', function() {
        showCodeInstructions();
    });
    
    checkPendingAngpaos();
}

// ฟังก์ชันเข้าสู่ระบบ
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
        return;
    }
    
    if (users[username] && users[username].password === password) {
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        showUserInfo();
        
        if (username === ADMIN_USERNAME) {
            alert('ยินดีต้อนรับแอดมิน! คุณมีสิทธิ์พิเศษในการจัดการระบบ');
        } else {
            alert('เข้าสู่ระบบสำเร็จ');
        }
        
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    } else {
        alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
}

// ฟังก์ชันสมัครสมาชิก
function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    
    if (!username || !password) {
        alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
        return;
    }
    
    if (username.length < 3) {
        alert('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
        return;
    }
    
    if (password.length < 4) {
        alert('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
        return;
    }
    
    if (users[username]) {
        alert('ชื่อผู้ใช้นี้มีอยู่แล้ว');
        return;
    }
    
    users[username] = {
        password: password,
        balance: 0,
        isAdmin: false,
        joinDate: new Date().toLocaleDateString('th-TH')
    };
    
    saveUsers();
    document.getElementById('register-modal').classList.add('hidden');
    alert('สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้เลย');
    
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
}

// ฟังก์ชันออกจากระบบ
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginForm();
    alert('ออกจากระบบสำเร็จ');
}

// ฟังก์ชันแสดงฟอร์มล็อกอิน
function showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('result-section').classList.add('hidden');
}

// ฟังก์ชันแสดงข้อมูลผู้ใช้
function showUserInfo() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    
    document.getElementById('display-username').textContent = currentUser;
    document.getElementById('balance-amount').textContent = users[currentUser].balance;
    
    if (users[currentUser].isAdmin) {
        document.getElementById('display-username').innerHTML = currentUser + ' <span style="color:gold;">👑</span>';
        addAdminButtons();
    }
    
    updateTransactionHistory();
}

// ฟังก์ชันแสดง Modal สมัครสมาชิก
function showRegisterModal() {
    document.getElementById('register-modal').classList.remove('hidden');
}

// ฟังก์ชันแสดง Modal เติมเงิน
function showTopupModal() {
    document.getElementById('topup-modal').classList.remove('hidden');
    document.getElementById('topup-code').value = '';
    document.querySelectorAll('.topup-option').forEach(opt => opt.classList.remove('active'));
    
    setTimeout(showCodeInstructions, 100);
}

// ฟังก์ชันแสดง Modal ส่งอั่งเปา
function showAngpaoModal() {
    if (!currentUser) {
        alert('กรุณาเข้าสู่ระบบก่อนส่งอั่งเปา');
        return;
    }
    
    document.getElementById('angpao-modal').classList.remove('hidden');
    document.querySelectorAll('.angpao-option').forEach(opt => opt.classList.remove('active'));
    document.getElementById('custom-amount').value = '';
    document.getElementById('angpao-message').value = '';
}

// ฟังก์ชันตรวจสอบโค้ดที่ใช้แล้ว
function isCodeUsed(code, username) {
    const codeKey = `${code}_${username}`;
    return usedCodes[codeKey] === true;
}

// ฟังก์ชันบันทึกโค้ดที่ใช้แล้ว
function markCodeAsUsed(code, username) {
    const codeKey = `${code}_${username}`;
    usedCodes[codeKey] = true;
    localStorage.setItem('usedCodes', JSON.stringify(usedCodes));
}

// ฟังก์ชันเติมเงิน
function processTopup() {
    let amount = 0;
    let method = '';
    let code = '';
    
    const selectedOption = document.querySelector('.topup-option.active');
    if (selectedOption) {
        amount = parseInt(selectedOption.getAttribute('data-amount'));
        method = 'qr';
    } else {
        code = document.getElementById('topup-code').value;
        if (!code) {
            alert('กรุณาเลือกจำนวนเงินหรือกรอกรหัสเติมเงิน');
            return;
        }
        
        const timedCodeResult = useTimedCode(code, currentUser);
        if (timedCodeResult.success) {
            users[currentUser].balance += timedCodeResult.amount;
            saveUsers();
            document.getElementById('topup-modal').classList.add('hidden');
            document.getElementById('topup-code').value = '';
            showUserInfo();
            
            addTransaction('เติมเงิน', timedCodeResult.amount, 'credit', `ใช้โค้ดเวลา: ${code}`);
            alert(`🎉 ${timedCodeResult.message}\nยอดเงินปัจจุบัน: ${users[currentUser].balance}฿`);
            return;
        }
        
        if (isCodeUsed(code, currentUser)) {
            alert('❌ คุณใช้โค้ดนี้ไปแล้ว ไม่สามารถใช้ซ้ำได้');
            return;
        }
        
        const codeUpper = code.toUpperCase();
        let foundCode = null;
        
        for (const [key, value] of Object.entries(topupCodes)) {
            if (key.toUpperCase() === codeUpper) {
                foundCode = key;
                amount = value;
                method = 'code';
                break;
            }
        }
        
        if (!foundCode) {
            alert('❌ รหัสเติมเงินไม่ถูกต้อง');
            return;
        }
    }
    
    if (method === 'qr') {
        startQRPayment(amount);
    } else {
        users[currentUser].balance += amount;
        markCodeAsUsed(code, currentUser);
        saveUsers();
        document.getElementById('topup-modal').classList.add('hidden');
        document.getElementById('topup-code').value = '';
        showUserInfo();
        
        addTransaction('เติมเงิน', amount, 'credit', `ใช้รหัส: ${code}`);
        alert(`🎉 เติมเงินสำเร็จ ${amount}฿ 🎉\nยอดเงินปัจจุบัน: ${users[currentUser].balance}฿`);
    }
}

// ฟังก์ชันเริ่มชำระเงินผ่าน QR Code
function startQRPayment(amount) {
    const paymentId = 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    const promptpayData = generatePromptPayData(amount, paymentId);
    
    QRCode.toCanvas(promptpayData, { 
        width: 250, 
        height: 250,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, function(err, canvas) {
        if (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการสร้าง QR Code');
            return;
        }
        
        canvas.style.border = '10px solid white';
        canvas.style.borderRadius = '10px';
        canvas.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        qrContainer.appendChild(canvas);
    });
    
    document.getElementById('qr-amount').textContent = amount;
    document.getElementById('qr-ref').textContent = paymentId;
    
    pendingPayments[paymentId] = {
        amount: amount,
        userId: currentUser,
        timestamp: Date.now(),
        status: 'pending'
    };
    savePendingPayments();
    
    document.getElementById('topup-modal').classList.add('hidden');
    document.getElementById('qr-modal').classList.remove('hidden');
    
    simulatePaymentVerification(paymentId, amount);
}

// ฟังก์ชันสร้างข้อมูล PromptPay
function generatePromptPayData(amount, referenceId) {
    const promptpayId = '0801234567';
    const accountName = 'นาย อนุวัฒน์ หาววิสัย';
    const accountNumber = 'XXX-X-X7897-X';
    
    const qrData = {
        version: '000201',
        mode: '010211',
        merchant: '0016A000000677010111',
        currency: '015303764',
        amount: `54${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}`,
        country: '0158TH',
        merchantName: '0106' + Buffer.from('ไก่ตัน').toString('hex').toUpperCase(),
        merchantCity: '0209BANGKOK',
        postalCode: '030610100',
        acquirer: '0016A000000677010111',
        merchantId: '0215' + promptpayId,
        reference: `0309${referenceId}`,
        terminal: '0708KPLUS001'
    };
    
    let qrString = '';
    for (const [key, value] of Object.entries(qrData)) {
        qrString += value;
    }
    qrString += '6304';
    qrString += 'ABCD';
    
    return qrString;
}

// ฟังก์ชันจำลองการตรวจสอบการชำระเงิน
function simulatePaymentVerification(paymentId, amount) {
    let progress = 0;
    const progressBar = document.querySelector('.loading-progress');
    const statusText = document.querySelector('#payment-status p');
    
    const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            
            if (Math.random() < 0.8) {
                statusText.innerHTML = '✅ ชำระเงินสำเร็จ!';
                statusText.style.color = '#4CAF50';
                
                users[currentUser].balance += amount;
                saveUsers();
                showUserInfo();
                
                pendingPayments[paymentId].status = 'completed';
                savePendingPayments();
                
                addTransaction('เติมเงิน', amount, 'credit', `QR Payment: ${paymentId}`);
                
                setTimeout(() => {
                    document.getElementById('qr-modal').classList.add('hidden');
                    alert(`🎉 เติมเงินสำเร็จ ${amount}฿ 🎉\nยอดเงินปัจจุบัน: ${users[currentUser].balance}฿`);
                }, 2000);
            } else {
                statusText.innerHTML = '❌ ชำระเงินไม่สำเร็จ';
                statusText.style.color = '#f44336';
                
                pendingPayments[paymentId].status = 'failed';
                savePendingPayments();
            }
        }
    }, 500);
    
    pendingPayments[paymentId].interval = interval;
    savePendingPayments();
}

// ฟังก์ชันยกเลิกการชำระเงิน
function cancelPayment() {
    const paymentId = document.getElementById('qr-ref').textContent;
    
    if (pendingPayments[paymentId] && pendingPayments[paymentId].interval) {
        clearInterval(pendingPayments[paymentId].interval);
    }
    
    delete pendingPayments[paymentId];
    savePendingPayments();
    
    document.getElementById('qr-modal').classList.add('hidden');
    alert('ยกเลิกการชำระเงินแล้ว');
}

// ฟังก์ชันสร้างอั่งเปา
function createAngpao() {
    let amount = 0;
    
    const selectedOption = document.querySelector('.angpao-option.active');
    if (selectedOption) {
        amount = parseInt(selectedOption.getAttribute('data-amount'));
    } else {
        amount = parseInt(document.getElementById('custom-amount').value);
        if (!amount || amount < 1 || amount > 1000) {
            alert('กรุณาเลือกจำนวนเงินหรือกำหนดจำนวนระหว่าง 1-1000 บาท');
            return;
        }
    }
    
    if (users[currentUser].balance < amount) {
        alert(`ยอดเงินไม่เพียงพอ\nต้องการ: ${amount}฿\nยอดเงินปัจจุบัน: ${users[currentUser].balance}฿`);
        return;
    }
    
    const message = document.getElementById('angpao-message').value || 'ขอให้โชคดี!';
    const angpaoId = 'ANGPAO_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    angpaos[angpaoId] = {
        id: angpaoId,
        sender: currentUser,
        amount: amount,
        message: message,
        createdAt: Date.now(),
        isOpened: false,
        receiver: null
    };
    
    users[currentUser].balance -= amount;
    saveUsers();
    saveAngpaos();
    
    addTransaction('ส่งอั่งเปา', amount, 'debit', `Angpao: ${angpaoId}`);
    
    document.getElementById('angpao-modal').classList.add('hidden');
    showUserInfo();
    
    const shareLink = `${window.location.origin}${window.location.pathname}?angpao=${angpaoId}`;
    
    alert(`🎊 สร้างอั่งเปาสำเร็จ! 🎊
💰 จำนวน: ${amount}฿
📝 ข้อความ: ${message}

ลิงก์สำหรับแชร์:
${shareLink}

(คัดลอกลิงก์นี้ส่งให้เพื่อนได้เลย)`);
}

// ฟังก์ชันเปิดอั่งเปา
function openAngpao() {
    const urlParams = new URLSearchParams(window.location.search);
    const angpaoId = urlParams.get('angpao');
    
    if (!angpaoId || !angpaos[angpaoId]) {
        alert('ไม่พบอั่งเปาหรืออั่งเปาถูกเปิดแล้ว');
        return;
    }
    
    const angpao = angpaos[angpaoId];
    
    if (angpao.isOpened) {
        alert('อั่งเปานี้ถูกเปิดแล้ว');
        return;
    }
    
    if (angpao.sender === currentUser) {
        alert('คุณไม่สามารถเปิดอั่งเปาของตัวเองได้');
        return;
    }
    
    users[currentUser].balance += angpao.amount;
    angpao.isOpened = true;
    angpao.receiver = currentUser;
    angpao.openedAt = Date.now();
    
    saveUsers();
    saveAngpaos();
    
    addTransaction('รับอั่งเปา', angpao.amount, 'credit', `จาก: ${angpao.sender}`);
    
    document.getElementById('sender-name').textContent = angpao.sender;
    document.getElementById('amount-value').textContent = angpao.amount;
    document.getElementById('message-text').textContent = angpao.message;
    
    document.getElementById('receive-angpao-modal').classList.remove('hidden');
    showUserInfo();
    
    alert(`🎉 รับอั่งเปาสำเร็จ! 🎉\nได้รับ: ${angpao.amount}฿`);
}

// ฟังก์ชันตรวจสอบอั่งเปาที่ยังไม่เปิด
function checkPendingAngpaos() {
    const urlParams = new URLSearchParams(window.location.search);
    const angpaoId = urlParams.get('angpao');
    
    if (angpaoId && angpaos[angpaoId] && !angpaos[angpaoId].isOpened && angpaos[angpaoId].sender !== currentUser) {
        document.getElementById('sender-name').textContent = angpaos[angpaoId].sender;
        document.getElementById('amount-value').textContent = angpaos[angpaoId].amount;
        document.getElementById('message-text').textContent = angpaos[angpaoId].message;
        document.getElementById('receive-angpao-modal').classList.remove('hidden');
    }
}

// ฟังก์ชันซื้อสินค้า
function purchaseItem(price, type) {
    if (!currentUser) {
        alert('กรุณาเข้าสู่ระบบก่อนซื้อสินค้า');
        return;
    }
    
    if (users[currentUser].balance < price) {
        alert(`ยอดเงินไม่เพียงพอ\nต้องการ: ${price}฿\nยอดเงินปัจจุบัน: ${users[currentUser].balance}฿`);
        return;
    }
    
    const itemName = type === 'id1' ? 'สุ่มไอดี 1฿' : 'สุ่มไอดีไม่มีเกลือ';
    if (!confirm(`ยืนยันการซื้อ ${itemName} ราคา ${price}฿?`)) {
        return;
    }
    
    users[currentUser].balance -= price;
    saveUsers();
    showUserInfo();
    
    let randomId;
    let isSpecial = false;
    
    if (type === 'id1') {
        const chance = Math.random() * 100000;
        
        if (chance < 1) {
            randomId = specialItems[Math.floor(Math.random() * specialItems.length)];
            isSpecial = true;
            
            if (!users[currentUser].specialWins) {
                users[currentUser].specialWins = 0;
            }
            users[currentUser].specialWins++;
            saveUsers();
        } else {
            randomId = randomIds1[Math.floor(Math.random() * randomIds1.length)];
        }
    } else {
        randomId = randomIds2[Math.floor(Math.random() * randomIds2.length)];
    }
    
    document.getElementById('result-section').classList.remove('hidden');
    
    if (isSpecial) {
        document.getElementById('result-content').innerHTML = `
            <div class="special-result">
                <h3 style="color: gold; text-align: center;">🎉 CONGRATULATIONS! 🎉</h3>
                <p style="text-align: center; font-size: 1.2rem;">คุณได้รับของดีพิเศษ!</p>
                <p style="text-align: center; font-weight: bold; color: gold; font-size: 1.3rem;">${randomId}</p>
                <p style="text-align: center;">โอกาสได้เพียง 0.001% เท่านั้น!</p>
                <p style="text-align: center;">ราคา: ${price}฿</p>
                <p style="text-align: center;">ยอดเงินคงเหลือ: ${users[currentUser].balance}฿</p>
                ${users[currentUser].specialWins > 1 ? 
                    `<p style="text-align: center; color: lightgreen;">คุณได้ของดีแล้ว ${users[currentUser].specialWins} ครั้ง!</p>` : 
                    ''}
            </div>
        `;
        
        playSpecialSound();
    } else {
        document.getElementById('result-content').innerHTML = `
            <p>📦 คุณได้รับ: <strong>${randomId}</strong></p>
            <p>💰 ราคา: ${price}฿</p>
            <p>💳 ยอดเงินคงเหลือ: ${users[currentUser].balance}฿</p>
            ${type === 'id1' ? '<p>🎯 โอกาสได้ของดี:51%</p>' : ''}
        `;
    }
    
    addTransaction(`ซื้อ${itemName}`, price, 'debit', `ได้รับ: ${randomId}`);
    
    document.getElementById('result-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// ฟังก์ชันเล่นเสียงเมื่อได้ของดี
function playSpecialSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('ไม่สามารถเล่นเสียงได้');
    }
}

// ฟังก์ชันบันทึกประวัติการทำรายการ
function addTransaction(description, amount, type, note = '') {
    if (!users[currentUser].transactions) {
        users[currentUser].transactions = [];
    }
    
    const transaction = {
        id: 'TXN_' + Date.now(),
        description: description,
        amount: amount,
        type: type,
        note: note,
        timestamp: Date.now(),
        date: new Date().toLocaleString('th-TH')
    };
    
    users[currentUser].transactions.unshift(transaction);
    
    if (users[currentUser].transactions.length > 50) {
        users[currentUser].transactions = users[currentUser].transactions.slice(0, 50);
    }
    
    saveUsers();
    updateTransactionHistory();
}

// ฟังก์ชันอัพเดทประวัติการทำรายการ
function updateTransactionHistory() {
    const transactionList = document.getElementById('transaction-list');
    const transactions = users[currentUser].transactions || [];
    
    if (transactions.length === 0) {
        transactionList.innerHTML = '<p>ยังไม่มีประวัติการทำรายการ</p>';
        return;
    }
    
    transactionList.innerHTML = transactions.map(transaction => `
        <div class="transaction-item ${transaction.type === 'credit' ? 'transaction-credit' : 'transaction-debit'}">
            <div>
                <strong>${transaction.description}</strong>
                <span class="transaction-amount ${transaction.type === 'credit' ? 'text-success' : 'text-danger'}">
                    ${transaction.type === 'credit' ? '+' : '-'}${transaction.amount}฿
                </span>
            </div>
            <small>${transaction.date}</small>
            ${transaction.note ? `<br><small>${transaction.note}</small>` : ''}
        </div>
    `).join('');
    
    document.getElementById('transaction-history').classList.remove('hidden');
}

// ฟังก์ชันบันทึกข้อมูล
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveAngpaos() {
    localStorage.setItem('angpaos', JSON.stringify(angpaos));
}

function savePendingPayments() {
    localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
}

// ==================== ระบบโค้ดเวลา ====================

// ฟังก์ชันสร้างโค้ดแบบสุ่ม
function generateRandomCode(length = 4) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ฟังก์ชันสร้างโค้ดพร้อมเวลา
function createTimedCode(amount, expiresInHours = 24, code = null) {
    const codeValue = code || generateRandomCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    
    const timedCode = {
        code: codeValue,
        amount: amount,
        createdAt: now.getTime(),
        expiresAt: expiresAt.getTime(),
        expiresInHours: expiresInHours,
        isUsed: false,
        usedBy: null,
        usedAt: null
    };
    
    generatedCodes[codeValue] = timedCode;
    localStorage.setItem('generatedCodes', JSON.stringify(generatedCodes));
    
    return timedCode;
}

// ฟังก์ชันตรวจสอบโค้ดแบบมีเวลา
function isValidTimedCode(code, username) {
    const timedCode = generatedCodes[code];
    
    if (!timedCode) {
        return { valid: false, reason: 'ไม่พบโค้ด' };
    }
    
    if (timedCode.isUsed) {
        return { valid: false, reason: 'โค้ดนี้ถูกใช้ไปแล้ว' };
    }
    
    const now = new Date().getTime();
    if (now > timedCode.expiresAt) {
        return { valid: false, reason: 'โค้ดหมดอายุ' };
    }
    
    if (isCodeUsed(code, username)) {
        return { valid: false, reason: 'คุณใช้โค้ดนี้ไปแล้ว' };
    }
    
    return { valid: true, code: timedCode };
}

// ฟังก์ชันใช้โค้ดแบบมีเวลา
function useTimedCode(code, username) {
    const validation = isValidTimedCode(code, username);
    
    if (!validation.valid) {
        return { success: false, message: validation.reason };
    }
    
    const timedCode = validation.code;
    
    timedCode.isUsed = true;
    timedCode.usedBy = username;
    timedCode.usedAt = new Date().getTime();
    
    markCodeAsUsed(code, username);
    
    localStorage.setItem('generatedCodes', JSON.stringify(generatedCodes));
    
    return { 
        success: true, 
        message: `ใช้โค้ดสำเร็จ! ได้รับ ${timedCode.amount}฿`,
        amount: timedCode.amount 
    };
}

// ฟังก์ชันสร้างโค้ดหลายๆ อันพร้อมกัน
function generateBulkCodes(amount, count, expiresInHours = 24) {
    if (currentUser !== ADMIN_USERNAME) {
        alert('เฉพาะแอดมินเท่านั้นที่สามารถสร้างโค้ดได้');
        return;
    }
    
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = createTimedCode(amount, expiresInHours);
        codes.push(code);
    }
    
    let message = `🎊 สร้างโค้ดสำเร็จ ${count} รหัส\n💰 มูลค่า: ${amount}฿\n⏰ หมดอายุใน: ${expiresInHours} ชั่วโมง\n\n`;
    message += '📋 รายการโค้ด:\n';
    codes.forEach((code, index) => {
        message += `${index + 1}. ${code.code}\n`;
    });
    
    alert(message);
    return codes;
}

// ฟังก์ชันดูโค้ดทั้งหมดที่สร้าง
function viewAllGeneratedCodes() {
    if (currentUser !== ADMIN_USERNAME) {
        alert('เฉพาะแอดมินเท่านั้นที่สามารถดูโค้ดได้');
        return;
    }
    
    let activeCodes = [];
    let usedCodes = [];
    let expiredCodes = [];
    const now = new Date().getTime();
    
    for (const [code, data] of Object.entries(generatedCodes)) {
        if (data.isUsed) {
            usedCodes.push(data);
        } else if (now > data.expiresAt) {
            expiredCodes.push(data);
        } else {
            activeCodes.push(data);
        }
    }
    
    let message = '📊 สถิติโค้ดทั้งหมด\n\n';
    
    message += `🟢 ใช้งานได้: ${activeCodes.length} รหัส\n`;
    message += `🔴 ใช้แล้ว: ${usedCodes.length} รหัส\n`;
    message += `⚫ หมดอายุ: ${expiredCodes.length} รหัส\n\n`;
    
    if (activeCodes.length > 0) {
        message += '📋 โค้ดที่ใช้งานได้:\n';
        activeCodes.forEach((code, index) => {
            const expiresIn = Math.ceil((code.expiresAt - now) / (60 * 60 * 1000));
            message += `${index + 1}. ${code.code} - ${code.amount}฿ (เหลือ ${expiresIn} ชม.)\n`;
        });
    }
    
    console.log(message);
    alert(message);
}

// ฟังก์ชันลบโค้ดที่หมดอายุแล้ว
function cleanupExpiredCodes() {
    const now = new Date().getTime();
    let deletedCount = 0;
    
    for (const [code, data] of Object.entries(generatedCodes)) {
        if (now > data.expiresAt && !data.isUsed) {
            delete generatedCodes[code];
            deletedCount++;
        }
    }
    
    localStorage.setItem('generatedCodes', JSON.stringify(generatedCodes));
    
    if (deletedCount > 0) {
        alert(`🧹 ลบโค้ดหมดอายุแล้ว ${deletedCount} รหัส`);
    } else {
        alert('✅ ไม่มีโค้ดหมดอายุที่ต้องลบ');
    }
}

// ฟังก์ชันสร้างโค้ดแบบกำหนดเอง
function generateCustomCodes() {
    if (currentUser !== ADMIN_USERNAME) {
        alert('เฉพาะแอดมินเท่านั้นที่สามารถสร้างโค้ดได้');
        return;
    }
    
    const amount = parseInt(document.getElementById('code-amount').value);
    const count = parseInt(document.getElementById('code-count').value);
    const expiresInHours = parseInt(document.getElementById('code-expires').value);
    const customCode = document.getElementById('custom-code').value;
    
    if (!amount || amount < 1) {
        alert('กรุณากรอกจำนวนเงินที่ถูกต้อง');
        return;
    }
    
    if (!count || count < 1 || count > 20) {
        alert('กรุณากรอกจำนวนโค้ดระหว่าง 1-20');
        return;
    }
    
    const codes = [];
    
    if (customCode) {
        const code = createTimedCode(amount, expiresInHours, customCode);
        codes.push(code);
    } else {
        for (let i = 0; i < count; i++) {
            const code = createTimedCode(amount, expiresInHours);
            codes.push(code);
        }
    }
    
    const resultDiv = document.getElementById('generated-codes-result');
    const codesList = document.getElementById('codes-list');
    
    codesList.innerHTML = codes.map((code, index) => 
        `<div>${index + 1}. ${code.code} - ${code.amount}฿ (หมดอายุใน ${expiresInHours} ชม.)</div>`
    ).join('');
    
    resultDiv.style.display = 'block';
    
    alert(`สร้างโค้ดสำเร็จ ${codes.length} รหัส`);
}

// อัพเดทคำแนะนำโค้ด
function showCodeInstructions() {
    const codeInstructions = document.getElementById('code-instructions');
    if (!codeInstructions) {
        const instructions = document.createElement('div');
        instructions.id = 'code-instructions';
        instructions.innerHTML = `
            <div style="background: #2c3e50; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 0.9rem;">
                <strong>📋 รหัสเติมเงิน:</strong><br>
                <div style="margin: 8px 0;">
                    <strong>🔸 โค้ดถาวร:</strong><br>
                    🔹 Aa - 10฿<br>
                    🔹 Bb - 20฿<br>
                    🔹 999i - 50฿<br>
                    🔹 77฿ - 77฿<br>
                    🔹 CODE100 - 100฿<br>
                    🔹 CODE500 - 500฿<br>
                    🔹 CODE1000 - 1000฿<br>
                </div>
                <div style="margin: 8px 0;">
                    <strong>🔸 โค้ดเวลา:</strong><br>
                    ⏰ ใช้งานได้ตามเวลาที่กำหนด<br>
                    🎯 แต่ละคนใช้ได้ 1 ครั้ง<br>
                    ⚠️ หมดอายุอัตโนมัติ
                </div>
                <small>⚠️ แต่ละโค้ดใช้ได้คนละ 1 ครั้งเท่านั้น</small>
            </div>
        `;
        document.querySelector('#topup-modal .modal-content').appendChild(instructions);
    }
}

// ฟังก์ชันตรวจสอบโค้ดที่ใช้ได้
function checkMyUsedCodes() {
    if (!currentUser) return;
    
    let myUsedCodes = [];
    let availableCodes = [];
    
    for (const [codeKey, isUsed] of Object.entries(usedCodes)) {
        if (codeKey.endsWith(`_${currentUser}`)) {
            const code = codeKey.split('_')[0];
            myUsedCodes.push(code);
        }
    }
    
    for (const code of Object.keys(topupCodes)) {
        if (!isCodeUsed(code, currentUser)) {
            availableCodes.push(`${code} (${topupCodes[code]}฿)`);
        }
    }
    
    const now = new Date().getTime();
    for (const [code, data] of Object.entries(generatedCodes)) {
        if (!data.isUsed && now < data.expiresAt && !isCodeUsed(code, currentUser)) {
            availableCodes.push(`${code} (${data.amount}฿)`);
        }
    }
    
    const message = `📋 สถานะโค้ดของคุณ:
    
✅ ใช้แล้ว: ${myUsedCodes.length > 0 ? myUsedCodes.join(', ') : 'ยังไม่มี'}
🎯 ใช้ได้: ${availableCodes.length > 0 ? availableCodes.join(', ') : 'ไม่มีโค้ดที่ใช้ได้'}

⚠️ แต่ละโค้ดใช้ได้ครั้งเดียวเท่านั้น`;

    alert(message);
}

// ฟังก์ชันแสดงรายการโค้ดที่ใช้แล้ว
function showUsedCodes() {
    if (currentUser === ADMIN_USERNAME) {
        console.log('=== โค้ดที่ใช้แล้ว ===');
        let userCodes = {};
        
        for (const [codeKey, isUsed] of Object.entries(usedCodes)) {
            const [code, username] = codeKey.split('_');
            if (!userCodes[username]) {
                userCodes[username] = [];
            }
            userCodes[username].push(code);
        }
        
        for (const [username, codes] of Object.entries(userCodes)) {
            console.log(`ผู้ใช้: ${username}, โค้ดที่ใช้แล้ว: ${codes.join(', ')}`);
        }
    }
}

// ฟังก์ชันรีเซ็ตโค้ดผู้ใช้
function resetUserCodes(username) {
    if (currentUser === ADMIN_USERNAME) {
        for (const codeKey in usedCodes) {
            if (codeKey.endsWith(`_${username}`)) {
                delete usedCodes[codeKey];
            }
        }
        localStorage.setItem('usedCodes', JSON.stringify(usedCodes));
        alert(`รีเซ็ตโค้ดสำหรับผู้ใช้ ${username} สำเร็จ`);
    }
}

// เพิ่มปุ่มสำหรับแอดมินใน user-info
function addAdminButtons() {
    if (currentUser === ADMIN_USERNAME) {
        const adminSection = document.createElement('div');
        adminSection.style.marginTop = '10px';
        adminSection.style.padding = '10px';
        adminSection.style.background = 'rgba(255,255,255,0.1)';
        adminSection.style.borderRadius = '5px';
        adminSection.innerHTML = `
            <strong style="color: gold;">👑 แอดมิน</strong><br>
            <button onclick="generateBulkCodes(50, 5, 24)">สร้างโค้ด 50฿ (5 รหัส)</button>
            <button onclick="generateBulkCodes(100, 3, 48)">สร้างโค้ด 100฿ (3 รหัส)</button>
            <button onclick="viewAllGeneratedCodes()">ดูโค้ดทั้งหมด</button>
            <button onclick="cleanupExpiredCodes()">ลบโค้ดหมดอายุ</button>
            <button onclick="document.getElementById('generate-code-modal').classList.remove('hidden')">สร้างโค้ดแบบกำหนดเอง</button>
        `;
        document.getElementById('user-info').appendChild(adminSection);
    }
}

// ทำให้ฟังก์ชันสามารถเรียกใช้จาก console ได้
window.generateRandomCode = generateRandomCode;
window.createTimedCode = createTimedCode;
window.generateBulkCodes = generateBulkCodes;
window.viewAllGeneratedCodes = viewAllGeneratedCodes;
window.cleanupExpiredCodes = cleanupExpiredCodes;
window.checkMyUsedCodes = checkMyUsedCodes;
window.showUsedCodes = showUsedCodes;
window.resetUserCodes = resetUserCodes;
window.generateCustomCodes = generateCustomCodes;