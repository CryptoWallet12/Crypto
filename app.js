// Firebase تنظیمات
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

// Firebase پیلول
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// تلګرام WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// د کارن معلومات
let user = {
    id: tg.initDataUnsafe.user?.id || Date.now().toString(),
    username: tg.initDataUnsafe.user?.username || "user_" + Math.floor(Math.random() * 10000),
    firstName: tg.initDataUnsafe.user?.first_name || "کارن",
    lastName: tg.initDataUnsafe.user?.last_name || "",
    photoUrl: tg.initDataUnsafe.user?.photo_url || "",
    language: 'ps'
};

// د اپلیکیشن حالت
let appState = {
    miningActive: false,
    miningStartTime: null,
    lastMiningClaim: null,
    mainBalance: 0.001,
    minedBalance: 0,
    referralCount: 0,
    referralEarnings: 0,
    totalMined: 0,
    totalWithdrawn: 0,
    referrals: [],
    withdrawals: [],
    language: 'ps'
};

// د ژبې متنونه
const translations = {
    ps: {
        // د مایننګ صفحه
        mining: "مایننګ",
        referral: "ریفریل",
        profile: "پروفایل",
        startMining: "Start Mining",
        claimTON: "Claim TON",
        miningInfo: "هر 24 ساعته کې 0.01 TON ترلاسه کوئ. ماین شوی تون هر ثانیه زياتيږي.",
        balance: "اصلي بیلانس",
        mined: "ماین شوی",
        miningTime: "د مایننګ وخت",
        dailyEarned: "د ورځې ترلاسه شوی",
        
        // د ریفریل صفحه
        referralTitle: "ریفریل سیستم",
        referralCount: "د ریفریل شمېره",
        referralEarnings: "د ریفریل ګټه",
        yourLink: "خپل ریفریل لینک",
        copy: "کاپي",
        shareTelegram: "په تلګرام کې شریک کړئ",
        referralInfo: "د ریفریل سیستم معلومات",
        referralPoints: [
            "هر ریفریل لپاره 0.01 TON ترلاسه کوئ",
            "ریفریل باید د تاسو د لینک له لارې راجستر شي",
            "د ویډرا لپاره لږ تر لږه 5 ریفریل ضروري دي",
            "ریفریل ګټه په اصل بیلانس کې اضافه کيږي"
        ],
        
        // د پروفایل صفحه
        totalBalance: "ټول بیلانس",
        totalMined: "ټول ماین شوي",
        totalWithdrawn: "ټول ویډرا شوي",
        withdrawalSystem: "ویډرا سیستم",
        tonAddress: "TON ادرس",
        amount: "مقدار (TON)",
        availableBalance: "شته بیلانس",
        withdraw: "ویډرا کړئ",
        withdrawalConditions: "د ویډرا شرایط",
        withdrawalPoints: [
            "لږترلږه ویډرا: 0.1 TON",
            "د ویډرا وخت: 1 څخه تر 24 ساعتونو",
            "د ویډرا لپاره: لږترلږه 5 ریفریل ضروري دي",
            "د ویډرا فیس: 0%"
        ],
        withdrawalHistory: "د ویډرا تاریخ",
        noWithdrawals: "تر اوسه هیڅ ویډرا نشته",
        
        // تنظیمات
        settings: "تنظیمات",
        language: "ژبه",
        appInfo: "د اپلیکیشن معلومات",
        appVersion: "TON Miner v1.0",
        appDescription: "د مایننګ ایردراپ اپلیکیشن",
        
        // ټیم
        supportTeam: "سپورت ټیم",
        contactAdmin: "@admin ته پیغام ولېږئ",
        
        // اعلانات
        copied: "لینک کاپي شو!",
        miningStarted: "مایننګ پیل شو!",
        miningStopped: "مایننګ ودرول شو!",
        tonClaimed: "TON ترلاسه شو!",
        withdrawalRequested: "د ویډرا غوښتنه ولیږل شوه!",
        needMoreReferrals: "د ویډرا لپاره لږ تر لږه 5 ریفریل ضروري دي!",
        insufficientBalance: "پوره بیلانس نشته!",
        invalidAddress: "د TON ادرس ناسم دی!"
    },
    
    fa: {
        // فارسی ترجمه
        mining: "ماینینگ",
        referral: "رفرال",
        profile: "پروفایل",
        startMining: "شروع ماینینگ",
        claimTON: "دریافت TON",
        miningInfo: "هر 24 ساعت 0.01 TON دریافت کنید. TON ماین شده هر ثانیه افزایش می‌یابد.",
        balance: "موجودی اصلی",
        mined: "ماین شده",
        miningTime: "زمان ماینینگ",
        dailyEarned: "دریافتی روزانه",
        
        referralTitle: "سیستم رفرال",
        referralCount: "تعداد رفرال",
        referralEarnings: "سود رفرال",
        yourLink: "لینک رفرال شما",
        copy: "کپی",
        shareTelegram: "اشتراک در تلگرام",
        referralInfo: "اطلاعات سیستم رفرال",
        referralPoints: [
            "برای هر رفرال 0.01 TON دریافت کنید",
            "رفرال باید از طریق لینک شما ثبت نام کند",
            "برای برداشت حداقل 5 رفرال لازم است",
            "سود رفرال به موجودی اصلی اضافه می‌شود"
        ],
        
        totalBalance: "مجموع موجودی",
        totalMined: "مجموع ماین شده",
        totalWithdrawn: "مجموع برداشت شده",
        withdrawalSystem: "سیستم برداشت",
        tonAddress: "آدرس TON",
        amount: "مقدار (TON)",
        availableBalance: "موجودی قابل برداشت",
        withdraw: "برداشت کنید",
        withdrawalConditions: "شرایط برداشت",
        withdrawalPoints: [
            "حداقل برداشت: 0.1 TON",
            "زمان برداشت: 1 تا 24 ساعت",
            "برای برداشت: حداقل 5 رفرال لازم است",
            "کارمزد برداشت: 0%"
        ],
        withdrawalHistory: "تاریخچه برداشت",
        noWithdrawals: "هنوز برداشتی وجود ندارد",
        
        settings: "تنظیمات",
        language: "زبان",
        appInfo: "اطلاعات برنامه",
        appVersion: "TON Miner v1.0",
        appDescription: "برنامه ایردراپ ماینینگ",
        
        supportTeam: "تیم پشتیبانی",
        contactAdmin: "پیام به @admin",
        
        copied: "لینک کپی شد!",
        miningStarted: "ماینینگ شروع شد!",
        miningStopped: "ماینینگ متوقف شد!",
        tonClaimed: "TON دریافت شد!",
        withdrawalRequested: "درخواست برداشت ارسال شد!",
        needMoreReferrals: "برای برداشت حداقل 5 رفرال لازم است!",
        insufficientBalance: "موجودی کافی نیست!",
        invalidAddress: "آدرس TON نامعتبر است!"
    },
    
    en: {
        // English translation
        mining: "Mining",
        referral: "Referral",
        profile: "Profile",
        startMining: "Start Mining",
        claimTON: "Claim TON",
        miningInfo: "Earn 0.01 TON every 24 hours. Mined TON increases every second.",
        balance: "Main Balance",
        mined: "Mined",
        miningTime: "Mining Time",
        dailyEarned: "Daily Earned",
        
        referralTitle: "Referral System",
        referralCount: "Referral Count",
        referralEarnings: "Referral Earnings",
        yourLink: "Your Referral Link",
        copy: "Copy",
        shareTelegram: "Share on Telegram",
        referralInfo: "Referral System Info",
        referralPoints: [
            "Earn 0.01 TON for each referral",
            "Referral must register through your link",
            "Minimum 5 referrals required for withdrawal",
            "Referral earnings added to main balance"
        ],
        
        totalBalance: "Total Balance",
        totalMined: "Total Mined",
        totalWithdrawn: "Total Withdrawn",
        withdrawalSystem: "Withdrawal System",
        tonAddress: "TON Address",
        amount: "Amount (TON)",
        availableBalance: "Available Balance",
        withdraw: "Withdraw",
        withdrawalConditions: "Withdrawal Conditions",
        withdrawalPoints: [
            "Minimum withdrawal: 0.1 TON",
            "Withdrawal time: 1 to 24 hours",
            "For withdrawal: Minimum 5 referrals required",
            "Withdrawal fee: 0%"
        ],
        withdrawalHistory: "Withdrawal History",
        noWithdrawals: "No withdrawals yet",
        
        settings: "Settings",
        language: "Language",
        appInfo: "App Info",
        appVersion: "TON Miner v1.0",
        appDescription: "Mining Airdrop Application",
        
        supportTeam: "Support Team",
        contactAdmin: "Message @admin",
        
        copied: "Link copied!",
        miningStarted: "Mining started!",
        miningStopped: "Mining stopped!",
        tonClaimed: "TON claimed!",
        withdrawalRequested: "Withdrawal requested!",
        needMoreReferrals: "Minimum 5 referrals required for withdrawal!",
        insufficientBalance: "Insufficient balance!",
        invalidAddress: "Invalid TON address!"
    }
};

