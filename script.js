// د Firebase تنظیمات
const firebaseConfig = {
    apiKey: "AIzaSyCvc70nVQEzcV7zUdKO5Xr4S8MyOvgHjyA",
    authDomain: "newairdrop-2024.firebaseapp.com",
    databaseURL: "https://newairdrop-2024-default-rtdb.firebaseio.com",
    projectId: "newairdrop-2024",
    storageBucket: "newairdrop-2024.firebasestorage.app",
    messagingSenderId: "1042065781050",
    appId: "1:1042065781050:web:2d01a3d52b3eece348a003",
    measurementId: "G-ZWY94C3KDC"
};

// Firebase پیل کول
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// د Telegram Web App تنظیمات
let tg = window.Telegram.WebApp;
tg.expand();

// د اپلیکیشن حالتونه
let userData = {
    userId: null,
    username: "User",
    avatar: "assets/default-avatar.png",
    walletAddress: null,
    walletConnected: false,
    balance: 0,
    referrals: 0,
    referralEarnings: 0,
    lastCheck: null,
    currentStreak: 0,
    referralCode: null
};

// د ورځنی چیک ارزښتونه
const DAILY_REWARDS = [10, 15, 25, 50, 85, 120, 235];
const REFERRAL_REWARD = 125;

// د اپلیکیشن پیل کول
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// د اپلیکیشن پیلول
async function initializeApp() {
    showLoading(true);
    
    // د Telegram معلومات ترلاسه کول
    if (tg.initDataUnsafe.user) {
        const tgUser = tg.initDataUnsafe.user;
        userData.userId = tgUser.id;
        userData.username = tgUser.username || `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`;
        userData.avatar = tgUser.photo_url || "assets/default-avatar.png";
        
        // د ریفریل کوډ چیک کول
        const startParam = tg.initDataUnsafe.start_param;
        if (startParam && startParam.startsWith("ref_")) {
            const referrerId = startParam.replace("ref_", "");
            handleReferral(referrerId);
        }
        
        // د کارن ریفریل کوډ جوړول
        userData.referralCode = `ref_${userData.userId}`;
    }
    
    // د UI په اپډیټ کول
    updateUserInfo();
    
    // د Firebase څخه معلومات ترلاسه کول
    await loadUserData();
    
    // د UI تازه کول
    updateUI();
    
    // لوډینګ بندول
    setTimeout(() => {
        showLoading(false);
        setupEventListeners();
        showMessage("Welcome to MetaX Coin Airdrop!", "success");
    }, 1500);
}

// د کارن معلومات Firebase څخه ترلاسه کول
async function loadUserData() {
    if (!userData.userId) return;
    
    try {
        const userRef = database.ref(`users/${userData.userId}`);
        const snapshot = await userRef.once('value');
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            userData.balance = data.balance || 0;
            userData.referrals = data.referrals || 0;
            userData.referralEarnings = data.referralEarnings || 0;
            userData.lastCheck = data.lastCheck;
            userData.currentStreak = data.currentStreak || 0;
            userData.walletAddress = data.walletAddress;
            userData.walletConnected = !!data.walletAddress;
            
            // د والیت معلومات تازه کول که چیرې شتون ولري
            if (userData.walletConnected && data.tonBalance) {
                document.getElementById('walletBalance').textContent = `${data.tonBalance} TON`;
            }
        } else {
            // نوی کارن ثبت کول
            await userRef.set({
                userId: userData.userId,
                username: userData.username,
                balance: 0,
                referrals: 0,
                referralEarnings: 0,
                lastCheck: null,
                currentStreak: 0,
                walletAddress: null,
                joinedAt: new Date().toISOString(),
                referralCode: userData.referralCode
            });
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        showMessage("Error loading data. Please try again.", "error");
    }
}

// د کارن معلومات په UI کې ښودل
function updateUserInfo() {
    document.getElementById('username').textContent = userData.username;
    document.getElementById('userAvatar').src = userData.avatar;
    
    // د ریفریل لینک تازه کول
    const referralLink = `https://t.me/TestingMinerBot?startapp=${userData.referralCode}`;
    document.getElementById('referralLink').value = referralLink;
}

