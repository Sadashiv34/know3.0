// TypeScript declarations for global window properties
// @ts-ignore
window.upcomingDueDates = [];

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
const monthlySummaryBody = document.getElementById('monthly-summary-body');
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

    // Initialize the time remaining feature
    updateTimeLeft();

    // Update time remaining every minute
    setInterval(updateTimeLeft, 60000);

    // Initialize filter buttons
    initializeFilterButtons();
});

// Initialize menu event listeners
document.addEventListener('DOMContentLoaded', initializeMenuEventListeners);

// Function to initialize filter buttons
function initializeFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Apply the filter
            const filterType = button.getAttribute('data-filter');
            filterTransactions(filterType);
        });
    });
}

// Function to filter transactions
function filterTransactions(filterType) {
    console.log(`Filtering transactions by: ${filterType}`);

    // Get all transaction rows
    const rows = document.querySelectorAll('.table-row');

    // If no rows or only special rows (empty, loading, error), exit early
    if (rows.length === 0 || (rows.length === 1 &&
        (rows[0].classList.contains('empty') ||
         rows[0].classList.contains('loading') ||
         rows[0].classList.contains('error')))) {
        return;
    }

    // Log filter type to console (no notification)
    console.log(`Applied filter: ${filterType}`);

    // Process each row
    rows.forEach(row => {
        // Skip special rows
        if (row.classList.contains('empty') ||
            row.classList.contains('loading') ||
            row.classList.contains('error')) {
            return;
        }

        // Get time remaining element if it exists
        const timeElement = row.querySelector('.time-remaining');
        const statusElement = row.querySelector('.status-badge');

        // Default to hiding the row
        let showRow = false;

        // Apply filter based on type
        switch(filterType) {
            case 'all':
                // Show all rows
                showRow = true;
                break;

            case 'expired':
                // Show only expired transactions
                if (timeElement && timeElement.classList.contains('expired')) {
                    showRow = true;
                }
                break;

            case 'ending-today':
                // Show only transactions ending today
                if (timeElement && timeElement.classList.contains('ending-today')) {
                    showRow = true;
                }
                break;

            case 'due-soon':
                // Show only transactions with 1-2 days remaining
                if (timeElement && timeElement.classList.contains('warning')) {
                    showRow = true;
                }
                break;

            case 'pending':
                // Show only pending transactions
                if (statusElement && statusElement.classList.contains('pending')) {
                    showRow = true;
                }
                break;
        }

        // Show or hide the row based on filter
        row.style.display = showRow ? 'flex' : 'none';
    });

    // Check if any rows are visible
    let visibleCount = 0;
    rows.forEach(row => {
        if (row.style.display !== 'none' &&
            !row.classList.contains('empty') &&
            !row.classList.contains('loading') &&
            !row.classList.contains('error')) {
            visibleCount++;
        }
    });

    // If no rows are visible, show empty message
    if (visibleCount === 0) {
        // Remove any existing empty filter row
        const existingEmptyRow = document.querySelector('.table-row.empty.filter-empty');
        if (existingEmptyRow) {
            existingEmptyRow.remove();
        }

        // Create and add empty row
        const emptyRow = document.createElement('div');
        emptyRow.className = 'table-row empty filter-empty';
        emptyRow.innerHTML = `<div class="column" style="text-align: center; flex: 1;">No transactions match the "${filterType}" filter.</div>`;
        tableBody.appendChild(emptyRow);
    } else {
        // Remove empty filter row if it exists
        const emptyRow = document.querySelector('.table-row.empty.filter-empty');
        if (emptyRow) {
            emptyRow.remove();
        }
    }
}

