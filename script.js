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
const calendarToggle = document.getElementById('calendar-toggle');
const calendarToggleText = document.getElementById('calendar-toggle-text');
const userIcon = document.querySelector('.user-icon');
const tableBody = document.querySelector('.table-body');
const usernameDisplay = document.getElementById('username-display');
const todayRevenueDisplay = document.getElementById('today-revenue');
const historyModal = document.getElementById('history-modal');
const closeHistoryModal = document.getElementById('close-history-modal');
const historyBody = document.getElementById('history-body');
const historyMonthSelect = document.getElementById('history-month');
const historyYearSelect = document.getElementById('history-year');

// Calendar mode elements
const hoursInputGroup = document.getElementById('hours-input-group');
const dateRangeGroup = document.getElementById('date-range-group');
const endDateGroup = document.getElementById('end-date-group');
const calculatedDurationGroup = document.getElementById('calculated-duration-group');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const calculatedDuration = document.getElementById('calculated-duration');

// Event Listeners
addButton.addEventListener('click', openTransactionModal);
closeTransactionModal.addEventListener('click', () => closeModal('transaction-modal'));
cancelTransaction.addEventListener('click', () => closeModal('transaction-modal'));
saveTransaction.addEventListener('click', saveTransactionData);
closeHistoryModal.addEventListener('click', () => closeModal('history-modal'));

// Add direct event listeners for menu items
const directHistoryButton = document.getElementById('history-btn');
if (directHistoryButton) {
    directHistoryButton.addEventListener('click', function(e) {
        e.stopPropagation();
        openHistoryModal();
        console.log('History button clicked');
    });
}

const directLogoutButton = document.getElementById('logout-btn');
if (directLogoutButton) {
    directLogoutButton.addEventListener('click', function(e) {
        e.stopPropagation();
        logout();
        console.log('Logout button clicked');
    });
}

const directCalendarToggle = document.getElementById('calendar-toggle');
if (directCalendarToggle) {
    directCalendarToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleCalendarMode();
        console.log('Calendar toggle clicked');
    });
}

// Add both click and touchstart events for better mobile support
userIcon.addEventListener('click', toggleUserMenu);
userIcon.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Prevent default touch behavior
    toggleUserMenu(e);
}, { passive: false });

historyMonthSelect.addEventListener('change', loadHistoryData);
historyYearSelect.addEventListener('change', loadHistoryData);
startDateInput.addEventListener('change', calculateDateDuration);
endDateInput.addEventListener('change', calculateDateDuration);

// Calendar mode state
let calendarModeEnabled = false;

// Check if user is logged in
checkAuthState();

// Set up midnight check for daily history update
setupMidnightCheck();

// Load calendar mode preference
loadCalendarModePreference();

// Check for approaching due dates
checkDueDates();

// Request notification permission
requestNotificationPermission();

// Initialize menu event listeners
document.addEventListener('DOMContentLoaded', initializeMenuEventListeners);

// Function to initialize menu event listeners
function initializeMenuEventListeners() {
    console.log('Initializing menu event listeners');

    // Function to close the menu
    function closeMenu() {
        const userMenu = document.querySelector('.user-menu');
        const menuBackdrop = document.getElementById('menu-backdrop');

        if (userMenu && userMenu.classList.contains('show')) {
            userMenu.classList.remove('show');
            if (menuBackdrop && menuBackdrop.parentNode) {
                document.body.removeChild(menuBackdrop);
            }
        }
    }

    // Add direct event listeners for menu items without replacing elements
    // Handle history button click
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
        console.log('Adding event listeners to history button');

        // Clear existing listeners by cloning and replacing
        const parent = historyBtn.parentNode;
        const clone = historyBtn.cloneNode(true);
        parent.replaceChild(clone, historyBtn);

        // Add new listeners to the clone
        clone.addEventListener('click', function(e) {
            console.log('History button clicked');
            e.stopPropagation();
            closeMenu();
            openHistoryModal();
        });

        clone.addEventListener('touchstart', function(e) {
            console.log('History button touched');
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
            openHistoryModal();
        }, { passive: false });
    }

    // Handle calendar toggle button click
    const calToggle = document.getElementById('calendar-toggle');
    if (calToggle) {
        console.log('Adding event listeners to calendar toggle');

        // Clear existing listeners by cloning and replacing
        const parent = calToggle.parentNode;
        const clone = calToggle.cloneNode(true);
        parent.replaceChild(clone, calToggle);

        // Add new listeners to the clone
        clone.addEventListener('click', function(e) {
            console.log('Calendar toggle clicked');
            e.stopPropagation();
            closeMenu();
            toggleCalendarMode();
        });

        clone.addEventListener('touchstart', function(e) {
            console.log('Calendar toggle touched');
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
            toggleCalendarMode();
        }, { passive: false });
    }

    // Handle logout button click
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        console.log('Adding event listeners to logout button');

        // Clear existing listeners by cloning and replacing
        const parent = logoutBtn.parentNode;
        const clone = logoutBtn.cloneNode(true);
        parent.replaceChild(clone, logoutBtn);

        // Add new listeners to the clone
        clone.addEventListener('click', function(e) {
            console.log('Logout button clicked');
            e.stopPropagation();
            closeMenu();
            logout();
        });

        clone.addEventListener('touchstart', function(e) {
            console.log('Logout button touched');
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
            logout();
        }, { passive: false });
    }
}

