// App State Management
class BankingApp {
    constructor() {
        this.balance = parseFloat(localStorage.getItem('balance')) || 3.20;
        this.userName = localStorage.getItem('userName') || 'BABATUNDE';
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.banks = [];
        
        this.init();
    }

    init() {
        this.loadBanks();
        this.updateUI();
        this.bindEvents();
        this.setDefaultDateTime();
    }

    // Load Nigerian banks
    async loadBanks() {
        try {
            const response = await fetch('/api/banks');
            this.banks = await response.json();
            this.populateBankSelect();
        } catch (error) {
            console.error('Error loading banks:', error);
            this.loadFallbackBanks();
        }
    }

    loadFallbackBanks() {
        this.banks = [
            { name: 'Access Bank', code: '044' },
            { name: 'Guaranty Trust Bank', code: '058' },
            { name: 'Zenith Bank Plc', code: '057' },
            { name: 'First Bank of Nigeria', code: '011' },
            { name: 'United Bank for Africa', code: '033' },
            { name: 'Kuda Microfinance Bank', code: '090267' },
            { name: 'Opay', code: '999992' },
            { name: 'PalmPay', code: '999991' },
            { name: 'Moniepoint', code: '50515' }
        ];
        this.populateBankSelect();
    }

    populateBankSelect() {
        const bankSelect = document.getElementById('bankName');
        if (bankSelect) {
            bankSelect.innerHTML = '<option value="">Select a bank</option>';
            this.banks.forEach(bank => {
                const option = document.createElement('option');
                option.value = bank.name;
                option.textContent = bank.name;
                bankSelect.appendChild(option);
            });
        }
    }

    // Update UI elements
    updateUI() {
        // Update balance displays
        const balanceElements = document.querySelectorAll('#currentBalance, #availableBalance');
        balanceElements.forEach(el => {
            if (el) el.textContent = this.balance.toFixed(2);
        });

        // Update user name
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = this.userName;

        // Update transaction history
        this.updateTransactionHistory();
        this.updateMonthlySummary();
    }

    // Bind event listeners
    bindEvents() {
        // Form submission
        const form = document.getElementById('transactionForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleTransferSubmit(e));
        }

        // Input validation
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.addEventListener('input', (e) => this.validateAmount(e));
            amountInput.addEventListener('blur', (e) => this.validateAmount(e));
        }

