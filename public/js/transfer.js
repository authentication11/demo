// Transfer page functionality
let appData = {
    balance: 10000.00,
    userName: 'BABATUNDE',
    transactions: []
};

// Load data
function loadData() {
    const saved = localStorage.getItem('kudasavingsData');
    if (saved) {
        appData = JSON.parse(saved);
    }
    updateBalance();
}

// Update balance display
function updateBalance() {
    const balanceEl = document.getElementById('availableBalance');
    if (balanceEl) {
        balanceEl.textContent = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(appData.balance);
    }
}

// Load Nigerian banks
function loadBanks() {
    const banks = [
        'Access Bank', 'Citibank', 'Diamond Bank', 'Ecobank Nigeria', 'Fidelity Bank Nigeria',
        'First Bank of Nigeria', 'First City Monument Bank', 'Guaranty Trust Bank',
        'Heritage Bank Plc', 'Keystone Bank Limited', 'Polaris Bank', 'Providus Bank Plc',
        'Stanbic IBTC Bank Nigeria Limited', 'Standard Chartered Bank', 'Sterling Bank Plc',
        'Union Bank of Nigeria', 'United Bank for Africa', 'Unity Bank Plc', 'Wema Bank Plc',
        'Zenith Bank Plc', 'Jaiz Bank', 'Kuda Microfinance Bank',
        'Opay', 'PalmPay', 'Moniepoint', 'Carbon'
    ];

    const select = document.getElementById('bankName');
    banks.forEach(bank => {
        const option = document.createElement('option');
        option.value = bank;
        option.textContent = bank;
        select.appendChild(option);
    });
}

// Check if amount exceeds balance
document.getElementById('amount')?.addEventListener('input', function() {
    const amount = parseFloat(this.value) || 0;
    const msg = document.getElementById('insufficientMsg');

    if (amount > appData.balance) {
        msg.style.display = 'block';
        this.style.borderColor = '#e74c3c';
    } else {
        msg.style.display = 'none';
        this.style.borderColor = '#ddd';
    }
});

// Handle form submission
document.getElementById('transferForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);

    // Check balance
    if (amount > appData.balance) {
        alert('Insufficient balance!');
        return;
    }

    // Show loading
    document.getElementById('loadingOverlay').classList.remove('hidden');

    // Create transaction
    const transaction = {
        id: 'TXN' + Date.now(),
        type: 'debit',
        accountName: document.getElementById('accountName').value,
        bankName: document.getElementById('bankName').value,
        accountNumber: document.getElementById('accountNumber').value,
        amount: amount,
        narration: document.getElementById('narration').value,
        date: new Date().toISOString(),
        status: 'successful',
        title: `Transfer to ${document.getElementById('accountName').value}`,
        referenceNumber: generateReference()
    };

    // Deduct from balance
    appData.balance -= amount;

    // Add to transactions (newest first)
    appData.transactions.unshift(transaction);

    // Save data
    localStorage.setItem('kudasavingsData', JSON.stringify(appData));
    localStorage.setItem('currentTransaction', JSON.stringify(transaction));

    // Simulate realistic processing time
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.add('hidden');
        window.location.href = '/success.html';
    }, 6000);
});

// Generate reference number
function generateReference() {
    return '2509' + Date.now().toString().slice(-16);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadBanks();

    // Format account number input
    const accountInput = document.getElementById('accountNumber');
    accountInput?.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });
});