// د اپلیکیشن پیلول
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadUserData();
});

// د اپلیکیشن پیلولو فنکشن
function initializeApp() {
    // د کارن معلومات ښکاره کول
    document.getElementById('username').textContent = user.username;
    document.getElementById('profile-username').textContent = user.username;
    document.getElementById('user-id').textContent = user.id;
    
    if (user.photoUrl) {
        document.getElementById('user-photo').src = user.photoUrl;
        document.getElementById('profile-photo').src = user.photoUrl;
    }
    
    // د ریفریل لینک جوړول
    const referralLink = `https://t.me/TestingMinerBot?startapp=${user.id}`;
    document.getElementById('referral-link').value = referralLink;
    
    // د بیلانسونو تحدید کول
    updateBalances();
    updateMiningDisplay();
    
    // د ژبې تحدید
    updateLanguage('ps');
}

// د ایونټ لیسټنر تنظیمول
function setupEventListeners() {
    // د صفحو ټیبونه
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const page = tab.dataset.page;
            switchPage(page);
        });
    });
    
    // د مایننګ بټن
    document.getElementById('start-mining-btn').addEventListener('click', toggleMining);
    
    // د کلیم بټن
    document.getElementById('claim-ton-btn').addEventListener('click', claimTON);
    
    // د کاپي لینک بټن
    document.getElementById('copy-link-btn').addEventListener('click', copyReferralLink);
    
    // د شریکولو بټن
    document.getElementById('share-telegram-btn').addEventListener('click', shareOnTelegram);
    
    // د ویډرا بټن
    document.getElementById('withdraw-btn').addEventListener('click', requestWithdrawal);
    
    // د تنظیماتو بټن
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-menu').classList.add('active');
    });
    
    // د ټیم بټن
    document.getElementById('team-btn').addEventListener('click', () => {
        document.getElementById('team-menu').classList.add('active');
    });
    
    // د منو بندولو بټنونه
    document.getElementById('close-settings').addEventListener('click', () => {
        document.getElementById('settings-menu').classList.remove('active');
    });
    
    document.getElementById('close-team').addEventListener('click', () => {
        document.getElementById('team-menu').classList.remove('active');
    });
    
    // د ژبې بټنونه
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            updateLanguage(lang);
            
            // فعال بټن تحدید
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.getElementById('settings-menu').classList.remove('active');
        });
    });
    
    // د ویډرا مقدار تحدید
    document.getElementById('withdrawal-amount').addEventListener('input', updateAvailableBalance);
}

