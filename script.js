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
const revenueHistoryCollection = db.collection('revenue_history');

// Current user state
let currentUser = null;

// DOM Elements
const addButton = document.getElementById('add-button');
const transactionModal = document.getElementById('transaction-modal');
const closeTransactionModal = document.getElementById('close-transaction-modal');
const cancelTransaction = document.getElementById('cancel-transaction');
const saveTransaction = document.getElementById('save-transaction');
const logoutButton = document.getElementById('logout-btn');
const historyButton = document.getElementById('history-btn');
const userIcon = document.querySelector('.user-icon');
const tableBody = document.querySelector('.table-body');
const usernameDisplay = document.getElementById('username-display');
const todayRevenueDisplay = document.getElementById('today-revenue');
const historyModal = document.getElementById('history-modal');
const closeHistoryModal = document.getElementById('close-history-modal');
const historyBody = document.getElementById('history-body');
const historyMonthSelect = document.getElementById('history-month');
const historyYearSelect = document.getElementById('history-year');

// Event Listeners
addButton.addEventListener('click', openTransactionModal);
closeTransactionModal.addEventListener('click', () => closeModal('transaction-modal'));
cancelTransaction.addEventListener('click', () => closeModal('transaction-modal'));
saveTransaction.addEventListener('click', saveTransactionData);
logoutButton.addEventListener('click', logout);
historyButton.addEventListener('click', openHistoryModal);
closeHistoryModal.addEventListener('click', () => closeModal('history-modal'));
userIcon.addEventListener('click', toggleUserMenu);
historyMonthSelect.addEventListener('change', loadHistoryData);
historyYearSelect.addEventListener('change', loadHistoryData);

// Check if user is logged in
checkAuthState();

// Set up midnight check for daily history update
setupMidnightCheck();

// Functions
function openTransactionModal() {
    transactionModal.style.display = 'flex';
}

function openHistoryModal() {
    // Initialize month and year selects
    initializeHistoryFilters();

    // Load history data
    loadHistoryData();

    // Show modal
    historyModal.style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function initializeHistoryFilters() {
    // Clear existing options
    historyMonthSelect.innerHTML = '';
    historyYearSelect.innerHTML = '';

    // Get current date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Add month options
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        option.selected = index === currentMonth;
        historyMonthSelect.appendChild(option);
    });

    // Add year options (current year and 2 years back)
    for (let year = currentYear - 2; year <= currentYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        option.selected = year === currentYear;
        historyYearSelect.appendChild(option);
    }
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
        showMessage('Please fill in all required fields', 'error');
        return;
    }

    // Disable save button
    saveTransaction.disabled = true;
    saveTransaction.textContent = 'Saving...';

    // Create new transaction object
    const newTransaction = {
        name: name,
        time: duration ? `${duration}h` : '0h',
        amount: parseFloat(amount),
        status: status,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
    };

    // Save to Firebase
    try {
        rentalCollection.add(newTransaction)
            .then(docRef => {
                try {
                    // Add to UI with the document ID
                    const transactionWithId = {
                        id: docRef.id,
                        ...newTransaction,
                        warning: false // Add warning flag for UI
                    };

                    addTransactionToUI(transactionWithId);

                    // Close modal
                    closeModal('transaction-modal');

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

                    // If the new transaction is from today and is paid, update the revenue display
                    if (isToday(newTransaction.createdAt) && newTransaction.status === 'paid') {
                        try {
                            // Get the current revenue amount
                            const currentRevenue = parseFloat(todayRevenueDisplay.textContent.replace('₹', '').trim());
                            // Add the new transaction amount
                            const newRevenue = currentRevenue + newTransaction.amount;
                            // Update the display
                            updateRevenueDisplay(newRevenue);

                            // Also update the revenue history
                            rentalCollection.where('userId', '==', currentUser.id)
                                .get()
                                .then(snapshot => {
                                    const transactions = [];
                                    snapshot.forEach(doc => {
                                        transactions.push({
                                            id: doc.id,
                                            ...doc.data()
                                        });
                                    });

                                    // Update today's history record
                                    updateTodayRevenueHistory(transactions);
                                })
                                .catch(error => {
                                    console.error('Error updating revenue history:', error);
                                    // Don't show alert to user for this non-critical error
                                });
                        } catch (innerError) {
                            console.error('Error updating revenue display:', innerError);
                            // Don't show alert to user for this non-critical error
                        }
                    }
                } catch (uiError) {
                    console.error('Error updating UI:', uiError);
                    showMessage('Transaction saved but UI update failed', 'error');

                    // Re-enable save button
                    saveTransaction.disabled = false;
                    saveTransaction.textContent = 'Save';
                }
            })
            .catch(error => {
                console.error('Error adding transaction:', error);
                showMessage('Error adding transaction. Please try again.', 'error');

                // Re-enable save button
                saveTransaction.disabled = false;
                saveTransaction.textContent = 'Save';
            });
    } catch (outerError) {
        console.error('Critical error in transaction save:', outerError);
        showMessage('Error adding transaction. Please try again.', 'error');

        // Re-enable save button
        saveTransaction.disabled = false;
        saveTransaction.textContent = 'Save';
    }
}