// د UI تازه کول
function updateUI() {
    // د بالانس تازه کول
    document.getElementById('tokenBalance').textContent = userData.balance;
    document.getElementById('referralCount').textContent = userData.referrals;
    document.getElementById('referralEarnings').textContent = userData.referralEarnings;
    
    // د USD ارزښت حساب کول
    const usdValue = (userData.balance * 0.02).toFixed(2);
    document.getElementById('usdValue').textContent = usdValue;
    
    // د والیت حالت تازه کول
    if (userData.walletConnected) {
        document.getElementById('connectWalletBtn').style.display = 'none';
        document.getElementById('walletInfo').style.display = 'block';
        
        if (userData.walletAddress) {
            const shortAddress = `${userData.walletAddress.substring(0, 6)}...${userData.walletAddress.substring(userData.walletAddress.length - 4)}`;
            document.getElementById('walletAddress').textContent = shortAddress;
            document.getElementById('dailyCheckBtn').disabled = false;
            document.getElementById('checkInfo').textContent = "Ready to claim daily reward";
        }
    } else {
        document.getElementById('connectWalletBtn').style.display = 'flex';
        document.getElementById('walletInfo').style.display = 'none';
        document.getElementById('dailyCheckBtn').disabled = true;
        document.getElementById('checkInfo').textContent = "Connect wallet to start daily check";
    }
    
    // د ورځنی چیک پروګرس تازه کول
    updateDailyCheckProgress();
}

// د ورځنی چیک پروګرس تازه کول
function updateDailyCheckProgress() {
    const days = document.querySelectorAll('.day');
    
    // ټولې ورځې غیر فعال کول
    days.forEach(day => day.classList.remove('active'));
    
    // فعاله ورځې ښودل
    for (let i = 0; i < userData.currentStreak; i++) {
        if (days[i]) {
            days[i].classList.add('active');
        }
    }
    
    // د چیک تازه کول
    const today = new Date().toDateString();
    const canCheckToday = !userData.lastCheck || new Date(userData.lastCheck).toDateString() !== today;
    
    if (canCheckToday && userData.walletConnected) {
        document.getElementById('dailyCheckBtn').disabled = false;
        document.getElementById('checkInfo').textContent = `Today's reward: ${DAILY_REWARDS[userData.currentStreak] || DAILY_REWARDS[0]} tokens`;
    } else if (userData.lastCheck) {
        document.getElementById('dailyCheckBtn').disabled = true;
        document.getElementById('checkInfo').textContent = "Daily reward already claimed today";
    }
}

// د ایونت لیسنر تنظیمول
function setupEventListeners() {
    // د والیت کنکټ بټن
    document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
    
    // د ورځنی چیک بټن
    document.getElementById('dailyCheckBtn').addEventListener('click', claimDailyReward);
    
    // د کاپي لینک بټن
    document.getElementById('copyLinkBtn').addEventListener('click', copyReferralLink);
    
    // د Telegram والیت پیښې
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.onEvent('walletDataChanged', handleWalletData);
    }
}

// د والیت سره وصل کول
function connectWallet() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.openWallet();
    } else {
        // د ټیسټ والیت
        simulateWalletConnection();
    }
}

// د والیت معلومات پروسیس کول
function handleWalletData(data) {
    if (data && data.address) {
        userData.walletAddress = data.address;
        userData.walletConnected = true;
        
        // په Firebase کې ذخیره کول
        saveUserData();
        
        // UI تازه کول
        updateUI();
        
        showMessage("Wallet connected successfully!", "success");
    }
}

// د ټیسټ والیت وصل کول
function simulateWalletConnection() {
    // د ټیسټ والیت ادرس
    const testAddress = "EQ" + Array.from({length: 48}, () => 
        "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16))
    ).join("");
    
    userData.walletAddress = testAddress;
    userData.walletConnected = true;
    
    // په Firebase کې ذخیره کول
    saveUserData();
    
    // UI تازه کول
    updateUI();
    
    showMessage("Test wallet connected successfully!", "success");
}

// ورځنی چیک ترسره کول
async function claimDailyReward() {
    if (!userData.walletConnected) {
        showMessage("Please connect your wallet first", "error");
        return;
    }
    
    const today = new Date().toDateString();
    const lastCheck = userData.lastCheck ? new Date(userData.lastCheck).toDateString() : null;
    
    // که نن ورځ چیک شوی وي
    if (lastCheck === today) {
        showMessage("You have already claimed today's reward", "error");
        return;
    }
    
    // د ورځنی سټریک حساب کول
    let streak = userData.currentStreak;
    if (!lastCheck) {
        streak = 1;
    } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (new Date(userData.lastCheck).toDateString() === yesterday.toDateString()) {
            streak = Math.min(streak + 1, 7);
        } else {
            streak = 1;
        }
    }
    
    // د انعام ارزښت
    const reward = DAILY_REWARDS[streak - 1] || DAILY_REWARDS[0];
    
    // د بالانس تازه کول
    userData.balance += reward;
    userData.lastCheck = new Date().toISOString();
    userData.currentStreak = streak;
    
    // په Firebase کې ذخیره کول
    await saveUserData();
    
    // UI تازه کول
    updateUI();
    
    // د انعام انیمیشن
    showRewardAnimation(reward);
    
    showMessage(`Daily reward claimed! You received ${reward} MetaX tokens`, "success");
}

