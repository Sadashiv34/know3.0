// TypeScript declarations for global window properties
// @ts-ignore
window.approachingDueDates = [];
// @ts-ignore
window.upcomingDueDates = [];
// @ts-ignore
window.scheduledNotifications = [];
// @ts-ignore
window.dismissedDueDates = {};

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
const searchInput = document.getElementById('search-input');
const clearSearchButton = document.getElementById('clear-search');
const searchResultsCount = document.getElementById('search-results-count');
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

// Search functionality event listeners
searchInput.addEventListener('input', handleSearch);
clearSearchButton.addEventListener('click', clearSearch);

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

// Initialize days remaining for calendar transactions
document.addEventListener('DOMContentLoaded', () => {
    // Update days remaining for transactions
    if (calendarModeEnabled) {
        updateDaysRemaining();

        // Check for approaching due dates after a short delay
        setTimeout(() => {
            checkDueDates();
        }, 2000);
    }
});

// Initialize menu event listeners
document.addEventListener('DOMContentLoaded', initializeMenuEventListeners);

// Function to initialize menu event listeners
function initializeMenuEventListeners() {
    console.log('Initializing menu event listeners');

    // Function to close the menu
    function closeMenu() {
        const userMenu = document.querySelector('.user-menu');
        const menuBackdrop = document.getElementById('menu-backdrop');
        const notificationPanel = document.getElementById('notification-panel');

        if (userMenu && userMenu.classList.contains('show')) {
            userMenu.classList.remove('show');
            if (menuBackdrop && menuBackdrop.parentNode) {
                document.body.removeChild(menuBackdrop);
            }
        }

        // Also close notification panel if open
        if (notificationPanel && notificationPanel.classList.contains('show')) {
            notificationPanel.classList.remove('show');
        }
    }

    // Initialize notification bell
    initializeNotificationBell();

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
    const wasDisabled = !calendarModeEnabled;
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

                // If calendar mode was just enabled, check if we should request notification permission
                if (wasDisabled && calendarModeEnabled) {
                    checkNotificationPermission();
                }

                // If calendar mode was enabled, check for due dates
                if (calendarModeEnabled) {
                    checkDueDates();
                }
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
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };

    // Add mode flag to clearly distinguish between calendar and hours mode transactions
    if (calendarModeEnabled) {
        // Calendar mode transaction
        newTransaction.timeMode = 'calendar';
        newTransaction.startDate = startDate;
        newTransaction.endDate = endDate;

        // Calculate and add days remaining
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day

        const endDateObj = new Date(endDate);
        endDateObj.setHours(0, 0, 0, 0); // Set to beginning of day

        const diffTime = endDateObj - today;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        newTransaction.daysRemaining = daysRemaining;

        console.log(`New transaction: ${name}, days remaining: ${daysRemaining}`);
    } else {
        // Hours mode transaction
        newTransaction.timeMode = 'hours';
        newTransaction.durationHours = parseFloat(document.getElementById('duration').value);

        console.log(`New transaction: ${name}, duration: ${newTransaction.durationHours} hours`);
    }

    // Get today's date in YYYY-MM-DD format for transaction numbering
    const transactionDate = formatDate(new Date());

    // Query existing transactions for today to determine the next transaction number
    rentalCollection
        .where('userId', '==', currentUser.id)
        .where('transactionDate', '==', transactionDate)
        .orderBy('transactionNumber', 'desc')
        .limit(1)
        .get()
        .then(snapshot => {
            let nextTransactionNumber = 1; // Default to 1 if no transactions exist for today

            if (!snapshot.empty) {
                // Get the highest transaction number and increment by 1
                const highestTransaction = snapshot.docs[0].data();
                nextTransactionNumber = (highestTransaction.transactionNumber || 0) + 1;
            }

            // Add transaction date and number to the transaction object
            newTransaction.transactionDate = transactionDate;
            newTransaction.transactionNumber = nextTransactionNumber;

            console.log(`Assigning transaction number ${nextTransactionNumber} for date ${transactionDate}`);

            // Save to Firebase
            return rentalCollection.add(newTransaction);
        })
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
}

function addTransactionToUI(transaction) {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.setAttribute('data-id', transaction.id);

    // Add transaction date as a data attribute for easier reference during deletion
    const transactionDate = transaction.transactionDate || formatDate(new Date(transaction.createdAt));
    row.setAttribute('data-date', transactionDate);

    // Determine if this is a calendar mode or hours mode transaction
    const isCalendarMode = transaction.timeMode === 'calendar' ||
                          (transaction.endDate && transaction.endDate !== '' && !transaction.timeMode);

    // Prepare time/duration display and icon
    let timeDisplay = '';
    let timeIcon = '<i class="far fa-clock time-icon"></i>';

    if (isCalendarMode) {
        // Calendar mode transaction
        // Calculate days remaining if needed
        const daysRemaining = transaction.daysRemaining !== undefined ? transaction.daysRemaining :
                             (transaction.endDate ? calculateDaysRemaining(transaction.endDate) : null);

        // Store the mode in a data attribute for easier reference
        row.setAttribute('data-time-mode', 'calendar');

        // Determine if this is an urgent transaction (0 days remaining)
        const isUrgent = daysRemaining === 0;

        // Add urgent class if needed
        if (isUrgent) {
            row.classList.add('urgent-transaction');
        }

        // Format the duration display
        timeDisplay = formatDuration(transaction.time, 'calendar');

        // If days remaining is available, add days remaining info
        if (daysRemaining !== null) {
            // Format days remaining text
            let daysRemainingText = '';
            if (daysRemaining === 0) {
                daysRemainingText = '<span class="days-remaining urgent">Ends today!</span>';
                timeIcon = '<i class="fas fa-exclamation-circle urgent-icon"></i>';
            } else if (daysRemaining === 1) {
                daysRemainingText = '<span class="days-remaining warning">1 day left</span>';
                timeIcon = '<i class="fas fa-exclamation-triangle warning-icon"></i>';
            } else if (daysRemaining === 2) {
                daysRemainingText = '<span class="days-remaining warning">2 days left</span>';
                timeIcon = '<i class="fas fa-exclamation-triangle warning-icon"></i>';
            } else if (daysRemaining > 0) {
                daysRemainingText = `<span class="days-remaining">${daysRemaining} days left</span>`;
            } else {
                daysRemainingText = '<span class="days-remaining overdue">Overdue</span>';
                timeIcon = '<i class="fas fa-exclamation-circle urgent-icon"></i>';
            }

            // Add days remaining to time display
            timeDisplay = `${timeDisplay} <br>${daysRemainingText}`;
        }
    } else {
        // Hours mode transaction
        // Store the mode in a data attribute for easier reference
        row.setAttribute('data-time-mode', 'hours');

        // Format the duration display
        timeDisplay = formatDuration(transaction.time, 'hours');

        // Use warning icon if transaction has a warning flag
        if (transaction.warning) {
            timeIcon = '<i class="fas fa-exclamation-triangle warning-icon"></i>';
        }
    }

    // Prepare transaction number display
    let transactionNumberDisplay = '';
    if (transaction.transactionNumber) {
        transactionNumberDisplay = `<span class="transaction-number">#${transaction.transactionNumber}</span>`;
    }

    row.innerHTML = `
        <div class="column name">
            ${transaction.name}
            ${transactionNumberDisplay}
        </div>
        <div class="column time">
            ${timeIcon}
            ${timeDisplay}
        </div>
        <div class="column amount">₹ ${transaction.amount.toFixed(2)}</div>
        <div class="column status">
            <span class="status-badge ${transaction.status}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
            <button class="delete-btn" title="Delete transaction"><i class="fas fa-trash"></i></button>
        </div>
    `;

    // Add click event to status badge for toggling
    const statusBadge = row.querySelector('.status-badge');
    statusBadge.addEventListener('click', () => toggleStatus(transaction.id));

    // Add click event to delete button
    const deleteBtn = row.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        deleteTransaction(transaction.id);
    });

    // Add to table
    tableBody.appendChild(row);
}