function addTransactionToUI(transaction) {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.setAttribute('data-id', transaction.id);

    row.innerHTML = `
        <div class="column name">${transaction.name}</div>
        <div class="column time">
            ${transaction.warning ? '<i class="fas fa-exclamation-triangle warning-icon"></i>' : '<i class="far fa-clock time-icon"></i>'}
            ${formatDuration(transaction.time)}
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
        showMessage('Please log in to update transaction status', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    try {
        const row = document.querySelector(`.table-row[data-id="${id}"]`);
        if (!row) {
            showMessage('Transaction not found', 'error');
            return;
        }

        const statusBadge = row.querySelector('.status-badge');
        const currentStatus = statusBadge.classList.contains('paid') ? 'paid' : 'pending';
        const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';

        // Disable the status badge temporarily
        statusBadge.style.pointerEvents = 'none';
        statusBadge.style.opacity = '0.7';

        // Get the transaction data to check if it's from today
        rentalCollection.doc(id).get()
            .then(doc => {
                if (doc.exists) {
                    const transaction = doc.data();

                    // Update in Firebase
                    return rentalCollection.doc(id).update({
                        status: newStatus
                    }).then(() => {
                        try {
                            // Update UI
                            statusBadge.classList.remove(currentStatus);
                            statusBadge.classList.add(newStatus);
                            statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

                            // Re-enable the status badge
                            statusBadge.style.pointerEvents = 'auto';
                            statusBadge.style.opacity = '1';

                            // Show success message
                            showMessage('Status updated successfully', 'success');

                            // If the transaction is from today, update the revenue display
                            if (isToday(transaction.createdAt)) {
                                try {
                                    // Recalculate today's revenue by loading all transactions again
                                    // This ensures we have the most up-to-date data
                                    rentalCollection.where('userId', '==', currentUser.id)
                                        .get()
                                        .then(snapshot => {
                                            const transactions = [];
                                            snapshot.forEach(doc => {
                                                transactions.push({
                                                    id: doc.id,
                                                    ...doc.data()
                                                });
                                            });

                                            // Calculate and update today's revenue
                                            const todayRevenue = calculateTodayRevenue(transactions);
                                            updateRevenueDisplay(todayRevenue);

                                            // Update revenue history for today
                                            updateTodayRevenueHistory(transactions);
                                        })
                                        .catch(error => {
                                            console.error('Error recalculating revenue:', error);
                                            // Don't show error to user for this non-critical operation
                                        });
                                } catch (revenueError) {
                                    console.error('Error updating revenue display:', revenueError);
                                }
                            }
                        } catch (uiError) {
                            console.error('Error updating UI after status change:', uiError);
                            showMessage('Status updated but UI refresh failed', 'error');

                            // Re-enable the status badge
                            statusBadge.style.pointerEvents = 'auto';
                            statusBadge.style.opacity = '1';
                        }
                    });
                } else {
                    // Document doesn't exist
                    showMessage('Transaction not found in database', 'error');

                    // Re-enable the status badge
                    statusBadge.style.pointerEvents = 'auto';
                    statusBadge.style.opacity = '1';
                }
            })
            .catch(error => {
                console.error('Error updating status:', error);
                showMessage('Error updating status. Please try again.', 'error');

                // Re-enable the status badge
                statusBadge.style.pointerEvents = 'auto';
                statusBadge.style.opacity = '1';
            });
    } catch (error) {
        console.error('Critical error in toggleStatus:', error);
        showMessage('Error updating status. Please try again.', 'error');
    }
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

    // For mobile devices, use classList to toggle the 'show' class
    if (window.innerWidth <= 600) {
        userMenu.classList.toggle('show');
    } else {
        // For desktop, use the style.display property
        userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
    }

    // Close menu when clicking outside
    const closeMenuOnClickOutside = (event) => {
        if (!event.target.closest('.user-icon')) {
            userMenu.classList.remove('show');
            userMenu.style.display = 'none';
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    };

    // Add the event listener with a slight delay to prevent immediate closing
    setTimeout(() => {
        document.addEventListener('click', closeMenuOnClickOutside);
    }, 100);
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

// Function to check if a date is today
function isToday(dateString) {
    const today = new Date();
    const date = new Date(dateString);

    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// Function to format a date as YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to format a date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Function to calculate today's revenue
function calculateTodayRevenue(transactions) {
    let todayRevenue = 0;

    transactions.forEach(transaction => {
        // Only count paid transactions from today
        if (transaction.status === 'paid' && isToday(transaction.createdAt)) {
            todayRevenue += transaction.amount;
        }
    });

    return todayRevenue;
}

// Function to update the revenue display
function updateRevenueDisplay(amount) {
    todayRevenueDisplay.textContent = `₹ ${amount.toFixed(2)}`;
}

// Function to format duration display
function formatDuration(durationStr) {
    // If the duration is already in the new format, return it
    if (durationStr.includes('h')) {
        return durationStr;
    }

    // Handle old format (for backward compatibility)
    if (durationStr.includes('m')) {
        // Convert minutes to hours
        const minutes = parseFloat(durationStr.replace('m', ''));
        const hours = (minutes / 60).toFixed(1);
        return `${hours}h`;
    }

    // Handle seconds format
    if (durationStr.includes('s')) {
        return '0h';
    }

    // Default case
    return durationStr;
}

// Function to load history data
function loadHistoryData() {
    // Clear existing rows
    historyBody.innerHTML = '';

    // Show loading indicator
    const loadingRow = document.createElement('div');
    loadingRow.className = 'history-row empty';
    loadingRow.innerHTML = '<div class="history-column" style="text-align: center; flex: 1;">Loading history data...</div>';
    historyBody.appendChild(loadingRow);

    // Get selected month and year
    const selectedMonth = parseInt(historyMonthSelect.value);
    const selectedYear = parseInt(historyYearSelect.value);

    // Calculate start and end dates for the selected month
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0); // Last day of the month

    // Query revenue history for the selected month
    revenueHistoryCollection
        .where('userId', '==', currentUser.id)
        .where('date', '>=', formatDate(startDate))
        .where('date', '<=', formatDate(endDate))
        .orderBy('date', 'desc')
        .get()
        .then(snapshot => {
            // Remove loading indicator
            historyBody.innerHTML = '';

            if (snapshot.empty) {
                // Show empty state
                const emptyRow = document.createElement('div');
                emptyRow.className = 'history-row empty';
                emptyRow.innerHTML = '<div class="history-column" style="text-align: center; flex: 1;">No history data found for this month.</div>';
                historyBody.appendChild(emptyRow);
                return;
            }

            // Add history rows to UI
            snapshot.forEach(doc => {
                const historyData = doc.data();
                addHistoryRowToUI(historyData);
            });
        })
        .catch(error => {
            console.error('Error loading history data:', error);
            historyBody.innerHTML = '';
            const errorRow = document.createElement('div');
            errorRow.className = 'history-row empty';
            errorRow.innerHTML = '<div class="history-column" style="text-align: center; flex: 1; color: #d32f2f;">Error loading history data. Please try again.</div>';
            historyBody.appendChild(errorRow);
        });
}

// Function to add a history row to the UI
function addHistoryRowToUI(historyData) {
    const row = document.createElement('div');
    row.className = 'history-row';

    // Check if this is today's date
    if (isToday(historyData.date)) {
        row.classList.add('today');
    }

    row.innerHTML = `
        <div class="history-column date">${formatDateForDisplay(historyData.date)}</div>
        <div class="history-column customers">${historyData.customerCount}</div>
        <div class="history-column revenue">₹ ${historyData.revenue.toFixed(2)}</div>
    `;

    // Add to history table
    historyBody.appendChild(row);
}

// Function to update or create a revenue history record for today
function updateTodayRevenueHistory(transactions) {
    // Calculate today's date in YYYY-MM-DD format
    const today = formatDate(new Date());

    // Calculate revenue and customer count
    let revenue = 0;
    const uniqueCustomers = new Set();

    transactions.forEach(transaction => {
        if (transaction.status === 'paid' && isToday(transaction.createdAt)) {
            revenue += transaction.amount;
            uniqueCustomers.add(transaction.name.toLowerCase());
        }
    });

    // Check if a record already exists for today
    revenueHistoryCollection
        .where('userId', '==', currentUser.id)
        .where('date', '==', today)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                // Create new record
                revenueHistoryCollection.add({
                    userId: currentUser.id,
                    date: today,
                    revenue: revenue,
                    customerCount: uniqueCustomers.size,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Update existing record
                const docId = snapshot.docs[0].id;
                revenueHistoryCollection.doc(docId).update({
                    revenue: revenue,
                    customerCount: uniqueCustomers.size,
                    updatedAt: new Date().toISOString()
                });
            }
        })
        .catch(error => {
            console.error('Error updating revenue history:', error);
        });
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

                // Reset revenue display
                updateRevenueDisplay(0);
                return;
            }

            // Store all transactions for revenue calculation
            const transactions = [];

            // Add transactions to UI
            snapshot.forEach(doc => {
                const transaction = {
                    id: doc.id,
                    ...doc.data(),
                    warning: false // No longer using warning flag for specific time
                };

                transactions.push(transaction);
                addTransactionToUI(transaction);
            });

            // Calculate and display today's revenue
            const todayRevenue = calculateTodayRevenue(transactions);
            updateRevenueDisplay(todayRevenue);

            // Update revenue history for today
            updateTodayRevenueHistory(transactions);
        })
        .catch(error => {
            console.error('Error loading transactions:', error);
            tableBody.innerHTML = '';
            const errorRow = document.createElement('div');
            errorRow.className = 'table-row error';
            errorRow.innerHTML = '<div class="column" style="text-align: center; flex: 1; color: #d32f2f;">Error loading transactions. Please refresh the page.</div>';
            tableBody.appendChild(errorRow);

            // Reset revenue display on error
            updateRevenueDisplay(0);
        });
}

// Keep track of active messages
let activeMessages = [];
let messageCounter = 0;

function showMessage(message, type) {
    // Create a unique ID for this message
    const messageId = `message-${messageCounter++}`;

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.id = messageId;
    messageElement.textContent = message;

    // Add close button
    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'message-close';
    closeButton.addEventListener('click', () => {
        removeMessage(messageId);
    });

    messageElement.appendChild(closeButton);

    // Add to active messages
    activeMessages.push({
        id: messageId,
        element: messageElement,
        timer: null
    });

    // Position messages from bottom to top
    positionMessages();

    // Add to DOM
    document.body.appendChild(messageElement);

    // Auto-remove after 3 seconds
    const timer = setTimeout(() => {
        removeMessage(messageId);
    }, 3000);

    // Update the timer in our active messages array
    const messageObj = activeMessages.find(m => m.id === messageId);
    if (messageObj) {
        messageObj.timer = timer;
    }
}

function removeMessage(messageId) {
    const index = activeMessages.findIndex(m => m.id === messageId);
    if (index !== -1) {
        const messageObj = activeMessages[index];

        // Clear the timeout if it exists
        if (messageObj.timer) {
            clearTimeout(messageObj.timer);
        }

        // Add hide class for animation
        messageObj.element.classList.add('hide');

        // Remove from DOM after animation
        setTimeout(() => {
            if (messageObj.element.parentNode) {
                messageObj.element.remove();
            }

            // Remove from active messages array
            activeMessages.splice(index, 1);

            // Reposition remaining messages
            positionMessages();
        }, 300);
    }
}

function positionMessages() {
    // Position messages from bottom to top with 10px gap
    let bottomOffset = 20;

    activeMessages.forEach(messageObj => {
        messageObj.element.style.bottom = `${bottomOffset}px`;
        bottomOffset += messageObj.element.offsetHeight + 10;
    });
}

// Function to set up midnight check for daily history update
function setupMidnightCheck() {
    // Calculate time until next midnight
    function getTimeUntilMidnight() {
        const now = new Date();
        const midnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1, // next day
            0, 0, 0 // midnight (00:00:00)
        );
        return midnight.getTime() - now.getTime();
    }

    // Function to run at midnight
    function midnightUpdate() {
        console.log('Midnight update triggered');

        // Only proceed if user is logged in
        if (currentUser) {
            // Load all transactions to update history
            rentalCollection.where('userId', '==', currentUser.id)
                .get()
                .then(snapshot => {
                    const transactions = [];
                    snapshot.forEach(doc => {
                        transactions.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });

                    // Update today's revenue history (which is now a new day)
                    updateTodayRevenueHistory(transactions);

                    // Update the revenue display
                    const todayRevenue = calculateTodayRevenue(transactions);
                    updateRevenueDisplay(todayRevenue);

                    // Show a message
                    showMessage('Daily revenue history updated', 'success');
                })
                .catch(error => {
                    console.error('Error updating midnight history:', error);
                });
        }

        // Set up the next midnight check
        setTimeout(midnightUpdate, getTimeUntilMidnight());
    }

    // Start the midnight check cycle
    setTimeout(midnightUpdate, getTimeUntilMidnight());

    // Also check if we need to create a history record for today when the page loads
    if (currentUser) {
        const today = formatDate(new Date());

        revenueHistoryCollection
            .where('userId', '==', currentUser.id)
            .where('date', '==', today)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    // We don't have a record for today yet, so load transactions and create one
                    rentalCollection.where('userId', '==', currentUser.id)
                        .get()
                        .then(snapshot => {
                            const transactions = [];
                            snapshot.forEach(doc => {
                                transactions.push({
                                    id: doc.id,
                                    ...doc.data()
                                });
                            });

                            // Create today's history record
                            updateTodayRevenueHistory(transactions);
                        });
                }
            });
    }
}