// د صفحې بدلولو فنکشن
function switchPage(pageName) {
    // د ټیبونو تحدید
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.page === pageName) {
            tab.classList.add('active');
        }
    });
    
    // د صفحو تحدید
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        if (page.id === `${pageName}-page`) {
            page.classList.add('active');
        }
    });
}

// د مایننګ ټوګل فنکشن
function toggleMining() {
    const btn = document.getElementById('start-mining-btn');
    const machine = document.getElementById('mining-machine');
    
    if (!appState.miningActive) {
        // مایننګ پیلول
        appState.miningActive = true;
        appState.miningStartTime = new Date();
        
        btn.innerHTML = '<i class="fas fa-stop"></i> Stop Mining';
        btn.classList.add('mining-active');
        machine.classList.add('mining-active');
        
        document.getElementById('claim-ton-btn').disabled = false;
        
        showNotification(translations[appState.language].miningStarted, 'success');
        
        // د مایننګ تایمر پیلول
        startMiningTimer();
        
        // په ډیټابیس کې ثبتول
        saveMiningState();
    } else {
        // مایننګ بندول
        appState.miningActive = false;
        
        btn.innerHTML = '<i class="fas fa-play"></i> Start Mining';
        btn.classList.remove('mining-active');
        machine.classList.remove('mining-active');
        
        showNotification(translations[appState.language].miningStopped, 'info');
        
        // په ډیټابیس کې ثبتول
        saveMiningState();
    }
}