// Function to toggle calendar mode
function toggleCalendarMode() {
    console.log('Toggle calendar mode called, current state:', calendarModeEnabled);
    calendarModeEnabled = !calendarModeEnabled;
    console.log('New calendar mode state:', calendarModeEnabled);

    // Update UI
    updateCalendarModeUI();

    // Save preference to user settings
    if (currentUser) {
        try {
            userCollection.doc(currentUser.id).update({
                calendarModeEnabled: calendarModeEnabled
            }).then(() => {
                console.log('Calendar mode preference saved successfully');
            }).catch(error => {
                console.error('Error saving calendar mode preference:', error);
            });
        } catch (error) {
            console.error('Error in toggleCalendarMode:', error);
        }
    }
}

// Function to update UI based on calendar mode
function updateCalendarModeUI() {
    console.log('Updating calendar mode UI');

    // Get fresh references to all elements
    const calToggleText = document.getElementById('calendar-toggle-text');
    const calToggle = document.getElementById('calendar-toggle');
    const hoursGroup = document.getElementById('hours-input-group');
    const dateRange = document.getElementById('date-range-group');
    const endDate = document.getElementById('end-date-group');
    const calcDuration = document.getElementById('calculated-duration-group');
    const startDate = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    console.log('Elements found:', {
        calToggleText: !!calToggleText,
        calToggle: !!calToggle,
        hoursGroup: !!hoursGroup,
        dateRange: !!dateRange,
        endDate: !!endDate,
        calcDuration: !!calcDuration,
        startDate: !!startDate,
        endDateInput: !!endDateInput
    });

    if (calendarModeEnabled) {
        // Update toggle button
        if (calToggleText) calToggleText.textContent = 'Disable Calendar';
        if (calToggle) calToggle.classList.add('active');

        // Update form fields
        if (hoursGroup) hoursGroup.style.display = 'none';
        if (dateRange) dateRange.style.display = 'block';
        if (endDate) endDate.style.display = 'block';
        if (calcDuration) calcDuration.style.display = 'block';

        // Set default dates if empty
        if (startDate && !startDate.value) {
            startDate.valueAsDate = new Date();
        }
        if (endDateInput && !endDateInput.value) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            endDateInput.valueAsDate = tomorrow;
        }

        // Calculate duration
        calculateDateDuration();

        // Show a success message
        showMessage('Calendar mode enabled', 'success');
    } else {
        // Update toggle button
        if (calToggleText) calToggleText.textContent = 'Enable Calendar';
        if (calToggle) calToggle.classList.remove('active');

        // Update form fields
        if (hoursGroup) hoursGroup.style.display = 'block';
        if (dateRange) dateRange.style.display = 'none';
        if (endDate) endDate.style.display = 'none';
        if (calcDuration) calcDuration.style.display = 'none';

        // Show a success message
        showMessage('Calendar mode disabled', 'success');
    }
}

