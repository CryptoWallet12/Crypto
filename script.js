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
    referralCode: null,
    taskCompleted: false
};

// د ورځنی چیک ارزښتونه
const DAILY_REWARDS = [10, 15, 25, 50, 85, 120, 235];
const REFERRAL_REWARD = 125;
const TASK_REWARD = 50;

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
    
    // د لوړ مقام کسانو لیست ډکول
    loadLeaderboard();
    
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
            userData.taskCompleted = data.taskCompleted || false;
            
            // د والیت معلومات تازه کول که چیرې شتون ولري
            if (userData.walletConnected && data.tonBalance) {
                document.getElementById('walletBalance').textContent = `${data.tonBalance} TON`;
            }
        } else {
            // نوی کارن ثبت کول
            await userRef.set({
                userId: userData.userId,
                username: userData.username,
                avatar: userData.avatar,
                balance: 0,
                referrals: 0,
                referralEarnings: 0,
                lastCheck: null,
                currentStreak: 0,
                walletAddress: null,
                taskCompleted: false,
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
    
    // د تاسک حالت تازه کول
    updateTaskStatus();
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

// د تاسک حالت تازه کول
function updateTaskStatus() {
    const startTaskBtn = document.getElementById('startTaskBtn');
    const taskStatus = document.getElementById('taskStatus');
    const checkTaskBtn = document.getElementById('checkTaskBtn');
    
    if (userData.taskCompleted) {
        startTaskBtn.style.display = 'none';
        taskStatus.style.display = 'none';
        checkTaskBtn.style.display = 'none';
        document.querySelector('.task-section p').textContent = "Community task already completed!";
    } else {
        startTaskBtn.style.display = 'block';
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
    
    // د Withdraw بټن
    document.getElementById('withdrawBtn').addEventListener('click', showWithdrawMessage);
    
    // د تاسک بټنونه
    document.getElementById('startTaskBtn').addEventListener('click', startTask);
    document.getElementById('checkTaskBtn').addEventListener('click', completeTask);
    
    // د Telegram والیت پیښې
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.onEvent('walletDataChanged', handleWalletData);
    }
}

// د TON والیت سره وصل کول (د Telegram او TON سره)
function connectWallet() {
    if (window.Telegram && Telegram.WebApp) {
        // د Telegram والیت انټرفیس کارول
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
        
        showMessage("TON Wallet connected successfully!", "success");
    }
}

// د ټیسټ والیت وصل کول
function simulateWalletConnection() {
    // د TON والیت ادرس جوړول
    const tonAddress = "EQ" + Array.from({length: 48}, () => 
        "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16))
    ).join("");
    
    userData.walletAddress = tonAddress;
    userData.walletConnected = true;
    
    // په Firebase کې ذخیره کول
    saveUserData();
    
    // UI تازه کول
    updateUI();
    
    showMessage("TON Wallet connected successfully!", "success");
}

// د Withdraw بټن لپاره
function showWithdrawMessage() {
    const withdrawBtn = document.getElementById('withdrawBtn');
    const withdrawMessage = document.getElementById('withdrawMessage');
    
    withdrawBtn.style.display = 'none';
    withdrawMessage.style.display = 'flex';
    
    showMessage("Withdraw feature will be available soon!", "info");
}

// ورځنی چیک ترسره کول
async function claimDailyReward() {
    if (!userData.walletConnected) {
        showMessage("Please connect your TON wallet first", "error");
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
    showRewardAnimation(reward, "Daily Reward");
    
    showMessage(`Daily reward claimed! You received ${reward} MetaX tokens`, "success");
}

// د تاسک پیلول
function startTask() {
    // د چینل لینک خلاصول
    window.open("https://t.me/MetaXCoin_Community", "_blank");
    
    // د تاسک پروګرس ښودل
    const startTaskBtn = document.getElementById('startTaskBtn');
    const taskStatus = document.getElementById('taskStatus');
    const checkTaskBtn = document.getElementById('checkTaskBtn');
    
    startTaskBtn.style.display = 'none';
    taskStatus.style.display = 'block';
    
    // د پروګرس بار انیمیشن
    let progress = 0;
    const interval = setInterval(() => {
        progress += 20;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            document.getElementById('taskMessage').textContent = "Task completed! Click Check to claim reward";
            checkTaskBtn.style.display = 'block';
            checkTaskBtn.disabled = false;
        }
    }, 1000); // 5 ثانیې لپاره (هر 1 ثانیه 20% زیاتوالی)
}

// د تاسک بشپړول
async function completeTask() {
    // د تاسک بشپړ ډیټا بیس کې ثبتول
    userData.taskCompleted = true;
    userData.balance += TASK_REWARD;
    
    // په Firebase کې ذخیره کول
    await saveUserData();
    
    // UI تازه کول
    updateUI();
    
    // د انعام انیمیشن
    showRewardAnimation(TASK_REWARD, "Task Reward");
    
    showMessage(`Task completed! You received ${TASK_REWARD} MetaX tokens`, "success");
}

// د لوړ مقام کسانو لیست ډکول
async function loadLeaderboard() {
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.orderByChild('balance').limitToLast(5).once('value');
        
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        if (snapshot.exists()) {
            const users = [];
            snapshot.forEach(childSnapshot => {
                users.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            // د بالانس له مخې ترتیبول (لوړ څخه ټیټ)
            users.sort((a, b) => (b.balance || 0) - (a.balance || 0));
            
            // د هر کارن لپاره HTML جوړول
            users.forEach((user, index) => {
                const rank = index + 1;
                const leaderboardItem = document.createElement('div');
                leaderboardItem.className = 'leaderboard-item';
                
                // د عکس لپاره ډیفالٹ
                const avatar = user.avatar || "assets/default-avatar.png";
                const username = user.username || "User";
                const balance = user.balance || 0;
                const referrals = user.referrals || 0;
                
                leaderboardItem.innerHTML = `
                    <div class="leaderboard-rank rank-${rank}">${rank}</div>
                    <img src="${avatar}" alt="${username}" class="leaderboard-avatar">
                    <div class="leaderboard-details">
                        <div class="leaderboard-name">${username}</div>
                        <div class="leaderboard-stats">
                            <span><i class="fas fa-coins"></i> ${balance} MetaX</span>
                            <span><i class="fas fa-user-friends"></i> ${referrals} Ref</span>
                        </div>
                    </div>
                `;
                
                leaderboardList.appendChild(leaderboardItem);
            });
        } else {
            leaderboardList.innerHTML = '<p class="no-leaders">No leaderboard data available yet.</p>';
        }
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        document.getElementById('leaderboardList').innerHTML = '<p class="no-leaders">Error loading leaderboard.</p>';
    }
}

// د کارن معلومات په Firebase کې ذخیره کول
async function saveUserData() {
    if (!userData.userId) return;
    
    try {
        await database.ref(`users/${userData.userId}`).update({
            username: userData.username,
            avatar: userData.avatar,
            balance: userData.balance,
            referrals: userData.referrals,
            referralEarnings: userData.referralEarnings,
            lastCheck: userData.lastCheck,
            currentStreak: userData.currentStreak,
            walletAddress: userData.walletAddress,
            walletConnected: userData.walletConnected,
            taskCompleted: userData.taskCompleted,
            updatedAt: new Date().toISOString()
        });
        
        // د لوړ مقام کسانو لیست تازه کول
        loadLeaderboard();
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}

// د انعام انیمیشن ښودل
function showRewardAnimation(reward, type) {
    const animation = document.createElement('div');
    animation.className = 'reward-animation';
    animation.innerHTML = `
        <div class="reward-content">
            <i class="fas fa-gift"></i>
            <div class="reward-text">+${reward} MetaX</div>
            <div class="reward-type">${type}</div>
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
    
    .reward-type {
        font-size: 16px;
        opacity: 0.8;
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
    
    .toast.info {
        background: linear-gradient(135deg, rgba(0, 136, 204, 0.9), rgba(0, 102, 170, 0.9));
        border-color: rgba(0, 136, 204, 0.5);
    }
    
    .no-leaders {
        text-align: center;
        color: #a0a0c0;
        font-style: italic;
        padding: 20px;
    }
`;
document.head.appendChild(style);