// د مایننګ تایمر
let miningTimer;
function startMiningTimer() {
    clearInterval(miningTimer);
    
    miningTimer = setInterval(() => {
        if (appState.miningActive) {
            // هر ثانیه 0.0000001157 TON اضافه کول (0.01 TON په 24 ساعتونو کې)
            const earnedPerSecond = 0.01 / (24 * 60 * 60);
            appState.minedBalance += earnedPerSecond;
            appState.totalMined += earnedPerSecond;
            
            // که چیرې 24 ساعت بشپړ شي
            const now = new Date();
            const hoursMined = (now - appState.miningStartTime) / (1000 * 60 * 60);
            
            if (hoursMined >= 24) {
                // 0.01 TON ترلاسه کول
                appState.mainBalance += 0.01;
                appState.minedBalance = 0;
                appState.miningStartTime = new Date();
                
                showNotification('24 ساعت پوره شو! 0.01 TON ترلاسه شو!', 'success');
            }
            
            updateMiningDisplay();
            updateBalances();
            saveMiningState();
        }
    }, 1000);
}

// د مایننګ ډسپلې تحدید
function updateMiningDisplay() {
    // د ماین شوي بیلانس تحدید
    document.getElementById('mined-balance').textContent = appState.minedBalance.toFixed(5) + ' TON';
    
    // د مایننګ وخت تحدید
    if (appState.miningActive && appState.miningStartTime) {
        const now = new Date();
        const diff = Math.floor((now - appState.miningStartTime) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        document.getElementById('mining-time').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // د ورځې ترلاسه شوي تحدید
    const dailyEarned = appState.miningActive ? (appState.minedBalance / 0.01) * 100 : 0;
    document.getElementById('daily-earned').textContent = dailyEarned.toFixed(2) + '%';
}

// د TON ترلاسه کولو فنکشن
function claimTON() {
    if (appState.minedBalance >= 0.005) {
        appState.mainBalance += appState.minedBalance;
        appState.minedBalance = 0;
        
        showNotification(translations[appState.language].tonClaimed, 'success');
        
        updateBalances();
        updateMiningDisplay();
        saveMiningState();
    } else {
        showNotification('لږترلږه 0.005 TON باید ماین شوي وي!', 'error');
    }
}

// د بیلانسونو تحدید
function updateBalances() {
    // اصلی بیلانس
    document.getElementById('main-balance').textContent = appState.mainBalance.toFixed(3) + ' TON';
    
    // د ریفریل شمېره
    document.getElementById('referral-count').textContent = appState.referralCount;
    document.getElementById('profile-referrals').textContent = appState.referralCount;
    
    // د ریفریل ګټه
    document.getElementById('referral-earnings').textContent = appState.referralEarnings.toFixed(2) + ' TON';
    
    // د پروفایل احصایې
    document.getElementById('total-balance').textContent = (appState.mainBalance + appState.minedBalance).toFixed(3) + ' TON';
    document.getElementById('total-mined').textContent = appState.totalMined.toFixed(5) + ' TON';
    document.getElementById('total-withdrawn').textContent = appState.totalWithdrawn.toFixed(3) + ' TON';
    
    // د ویډرا لپاره شته بیلانس
    document.getElementById('available-balance').value = (appState.mainBalance + appState.minedBalance).toFixed(3) + ' TON';
}

// د ریفریل لینک کاپي کول
function copyReferralLink() {
    const linkInput = document.getElementById('referral-link');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(linkInput.value)
        .then(() => {
            showNotification(translations[appState.language].copied, 'success');
        })
        .catch(err => {
            console.error('د کاپي کولو ستونزه:', err);
        });
}

// په تلګرام کې شریکول
function shareOnTelegram() {
    const link = document.getElementById('referral-link').value;
    const text = encodeURIComponent(`د TON Miner سره مایننګ وکړئ او TON ترلاسه کړئ!\n\n${link}`);
    const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
    
    window.open(url, '_blank');
}

// د ویډرا غوښتنه
function requestWithdrawal() {
    const address = document.getElementById('ton-address').value.trim();
    const amount = parseFloat(document.getElementById('withdrawal-amount').value);
    const totalBalance = appState.mainBalance + appState.minedBalance;
    
    // اعتبار وړاندیز
    if (!address || address.length < 10) {
        showNotification(translations[appState.language].invalidAddress, 'error');
        return;
    }
    
    if (amount < 0.1) {
        showNotification('لږترلږه ویډرا 0.1 TON دی!', 'error');
        return;
    }
    
    if (amount > totalBalance) {
        showNotification(translations[appState.language].insufficientBalance, 'error');
        return;
    }
    
    if (appState.referralCount < 5) {
        showNotification(translations[appState.language].needMoreReferrals, 'error');
        return;
    }
    
    // ویډرا ریکارډ جوړول
    const withdrawal = {
        id: Date.now().toString(),
        address: address,
        amount: amount,
        status: 'pending',
        date: new Date().toISOString(),
        processed: false
    };
    
    // په حالت کې اضافه کول
    appState.withdrawals.unshift(withdrawal);
    appState.totalWithdrawn += amount;
    
    // د بیلانس کمول
    if (amount <= appState.minedBalance) {
        appState.minedBalance -= amount;
    } else {
        const remaining = amount - appState.minedBalance;
        appState.minedBalance = 0;
        appState.mainBalance -= remaining;
    }
    
    // تحدیدونه
    updateBalances();
    updateWithdrawalHistory();
    showNotification(translations[appState.language].withdrawalRequested, 'success');
    
    // په ډیټابیس کې ثبتول
    saveWithdrawal(withdrawal);
    
    // فورم پاکول
    document.getElementById('ton-address').value = '';
    document.getElementById('withdrawal-amount').value = '0.1';
}

// د ویډرا تاریخ تحدید
function updateWithdrawalHistory() {
    const historyContainer = document.getElementById('withdrawal-history');
    
    if (appState.withdrawals.length === 0) {
        historyContainer.innerHTML = `<div class="empty-history">${translations[appState.language].noWithdrawals}</div>`;
        return;
    }
    
    historyContainer.innerHTML = appState.withdrawals.map(withdrawal => `
        <div class="history-item">
            <div class="history-item-header">
                <span class="history-amount">${withdrawal.amount.toFixed(3)} TON</span>
                <span class="history-status status-${withdrawal.status}">${withdrawal.status === 'pending' ? 'په انتظار کې' : 'بشپړ شو'}</span>
            </div>
            <div class="history-date">${new Date(withdrawal.date).toLocaleDateString('ps-AF')}</div>
            <div class="history-address">${withdrawal.address.substring(0, 20)}...</div>
        </div>
    `).join('');
}

// د شته بیلانس تحدید
function updateAvailableBalance() {
    const totalBalance = appState.mainBalance + appState.minedBalance;
    document.getElementById('available-balance').value = totalBalance.toFixed(3) + ' TON';
}

// د ژبې تحدید
function updateLanguage(lang) {
    appState.language = lang;
    const t = translations[lang];
    
    // د ټیبونو متنونه
    document.querySelectorAll('.tab').forEach((tab, index) => {
        const icons = ['fa-digging', 'fa-user-friends', 'fa-user'];
        if (index === 0) tab.innerHTML = `<i class="fas ${icons[0]}"></i> ${t.mining}`;
        if (index === 1) tab.innerHTML = `<i class="fas ${icons[1]}"></i> ${t.referral}`;
        if (index === 2) tab.innerHTML = `<i class="fas ${icons[2]}"></i> ${t.profile}`;
    });
    
    // د مایننګ صفحه
    document.querySelector('.balance-header h3').textContent = t.balance;
    document.querySelector('.mined-amount small').innerHTML = `${t.mined}: <span id="mined-balance">0.00000 TON</span>`;
    document.querySelectorAll('.stat')[0].innerHTML = `<span>${t.miningTime}:</span><span id="mining-time">00:00:00</span>`;
    document.querySelectorAll('.stat')[1].innerHTML = `<span>${t.dailyEarned}:</span><span id="daily-earned">0.00000 TON</span>`;
    document.getElementById('start-mining-btn').innerHTML = `<i class="fas fa-play"></i> ${t.startMining}`;
    document.getElementById('claim-ton-btn').innerHTML = `<i class="fas fa-coins"></i> ${t.claimTON}`;
    document.querySelector('.info-text').innerHTML = `<i class="fas fa-info-circle"></i> ${t.miningInfo}`;
    
    // د ریفریل صفحه
    document.querySelector('.referral-header h2').innerHTML = `<i class="fas fa-user-friends"></i> ${t.referralTitle}`;
    document.querySelectorAll('.stat-box h4')[0].textContent = t.referralCount;
    document.querySelectorAll('.stat-box h4')[1].textContent = t.referralEarnings;
    document.querySelector('.referral-link-box h3').textContent = t.yourLink;
    document.getElementById('copy-link-btn').innerHTML = `<i class="fas fa-copy"></i> ${t.copy}`;
    document.getElementById('share-telegram-btn').innerHTML = `<i class="fab fa-telegram"></i> ${t.shareTelegram}`;
    document.querySelector('.referral-info h3').innerHTML = `<i class="fas fa-info-circle"></i> ${t.referralInfo}`;
    document.querySelector('.referral-info ul').innerHTML = t.referralPoints.map(point => `<li>${point}</li>`).join('');
    
    // د پروفایل صفحه
    document.querySelectorAll('.stat-card h4')[0].textContent = t.totalBalance;
    document.querySelectorAll('.stat-card h4')[1].textContent = t.totalMined;
    document.querySelectorAll('.stat-card h4')[2].textContent = t.totalWithdrawn;
    document.querySelector('.withdrawal-section h3').innerHTML = `<i class="fas fa-paper-plane"></i> ${t.withdrawalSystem}`;
    document.querySelectorAll('.form-group label')[0].textContent = t.tonAddress;
    document.querySelectorAll('.form-group label')[1].textContent = t.amount;
    document.querySelectorAll('.form-group label')[2].textContent = t.availableBalance;
    document.getElementById('withdraw-btn').innerHTML = `<i class="fas fa-paper-plane"></i> ${t.withdraw}`;
    document.querySelector('.withdrawal-info h4').innerHTML = `<i class="fas fa-info-circle"></i> ${t.withdrawalConditions}`;
    document.querySelector('.withdrawal-info ul').innerHTML = t.withdrawalPoints.map(point => `<li>${point}</li>`).join('');
    document.querySelector('.history-section h3').innerHTML = `<i class="fas fa-history"></i> ${t.withdrawalHistory}`;
    
    // تنظیمات
    document.querySelector('.settings-menu h3').innerHTML = `<i class="fas fa-cog"></i> ${t.settings}`;
    document.querySelectorAll('.menu-section h4')[0].textContent = t.language;
    document.querySelectorAll('.menu-section h4')[1].textContent = t.appInfo;
    document.querySelectorAll('.menu-section p')[0].textContent = t.appVersion;
    document.querySelectorAll('.menu-section p')[1].textContent = t.appDescription;
    
    // ټیم
    document.querySelector('.team-menu h3').innerHTML = `<i class="fas fa-users"></i> ${t.supportTeam}`;
    document.querySelector('.team-menu p').textContent = t.contactAdmin;
    document.querySelector('.team-menu a').innerHTML = `<i class="fab fa-telegram"></i> ${t.contactAdmin}`;
    
    // بیلانسونه بیا تحدید کول
    updateBalances();
    updateMiningDisplay();
}

// د اعلاناتو ښکاره کولو فنکشن
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add('show', type);
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// د کارن ډیټا لوډول
function loadUserData() {
    const userRef = database.ref('users/' + user.id);
    
    userRef.once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                appState = { ...appState, ...data };
                
                // که چیرې مایننګ فعال وي، تایمر پیل کړئ
                if (appState.miningActive && appState.miningStartTime) {
                    const startTime = new Date(appState.miningStartTime);
                    const now = new Date();
                    const hoursMined = (now - startTime) / (1000 * 60 * 60);
                    
                    // که چیرې 24 ساعت تیر شوي وي، مایننګ بند کړئ
                    if (hoursMined >= 24) {
                        appState.miningActive = false;
                        appState.miningStartTime = null;
                        showNotification('24 ساعت تیر شوي! مایننګ بند شو.', 'info');
                    } else {
                        // مایننګ بیا پیل کړئ
                        toggleMining();
                    }
                }
                
                updateBalances();
                updateMiningDisplay();
                updateWithdrawalHistory();
            } else {
                // نوی کارن ثبت کړئ
                saveUserData();
            }
        })
        .catch(error => {
            console.error('د ډیټا لوډولو ستونزه:', error);
        });
}