// Helper function to calculate days remaining from an end date
function calculateDaysRemaining(endDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate calculation

    const endDate = new Date(endDateStr);
    endDate.setHours(0, 0, 0, 0); // Set to beginning of day

    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

// Function to handle transaction deletion and renumber remaining transactions
function deleteTransaction(transactionId) {
    // Check if user is logged in
    if (!currentUser) {
        showMessage('Please log in to delete transactions', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    // Find the row in the UI first and add a "deleting" visual state
    const row = document.querySelector(`.table-row[data-id="${transactionId}"]`);
    if (row) {
        row.classList.add('deleting');
    }

    // Get the transaction to be deleted
    rentalCollection.doc(transactionId).get()
        .then(doc => {
            if (!doc.exists) {
                showMessage('Transaction not found', 'error');
                if (row) {
                    row.classList.remove('deleting');
                }
                return;
            }

            const transaction = doc.data();
            const transactionDate = transaction.transactionDate || formatDate(new Date(transaction.createdAt));
            const transactionNumber = transaction.transactionNumber;
            const isPaidTransaction = transaction.status === 'paid';
            const isFromToday = isToday(transaction.createdAt);

            // Remove from UI immediately for better user experience
            if (row) {
                row.remove();
            }

            // Delete the transaction from Firestore
            rentalCollection.doc(transactionId).delete()
                .then(() => {
                    // Show success message
                    showMessage('Transaction deleted successfully', 'success');

                    // If the transaction was paid and from today, update the revenue display
                    if (isPaidTransaction && isFromToday) {
                        try {
                            // Get the current revenue amount
                            const currentRevenue = parseFloat(todayRevenueDisplay.textContent.replace('₹', '').trim());
                            // Subtract the deleted transaction amount
                            const newRevenue = Math.max(0, currentRevenue - transaction.amount);
                            // Update the display
                            updateRevenueDisplay(newRevenue);

                            // Update revenue history in the background
                            updateTodayRevenueHistoryAfterDeletion();
                        } catch (error) {
                            console.error('Error updating revenue display:', error);
                        }
                    }

                    // If the transaction had a number, update the UI for other transactions with the same date
                    if (transactionNumber) {
                        // Find all transactions in the UI with the same date and higher numbers
                        const allRows = document.querySelectorAll('.table-row');
                        const affectedRows = [];

                        allRows.forEach(r => {
                            const id = r.getAttribute('data-id');
                            if (id) {
                                // Find the transaction number element
                                const numberElement = r.querySelector('.transaction-number');
                                if (numberElement) {
                                    const currentNumber = parseInt(numberElement.textContent.replace('#', ''));
                                    const rowDate = r.getAttribute('data-date');

                                    // If this transaction is from the same date and has a higher number
                                    if (rowDate === transactionDate && currentNumber > transactionNumber) {
                                        affectedRows.push({
                                            row: r,
                                            element: numberElement,
                                            currentNumber: currentNumber,
                                            id: id
                                        });
                                    }
                                }
                            }
                        });

                        // Update the UI for affected rows
                        affectedRows.forEach(item => {
                            // Update the number in the UI
                            item.element.textContent = `#${item.currentNumber - 1}`;
                        });

                        // In the background, update the database for affected transactions
                        rentalCollection
                            .where('userId', '==', currentUser.id)
                            .where('transactionDate', '==', transactionDate)
                            .where('transactionNumber', '>', transactionNumber)
                            .get()
                            .then(snapshot => {
                                if (!snapshot.empty) {
                                    // Create batch to update all transactions at once
                                    const batch = db.batch();

                                    snapshot.forEach(doc => {
                                        const higherTransaction = doc.data();
                                        // Decrement the transaction number
                                        batch.update(doc.ref, {
                                            transactionNumber: higherTransaction.transactionNumber - 1
                                        });
                                    });

                                    // Commit the batch
                                    return batch.commit();
                                }
                            })
                            .then(() => {
                                console.log('Transaction numbers updated successfully');
                            })
                            .catch(error => {
                                console.error('Error updating transaction numbers:', error);
                                // Don't show error to user as the UI is already updated
                            });
                    }
                })
                .catch(error => {
                    console.error('Error deleting transaction:', error);
                    showMessage('Error deleting transaction. Please try again.', 'error');

                    // If there was an error, we need to reload the transactions to ensure UI consistency
                    loadTransactions();
                });
        })
        .catch(error => {
            console.error('Error getting transaction:', error);
            showMessage('Error deleting transaction. Please try again.', 'error');
            if (row) {
                row.classList.remove('deleting');
            }
        });
}

// Function to update today's revenue history after a transaction is deleted
function updateTodayRevenueHistoryAfterDeletion() {
    const today = formatDate(new Date());

    // Get all of today's transactions
    rentalCollection
        .where('userId', '==', currentUser.id)
        .where('createdAt', '>=', today + 'T00:00:00.000Z')
        .where('createdAt', '<=', today + 'T23:59:59.999Z')
        .get()
        .then(snapshot => {
            const transactions = [];
            snapshot.forEach(doc => {
                transactions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Update today's revenue history
            updateTodayRevenueHistory(transactions);
        })
        .catch(error => {
            console.error('Error updating revenue history after deletion:', error);
        });
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

                                            // Update revenue display directly without reloading all transactions
                                            if (newStatus === 'paid') {
                                                // Add the transaction amount to today's revenue
                                                const currentRevenue = parseFloat(todayRevenueDisplay.textContent.replace('₹', '').trim());
                                                const newRevenue = currentRevenue + transaction.amount;
                                                updateRevenueDisplay(newRevenue);
                                            } else {
                                                // Subtract the transaction amount from today's revenue
                                                const currentRevenue = parseFloat(todayRevenueDisplay.textContent.replace('₹', '').trim());
                                                const newRevenue = Math.max(0, currentRevenue - transaction.amount);
                                                updateRevenueDisplay(newRevenue);
                                            }

                                            // Update revenue history in the background
                                            updateTodayRevenueHistoryAfterDeletion();
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



// Function to handle search input
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    // Show/hide clear button based on search term
    clearSearchButton.style.display = searchTerm ? 'block' : 'none';

    // Get all transaction rows
    const rows = document.querySelectorAll('.table-row');
    let visibleCount = 0;

    // If search term is empty, show all rows
    if (!searchTerm) {
        rows.forEach(row => {
            if (!row.classList.contains('empty') && !row.classList.contains('error')) {
                row.style.display = 'flex';
                visibleCount++;
            }
        });

        // Hide search results count
        searchResultsCount.textContent = '';
        return;
    }

    // Filter rows based on search term
    rows.forEach(row => {
        // Skip empty or error rows
        if (row.classList.contains('empty') || row.classList.contains('error')) {
            return;
        }

        // Get transaction name from the row
        const nameColumn = row.querySelector('.column.name');
        const name = nameColumn ? nameColumn.textContent.trim().toLowerCase() : '';

        // Get transaction time/duration from the row
        const timeColumn = row.querySelector('.column.time');
        const timeText = timeColumn ? timeColumn.textContent.trim().toLowerCase() : '';

        // Get transaction amount from the row
        const amountColumn = row.querySelector('.column.amount');
        const amountText = amountColumn ? amountColumn.textContent.trim().toLowerCase() : '';

        // Get transaction status from the row
        const statusColumn = row.querySelector('.column.status');
        const statusText = statusColumn ? statusColumn.querySelector('.status-badge').textContent.trim().toLowerCase() : '';

        // Check if any field contains search term
        if (name.includes(searchTerm) ||
            timeText.includes(searchTerm) ||
            amountText.includes(searchTerm) ||
            statusText.includes(searchTerm)) {
            row.style.display = 'flex';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Show empty state if no results found
    if (visibleCount === 0) {
        // Check if empty row already exists
        let emptyRow = document.querySelector('.table-row.empty.search-empty');

        if (!emptyRow) {
            // Create empty row
            emptyRow = document.createElement('div');
            emptyRow.className = 'table-row empty search-empty';
            emptyRow.innerHTML = '<div class="column" style="text-align: center; flex: 1;">No results found for "' + searchTerm + '"</div>';
            tableBody.appendChild(emptyRow);
        } else {
            // Update existing empty row
            emptyRow.innerHTML = '<div class="column" style="text-align: center; flex: 1;">No results found for "' + searchTerm + '"</div>';
            emptyRow.style.display = 'flex';
        }
    } else {
        // Remove empty row if it exists
        const emptyRow = document.querySelector('.table-row.empty.search-empty');
        if (emptyRow) {
            emptyRow.style.display = 'none';
        }
    }

    // Update search results count
    searchResultsCount.textContent = `Found ${visibleCount} result${visibleCount !== 1 ? 's' : ''}`;
}

// Function to clear search
function clearSearch() {
    // Clear search input
    searchInput.value = '';

    // Hide clear button
    clearSearchButton.style.display = 'none';

    // Show all regular rows and hide empty search results row
    const rows = document.querySelectorAll('.table-row');
    rows.forEach(row => {
        if (row.classList.contains('search-empty')) {
            // Hide empty search results row
            row.style.display = 'none';
        } else if (!row.classList.contains('empty') && !row.classList.contains('error')) {
            // Show all regular transaction rows
            row.style.display = 'flex';
        }
    });

    // Clear search results count
    searchResultsCount.textContent = '';

    // Focus on search input
    searchInput.focus();

    // Trigger the search event to update the UI
    handleSearch();
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
function formatDuration(durationStr, timeMode) {
    // If timeMode is explicitly provided, use it to determine formatting
    if (timeMode === 'calendar') {
        // For calendar mode, extract the number from the string (e.g., "5d" -> 5)
        const days = parseFloat(durationStr.replace('d', ''));
        return `${days} day${days !== 1 ? 's' : ''}`;
    } else if (timeMode === 'hours') {
        // For hours mode, extract the number from the string (e.g., "3h" -> 3)
        const hours = parseFloat(durationStr.replace('h', ''));
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    // If timeMode is not provided, infer from the string format (for backward compatibility)

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

            // Group transactions by date for numbering
            const transactionsByDate = {};

            // First pass: group transactions by date and check for existing transaction numbers
            snapshot.forEach(doc => {
                const transaction = {
                    id: doc.id,
                    ...doc.data(),
                    warning: false // No longer using warning flag for specific time
                };

                // Get or create transaction date
                const transactionDate = transaction.transactionDate ||
                                       formatDate(new Date(transaction.createdAt));

                // Initialize date group if it doesn't exist
                if (!transactionsByDate[transactionDate]) {
                    transactionsByDate[transactionDate] = [];
                }

                // Add transaction to its date group
                transactionsByDate[transactionDate].push(transaction);
            });

            // Second pass: assign transaction numbers to any transactions that don't have them
            // and update them in Firestore
            const updatePromises = [];

            Object.keys(transactionsByDate).forEach(date => {
                const dateTransactions = transactionsByDate[date];

                // Sort transactions by existing transaction number or creation time
                dateTransactions.sort((a, b) => {
                    // If both have transaction numbers, sort by those
                    if (a.transactionNumber && b.transactionNumber) {
                        return a.transactionNumber - b.transactionNumber;
                    }
                    // If only one has a transaction number, prioritize the one with a number
                    if (a.transactionNumber) return -1;
                    if (b.transactionNumber) return 1;
                    // Otherwise sort by creation time
                    return new Date(a.createdAt) - new Date(b.createdAt);
                });

                // Assign sequential numbers to transactions without them
                let nextNumber = 1;
                dateTransactions.forEach(transaction => {
                    if (!transaction.transactionNumber) {
                        transaction.transactionNumber = nextNumber++;
                        transaction.transactionDate = date;

                        // Update in Firestore
                        updatePromises.push(
                            rentalCollection.doc(transaction.id).update({
                                transactionNumber: transaction.transactionNumber,
                                transactionDate: date
                            })
                        );
                    } else {
                        nextNumber = Math.max(nextNumber, transaction.transactionNumber + 1);
                    }

                    // Add to the main transactions array
                    transactions.push(transaction);
                });
            });

            // Wait for all updates to complete
            Promise.all(updatePromises)
                .then(() => {
                    console.log(`Updated ${updatePromises.length} transactions with new transaction numbers`);
                })
                .catch(error => {
                    console.error('Error updating transaction numbers:', error);
                });

            // Sort transactions by creation date (newest first) for display
            transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Add transactions to UI
            transactions.forEach(transaction => {
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

                    // Update days remaining for calendar transactions
                    updateDaysRemaining();

                    // Check for approaching due dates
                    checkDueDates();

                    // Clear dismissed notifications from yesterday
                    clearDismissedNotifications();

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

// Function to update days remaining for all calendar transactions
function updateDaysRemaining() {
    console.log('Updating days remaining for calendar transactions');

    if (!currentUser) {
        console.log('No current user, skipping days remaining update');
        return;
    }

    // Get all pending transactions with end dates
    rentalCollection.where('userId', '==', currentUser.id)
        .where('status', '==', 'pending')
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('No pending transactions found');
                return;
            }

            // Get current date in user's local timezone
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate calculation

            const batch = db.batch();
            let updatedCount = 0;
            let urgentTransactions = [];
            let warningTransactions = [];

            snapshot.forEach(doc => {
                const transaction = {
                    id: doc.id,
                    ...doc.data()
                };

                // Only process calendar mode transactions
                if (transaction.timeMode === 'calendar' || (transaction.endDate && !transaction.timeMode)) {
                    // If timeMode is not set but endDate exists, treat as calendar mode for backward compatibility
                    if (!transaction.timeMode && transaction.endDate) {
                        // Update the transaction to set the timeMode for future processing
                        batch.update(doc.ref, {
                            timeMode: 'calendar'
                        });
                        console.log(`Updated transaction ${transaction.name} to set timeMode to calendar`);
                    }

                    const endDate = new Date(transaction.endDate);
                    endDate.setHours(0, 0, 0, 0); // Set to beginning of day

                    const diffTime = endDate - today;
                    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    console.log(`Transaction ${transaction.name}: ${daysUntilDue} days until due`);

                    // Check if days remaining has changed
                    const currentDaysRemaining = transaction.daysRemaining !== undefined ?
                                               transaction.daysRemaining : null;

                    if (currentDaysRemaining === null || currentDaysRemaining !== daysUntilDue) {
                        console.log(`Updating days remaining for ${transaction.name} from ${currentDaysRemaining} to ${daysUntilDue}`);

                        // Update the transaction with days remaining
                        batch.update(doc.ref, {
                            daysRemaining: daysUntilDue,
                            lastUpdated: new Date().toISOString()
                        });

                        updatedCount++;

                        // Track transactions that need notifications
                        if (daysUntilDue === 0) {
                            urgentTransactions.push({
                                ...transaction,
                                daysUntilDue
                            });
                        } else if (daysUntilDue === 1 || daysUntilDue === 2) {
                            warningTransactions.push({
                                ...transaction,
                                daysUntilDue
                            });
                        }
                    }

                    // If the due date has passed (negative days), mark as overdue
                    if (daysUntilDue < 0) {
                        batch.update(doc.ref, {
                            status: 'overdue',
                            overdueDate: new Date().toISOString()
                        });
                        console.log(`Transaction ${transaction.name} is overdue by ${Math.abs(daysUntilDue)} days`);
                    }
                } else if (transaction.timeMode === 'hours') {
                    // Hours mode transactions don't need day-by-day countdown
                    console.log(`Skipping hours mode transaction ${transaction.name}`);
                }
            });

            // Commit the batch update
            if (updatedCount > 0) {
                batch.commit()
                    .then(() => {
                        console.log(`Updated days remaining for ${updatedCount} transactions`);

                        // After updating, trigger notifications for urgent and warning transactions
                        if (urgentTransactions.length > 0 || warningTransactions.length > 0) {
                            // Combine urgent and warning transactions for notifications
                            const notificationTransactions = [...urgentTransactions, ...warningTransactions];

                            // Update notification badge
                            updateNotificationBadge(notificationTransactions.length);

                            // Store for notification panel
                            window.approachingDueDates = notificationTransactions;

                            // Show in-app notifications
                            showDueDateNotifications(notificationTransactions);

                            // Check if we should send browser notifications
                            if (Notification.permission === 'granted') {
                                // Schedule notifications with appropriate frequency
                                scheduleNotifications(urgentTransactions, warningTransactions.filter(t => t.daysUntilDue === 1));
                            }
                        }

                        // Reload transactions to update UI
                        loadTransactions();
                    })
                    .catch(error => {
                        console.error('Error updating days remaining:', error);
                    });
            } else {
                console.log('No transactions needed days remaining update');
            }
        })
        .catch(error => {
            console.error('Error fetching transactions for days update:', error);
        });
}

// Function to clear dismissed notifications from previous days
function clearDismissedNotifications() {
    console.log('Clearing dismissed notifications from previous days');

    try {
        const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let hasChanges = false;

        // Check each dismissed notification
        Object.keys(dismissedNotifications).forEach(id => {
            const dismissedDate = new Date(dismissedNotifications[id]);
            dismissedDate.setHours(0, 0, 0, 0);

            // If the dismissed date is before today, remove it
            if (dismissedDate < today) {
                delete dismissedNotifications[id];
                hasChanges = true;
            }
        });

        // Save changes if any were made
        if (hasChanges) {
            localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotifications));
            console.log('Cleared old dismissed notifications');
        }
    } catch (error) {
        console.error('Error clearing dismissed notifications:', error);
    }
}

// Function to check notification permission status and request if needed
function checkNotificationPermission() {
    console.log('Checking notification permission');

    // Check if the browser supports notifications
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
    }

    // Check if we already know the user's preference
    if (currentUser) {
        userCollection.doc(currentUser.id).get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();

                    // If we haven't asked for permission yet
                    if (userData.notificationPermissionAsked === undefined) {
                        // Show the permission dialog
                        showNotificationPermissionDialog();
                    } else if (userData.notificationPermissionAsked && Notification.permission === 'granted') {
                        // If permission was previously granted, show a confirmation message
                        showMessage('Due date notifications are enabled', 'success');
                    }
                }
            })
            .catch(error => {
                console.error('Error checking notification permission:', error);
            });
    }
}

// Function to show notification permission dialog
function showNotificationPermissionDialog() {
    // Create a modal dialog for permission
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'notification-dialog-overlay';
    dialogOverlay.style.position = 'fixed';
    dialogOverlay.style.top = '0';
    dialogOverlay.style.left = '0';
    dialogOverlay.style.width = '100%';
    dialogOverlay.style.height = '100%';
    dialogOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    dialogOverlay.style.zIndex = '2000';
    dialogOverlay.style.display = 'flex';
    dialogOverlay.style.justifyContent = 'center';
    dialogOverlay.style.alignItems = 'center';

    const dialog = document.createElement('div');
    dialog.className = 'notification-dialog';
    dialog.style.backgroundColor = 'white';
    dialog.style.borderRadius = '8px';
    dialog.style.padding = '20px';
    dialog.style.maxWidth = '400px';
    dialog.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    dialog.style.textAlign = 'center';

    const title = document.createElement('h3');
    title.textContent = 'Enable Due Date Notifications';
    title.style.margin = '0 0 15px 0';
    title.style.color = '#333';

    const message = document.createElement('p');
    message.textContent = 'Would you like to receive notifications for approaching due dates? This will help you stay informed when transactions are about to expire.';
    message.style.margin = '0 0 20px 0';
    message.style.lineHeight = '1.5';
    message.style.color = '#555';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '10px';

    const allowButton = document.createElement('button');
    allowButton.textContent = 'Allow Notifications';
    allowButton.style.padding = '10px 15px';
    allowButton.style.backgroundColor = '#4CAF50';
    allowButton.style.color = 'white';
    allowButton.style.border = 'none';
    allowButton.style.borderRadius = '4px';
    allowButton.style.cursor = 'pointer';

    const denyButton = document.createElement('button');
    denyButton.textContent = 'No Thanks';
    denyButton.style.padding = '10px 15px';
    denyButton.style.backgroundColor = '#f5f5f5';
    denyButton.style.color = '#333';
    denyButton.style.border = '1px solid #ddd';
    denyButton.style.borderRadius = '4px';
    denyButton.style.cursor = 'pointer';

    // Add event listeners
    allowButton.addEventListener('click', () => {
        // Request browser permission
        Notification.requestPermission().then(permission => {
            // Save the user's choice
            saveNotificationPermission(permission === 'granted');

            // Show appropriate message
            if (permission === 'granted') {
                showMessage('Due date notifications enabled!', 'success');
            } else {
                showMessage('Notification permission denied', 'info');
            }

            // Remove dialog
            document.body.removeChild(dialogOverlay);
        });
    });

    denyButton.addEventListener('click', () => {
        // Save that the user denied permission
        saveNotificationPermission(false);

        // Show message
        showMessage('Notifications will not be sent', 'info');

        // Remove dialog
        document.body.removeChild(dialogOverlay);
    });

    // Assemble dialog
    buttonContainer.appendChild(allowButton);
    buttonContainer.appendChild(denyButton);
    dialog.appendChild(title);
    dialog.appendChild(message);
    dialog.appendChild(buttonContainer);
    dialogOverlay.appendChild(dialog);

    // Add to document
    document.body.appendChild(dialogOverlay);
}

// Function to save notification permission preference
function saveNotificationPermission(granted) {
    if (currentUser) {
        userCollection.doc(currentUser.id).update({
            notificationPermissionAsked: true,
            notificationPermissionGranted: granted,
            notificationPermissionTimestamp: new Date().toISOString()
        }).then(() => {
            console.log('Notification permission preference saved:', granted);
        }).catch(error => {
            console.error('Error saving notification permission preference:', error);
        });
    }
}

// Function to check for approaching due dates
function checkDueDates() {
    console.log('Checking for approaching due dates');

    if (!currentUser) {
        console.log('No current user, skipping due date check');
        return;
    }

    // Check if calendar mode is enabled
    if (!calendarModeEnabled) {
        console.log('Calendar mode is disabled, skipping due date check');
        return;
    }

    // Check if notification permission is granted
    userCollection.doc(currentUser.id).get()
        .then(doc => {
            if (!doc.exists) {
                console.log('User document not found');
                return;
            }

            const userData = doc.data();
            const notificationsEnabled = userData.notificationPermissionGranted === true;

            console.log('Notifications enabled:', notificationsEnabled);

            // Only check for due dates if calendar mode is enabled
            rentalCollection.where('userId', '==', currentUser.id)
                .where('status', '==', 'pending') // Only check pending transactions
                .get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        console.log('No pending transactions found');
                        updateNotificationBadge(0);
                        return;
                    }

                    const today = new Date();
                    const approachingDueDates = []; // Due within 2 days
                    const upcomingDueDates = []; // Due within 7 days or overdue
                    const dueTodayTransactions = [];
                    const dueTomorrowTransactions = [];
                    const overdueTransactions = [];

                    snapshot.forEach(doc => {
                        const transaction = {
                            id: doc.id,
                            ...doc.data()
                        };

                        // Only process calendar mode transactions
                        const isCalendarMode = transaction.timeMode === 'calendar' ||
                                             (transaction.endDate && transaction.endDate !== '' && !transaction.timeMode);

                        // Skip if not a calendar mode transaction
                        if (!isCalendarMode) {
                            console.log(`Skipping hours mode transaction ${transaction.name} in due date check`);
                            return;
                        }

                        // Skip if no end date (should not happen for calendar mode, but check anyway)
                        if (!transaction.endDate) {
                            console.log(`Skipping calendar mode transaction ${transaction.name} with no end date`);
                            return;
                        }

                        const endDate = new Date(transaction.endDate);
                        const daysUntilDue = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                        console.log(`Transaction ${transaction.name} due in ${daysUntilDue} days`);

                        // Add daysUntilDue to transaction object
                        const transactionWithDays = {
                            ...transaction,
                            daysUntilDue
                        };

                        // Check if due date is approaching (2 days or less)
                        if (daysUntilDue <= 2 && daysUntilDue >= 0) {
                            approachingDueDates.push(transactionWithDays);

                            // Separate transactions by due date for notification frequency
                            if (daysUntilDue === 0) {
                                dueTodayTransactions.push(transactionWithDays);
                            } else if (daysUntilDue === 1) {
                                dueTomorrowTransactions.push(transactionWithDays);
                            }
                        }

                        // Check if due date is within 7 days or overdue
                        if (daysUntilDue <= 7) {
                            upcomingDueDates.push(transactionWithDays);
                        }

                        // Check if transaction is overdue
                        if (daysUntilDue < 0) {
                            overdueTransactions.push(transactionWithDays);
                            upcomingDueDates.push(transactionWithDays); // Include overdue in upcoming
                        }
                    });

                    console.log(`Found ${approachingDueDates.length} approaching due dates`);
                    console.log(`Found ${upcomingDueDates.length} upcoming due dates (within 7 days)`);
                    console.log(`Found ${overdueTransactions.length} overdue transactions`);
                    console.log(`Due today: ${dueTodayTransactions.length}, Due tomorrow: ${dueTomorrowTransactions.length}`);

                    // Update notification badge with count of approaching due dates (2 days or less)
                    updateNotificationBadge(approachingDueDates.length);

                    // Update due dates badge with count of all upcoming due dates (7 days or less + overdue)
                    updateDueDatesBadge(upcomingDueDates.length);

                    // Store approaching due dates for the notification panel
                    window.approachingDueDates = approachingDueDates;

                    // Store upcoming due dates for the due dates panel
                    window.upcomingDueDates = upcomingDueDates;

                    // Show notifications for approaching due dates
                    if (approachingDueDates.length > 0) {
                        // Always show in-app notifications
                        showDueDateNotifications(approachingDueDates);

                        // Only send browser notifications if permission is granted
                        if (notificationsEnabled && Notification.permission === 'granted') {
                            // Schedule notifications based on frequency requirements
                            scheduleNotifications(dueTodayTransactions, dueTomorrowTransactions);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error checking due dates:', error);
                });
        })
        .catch(error => {
            console.error('Error checking notification permission:', error);
        });
}

// Function to initialize notification bell
function initializeNotificationBell() {
    console.log('Initializing notification bell');

    const notificationBell = document.getElementById('notification-bell');
    const notificationPanel = document.getElementById('notification-panel');
    const clearAllBtn = document.getElementById('clear-all-notifications');

    if (!notificationBell || !notificationPanel || !clearAllBtn) {
        console.error('Notification elements not found');
        return;
    }

    // Toggle notification panel on bell click
    notificationBell.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationPanel.classList.toggle('show');

        // Update notification panel content when opened
        if (notificationPanel.classList.contains('show')) {
            updateNotificationPanel();
        }
    });

    // Clear all notifications
    clearAllBtn.addEventListener('click', function() {
        clearAllNotifications();
    });

    // Close notification panel when clicking outside
    document.addEventListener('click', function(e) {
        if (notificationPanel.classList.contains('show')) {
            if (!notificationPanel.contains(e.target) && e.target !== notificationBell) {
                notificationPanel.classList.remove('show');
            }
        }
    });

    // Initial check for notifications
    if (calendarModeEnabled) {
        setTimeout(() => {
            checkDueDates();
        }, 1000);
    }
}

// Function to update notification badge count
function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    badge.textContent = count;

    if (count > 0) {
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Function to update notification panel content
function updateNotificationPanel() {
    console.log('Updating notification panel');

    const notificationList = document.getElementById('notification-list');
    if (!notificationList) return;

    // Clear existing notifications
    notificationList.innerHTML = '';

    // Get approaching due dates
    const approachingDueDates = window.approachingDueDates || [];

    if (approachingDueDates.length === 0) {
        // Show empty state
        const emptyNotification = document.createElement('div');
        emptyNotification.className = 'empty-notification';
        emptyNotification.textContent = 'No notifications';
        notificationList.appendChild(emptyNotification);
        return;
    }

    // Add notifications to panel
    approachingDueDates.forEach(transaction => {
        addNotificationToPanel(transaction);
    });
}

// Function to add a notification to the panel
function addNotificationToPanel(transaction) {
    const notificationList = document.getElementById('notification-list');
    if (!notificationList) return;

    const notificationItem = document.createElement('div');
    notificationItem.className = 'notification-item';
    notificationItem.dataset.id = transaction.id;

    // Format days text
    let daysText = '';
    if (transaction.daysUntilDue === 0) {
        daysText = 'Ends today';
    } else if (transaction.daysUntilDue === 1) {
        daysText = 'Ends tomorrow';
    } else {
        daysText = `Ends in ${transaction.daysUntilDue} days`;
    }

    notificationItem.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">${transaction.name}</div>
            <div class="notification-details">
                <span>${daysText}</span>
                <span>₹ ${transaction.amount.toFixed(2)}</span>
            </div>
        </div>
        <div class="notification-actions">
            <button class="dismiss-btn" data-id="${transaction.id}">Dismiss</button>
            <button class="complete-btn" data-id="${transaction.id}">Mark Complete</button>
        </div>
    `;

    // Add event listeners
    const dismissBtn = notificationItem.querySelector('.dismiss-btn');
    const completeBtn = notificationItem.querySelector('.complete-btn');

    dismissBtn.addEventListener('click', function() {
        dismissNotification(transaction.id);
    });

    completeBtn.addEventListener('click', function() {
        markTransactionComplete(transaction.id);
    });

    notificationList.appendChild(notificationItem);
}

// Function to dismiss a notification
function dismissNotification(transactionId) {
    console.log('Dismissing notification:', transactionId);

    // Remove from panel
    const notificationItem = document.querySelector(`.notification-item[data-id="${transactionId}"]`);
    if (notificationItem) {
        notificationItem.remove();
    }

    // Store in localStorage that this notification was dismissed
    const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
    dismissedNotifications[transactionId] = new Date().toISOString();
    localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotifications));

    // Update notification badge
    if (window.approachingDueDates) {
        window.approachingDueDates = window.approachingDueDates.filter(t => t.id !== transactionId);
        updateNotificationBadge(window.approachingDueDates.length);
    }

    // Check if notification list is empty
    const notificationList = document.getElementById('notification-list');
    if (notificationList && notificationList.children.length === 0) {
        const emptyNotification = document.createElement('div');
        emptyNotification.className = 'empty-notification';
        emptyNotification.textContent = 'No notifications';
        notificationList.appendChild(emptyNotification);
    }

    showMessage('Notification dismissed', 'success');
}

// Function to mark a transaction as complete
function markTransactionComplete(transactionId) {
    console.log('Marking transaction complete:', transactionId);

    if (!currentUser) return;

    // Get the transaction first to check if it's from today (for revenue update)
    rentalCollection.doc(transactionId).get()
        .then(doc => {
            if (!doc.exists) {
                showMessage('Transaction not found', 'error');
                return;
            }

            const transaction = doc.data();
            const isFromToday = isToday(transaction.createdAt);
            const wasPending = transaction.status === 'pending';

            // Update transaction status in Firestore
            return rentalCollection.doc(transactionId).update({
                status: 'paid',
                updatedAt: new Date().toISOString()
            }).then(() => {
                // Remove from panel
                dismissNotification(transactionId);

                // Update UI
                const statusBadge = document.querySelector(`.table-row[data-id="${transactionId}"] .status-badge`);
                if (statusBadge) {
                    statusBadge.textContent = 'Paid';
                    statusBadge.className = 'status-badge paid';
                }

                showMessage('Transaction marked as complete', 'success');

                // If the transaction was from today and was pending, update the revenue display
                if (isFromToday && wasPending) {
                    try {
                        // Get the current revenue amount
                        const currentRevenue = parseFloat(todayRevenueDisplay.textContent.replace('₹', '').trim());
                        // Add the transaction amount
                        const newRevenue = currentRevenue + transaction.amount;
                        // Update the display
                        updateRevenueDisplay(newRevenue);

                        // Update revenue history in the background
                        updateTodayRevenueHistoryAfterDeletion();
                    } catch (error) {
                        console.error('Error updating revenue display:', error);
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error updating transaction:', error);
            showMessage('Error updating transaction', 'error');
        });
}

// Function to clear all notifications
function clearAllNotifications() {
    console.log('Clearing all notifications');

    if (!window.approachingDueDates || window.approachingDueDates.length === 0) {
        return;
    }

    // Store all transaction IDs as dismissed
    const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');

    window.approachingDueDates.forEach(transaction => {
        dismissedNotifications[transaction.id] = new Date().toISOString();
    });

    localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotifications));

    // Clear notification list
    const notificationList = document.getElementById('notification-list');
    if (notificationList) {
        notificationList.innerHTML = '';

        const emptyNotification = document.createElement('div');
        emptyNotification.className = 'empty-notification';
        emptyNotification.textContent = 'No notifications';
        notificationList.appendChild(emptyNotification);
    }

    // Reset badge
    window.approachingDueDates = [];
    updateNotificationBadge(0);

    showMessage('All notifications cleared', 'success');
}

// Function to schedule notifications based on frequency requirements
function scheduleNotifications(dueTodayTransactions, dueTomorrowTransactions) {
    console.log('Scheduling notifications');

    // Get current time
    const now = new Date();
    const currentHour = now.getHours();

    // Schedule notifications for transactions due today (3 notifications)
    dueTodayTransactions.forEach(transaction => {
        console.log(`Scheduling urgent notifications for ${transaction.name}`);

        // First notification immediately with urgent styling
        sendBrowserNotification(
            'URGENT: Due Date Today',
            `${transaction.name}'s transaction ends today!`,
            {
                requireInteraction: true, // Keep notification visible until user interacts with it
                icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
                vibrate: [200, 100, 200, 100, 200], // More intense vibration pattern
                tag: `transaction-${transaction.id}-urgent`, // Tag to replace previous notifications
                data: {
                    transactionId: transaction.id,
                    urgent: true
                }
            }
        );

        // Determine timing for second notification
        let secondNotificationHour, secondNotificationMinute;

        if (currentHour < 10) {
            // If it's morning, schedule for noon
            secondNotificationHour = 12;
            secondNotificationMinute = 0;
        } else if (currentHour < 14) {
            // If it's around noon, schedule for 2 hours later
            secondNotificationHour = currentHour + 2;
            secondNotificationMinute = now.getMinutes();
        } else {
            // If it's afternoon, schedule for 3 PM
            secondNotificationHour = 15;
            secondNotificationMinute = 0;
        }

        // Second notification with more urgent message
        scheduleNotificationAt(secondNotificationHour, secondNotificationMinute,
            'URGENT: Due Date Today',
            `${transaction.name}'s transaction ends today! Please take action soon.`,
            transaction,
            {
                requireInteraction: true,
                icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
                vibrate: [200, 100, 200, 100, 200],
                tag: `transaction-${transaction.id}-urgent-2`,
                data: {
                    transactionId: transaction.id,
                    urgent: true
                }
            }
        );

        // Third notification in the evening (5 PM) with final reminder
        scheduleNotificationAt(17, 0,
            'FINAL REMINDER: Due Date Today',
            `${transaction.name}'s transaction ends today! This is your final reminder to take action.`,
            transaction,
            {
                requireInteraction: true,
                icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
                vibrate: [300, 100, 300, 100, 300], // Even more intense vibration
                tag: `transaction-${transaction.id}-urgent-final`,
                data: {
                    transactionId: transaction.id,
                    urgent: true,
                    final: true
                }
            }
        );
    });

    // Schedule notifications for transactions due tomorrow (2 notifications)
    dueTomorrowTransactions.forEach(transaction => {
        console.log(`Scheduling warning notifications for ${transaction.name}`);

        // First notification immediately
        sendBrowserNotification(
            'Due Date Approaching',
            `${transaction.name}'s transaction will end tomorrow.`,
            {
                icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
                tag: `transaction-${transaction.id}-warning`,
                data: {
                    transactionId: transaction.id,
                    warning: true
                }
            }
        );

        // Second notification in the afternoon (3 PM)
        scheduleNotificationAt(15, 0,
            'Reminder: Due Date Tomorrow',
            `${transaction.name}'s transaction ends tomorrow! Please prepare to take action.`,
            transaction,
            {
                icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
                tag: `transaction-${transaction.id}-warning-2`,
                data: {
                    transactionId: transaction.id,
                    warning: true
                }
            }
        );
    });

    // Also schedule notifications for transactions due in 2 days (1 notification)
    const dueDayAfterTomorrowTransactions = window.approachingDueDates?.filter(t => t.daysUntilDue === 2) || [];

    dueDayAfterTomorrowTransactions.forEach(transaction => {
        console.log(`Scheduling early warning notification for ${transaction.name}`);

        // Just one notification in the morning
        if (currentHour < 10) {
            sendBrowserNotification(
                'Due Date Approaching',
                `${transaction.name}'s transaction will end in 2 days.`,
                {
                    icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
                    tag: `transaction-${transaction.id}-early-warning`,
                    data: {
                        transactionId: transaction.id,
                        earlyWarning: true
                    }
                }
            );
        }
    });
}