// د ریفریل پروسیس کول
async function handleReferral(referrerId) {
    if (!referrerId || referrerId === userData.userId) return;
    
    try {
        // د ریفریل چیک کول که چیرې دمخه ثبت شوی وي
        const referralCheckRef = database.ref(`referrals/${userData.userId}`);
        const snapshot = await referralCheckRef.once('value');
        
        if (snapshot.exists()) return; // دمخه ثبت شوی
        
        // د ریفریل ثبت کول
        await referralCheckRef.set({
            referrerId: referrerId,
            referredId: userData.userId,
            timestamp: new Date().toISOString(),
            rewardPaid: false
        });
        
        // د ریفریل انعام ورکول
        const referrerRef = database.ref(`users/${referrerId}`);
        const referrerSnapshot = await referrerRef.once('value');
        
        if (referrerSnapshot.exists()) {
            const referrerData = referrerSnapshot.val();
            const newBalance = (referrerData.balance || 0) + REFERRAL_REWARD;
            const newReferrals = (referrerData.referrals || 0) + 1;
            const newReferralEarnings = (referrerData.referralEarnings || 0) + REFERRAL_REWARD;
            
            await referrerRef.update({
                balance: newBalance,
                referrals: newReferrals,
                referralEarnings: newReferralEarnings
            });
        }
        
        showMessage("Welcome! You joined via referral link", "success");
    } catch (error) {
        console.error("Error processing referral:", error);
    }
}

// د ریفریل لینک کاپي کول
function copyReferralLink() {
    const linkInput = document.getElementById('referralLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(linkInput.value)
        .then(() => {
            showMessage("Referral link copied to clipboard!", "success");
        })
        .catch(err => {
            showMessage("Failed to copy link", "error");
        });
}

// د کارن معلومات په Firebase کې ذخیره کول
async function saveUserData() {
    if (!userData.userId) return;
    
    try {
        await database.ref(`users/${userData.userId}`).update({
            username: userData.username,
            balance: userData.balance,
            referrals: userData.referrals,
            referralEarnings: userData.referralEarnings,
            lastCheck: userData.lastCheck,
            currentStreak: userData.currentStreak,
            walletAddress: userData.walletAddress,
            walletConnected: userData.walletConnected,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}

// د انعام انیمیشن ښودل
function showRewardAnimation(reward) {
    const animation = document.createElement('div');
    animation.className = 'reward-animation';
    animation.innerHTML = `
        <div class="reward-content">
            <i class="fas fa-gift"></i>
            <div class="reward-text">+${reward} MetaX</div>
        </div>
    `;
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
        animation.remove();
    }, 2000);
}

// د پیغام ښودل
function showMessage(message, type = "info") {
    const toast = document.getElementById('messageToast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.className = 'toast';
        }, 300);
    }, 3000);
}

// د لوډینګ ښودل یا پټول
function showLoading(show) {
    const loadingScreen = document.getElementById('loadingScreen');
    const app = document.getElementById('app');
    
    if (show) {
        loadingScreen.style.display = 'flex';
        app.style.display = 'none';
    } else {
        loadingScreen.style.display = 'none';
        app.style.display = 'block';
    }
}

// د CSS د انیمیشن لپاره اضافه شیلیزونه
const style = document.createElement('style');
style.textContent = `
    .reward-animation {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1001;
        animation: rewardPopup 2s ease forwards;
    }
    
    .reward-content {
        background: linear-gradient(135deg, #00ff9d, #00cc7a);
        color: #000;
        padding: 20px 30px;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        font-weight: 700;
        font-size: 24px;
        box-shadow: 0 10px 30px rgba(0, 255, 157, 0.5);
        border: 2px solid rgba(255, 255, 255, 0.5);
    }
    
    .reward-content i {
        font-size: 36px;
    }
    
    @keyframes rewardPopup {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
        }
        40% {
            transform: translate(-50%, -50%) scale(1);
        }
        80% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
    }
    
    .toast.success {
        background: linear-gradient(135deg, rgba(0, 255, 157, 0.9), rgba(0, 204, 122, 0.9));
        border-color: rgba(0, 255, 157, 0.5);
    }
    
    .toast.error {
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.9), rgba(255, 71, 87, 0.9));
        border-color: rgba(255, 107, 107, 0.5);
    }
`;
document.head.appendChild(style);
