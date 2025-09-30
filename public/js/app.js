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
    clear