// Form validation and enhanced mobile experience
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('transactionForm');
    
    // Load Nigerian banks
    loadNigerianBanks();
    
    // Set default transaction date to current date/time
    const now = new Date();
    const isoString = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('transactionDate').value = isoString;
    
    // Enhanced form validation with mobile-friendly feedback
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return false;
        }
        
        // Show loading overlay with enhanced animation
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.remove('hidden');
        
        // Add success animation to loading
        setTimeout(() => {
            const spinner = loadingOverlay.querySelector('.spinner');
            spinner.style.borderTopColor = '#00d4aa';
            loadingOverlay.querySelector('p').textContent = 'Transaction Successful!';
        }, 2000);
        
        // Submit form after 3 seconds
        setTimeout(() => {
            form.submit();
        }, 3000);
    });
    
    // Real-time validation with enhanced mobile feedback
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
        
        // Enhanced mobile focus effects
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'translateY(-2px)';
            this.parentNode.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'translateY(0)';
        });
    });
    
    // Load Nigerian banks function
    async function loadNigerianBanks() {
        const bankSelect = document.getElementById('bankName');
        
        try {
            const response = await fetch('/api/banks');
            const banks = await response.json();
            
            // Clear existing options except the first one
            bankSelect.innerHTML = '<option value="">Select a bank</option>';
            
            // Add bank options
            banks.forEach(bank => {
                const option = document.createElement('option');
                option.value = bank.name;
                option.textContent = bank.name;
                option.dataset.code = bank.code;
                option.dataset.logo = bank.logo;
                bankSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading banks:', error);
            // Fallback to manual list if API fails
            loadFallbackBanks();
        }
    }
    
    function loadFallbackBanks() {
        const bankSelect = document.getElementById('bankName');
        const fallbackBanks = [
            'Access Bank', 'Citibank', 'Diamond Bank', 'Ecobank Nigeria', 'Fidelity Bank Nigeria',
            'First Bank of Nigeria', 'First City Monument Bank', 'Guaranty Trust Bank',
            'Heritage Bank Plc', 'Keystone Bank Limited', 'Polaris Bank', 'Providus Bank Plc',
            'Stanbic IBTC Bank Nigeria Limited', 'Standard Chartered Bank', 'Sterling Bank Plc',
            'Union Bank of Nigeria', 'United Bank for Africa', 'Unity Bank Plc', 'Wema Bank Plc',
            'Zenith Bank Plc', 'Jaiz Bank', 'SunTrust Bank Nigeria Limited', 'Kuda Microfinance Bank',
            'Opay', 'PalmPay', 'Moniepoint', 'Carbon', 'Rubies Bank', 'Sparkle Microfinance Bank'
        ];
        
        bankSelect.innerHTML = '<option value="">Select a bank</option>';
        fallbackBanks.forEach(bankName => {
            const option = document.createElement('option');
            option.value = bankName;
            option.textContent = bankName;
            bankSelect.appendChild(option);
        });
    }
    
    function validateForm() {
        let isValid = true;
        
        // Validate account name
        const accountName = document.getElementById('accountName');
        if (accountName.value.trim().length < 2) {
            showError(accountName, 'Account name must be at least 2 characters');
            isValid = false;
        }
        
        // Validate bank name
        const bankName = document.getElementById('bankName');
        if (bankName.value.trim().length < 2) {
            showError(bankName, 'Bank name must be at least 2 characters');
            isValid = false;
        }
        
        // Validate account number
        const accountNumber = document.getElementById('accountNumber');
        if (!/^[0-9]{10}$/.test(accountNumber.value)) {
            showError(accountNumber, 'Account number must be exactly 10 digits');
            isValid = false;
        }
        
        // Validate phone number
        const phoneNumber = document.getElementById('phoneNumber');
        if (!/^[\+]?[0-9]{10,15}$/.test(phoneNumber.value.replace(/[\s\-\(\)]/g, ''))) {
            showError(phoneNumber, 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Validate amount
        const amount = document.getElementById('amount');
        const amountValue = parseFloat(amount.value);
        if (isNaN(amountValue) || amountValue <= 0) {
            showError(amount, 'Amount must be greater than 0');
            isValid = false;
        }
        
        // Validate narration
        const narration = document.getElementById('narration');
        if (narration.value.trim().length < 1) {
            showError(narration, 'Transaction description is required');
            isValid = false;
        }
        
        // Validate transaction date
        const transactionDate = document.getElementById('transactionDate');
        const selectedDate = new Date(transactionDate.value);
        const now = new Date();
        const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        
        if (selectedDate < new Date('2020-01-01') || selectedDate > maxDate) {
            showError(transactionDate, 'Date must be between 2020 and 30 days from now');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validateField(e) {
        const field = e.target;
        clearError(e);
        
        switch (field.id) {
            case 'accountNumber':
                if (!/^[0-9]{10}$/.test(field.value)) {
                    showError(field, 'Account number must be exactly 10 digits');
                }
                break;
            case 'amount':
                const amount = parseFloat(field.value);
                if (isNaN(amount) || amount <= 0) {
                    showError(field, 'Amount must be greater than 0');
                }
                break;
        }
    }
    
    function showError(field, message) {
        clearError({target: field});
        
        field.style.borderColor = '#e74c3c';
        field.style.backgroundColor = '#fff5f5';
        field.style.transform = 'shake 0.5s ease-in-out';
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.cssText = `
            color: #e74c3c;
            font-size: 13px;
            margin-top: 6px;
            font-weight: 500;
            animation: fadeInUp 0.3s ease-out;
        `;
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
        
        // Haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
    
    function clearError(e) {
        const field = e.target;
        field.style.borderColor = '#ddd';
        field.style.backgroundColor = '#fff';
        field.style.transform = 'none';
        
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // Enhanced input formatting
    const accountNumberInput = document.getElementById('accountNumber');
    accountNumberInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
    
    // Enhanced phone number formatting
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput.addEventListener('input', function(e) {
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
    });
    
    // Amount formatting with currency
    const amountInput = document.getElementById('amount');
    amountInput.addEventListener('blur', function(e) {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            e.target.value = value.toFixed(2);
        }
    });
});

// Enhanced utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Prevent form resubmission on page refresh
if (performance.navigation.type === 1) {
    const url = new URL(window.location);
    if (url.pathname === '/') {
        document.getElementById('transactionForm')?.reset();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Load PWA functionality
const pwaScript = document.createElement('script');
pwaScript.src = '/js/pwa.js';
pwaScript.async = true;
document.head.appendChild(pwaScript);