// Function to calculate duration between dates
function calculateDateDuration() {
    console.log('Calculating date duration');

    // Get fresh references to the elements
    const startDateEl = document.getElementById('start-date');
    const endDateEl = document.getElementById('end-date');
    const calculatedDurationEl = document.getElementById('calculated-duration');

    // Check if elements exist
    if (!startDateEl || !endDateEl || !calculatedDurationEl) {
        console.error('Date elements not found:', {
            startDateEl: !!startDateEl,
            endDateEl: !!endDateEl,
            calculatedDurationEl: !!calculatedDurationEl
        });
        return;
    }

    console.log('Date values:', {
        startDate: startDateEl.value,
        endDate: endDateEl.value
    });

    if (!startDateEl.value || !endDateEl.value) {
        calculatedDurationEl.textContent = '0 days';
        return;
    }

    const startDate = new Date(startDateEl.value);
    const endDate = new Date(endDateEl.value);

    // Validate dates
    if (endDate < startDate) {
        calculatedDurationEl.textContent = 'Invalid date range';
        calculatedDurationEl.style.color = '#d32f2f';
        return;
    }

    // Calculate difference in days
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log('Calculated days:', diffDays);

    // Update UI
    calculatedDurationEl.textContent = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    calculatedDurationEl.style.color = '#333';
}

// Function to load calendar mode preference
function loadCalendarModePreference() {
    console.log('Loading calendar mode preference');

    if (currentUser) {
        try {
            userCollection.doc(currentUser.id).get()
                .then(doc => {
                    console.log('User document retrieved');

                    if (doc.exists) {
                        const userData = doc.data();
                        console.log('User data:', userData);

                        if (userData.calendarModeEnabled !== undefined) {
                            calendarModeEnabled = userData.calendarModeEnabled;
                            console.log('Calendar mode preference loaded:', calendarModeEnabled);

                            // Ensure we have the latest references before updating UI
                            setTimeout(() => {
                                updateCalendarModeUI();
                            }, 300);
                        } else {
                            console.log('Calendar mode preference not found, using default:', calendarModeEnabled);

                            // Save the default preference
                            userCollection.doc(currentUser.id).update({
                                calendarModeEnabled: calendarModeEnabled
                            }).catch(error => {
                                console.error('Error saving default calendar mode preference:', error);
                            });
                        }
                    } else {
                        console.log('User document does not exist');
                    }
                })
                .catch(error => {
                    console.error('Error loading calendar mode preference:', error);
                });
        } catch (error) {
            console.error('Error in loadCalendarModePreference:', error);
        }
    } else {
        console.log('No current user, cannot load calendar mode preference');
    }
}

// Functions
function openTransactionModal() {
    transactionModal.style.display = 'flex';
}

function openHistoryModal() {
    console.log('Opening history modal');

    // Get a fresh reference to the history modal
    const historyModalEl = document.getElementById('history-modal');

    if (!historyModalEl) {
        console.error('History modal element not found');
        showMessage('Error: History modal not found', 'error');
        return;
    }

    // Initialize month and year selects
    initializeHistoryFilters();

    // Load history data
    loadHistoryData();

    // Show modal
    historyModalEl.style.display = 'flex';
    console.log('History modal displayed');

    // Show a message
    showMessage('Revenue history loaded', 'success');
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
        showMessage('Please log in to add transactions', 'error');
        window.location.href = 'login.html';
        return;
    }

    // Get form values
    const name = document.getElementById('name').value;
    const amount = document.getElementById('amount').value;
    const status = document.getElementById('status').value;

    // Get duration based on mode
    let duration, startDate, endDate;

    if (calendarModeEnabled) {
        startDate = startDateInput.value;
        endDate = endDateInput.value;

        // Validate date inputs
        if (!startDate || !endDate) {
            showMessage('Please select both start and end dates', 'error');
            return;
        }

        // Calculate duration in days
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            showMessage('End date must be after start date', 'error');
            return;
        }

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        duration = `${diffDays}d`;
    } else {
        duration = document.getElementById('duration').value;

        // Validate duration
        if (!duration) {
            showMessage('Please enter duration', 'error');
            return;
        }

        duration = `${duration}h`;
    }

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
        time: duration,
        amount: parseFloat(amount),
        status: status,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
    };

    // Add date range if calendar mode is enabled
    if (calendarModeEnabled) {
        newTransaction.startDate = startDate;
        newTransaction.endDate = endDate;
    }

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
                    document.getElementById('amount').value = '';
                    document.getElementById('status').value = 'pending';

                    if (calendarModeEnabled) {
                        // Reset date inputs to default values
                        const today = new Date();
                        startDateInput.valueAsDate = today;

                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        endDateInput.valueAsDate = tomorrow;

                        // Recalculate duration
                        calculateDateDuration();
                    } else {
                        // Reset duration input
                        document.getElementById('duration').value = '';
                    }

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
    console.log('Logout function called');

    try {
        // First redirect to login page immediately
        // This is the most important part and should happen regardless of errors
        console.log('Redirecting to login page immediately');

        // Clear user data first
        currentUser = null;
        localStorage.removeItem('currentUser');

        // Use a simple alert instead of showMessage to avoid any potential errors
        alert('Logged out successfully');

        // Redirect immediately
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Critical error during logout:', error);

        // If there's an error, still try to redirect
        alert('Error during logout, but still redirecting to login page');
        window.location.href = 'login.html';
    }
}