// Function to show due date notifications in the app UI
function showDueDateNotifications(approachingDueDates) {
    console.log('Showing due date notifications in UI');

    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.due-date-notification');
    existingNotifications.forEach(notification => notification.remove());

    // Show notifications for each approaching due date
    approachingDueDates.forEach((transaction, index) => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'due-date-notification';
        notification.dataset.transactionId = transaction.id; // Store transaction ID for reference
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

        // Format the message based on days remaining
        let messageText = '';
        if (transaction.daysUntilDue === 0) {
            messageText = `<span class="customer-name">${transaction.name}</span>'s transaction will end today.`;
        } else if (transaction.daysUntilDue === 1) {
            messageText = `<span class="customer-name">${transaction.name}</span>'s transaction will end tomorrow.`;
        } else {
            messageText = `<span class="customer-name">${transaction.name}</span>'s transaction will end in ${transaction.daysUntilDue} days.`;
        }

        content.innerHTML = `
            <strong>Due Date Approaching!</strong><br>
            ${messageText}
        `;

        // Add action buttons
        const actionButtons = document.createElement('div');
        actionButtons.className = 'notification-actions';
        actionButtons.style.marginTop = '10px';
        actionButtons.style.display = 'flex';
        actionButtons.style.justifyContent = 'space-between';

        // View transaction button
        const viewButton = document.createElement('button');
        viewButton.textContent = 'View Details';
        viewButton.style.padding = '5px 10px';
        viewButton.style.backgroundColor = '#1a73e8';
        viewButton.style.color = 'white';
        viewButton.style.border = 'none';
        viewButton.style.borderRadius = '4px';
        viewButton.style.cursor = 'pointer';
        viewButton.style.fontSize = '12px';
        viewButton.addEventListener('click', () => {
            // Open transaction details (you can implement this functionality)
            showMessage(`Viewing details for ${transaction.name}'s transaction`, 'info');
        });

        // Dismiss for today button
        const dismissButton = document.createElement('button');
        dismissButton.textContent = 'Dismiss for Today';
        dismissButton.style.padding = '5px 10px';
        dismissButton.style.backgroundColor = '#f5f5f5';
        dismissButton.style.color = '#333';
        dismissButton.style.border = '1px solid #ddd';
        dismissButton.style.borderRadius = '4px';
        dismissButton.style.cursor = 'pointer';
        dismissButton.style.fontSize = '12px';
        dismissButton.addEventListener('click', () => {
            // Store in localStorage that this notification was dismissed for today
            const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
            dismissedNotifications[transaction.id] = new Date().toISOString();
            localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotifications));

            // Remove the notification
            notification.remove();

            showMessage(`Dismissed notification for ${transaction.name} for today`, 'info');
        });

        // Add buttons to action container
        actionButtons.appendChild(viewButton);
        actionButtons.appendChild(dismissButton);

        // Add elements to notification
        notification.appendChild(closeBtn);
        notification.appendChild(content);
        notification.appendChild(actionButtons);

        // Add to document
        document.body.appendChild(notification);
    });
}