// Function to update time remaining for all transactions
function updateTimeLeft() {
    console.log('Updating time remaining for transactions');

    // Select all elements with the time-remaining class
    const timeElements = document.querySelectorAll('.time-remaining');

    if (timeElements.length === 0) {
        console.log('No time-remaining elements found');
        return;
    }

    console.log(`Found ${timeElements.length} time-remaining elements`);

    // Debug: Log the first element to see what we're working with
    if (timeElements.length > 0) {
        const firstElement = timeElements[0];
        console.log('First time element:', {
            element: firstElement,
            endTime: firstElement.getAttribute('data-end-time'),
            currentText: firstElement.textContent,
            className: firstElement.className
        });
    }

    // Get current time
    const now = new Date();

    // Update each time element
    timeElements.forEach(element => {
        // Get the end time from the data attribute
        const endTimeStr = element.getAttribute('data-end-time');

        if (!endTimeStr) {
            console.log('No end time found for element', element);
            element.textContent = 'Invalid date';
            element.className = 'time-remaining expired';
            return;
        }

        // Parse the end time
        const endTime = new Date(endTimeStr);

        // Calculate time difference in milliseconds
        const diff = endTime - now;

        // Format the time remaining
        if (diff <= 0) {
            // Time has expired
            element.textContent = 'Expired';
            element.className = 'time-remaining expired';
        } else {
            // Calculate days, hours (no minutes)
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            // Format the time string - only days and hours
            let timeString = '';
            if (days > 0) {
                timeString += `${days} day${days !== 1 ? 's' : ''} `;
            }
            if (hours > 0 || days === 0) {
                timeString += `${hours} hour${hours !== 1 ? 's' : ''}`;
            }

            // Trim any extra spaces
            timeString = timeString.trim();

            // Update the element text
            element.textContent = timeString;

            // Apply appropriate class based on urgency
            if (days === 0) {
                // Ending today (0 days remaining)
                element.className = 'time-remaining ending-today';
            } else if (days === 1) {
                // 1 day remaining
                element.className = 'time-remaining warning';
            } else {
                // Normal (more than 1 day remaining)
                element.className = 'time-remaining normal';
            }
        }
    });
}

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

                // Update time remaining for the new transaction
                updateTimeLeft();

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

        // If days remaining is available, update the icon based on urgency
        if (daysRemaining !== null) {
            // Update icon based on urgency
            if (daysRemaining === 0) {
                timeIcon = '<i class="fas fa-exclamation-circle urgent-icon"></i>';
            } else if (daysRemaining === 1 || daysRemaining === 2) {
                timeIcon = '<i class="fas fa-exclamation-triangle warning-icon"></i>';
            } else if (daysRemaining < 0) {
                timeIcon = '<i class="fas fa-exclamation-circle urgent-icon"></i>';
            }

            // Add time remaining element with ISO format end date
            if (transaction.endDate) {
                const endDate = new Date(transaction.endDate);
                // Set the end time to 23:59:59 on the end date
                endDate.setHours(23, 59, 59, 999);

                // Create the time-remaining element with data-end-time attribute
                let initialClass = 'normal';
                if (daysRemaining < 0) {
                    initialClass = 'expired';
                } else if (daysRemaining === 0) {
                    initialClass = 'ending-today';
                } else if (daysRemaining === 1) {
                    initialClass = 'warning';
                }

                // Create the time-remaining element with appropriate initial class
                const timeRemainingElement = `<span class="time-remaining ${initialClass}" data-end-time="${endDate.toISOString()}">Calculating time...</span>`;

                // Set the time display to only show the dynamic time remaining
                timeDisplay = `${timeDisplay} <br>${timeRemainingElement}`;
            }
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

    // Get current active filter
    const activeFilter = document.querySelector('.filter-btn.active');
    const filterType = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';

    // If search term is empty, apply the current filter
    if (!searchTerm) {
        // If filter is "all", show all rows
        if (filterType === 'all') {
            rows.forEach(row => {
                if (!row.classList.contains('empty') && !row.classList.contains('error')) {
                    row.style.display = 'flex';
                    visibleCount++;
                }
            });
        } else {
            // Otherwise, reapply the current filter
            filterTransactions(filterType);
            return;
        }

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
        const matchesSearch = name.includes(searchTerm) ||
            timeText.includes(searchTerm) ||
            amountText.includes(searchTerm) ||
            statusText.includes(searchTerm);

        // Check if row matches the current filter
        let matchesFilter = true;

        if (filterType !== 'all') {
            const timeElement = row.querySelector('.time-remaining');
            const statusElement = row.querySelector('.status-badge');

            switch(filterType) {
                case 'expired':
                    matchesFilter = timeElement && timeElement.classList.contains('expired');
                    break;

                case 'ending-today':
                    matchesFilter = timeElement && timeElement.classList.contains('ending-today');
                    break;

                case 'due-soon':
                    matchesFilter = timeElement && timeElement.classList.contains('warning');
                    break;

                case 'pending':
                    matchesFilter = statusElement && statusElement.classList.contains('pending');
                    break;
            }
        }

        // Show row only if it matches both search and filter
        if (matchesSearch && matchesFilter) {
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
        if (row.classList.contains('search-empty') || row.classList.contains('filter-empty')) {
            // Hide empty search results row and filter empty row
            row.style.display = 'none';
        } else if (!row.classList.contains('empty') && !row.classList.contains('error')) {
            // Show all regular transaction rows
            row.style.display = 'flex';
        }
    });

    // Clear search results count
    searchResultsCount.textContent = '';

    // Reset filter buttons to "All"
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const allButton = document.querySelector('.filter-btn[data-filter="all"]');
    if (allButton) {
        allButton.classList.add('active');
    }

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
    monthlySummaryBody.innerHTML = '';

    // Show loading indicators
    const loadingRow = document.createElement('div');
    loadingRow.className = 'history-row empty';
    loadingRow.innerHTML = '<div class="history-column" style="text-align: center; flex: 1;">Loading daily data...</div>';
    historyBody.appendChild(loadingRow);

    const monthlyLoadingRow = document.createElement('div');
    monthlyLoadingRow.className = 'monthly-summary-row empty';
    monthlyLoadingRow.innerHTML = '<div class="monthly-column" style="text-align: center; flex: 1;">Loading monthly summaries...</div>';
    monthlySummaryBody.appendChild(monthlyLoadingRow);

    // Get selected year
    const selectedYear = parseInt(historyYearSelect.value);

    // Load both monthly summaries and daily data
    Promise.all([
        loadMonthlySummaries(selectedYear),
        loadDailyData(selectedYear)
    ]).then(() => {
        console.log('Both monthly and daily data loaded successfully');
    }).catch(error => {
        console.error('Error loading history data:', error);
        showMessage('Error loading history data', 'error');
    });
}