function toggleUserMenu(event) {
    // Prevent the event from bubbling up to document
    if (event) {
        event.stopPropagation();
    }

    const userMenu = document.querySelector('.user-menu');
    const menuBackdrop = document.getElementById('menu-backdrop') || createMenuBackdrop();

    // Toggle menu visibility
    if (userMenu.classList.contains('show')) {
        // Hide menu
        userMenu.classList.remove('show');
        document.body.removeChild(menuBackdrop);
    } else {
        // Show menu
        userMenu.classList.add('show');
        document.body.appendChild(menuBackdrop);

        // Position the menu correctly for mobile
        if (window.innerWidth <= 600) {
            const userIcon = document.querySelector('.user-icon');
            const iconRect = userIcon.getBoundingClientRect();

            userMenu.style.top = `${iconRect.bottom + 5}px`;
            userMenu.style.right = `${window.innerWidth - iconRect.right}px`;
        }
    }
}

// Function to create a backdrop for the menu
function createMenuBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.id = 'menu-backdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.zIndex = '99'; // Just below the menu (z-index 100)
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'; // Slight darkening for visual feedback
    backdrop.style.transition = 'opacity 0.2s';

    // Close menu when clicking or touching the backdrop
    backdrop.addEventListener('click', closeBackdrop);
    backdrop.addEventListener('touchstart', closeBackdrop);

    function closeBackdrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const userMenu = document.querySelector('.user-menu');
        if (userMenu) userMenu.classList.remove('show');

        // Fade out effect
        backdrop.style.opacity = '0';

        // Remove after animation
        setTimeout(() => {
            if (backdrop.parentNode) {
                document.body.removeChild(backdrop);
            }
        }, 200);
    }

    // Start with 0 opacity and fade in
    backdrop.style.opacity = '0';
    setTimeout(() => {
        backdrop.style.opacity = '1';
    }, 10);

    return backdrop;
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
    // If the duration is in days format (from calendar mode)
    if (durationStr.includes('d')) {
        const days = parseFloat(durationStr.replace('d', ''));
        return `${days} day${days !== 1 ? 's' : ''}`;
    }

    // If the duration is in hours format
    if (durationStr.includes('h')) {
        const hours = parseFloat(durationStr.replace('h', ''));
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    // Handle old format (for backward compatibility)
    if (durationStr.includes('m')) {
        // Convert minutes to hours
        const minutes = parseFloat(durationStr.replace('m', ''));
        const hours = (minutes / 60).toFixed(1);
        return `${hours} hour${hours !== '1.0' ? 's' : ''}`;
    }

    // Handle seconds format
    if (durationStr.includes('s')) {
        return '0 hours';
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
    try {
        console.log('Showing message:', message, type);

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
            try {
                removeMessage(messageId);
            } catch (err) {
                console.error('Error removing message:', err);
            }
        });

        messageElement.appendChild(closeButton);

        // Add to active messages array (create if it doesn't exist)
        if (!window.activeMessages) {
            window.activeMessages = [];
        }

        window.activeMessages.push({
            id: messageId,
            element: messageElement,
            timer: null
        });

        // Position messages from bottom to top
        try {
            positionMessages();
        } catch (err) {
            console.error('Error positioning messages:', err);
            // Set a default position if positioning fails
            messageElement.style.bottom = '20px';
        }

        // Add to DOM if body exists
        if (document.body) {
            document.body.appendChild(messageElement);
        } else {
            console.error('Document body not available');
            return; // Exit early if body doesn't exist
        }

        // Auto-remove after 3 seconds
        const timer = setTimeout(() => {
            try {
                removeMessage(messageId);
            } catch (err) {
                console.error('Error auto-removing message:', err);
                // Fallback removal if removeMessage fails
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }
        }, 3000);

        // Update the timer in our active messages array
        const messageObj = window.activeMessages.find(m => m.id === messageId);
        if (messageObj) {
            messageObj.timer = timer;
        }

        return messageId; // Return the ID for potential future reference
    } catch (error) {
        console.error('Critical error in showMessage:', error);
        // Don't throw further to prevent app from crashing

        // Try a very basic alert as fallback
        try {
            alert(message);
        } catch (alertError) {
            console.error('Even alert failed:', alertError);
        }
    }
}