// د کارن ډیټا په ډیټابیس کې خوندي کول
function saveUserData() {
    const userRef = database.ref('users/' + user.id);
    userRef.set({
        ...user,
        ...appState,
        lastUpdated: new Date().toISOString()
    })
    .catch(error => {
        console.error('د ډیټا خوندي کولو ستونزه:', error);
    });
}

// د مایننګ حالت خوندي کول
function saveMiningState() {
    const miningRef = database.ref('users/' + user.id + '/mining');
    miningRef.set({
        active: appState.miningActive,
        startTime: appState.miningStartTime ? appState.miningStartTime.toISOString() : null,
        minedBalance: appState.minedBalance,
        totalMined: appState.totalMined,
        mainBalance: appState.mainBalance
    })
    .catch(error => {
        console.error('د مایننګ حالت خوندي کولو ستونزه:', error);
    });
}

// د ویډرا خوندي کول
function saveWithdrawal(withdrawal) {
    const withdrawalRef = database.ref('withdrawals/' + withdrawal.id);
    withdrawalRef.set({
        ...withdrawal,
        userId: user.id,
        username: user.username
    })
    .catch(error => {
        console.error('د ویډرا خوندي کولو ستونزه:', error);
    });
}

// د ویډرا تاریخ لوډول
function loadWithdrawalHistory() {
    const withdrawalsRef = database.ref('withdrawals').orderByChild('userId').equalTo(user.id);
    
    withdrawalsRef.once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const withdrawals = [];
                snapshot.forEach(childSnapshot => {
                    withdrawals.push(childSnapshot.val());
                });
                
                // نېټې په ترتیب سره تنظیم کول
                withdrawals.sort((a, b) => new Date(b.date) - new Date(a.date));
                appState.withdrawals = withdrawals;
                appState.totalWithdrawn = withdrawals
                    .filter(w => w.status === 'completed')
                    .reduce((sum, w) => sum + w.amount, 0);
                
                updateWithdrawalHistory();
            }
        })
        .catch(error => {
            console.error('د ویډرا تاریخ لوډولو ستونزه:', error);
        });
}

// د ریفریل ډیټا لوډول
function loadReferralData() {
    const referralsRef = database.ref('referrals/' + user.id);
    
    referralsRef.once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                appState.referralCount = data.count || 0;
                appState.referralEarnings = data.earnings || 0;
                appState.referrals = data.list || [];
                
                updateBalances();
            }
        })
        .catch(error => {
            console.error('د ریفریل ډیټا لوډولو ستونزه:', error);
        });
}

// په پیل کې ټول ډیټا لوډ کړئ
Promise.all([
    loadUserData(),
    loadWithdrawalHistory(),
    loadReferralData()
]).then(() => {
    console.log('ټول ډیټا په بریالیتوب سره لوډ شول');
});