// Function to send a browser notification
function sendBrowserNotification(title, message, options = {}) {
    console.log('Sending browser notification:', title, message);

    // Check if notifications are supported and permission is granted
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
    }

    if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
    }

    // Default notification options
    const defaultOptions = {
        body: message,
        icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
        vibrate: [200, 100, 200],
        requireInteraction: false
    };

    // Merge default options with provided options
    const notificationOptions = { ...defaultOptions, ...options };

    // Create and show the notification
    try {
        const notification = new Notification(title, notificationOptions);

        // Add click handler
        notification.onclick = function() {
            console.log('Notification clicked');
            window.focus();
            notification.close();
        };

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

// Function to schedule a notification at a specific time
function scheduleNotificationAt(hour, minute, title, message, transaction, options = {}) {
    console.log(`Scheduling notification for ${hour}:${minute}: ${title}`);

    // Get current time
    const now = new Date();

    // Create target time for today
    const targetTime = new Date();
    targetTime.setHours(hour, minute, 0, 0);

    // If the target time has already passed today, don't schedule
    if (targetTime <= now) {
        console.log('Target time has already passed today, not scheduling');
        return;
    }

    // Calculate milliseconds until target time
    const timeUntilNotification = targetTime.getTime() - now.getTime();

    console.log(`Notification will be sent in ${timeUntilNotification / 1000 / 60} minutes`);

    // Store the scheduled notification in a global array for tracking
    // @ts-ignore
    if (!window.scheduledNotifications) {
        // @ts-ignore
        window.scheduledNotifications = [];
    }

    // Create a unique ID for this scheduled notification
    const notificationId = `${transaction.id}-${Date.now()}`;

    // Schedule the notification
    const timeoutId = setTimeout(() => {
        // Check if the transaction is still relevant (not marked as paid, etc.)
        rentalCollection.doc(transaction.id).get()
            .then(doc => {
                if (doc.exists) {
                    const updatedTransaction = doc.data();

                    // Only send notification if transaction is still pending
                    if (updatedTransaction.status === 'pending') {
                        // Check if the notification has been dismissed
                        const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
                        const isDismissed = dismissedNotifications[transaction.id] &&
                                          new Date(dismissedNotifications[transaction.id]) > new Date(Date.now() - 24 * 60 * 60 * 1000);

                        if (!isDismissed) {
                            // Merge with any provided options
                            const notificationOptions = {
                                ...options,
                                data: {
                                    ...(options.data || {}),
                                    transactionId: transaction.id,
                                    scheduledNotificationId: notificationId
                                }
                            };

                            // Send the notification
                            sendBrowserNotification(title, message, notificationOptions);

                            // Also update the notification panel if it's open
                            if (document.getElementById('notification-panel')?.classList.contains('show')) {
                                updateNotificationPanel();
                            }

                            // Update the notification badge
                            if (window.approachingDueDates && window.approachingDueDates.length > 0) {
                                updateNotificationBadge(window.approachingDueDates.length);
                            }
                        } else {
                            console.log('Notification dismissed by user, not sending');
                        }
                    } else {
                        console.log('Transaction status changed, not sending notification');
                    }
                }

                // Remove from scheduled notifications
                // @ts-ignore
                window.scheduledNotifications = window.scheduledNotifications.filter(n => n.id !== notificationId);
            })
            .catch(error => {
                console.error('Error checking transaction before sending notification:', error);

                // Remove from scheduled notifications even on error
                // @ts-ignore
                window.scheduledNotifications = window.scheduledNotifications.filter(n => n.id !== notificationId);
            });
    }, timeUntilNotification);

    // Store the scheduled notification for potential cancellation
    // @ts-ignore
    window.scheduledNotifications.push({
        id: notificationId,
        transactionId: transaction.id,
        timeoutId: timeoutId,
        scheduledTime: targetTime.toISOString(),
        title: title,
        message: message
    });

    // Return the timeout ID in case we need to cancel it later
    return timeoutId;
}