function removeMessage(messageId) {
    try {
        console.log('Removing message:', messageId);

        // Use window.activeMessages to ensure we're accessing the global array
        const messages = window.activeMessages || [];
        const index = messages.findIndex(m => m.id === messageId);

        if (index !== -1) {
            const messageObj = messages[index];

            // Clear the timeout if it exists
            if (messageObj.timer) {
                clearTimeout(messageObj.timer);
            }

            // Add hide class for animation if element exists
            if (messageObj.element) {
                messageObj.element.classList.add('hide');

                // Remove from DOM after animation
                setTimeout(() => {
                    try {
                        if (messageObj.element && messageObj.element.parentNode) {
                            messageObj.element.parentNode.removeChild(messageObj.element);
                        }

                        // Remove from active messages array
                        if (window.activeMessages) {
                            window.activeMessages.splice(index, 1);
                        }

                        // Reposition remaining messages
                        positionMessages();
                    } catch (err) {
                        console.error('Error in removeMessage timeout callback:', err);
                    }
                }, 300);
            } else {
                // If element doesn't exist, just remove from array
                if (window.activeMessages) {
                    window.activeMessages.splice(index, 1);
                }
            }
        } else {
            console.warn('Message not found for removal:', messageId);
        }
    } catch (error) {
        console.error('Error in removeMessage:', error);
    }
}

function positionMessages() {
    try {
        console.log('Positioning messages');

        // Use window.activeMessages to ensure we're accessing the global array
        const messages = window.activeMessages || [];

        if (messages.length === 0) {
            return; // No messages to position
        }

        // Position messages from bottom to top with 10px gap
        let bottomOffset = 20;

        messages.forEach(messageObj => {
            if (messageObj && messageObj.element) {
                messageObj.element.style.bottom = `${bottomOffset}px`;

                // Only add height if we can get it
                try {
                    bottomOffset += messageObj.element.offsetHeight + 10;
                } catch (err) {
                    console.warn('Could not get element height, using default spacing');
                    bottomOffset += 80; // Default height + spacing
                }
            }
        });
    } catch (error) {
        console.error('Error in positionMessages:', error);
    }
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

                    // Check for approaching due dates
                    checkDueDates();

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

// Function to request notification permission
function requestNotificationPermission() {
    // Check if the browser supports notifications
    if ('Notification' in window) {
        // Check if permission is not granted or denied
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            // Show a message asking for permission
            showMessage('Would you like to receive notifications for approaching due dates?', 'info');

            // Add a notification permission button
            const permissionBtn = document.createElement('button');
            permissionBtn.textContent = 'Allow Notifications';
            permissionBtn.style.marginTop = '10px';
            permissionBtn.style.padding = '8px 12px';
            permissionBtn.style.backgroundColor = '#1a73e8';
            permissionBtn.style.color = 'white';
            permissionBtn.style.border = 'none';
            permissionBtn.style.borderRadius = '4px';
            permissionBtn.style.cursor = 'pointer';

            // Add click event
            permissionBtn.addEventListener('click', () => {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        showMessage('Notifications enabled!', 'success');
                    }
                });
            });

            // Add to the last message
            const messages = document.querySelectorAll('.message');
            if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                lastMessage.appendChild(document.createElement('br'));
                lastMessage.appendChild(permissionBtn);
            }
        }
    }
}