// Function to load monthly summaries for a year
function loadMonthlySummaries(year) {
    return new Promise((resolve, reject) => {
        // Calculate start and end dates for the year
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        // Query all revenue history for the year
        revenueHistoryCollection
            .where('userId', '==', currentUser.id)
            .where('date', '>=', formatDate(startDate))
            .where('date', '<=', formatDate(endDate))
            .get()
            .then(snapshot => {
                // Clear monthly summary loading indicator
                monthlySummaryBody.innerHTML = '';

                if (snapshot.empty) {
                    const emptyRow = document.createElement('div');
                    emptyRow.className = 'monthly-summary-row empty';
                    emptyRow.innerHTML = '<div class="monthly-column" style="text-align: center; flex: 1;">No monthly data found for this year.</div>';
                    monthlySummaryBody.appendChild(emptyRow);
                    resolve();
                    return;
                }

                // Group data by month
                const monthlyData = {};

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const date = new Date(data.date);
                    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = {
                            year: date.getFullYear(),
                            month: date.getMonth(),
                            totalRevenue: 0,
                            totalCustomers: 0,
                            daysWithData: 0,
                            customerSet: new Set()
                        };
                    }

                    monthlyData[monthKey].totalRevenue += data.revenue;
                    monthlyData[monthKey].totalCustomers += data.customerCount;
                    monthlyData[monthKey].daysWithData++;
                });

                // Sort months and add to UI
                const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
                    const [yearA, monthA] = a.split('-').map(Number);
                    const [yearB, monthB] = b.split('-').map(Number);
                    return yearB - yearA || monthB - monthA; // Sort by year desc, then month desc
                });

                sortedMonths.forEach(monthKey => {
                    const data = monthlyData[monthKey];
                    addMonthlySummaryRowToUI(data);
                });

                resolve();
            })
            .catch(error => {
                console.error('Error loading monthly summaries:', error);
                monthlySummaryBody.innerHTML = '';
                const errorRow = document.createElement('div');
                errorRow.className = 'monthly-summary-row empty';
                errorRow.innerHTML = '<div class="monthly-column" style="text-align: center; flex: 1; color: #d32f2f;">Error loading monthly data.</div>';
                monthlySummaryBody.appendChild(errorRow);
                reject(error);
            });
    });
}