        // Account number formatting
        const accountNumberInput = document.getElementById('accountNumber');
        if (accountNumberInput) {
            accountNumberInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
            });
        }

        // Phone number formatting
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e));
        }
    }

    // Set default date and time
    setDefaultDateTime() {
        const dateInput = document.getElementById('transactionDate');
        if (dateInput) {
            const now = new Date();
            const isoString = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            dateInput.value = isoString;
        }
    }

    // Validate amount against balance
    validateAmount(e) {
        const amount = parseFloat(e.target.value);
        const existingError = e.target.parentNode.querySelector('.insufficient-funds');
        
        if (existingError) {
            existingError.remove();
        }

        if (amount > this.balance) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'insufficient-funds';
            errorDiv.textContent = `Insufficient funds. Available balance: ₦${this.balance.toFixed(2)}`;
            e.target.parentNode.appendChild(errorDiv);
            return false;
        }
        return true;
    }

    // Format phone number
    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 4) {
                value = value;
            } else if (value.length <= 7) {
                value = value.slice(0, 4) + '-' + value.slice(4);
            } else if (value.length <= 11) {
                value = value.slice(0, 4) + '-' + value.slice(4, 7) + '-' + value.slice(7);
            } else {
                value = value.slice(0, 4) + '-' + value.slice(4, 7) + '-' + value.slice(7, 11);
            }
        }
        e.target.value = value;
    }

    // Handle transfer form submission
    handleTransferSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const formData = new FormData(e.target);
        const amount = parseFloat(formData.get('amount'));

        // Check balance
        if (amount > this.balance) {
            this.showError('Insufficient funds');
            return;
        }

        // Show loading
        this.showLoading('Processing Transaction...');

        // Simulate processing delay
        setTimeout(() => {
            this.processTransfer(formData);
        }, 3000);
    }

    // Process the transfer
    processTransfer(formData) {
        const amount = parseFloat(formData.get('amount'));
        const transactionData = {
            id: this.generateId(),
            accountName: formData.get('accountName'),
            bankName: formData.get('bankName'),
            accountNumber: formData.get('accountNumber'),
            phoneNumber: formData.get('phoneNumber'),
            amount: amount,
            narration: formData.get('narration'),
            transactionDate: formData.get('transactionDate'),
            referenceNumber: this.generateReferenceNumber(),
            status: 'Successful',
            type: 'Transfer',
            createdAt: new Date().toISOString()
        };

        // Deduct from balance
        this.balance -= amount;
        
        // Add to transactions (newest first)
        this.transactions.unshift(transactionData);

        // Save to localStorage
        this.saveData();

        // Update UI
        this.updateUI();

        // Show receipt
        this.showReceipt(transactionData);
    }

    // Validate form
    validateForm() {
        const form = document.getElementById('transactionForm');
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        // Validate account number
        const accountNumber = document.getElementById('accountNumber');
        if (accountNumber.value && !/^[0-9]{10}$/.test(accountNumber.value)) {
            this.showFieldError(accountNumber, 'Account number must be exactly 10 digits');
            isValid = false;
        }

        // Validate amount
        const amount = document.getElementById('amount');
        const amountValue = parseFloat(amount.value);
        if (amount.value && (isNaN(amountValue) || amountValue <= 0)) {
            this.showFieldError(amount, 'Amount must be greater than 0');
            isValid = false;
        }

        return isValid;
    }

    // Show field error
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = '#e74c3c';
        field.style.backgroundColor = '#fff5f5';
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }

    // Clear field error
    clearFieldError(field) {
        field.style.borderColor = '#ddd';
        field.style.backgroundColor = '#fff';
        
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    // Show error message
    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #e74c3c;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            animation: slideDown 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Show loading overlay
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageEl = overlay.querySelector('p');
        
        if (messageEl) messageEl.textContent = message;
        overlay.classList.remove('hidden');
    }

    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('hidden');
    }

    // Show receipt page
    showReceipt(transactionData) {
        this.hideLoading();
        
        // Store current transaction for receipt display
        localStorage.setItem('currentTransaction', JSON.stringify(transactionData));
        
        const receiptContent = document.getElementById('receiptContent');
        receiptContent.innerHTML = `
            <div class="receipt-header">
                <span class="done-text">Done</span>
            </div>

            <div class="success-icon">
                <div class="check-circle">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="35" fill="#321457"/>
                        <path d="M25 40L35 50L55 30" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>

            <h1 class="success-title">Transfer successful</h1>

            <div class="amount-display">
                <span>₦${transactionData.amount.toFixed(2)}</span>
            </div>

            <p class="receipt-message">
                Transfer to ${transactionData.accountName} (${transactionData.bankName}) was successful.
                Reference: ${transactionData.referenceNumber}
            </p>

            <div style="padding: 20px; margin-top: 30px;">
                <button class="submit-btn" onclick="app.showDashboard()" style="margin-bottom: 15px;">
                    Back to Dashboard
                </button>
                <button class="submit-btn" onclick="app.viewCurrentReceipt()" style="background: rgba(50, 20, 87, 0.1); color: #321457; margin-bottom: 15px;">
                    View Receipt
                </button>
                <button class="submit-btn" onclick="app.showTransactionHistory()" style="background: rgba(50, 20, 87, 0.1); color: #321457;">
                    View Transaction History
                </button>
            </div>
        `;
        
        this.showPage('receiptPage');
    }

    // View current receipt
    viewCurrentReceipt() {
        const currentTransaction = JSON.parse(localStorage.getItem('currentTransaction'));
        if (currentTransaction) {
            this.showTransactionReceipt(currentTransaction);
        }
    }

    // Show transaction receipt (detailed view)
    showTransactionReceipt(transaction) {
        const receiptContent = document.getElementById('receiptContent');
        receiptContent.innerHTML = `
            <div class="receipt-header">
                <button class="back-btn" onclick="app.showDashboard()" style="background: none; border: none; color: #321457; font-size: 16px; cursor: pointer;">
                    ← Back
                </button>
                <span class="done-text">Receipt</span>
            </div>

            <div class="success-icon">
                <div class="check-circle">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <circle cx="30" cy="30" r="25" fill="#321457"/>
                        <path d="M20 30L25 35L40 20" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>

            <h1 class="success-title">Transaction Receipt</h1>

            <div class="transaction-summary">
                <div class="summary-row">
                    <span class="label">Recipient</span>
                    <span class="value">${transaction.accountName}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Bank</span>
                    <span class="value">${transaction.bankName}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Account Number</span>
                    <span class="value">${transaction.accountNumber}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Amount</span>
                    <span class="value">₦${transaction.amount.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Reference</span>
                    <span class="value">${transaction.referenceNumber}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Date</span>
                    <span class="value">${this.formatDate(transaction.transactionDate)}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Status</span>
                    <span class="value" style="color: #321457; font-weight: 700;">${transaction.status}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Description</span>
                    <span class="value">${transaction.narration}</span>
                </div>
            </div>

            <div style="padding: 20px; margin-top: 20px;">
                <button class="submit-btn" onclick="app.shareReceipt('${transaction.id}')" style="margin-bottom: 15px;">
                    Share Receipt
                </button>
                <button class="submit-btn" onclick="app.showDashboard()" style="background: rgba(50, 20, 87, 0.1); color: #321457;">
                    Back to Dashboard
                </button>
            </div>
        `;
        
        this.showPage('receiptPage');
    }

    // Share receipt
    shareReceipt(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (transaction && navigator.share) {
            navigator.share({
                title: 'Transaction Receipt',
                text: `Transfer of ₦${transaction.amount.toFixed(2)} to ${transaction.accountName} was successful. Reference: ${transaction.referenceNumber}`,
            });
        } else {
            // Fallback for browsers without Web Share API
            const receiptText = `Transaction Receipt\n\nRecipient: ${transaction.accountName}\nBank: ${transaction.bankName}\nAmount: ₦${transaction.amount.toFixed(2)}\nReference: ${transaction.referenceNumber}\nStatus: ${transaction.status}`;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(receiptText);
                this.showError('Receipt copied to clipboard!');
            }
        }
    }

    // Add money to balance
    addMoney() {
        const amountInput = document.getElementById('topupAmount');
        const nameInput = document.getElementById('displayName');
        
        const amount = parseFloat(amountInput.value);
        const displayName = nameInput.value.trim();

        if (!amount || amount <= 0) {
            this.showError('Please enter a valid amount');
            return;
        }

        this.showLoading('Adding Money...');

        setTimeout(() => {
            // Add to balance
            this.balance += amount;

            // Update display name if provided
            if (displayName) {
                this.userName = displayName;
            }

            // Create transaction record
            const transaction = {
                id: this.generateId(),
                accountName: 'Top Up',
                bankName: 'Wallet',
                accountNumber: '0000000000',
                phoneNumber: '',
                amount: amount,
                narration: 'Wallet Top Up',
                transactionDate: new Date().toISOString(),
                referenceNumber: this.generateReferenceNumber(),
                status: 'Successful',
                type: 'Credit',
                createdAt: new Date().toISOString()
            };

            this.transactions.unshift(transaction);
            this.saveData();
            this.updateUI();
            this.hideLoading();

            // Clear form
            amountInput.value = '';
            nameInput.value = '';

            // Show success and redirect
            setTimeout(() => {
                this.showDashboard();
            }, 1000);

        }, 2000);
    }

    // Update transaction history
    updateTransactionHistory() {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) return;

        if (this.transactions.length === 0) {
            transactionsList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #666;">
                    <svg width="60" height="60" fill="#ddd" viewBox="0 0 24 24" style="margin-bottom: 15px;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <h3 style="margin-bottom: 10px;">No Transactions Yet</h3>
                    <p>Your transaction history will appear here</p>
                </div>
            `;
            return;
        }

        transactionsList.innerHTML = this.transactions.map(transaction => `
            <div class="history-transaction-item" onclick="app.showTransactionReceipt(${JSON.stringify(transaction).replace(/"/g, '&quot;')})">
                <div class="transaction-icon ${transaction.type === 'Credit' ? 'green' : 'purple'}">
                    ${this.getTransactionIcon(transaction.type)}
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.narration}</div>
                    <div class="transaction-date">${this.formatDate(transaction.transactionDate)}</div>
                </div>
                <div class="transaction-amount ${transaction.type === 'Credit' ? 'positive' : 'negative'}">
                    ${transaction.type === 'Credit' ? '+' : '-'}₦${transaction.amount.toFixed(2)}
                </div>
                <div class="transaction-status ${transaction.status.toLowerCase()}">${transaction.status}</div>
            </div>
        `).join('');
    }

    // Update monthly summary
    updateMonthlySummary() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.transactionDate);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });

        const totalIn = monthlyTransactions
            .filter(t => t.type === 'Credit')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalOut = monthlyTransactions
            .filter(t => t.type === 'Transfer')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyInEl = document.getElementById('monthlyIn');
        const monthlyOutEl = document.getElementById('monthlyOut');

        if (monthlyInEl) monthlyInEl.textContent = totalIn.toFixed(2);
        if (monthlyOutEl) monthlyOutEl.textContent = totalOut.toFixed(2);
    }

    // Get transaction icon
    getTransactionIcon(type) {
        if (type === 'Credit') {
            return `<svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M7 14l5-5 5 5z"/>
            </svg>`;
        } else {
            return `<svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z"/>
            </svg>`;
        }
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        };
        return date.toLocaleDateString('en-US', options).replace(',', 'th,');
    }

    // Page navigation
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    showDashboard() {
        this.showPage('dashboardPage');
        this.updateUI();
    }

    showTransferForm() {
        this.showPage('transferPage');
        this.updateUI();
    }

    showTransactionHistory() {
        this.showPage('historyPage');
        this.updateTransactionHistory();
        this.updateMonthlySummary();
    }

    showAddMoney() {
        this.showPage('addMoneyPage');
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateReferenceNumber() {
        return 'TXN' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('balance', this.balance.toString());
        localStorage.setItem('userName', this.userName);
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }
}

// Global functions for onclick handlers
function showDashboard() {
    app.showDashboard();
}

function showTransferForm() {
    app.showTransferForm();
}

function showTransactionHistory() {
    app.showTransactionHistory();
}

function showAddMoney() {
    app.showAddMoney();
}

function addMoney() {
    app.addMoney();
}

// Initialize app
const app = new BankingApp();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    .toast {
        animation: slideDown 0.3s ease-out;
    }
`;
document.head.appendChild(style);