// Function to check for approaching due dates
function checkDueDates() {
    if (!currentUser) return;

    // Only check if calendar mode is enabled and we have transactions with end dates
    rentalCollection.where('userId', '==', currentUser.id)
        .where('status', '==', 'pending') // Only check pending transactions
        .get()
        .then(snapshot => {
            if (snapshot.empty) return;

            const today = new Date();
            const approachingDueDates = [];

            snapshot.forEach(doc => {
                const transaction = {
                    id: doc.id,
                    ...doc.data()
                };

                // Skip if no end date (not using calendar mode)
                if (!transaction.endDate) return;

                const endDate = new Date(transaction.endDate);
                const daysUntilDue = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                // Check if due date is approaching (2 days or less)
                if (daysUntilDue <= 2 && daysUntilDue >= 0) {
                    approachingDueDates.push({
                        ...transaction,
                        daysUntilDue
                    });
                }
            });

            // Show notifications for approaching due dates
            if (approachingDueDates.length > 0) {
                showDueDateNotifications(approachingDueDates);
            }
        })
        .catch(error => {
            console.error('Error checking due dates:', error);
        });
}

// Function to show due date notifications
function showDueDateNotifications(approachingDueDates) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.due-date-notification');
    existingNotifications.forEach(notification => notification.remove());

    // Show notifications for each approaching due date
    approachingDueDates.forEach((transaction, index) => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'due-date-notification';
        notification.style.top = `${20 + (index * 90)}px`; // Stack notifications

        // Add close button
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-btn';
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Create notification content
        const content = document.createElement('div');
        content.innerHTML = `
            <strong>Due Date Approaching!</strong><br>
            <span class="customer-name">${transaction.name}</span>'s transaction will
            ${transaction.daysUntilDue === 0 ? 'end today' : `end in ${transaction.daysUntilDue} day${transaction.daysUntilDue !== 1 ? 's' : ''}`}.
        `;

        // Add elements to notification
        notification.appendChild(closeBtn);
        notification.appendChild(content);

        // Add to document
        document.body.appendChild(notification);

        // Send browser notification if permission granted
        if (Notification.permission === 'granted') {
            const notificationTitle = 'Due Date Approaching';
            const notificationOptions = {
                body: `${transaction.name}'s transaction will ${transaction.daysUntilDue === 0 ? 'end today' : `end in ${transaction.daysUntilDue} day${transaction.daysUntilDue !== 1 ? 's' : ''}`}.`,
                icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png'
            };

            // Send more notifications for last day
            if (transaction.daysUntilDue === 0) {
                // Send 3 notifications for the last day
                new Notification(notificationTitle, notificationOptions);

                // Send second notification after 1 hour
                setTimeout(() => {
                    new Notification('URGENT: Due Date Today', {
                        body: `${transaction.name}'s transaction ends today!`,
                        icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png'
                    });
                }, 60 * 60 * 1000); // 1 hour

                // Send third notification after 2 hours
                setTimeout(() => {
                    new Notification('FINAL REMINDER: Due Date Today', {
                        body: `${transaction.name}'s transaction ends today! Take action now.`,
                        icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png'
                    });
                }, 2 * 60 * 60 * 1000); // 2 hours
            }
            // Send 2 notifications for second-to-last day
            else if (transaction.daysUntilDue === 1) {
                new Notification(notificationTitle, notificationOptions);

                // Send second notification after 2 hours
                setTimeout(() => {
                    new Notification('Reminder: Due Date Tomorrow', {
                        body: `${transaction.name}'s transaction ends tomorrow!`,
                        icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png'
                    });
                }, 2 * 60 * 60 * 1000); // 2 hours
            }
            // Send 1 notification for earlier days
            else {
                new Notification(notificationTitle, notificationOptions);
            }
        }
    });
}
