// Transaction details functionality
let appData = {
    balance: 10000.00,
    userName: 'BABATUNDE',
    transactions: []
};

let currentTransaction = null;

// Load data
function loadData() {
    const saved = localStorage.getItem('kudasavingsData');
    if (saved) {
        appData = JSON.parse(saved);
    }

    // Get transaction ID
    const txId = localStorage.getItem('viewTransactionId');
    if (txId) {
        currentTransaction = appData.transactions.find(t => t.id === txId);
        if (currentTransaction) {
            displayTransaction();
        }
    }
}

// Display transaction
function displayTransaction() {
    if (!currentTransaction) return;

    // Update title
    const title = currentTransaction.type === 'credit'
        ? currentTransaction.title || 'Top-up'
        : `Transfer to ${currentTransaction.accountName}`;
    document.getElementById('transferTitle').textContent = title;

    // Update amount
    const amount = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(currentTransaction.amount);

    document.getElementById('transferAmount').textContent = amount;
    document.getElementById('summaryAmount').textContent = amount;
    document.getElementById('summaryTotal').textContent = amount;

    // Update recipient details
    if (currentTransaction.type === 'debit') {
        document.getElementById('recipientDetails').innerHTML =
            `${currentTransaction.accountName}<br>${currentTransaction.bankName} | ${currentTransaction.accountNumber}`;
    } else {
        document.getElementById('recipientDetails').innerHTML =
            `${currentTransaction.accountName || 'Wallet Top-up'}`;
    }

    // Update transaction number
    document.getElementById('transactionNo').textContent = currentTransaction.referenceNumber || '--';

    // Update transaction date
    const date = new Date(currentTransaction.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('transactionDate').textContent = formattedDate;

    // Update step times
    const timeStr = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('step1Time').textContent = timeStr;
    document.getElementById('step2Time').textContent = timeStr;

    const receivedDate = new Date(date.getTime() + 28000); // +28 seconds
    const receivedTimeStr = receivedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('step3Time').textContent = receivedTimeStr;

    // Update session ID
    document.getElementById('sessionId').textContent = '1000042509021437241402499380' + Math.floor(Math.random() * 100);
}

// Share receipt
function shareReceipt() {
    if (navigator.share && currentTransaction) {
        const text = `Transaction Receipt\nAmount: ₦${currentTransaction.amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}\n${currentTransaction.type === 'debit' ? `Recipient: ${currentTransaction.accountName}\nBank: ${currentTransaction.bankName}` : 'Type: Wallet Top-up'}\nReference: ${currentTransaction.referenceNumber}\nDate: ${new Date(currentTransaction.date).toLocaleString()}`;

        navigator.share({
            title: 'Transaction Receipt',
            text: text
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: Create shareable image or text
        const text = `Transaction Receipt\nAmount: ₦${currentTransaction?.amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}\nReference: ${currentTransaction?.referenceNumber}`;

        navigator.clipboard.writeText(text).then(() => {
            alert('Receipt details copied to clipboard!');
        }).catch(() => {
            alert('Unable to share receipt. Please try again.');
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});