// Function to load daily data for selected month
function loadDailyData(year) {
    return new Promise((resolve, reject) => {
        // Get selected month
        const selectedMonth = parseInt(historyMonthSelect.value);

        // Calculate start and end dates for the selected month
        const startDate = new Date(year, selectedMonth, 1);
        const endDate = new Date(year, selectedMonth + 1, 0);

        // Query revenue history for the selected month
        revenueHistoryCollection
            .where('userId', '==', currentUser.id)
            .where('date', '>=', formatDate(startDate))
            .where('date', '<=', formatDate(endDate))
            .orderBy('date', 'desc')
            .get()
            .then(snapshot => {
                // Remove daily loading indicator
                historyBody.innerHTML = '';

                if (snapshot.empty) {
                    const emptyRow = document.createElement('div');
                    emptyRow.className = 'history-row empty';
                    emptyRow.innerHTML = '<div class="history-column" style="text-align: center; flex: 1;">No daily data found for this month.</div>';
                    historyBody.appendChild(emptyRow);
                    resolve();
                    return;
                }

                // Add history rows to UI
                snapshot.forEach(doc => {
                    const historyData = doc.data();
                    addHistoryRowToUI(historyData);
                });

                resolve();
            })
            .catch(error => {
                console.error('Error loading daily data:', error);
                historyBody.innerHTML = '';
                const errorRow = document.createElement('div');
                errorRow.className = 'history-row empty';
                errorRow.innerHTML = '<div class="history-column" style="text-align: center; flex: 1; color: #d32f2f;">Error loading daily data.</div>';
                historyBody.appendChild(errorRow);
                reject(error);
            });
    });
}

// Function to add a monthly summary row to the UI
function addMonthlySummaryRowToUI(monthlyData) {
    const row = document.createElement('div');
    row.className = 'monthly-summary-row';

    // Check if this is the current month
    const currentDate = new Date();
    const isCurrentMonth = monthlyData.year === currentDate.getFullYear() &&
                           monthlyData.month === currentDate.getMonth();

    if (isCurrentMonth) {
        row.classList.add('current-month');
    }

    // Format month name
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = `${monthNames[monthlyData.month]} ${monthlyData.year}`;

    row.innerHTML = `
        <div class="monthly-column month">${monthName}</div>
        <div class="monthly-column total-days">${monthlyData.daysWithData}</div>
        <div class="monthly-column total-customers">${monthlyData.totalCustomers}</div>
        <div class="monthly-column total-revenue">₹ ${monthlyData.totalRevenue.toFixed(2)}</div>
    `;

    // Add to monthly summary table
    monthlySummaryBody.appendChild(row);
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

            // Update time remaining for all transactions
            updateTimeLeft();

            // Apply current filter if not "all"
            const activeFilter = document.querySelector('.filter-btn.active');
            if (activeFilter && activeFilter.getAttribute('data-filter') !== 'all') {
                filterTransactions(activeFilter.getAttribute('data-filter'));
            }
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



                        // Reload transactions to update UI
                        loadTransactions();

                        // Update time remaining after days remaining are updated
                        setTimeout(updateTimeLeft, 1000);
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

    // Only check for due dates if calendar mode is enabled
    rentalCollection.where('userId', '==', currentUser.id)
        .where('status', '==', 'pending') // Only check pending transactions
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('No pending transactions found');
                return;
            }

            const today = new Date();
            const upcomingDueDates = []; // Due within 7 days or overdue
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

            console.log(`Found ${upcomingDueDates.length} upcoming due dates (within 7 days)`);
            console.log(`Found ${overdueTransactions.length} overdue transactions`);

            // Store upcoming due dates for the due dates panel
            window.upcomingDueDates = upcomingDueDates;
        })
        .catch(error => {
            console.error('Error checking due dates:', error);
        });
}



