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
const rentalCollection = db.collection('rental_info');

// Current user state
let currentUser = null;

// DOM Elements
const addButton = document.getElementById('add-button');
const transactionModal = document.getElementById('transaction-modal');
const closeTransactionModal = document.getElementById('close-transaction-modal');
const cancelTransaction = document.getElementById('cancel-transaction');
const saveTransaction = document.getElementById('save-transaction');
const logoutButton = document.getElementById('logout-btn');
const userIcon = document.querySelector('.user-icon');
const tableBody = document.querySelector('.table-body');
const usernameDisplay = document.getElementById('username-display');

// Event Listeners
addButton.addEventListener('click', openTransactionModal);
closeTransactionModal.addEventListener('click', closeModal);
cancelTransaction.addEventListener('click', closeModal);
saveTransaction.addEventListener('click', saveTransactionData);
logoutButton.addEventListener('click', logout);
userIcon.addEventListener('click', toggleUserMenu);

// Check if user is logged in
checkAuthState();

// Functions
function openTransactionModal() {
    transactionModal.style.display = 'flex';
}

function closeModal() {
    transactionModal.style.display = 'none';
}

function saveTransactionData() {
    // Check if user is logged in
    if (!currentUser) {
        alert('Please log in to add transactions');
        window.location.href = 'login.html';
        return;
    }

    // Get form values
    const name = document.getElementById('name').value;
    const duration = document.getElementById('duration').value;
    const amount = document.getElementById('amount').value;
    const status = document.getElementById('status').value;

    // Validate form
    if (!name || !amount) {
        alert('Please fill in all required fields');
        return;
    }

    // Disable save button
    saveTransaction.disabled = true;
    saveTransaction.textContent = 'Saving...';

    // Create new transaction object
    const newTransaction = {
        name: name,
        time: duration ? `${duration}m` : '0s',
        amount: parseFloat(amount),
        status: status,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
    };

    // Save to Firebase
    rentalCollection.add(newTransaction)
        .then(docRef => {
            // Add to UI with the document ID
            const transactionWithId = {
                id: docRef.id,
                ...newTransaction,
                warning: false // Add warning flag for UI
            };

            addTransactionToUI(transactionWithId);

            // Close modal
            closeModal();

            // Reset form
            document.getElementById('name').value = '';
            document.getElementById('duration').value = '';
            document.getElementById('amount').value = '';
            document.getElementById('status').value = 'pending';

            // Re-enable save button
            saveTransaction.disabled = false;
            saveTransaction.textContent = 'Save';

            // Show success message
            showMessage('Transaction added successfully', 'success');
        })
        .catch(error => {
            console.error('Error adding transaction:', error);
            alert('Error adding transaction. Please try again.');

            // Re-enable save button
            saveTransaction.disabled = false;
            saveTransaction.textContent = 'Save';
        });
}

function addTransactionToUI(transaction) {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.setAttribute('data-id', transaction.id);

    row.innerHTML = `
        <div class="column name">${transaction.name}</div>
        <div class="column time">
            ${transaction.warning ? '<i class="fas fa-exclamation-triangle warning-icon"></i>' : ''}
            ${transaction.time}
        </div>
        <div class="column amount">₹ ${transaction.amount}</div>
        <div class="column status">
            <span class="status-badge ${transaction.status}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
        </div>
    `;

    // Add click event to status badge for toggling
    const statusBadge = row.querySelector('.status-badge');
    statusBadge.addEventListener('click', () => toggleStatus(transaction.id));

    // Add to table
    tableBody.appendChild(row);
}

function toggleStatus(id) {
    // Check if user is logged in
    if (!currentUser) {
        alert('Please log in to update transaction status');
        window.location.href = 'login.html';
        return;
    }

    const row = document.querySelector(`.table-row[data-id="${id}"]`);
    const statusBadge = row.querySelector('.status-badge');
    const currentStatus = statusBadge.classList.contains('paid') ? 'paid' : 'pending';
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';

    // Update in Firebase
    rentalCollection.doc(id).update({
        status: newStatus
    })
    .then(() => {
        // Update UI
        statusBadge.classList.remove(currentStatus);
        statusBadge.classList.add(newStatus);
        statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

        // Show success message
        showMessage('Status updated successfully', 'success');
    })
    .catch(error => {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    });
}

function logout() {
    // Clear user data
    currentUser = null;
    localStorage.removeItem('currentUser');

    // Show success message
    showMessage('Logged out successfully', 'success');

    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

function toggleUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
}

function checkAuthState() {
    // Check if user is logged in from local storage
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUIForAuthState();
            loadTransactions();
        } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    } else {
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

function updateUIForAuthState() {
    if (currentUser) {
        // Update username display
        usernameDisplay.textContent = currentUser.username;

        // Show add button
        addButton.style.display = 'flex';
    } else {
        // Clear username display
        usernameDisplay.textContent = '';

        // Hide add button
        addButton.style.display = 'none';
    }
}

function loadTransactions() {
    // Clear existing rows
    tableBody.innerHTML = '';

    // Check if user is logged in
    if (!currentUser) {
        return;
    }

    // Show loading indicator
    const loadingRow = document.createElement('div');
    loadingRow.className = 'table-row loading';
    loadingRow.innerHTML = '<div class="column" style="text-align: center; flex: 1;">Loading transactions...</div>';
    tableBody.appendChild(loadingRow);

    // Load transactions from Firebase for the current user
    rentalCollection.where('userId', '==', currentUser.id)
        .get()
        .then(snapshot => {
            // Remove loading indicator
            tableBody.innerHTML = '';

            if (snapshot.empty) {
                // Show empty state
                const emptyRow = document.createElement('div');
                emptyRow.className = 'table-row empty';
                emptyRow.innerHTML = '<div class="column" style="text-align: center; flex: 1;">No transactions found. Add one by clicking the + button.</div>';
                tableBody.appendChild(emptyRow);
                return;
            }

            // Add transactions to UI
            snapshot.forEach(doc => {
                const transaction = {
                    id: doc.id,
                    ...doc.data(),
                    warning: doc.data().time && doc.data().time.includes('13m 38s') // Add warning flag for specific time
                };
                addTransactionToUI(transaction);
            });
        })
        .catch(error => {
            console.error('Error loading transactions:', error);
            tableBody.innerHTML = '';
            const errorRow = document.createElement('div');
            errorRow.className = 'table-row error';
            errorRow.innerHTML = '<div class="column" style="text-align: center; flex: 1; color: #d32f2f;">Error loading transactions. Please refresh the page.</div>';
            tableBody.appendChild(errorRow);
        });
}

function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        messageElement.classList.add('hide');
        setTimeout(() => {
            messageElement.remove();
        }, 300);
    }, 3000);
}
