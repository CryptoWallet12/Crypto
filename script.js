// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD4UbW_Iy4kUWH3V70Q1mWCI4-_KFk6ku4",
    authDomain: "onlinewark-a0147.firebaseapp.com",
    databaseURL: "https://onlinewark-a0147-default-rtdb.firebaseio.com",
    projectId: "onlinewark-a0147",
    storageBucket: "onlinewark-a0147.appspot.com",
    messagingSenderId: "92155538620",
    appId: "1:92155538620:android:5e198a8eea6bf17f61f4b9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const investNowBtn = document.getElementById('investNow');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const dashboardModal = document.getElementById('dashboardModal');
const closeButtons = document.getElementsByClassName('close');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const depositBtn = document.getElementById('depositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userBalance = document.getElementById('userBalance');
const transactionList = document.getElementById('transactionList');

// Modal Functions
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Event Listeners
loginBtn.addEventListener('click', () => openModal(loginModal));
registerBtn.addEventListener('click', () => openModal(registerModal));
investNowBtn.addEventListener('click', () => {
    if (auth.currentUser) {
        openModal(dashboardModal);
        loadUserData();
    } else {
        openModal(loginModal);
    }
});

Array.from(closeButtons).forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        closeModal(modal);
    });
});

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
});

showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(registerModal);
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(registerModal);
    openModal(loginModal);
});

// Authentication Functions
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = registerForm['registerName'].value;
    const email = registerForm['registerEmail'].value;
    const password = registerForm['registerPassword'].value;
    const confirmPassword = registerForm['registerConfirmPassword'].value;
    
    if (password !== confirmPassword) {
        alert('پاسورډونه مطابقت نلري!');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Save additional user data to database
            const user = userCredential.user;
            return database.ref('users/' + user.uid).set({
                name: name,
                email: email,
                balance: 0,
                transactions: []
            });
        })
        .then(() => {
            alert('په بریالیتوب سره راجستر شوی!');
            closeModal(registerModal);
            registerForm.reset();
        })
        .catch((error) => {
            alert(error.message);
        });
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = loginForm['loginEmail'].value;
    const password = loginForm['loginPassword'].value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            closeModal(loginModal);
            loginForm.reset();
            openModal(dashboardModal);
            loadUserData();
        })
        .catch((error) => {
            alert(error.message);
        });
});

logoutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            closeModal(dashboardModal);
        })
        .catch((error) => {
            alert(error.message);
        });
});

// User Data Functions
function loadUserData() {
    const user = auth.currentUser;
    if (user) {
        database.ref('users/' + user.uid).once('value')
            .then((snapshot) => {
                const userData = snapshot.val();
                userName.textContent = userData.name;
                userEmail.textContent = userData.email;
                userBalance.textContent = userData.balance + ' USDT';
                
                // Load transactions
                transactionList.innerHTML = '';
                if (userData.transactions) {
                    userData.transactions.forEach(transaction => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <span>${transaction.type === 'deposit' ? 'پانګه اچونه' : 'ویډرا'}</span>
                            <span>${transaction.amount} USDT</span>
                            <span>${new Date(transaction.timestamp).toLocaleString()}</span>
                        `;
                        transactionList.appendChild(li);
                    });
                }
            });
    }
}

// Deposit and Withdraw Functions
depositBtn.addEventListener('click', () => {
    const amount = prompt('د پانګې اچونې مقدار داخل کړئ (USDT):');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        processTransaction('deposit', parseFloat(amount));
    } else {
        alert('مهرباني وکړئ یو صحیح مقدار داخل کړئ!');
    }
});

withdrawBtn.addEventListener('click', () => {
    const amount = prompt('د ویډرې مقدار داخل کړئ (USDT):');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        processTransaction('withdraw', parseFloat(amount));
    } else {
        alert('مهرباني وکړئ یو صحیح مقدار داخل کړئ!');
    }
});

function processTransaction(type, amount) {
    const user = auth.currentUser;
    if (user) {
        database.ref('users/' + user.uid).once('value')
            .then((snapshot) => {
                const userData = snapshot.val();
                let newBalance = userData.balance || 0;
                
                if (type === 'deposit') {
                    newBalance += amount;
                } else if (type === 'withdraw') {
                    if (amount > newBalance) {
                        alert('ستاسو موجودي کافي نه ده!');
                        return;
                    }
                    newBalance -= amount;
                }
                
                // Update balance and add transaction
                const transaction = {
                    type: type,
                    amount: amount,
                    timestamp: Date.now()
                };
                
                const updates = {
                    balance: newBalance,
                    transactions: [...(userData.transactions || []), transaction]
                };
                
                return database.ref('users/' + user.uid).update(updates);
            })
            .then(() => {
                alert(`${type === 'deposit' ? 'پانګه اچونه' : 'ویډرا'} په بریالیتوب سره ترسره شوه!`);
                loadUserData();
            })
            .catch((error) => {
                alert(error.message);
            });
    }
}

// Check auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        investNowBtn.textContent = 'ستاسو ډاشبورډ';
    } else {
        // User is signed out
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        investNowBtn.textContent = 'اوس پانګه اچونه وکړئ';
    }
}); 