// Function to show transaction details
function showTransactionDetails(transaction) {
    console.log('Showing transaction details:', transaction);

    // Create a modal for transaction details
    const detailsModal = document.createElement('div');
    detailsModal.className = 'modal';
    detailsModal.id = 'transaction-details-modal';
    detailsModal.style.display = 'flex';

    // Calculate time remaining
    const now = new Date();
    let timeRemainingText = '';
    let timeRemainingClass = '';

    if (transaction.endDate) {
        const endDate = new Date(transaction.endDate);
        endDate.setHours(23, 59, 59, 999);

        const diff = endDate - now;

        if (diff <= 0) {
            timeRemainingText = 'Expired';
            timeRemainingClass = 'expired';
        } else {
            // Calculate days and hours
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            // Format time string
            if (days > 0) {
                timeRemainingText = `${days} day${days !== 1 ? 's' : ''} `;
            }
            if (hours > 0 || days === 0) {
                timeRemainingText += `${hours} hour${hours !== 1 ? 's' : ''}`;
            }
            timeRemainingText = timeRemainingText.trim();

            // Set class based on urgency
            if (days === 0) {
                timeRemainingClass = 'ending-today';
            } else if (days === 1) {
                timeRemainingClass = 'warning';
            } else {
                timeRemainingClass = 'normal';
            }
        }
    }

    // Format dates
    const createdDate = new Date(transaction.createdAt);
    const formattedCreatedDate = formatDateForDisplay(createdDate);

    let endDateDisplay = '';
    if (transaction.endDate) {
        const endDate = new Date(transaction.endDate);
        endDateDisplay = formatDateForDisplay(endDate);
    }

    // Create modal content
    detailsModal.innerHTML = `
        <div class="modal-content transaction-details">
            <div class="modal-header">
                <h2>Transaction Details</h2>
                <span class="close" id="close-details-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="detail-row">
                    <div class="detail-label">Customer:</div>
                    <div class="detail-value">${transaction.name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Amount:</div>
                    <div class="detail-value">₹ ${transaction.amount.toFixed(2)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">
                        <span class="status-badge ${transaction.status}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Created:</div>
                    <div class="detail-value">${formattedCreatedDate}</div>
                </div>
                ${endDateDisplay ? `
                <div class="detail-row">
                    <div class="detail-label">End Date:</div>
                    <div class="detail-value">${endDateDisplay}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Time Remaining:</div>
                    <div class="detail-value">
                        <span class="time-remaining ${timeRemainingClass}">${timeRemainingText}</span>
                    </div>
                </div>
                ` : ''}
                ${transaction.transactionNumber ? `
                <div class="detail-row">
                    <div class="detail-label">Transaction #:</div>
                    <div class="detail-value">${transaction.transactionNumber}</div>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="cancel-btn" id="close-details-btn">Close</button>
                <button class="save-btn" id="mark-complete-details-btn">Mark Complete</button>
            </div>
        </div>
    `;

    // Add to document
    document.body.appendChild(detailsModal);

    // Add event listeners
    document.getElementById('close-details-modal').addEventListener('click', () => {
        detailsModal.remove();
    });

    document.getElementById('close-details-btn').addEventListener('click', () => {
        detailsModal.remove();
    });

    document.getElementById('mark-complete-details-btn').addEventListener('click', () => {
        markTransactionComplete(transaction.id);
        detailsModal.remove();
    });

    // Close when clicking outside
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.remove();
        }
    });
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


