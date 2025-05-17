// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwGx2qJ90LFhu06lgWr_r6vv5Jx6JqxzE",
  authDomain: "pagepilot-y6ez7.firebaseapp.com",
  databaseURL: "https://pagepilot-y6ez7-default-rtdb.firebaseio.com",
  projectId: "pagepilot-y6ez7",
  storageBucket: "pagepilot-y6ez7.firebasestorage.app",
  messagingSenderId: "654134506434",
  appId: "1:654134506434:web:303611b2baa4b90e271c5b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Set the Firestore database location to nam5
firebase.firestore().settings({
  host: 'firestore.googleapis.com',
  ssl: true,
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
});

// Collections
const userCollection = db.collection('user_info');

// DOM Elements
const authMessage = document.getElementById('auth-message');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const phoneInput = document.getElementById('phone');

// Check if we're on the login or register page
const isLoginPage = window.location.pathname.includes('login.html');
const isRegisterPage = window.location.pathname.includes('register.html');

// Add event listeners based on the page
if (isLoginPage) {
    const loginButton = document.getElementById('login-button');
    loginButton.addEventListener('click', handleLogin);

    // Check if user is already logged in
    checkAuthState();
} else if (isRegisterPage) {
    const registerButton = document.getElementById('register-button');
    registerButton.addEventListener('click', handleRegister);

    // Check if user is already logged in
    checkAuthState();
}

// Functions
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showAuthError('Please enter both username and password');
        return;
    }

    const loginButton = document.getElementById('login-button');
    loginButton.disabled = true;
    loginButton.textContent = 'Signing in...';

    // Check if user exists in user_info collection
    userCollection.where('username', '==', username).get()
        .then(snapshot => {
            if (snapshot.empty) {
                showAuthError('User not found. Please check your username or create an account.');
                loginButton.disabled = false;
                loginButton.textContent = 'Sign In';
                return;
            }

            const userDoc = snapshot.docs[0];
            const userData = userDoc.data();

            // Check password
            if (userData.password !== password) {
                showAuthError('Incorrect password. Please try again.');
                loginButton.disabled = false;
                loginButton.textContent = 'Sign In';
                return;
            }

            // Login successful
            const currentUser = {
                id: userDoc.id,
                username: userData.username,
                phone: userData.phone_number
            };

            // Save to local storage for persistence
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Show success message
            showAuthSuccess('Signed in successfully');

            // Redirect to main page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        })
        .catch(error => {
            console.error('Error logging in:', error);
            showAuthError('Error logging in. Please try again.');
            loginButton.disabled = false;
            loginButton.textContent = 'Sign In';
        });
}

function handleRegister() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (!username || !password) {
        showAuthError('Please enter both username and password');
        return;
    }

    if (phoneInput && !phone) {
        showAuthError('Please enter your phone number');
        return;
    }

    const registerButton = document.getElementById('register-button');
    registerButton.disabled = true;
    registerButton.textContent = 'Creating account...';

    // Check if username already exists
    userCollection.where('username', '==', username).get()
        .then(snapshot => {
            if (!snapshot.empty) {
                showAuthError('Username already exists. Please choose another one.');
                registerButton.disabled = false;
                registerButton.textContent = 'Create Account';
                return;
            }

            // Create new user in user_info collection with the exact structure shown in the image
            const userData = {
                username: username,
                password: password,
                phone_number: phone
            };

            userCollection.add(userData)
                .then(docRef => {
                    // Registration successful
                    const currentUser = {
                        id: docRef.id,
                        username: username,
                        phone: phone
                    };

                    // Save to local storage for persistence
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    // Show success message
                    showAuthSuccess('Account created successfully');

                    // Redirect to main page
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                })
                .catch(error => {
                    console.error('Error creating user:', error);
                    showAuthError('Error creating account. Please try again.');
                    registerButton.disabled = false;
                    registerButton.textContent = 'Create Account';
                });
        })
        .catch(error => {
            console.error('Error checking username:', error);
            showAuthError('Error creating account. Please try again.');
            registerButton.disabled = false;
            registerButton.textContent = 'Create Account';
        });
}

function showAuthError(message) {
    authMessage.textContent = message;
    authMessage.className = 'auth-message error';
}

function showAuthSuccess(message) {
    authMessage.textContent = message;
    authMessage.className = 'auth-message success';
}

function checkAuthState() {
    // Check if user is logged in from local storage
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
        // User is already logged in, redirect to main page
        window.location.href = 'index.html';
    }
}
