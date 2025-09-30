// Add money functionality
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

    // Pre-fill display name if exists
    document.getElementById('displayName').value = appData.userName;
}

// Update balance display
function updateBalance() {
    const balanceEl = document.getElementById('currentBalance');
    if (balanceEl) {
        balanceEl.textContent = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(appData.balance);
    }
}

// Handle form submission
document.getElementById('addMoneyForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('topupAmount').value);
    const displayName = document.getElementById('displayName').value;
    const narration = document.getElementById('narration').value || 'Wallet Top-up';

    if (amount < 100) {
        alert('Minimum top-up amount is ₦100.00');
        return;
    }

    // Show loading
    document.getElementById('loadingOverlay').classList.remove('hidden');

    // Update user name
    appData.userName = displayName;

    // Create transaction
    const transaction = {
        id: 'TXN' + Date.now(),
        type: 'credit',
        accountName: 'Wallet Top-up',
        amount: amount,
        narration: narration,
        date: new Date().toISOString(),
        status: 'successful',
        title: narration,
        referenceNumber: generateReference()
    };

    // Add to balance
    appData.balance += amount;

    // Add to transactions (newest first)
    appData.transactions.unshift(transaction);

    // Save data
    localStorage.setItem('kudasavingsData', JSON.stringify(appData));

    // Simulate processing
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.add('hidden');
        alert(`Successfully added ₦${amount.toLocaleString('en-NG', {minimumFractionDigits: 2})} to your balance!`);
        window.location.href = '/dashboard.html';
    }, 1500);
});

// Generate reference number
function generateReference() {
    return '2509' + Date.now().toString().slice(-16);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();

    // Validate amount
    document.getElementById('topupAmount')?.addEventListener('input', function() {
        const amount = parseFloat(this.value) || 0;
        if (amount < 100 && amount > 0) {
            this.style.borderColor = '#ff6b35';
        } else {
            this.style.borderColor = '#ddd';
        }
    });
});