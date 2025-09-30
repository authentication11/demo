// Success page functionality
let currentTransaction = null;

// Load transaction data
function loadTransaction() {
    const saved = localStorage.getItem('currentTransaction');
    if (saved) {
        currentTransaction = JSON.parse(saved);
        displayTransaction();
    }
}

// Display transaction
function displayTransaction() {
    if (!currentTransaction) return;

    const amountEl = document.getElementById('receiptAmount');
    if (amountEl) {
        amountEl.textContent = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(currentTransaction.amount);
    }
}

// Share receipt
function shareReceipt() {
    if (navigator.share && currentTransaction) {
        const text = `Transfer successful!\nAmount: ₦${currentTransaction.amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}\nRecipient: ${currentTransaction.accountName}\nBank: ${currentTransaction.bankName}\nReference: ${currentTransaction.referenceNumber}`;

        navigator.share({
            title: 'Transaction Receipt',
            text: text
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: Copy to clipboard
        const text = `Transfer successful!\nAmount: ₦${currentTransaction?.amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}\nRecipient: ${currentTransaction?.accountName}\nBank: ${currentTransaction?.bankName}`;

        navigator.clipboard.writeText(text).then(() => {
            alert('Receipt details copied to clipboard!');
        }).catch(() => {
            alert('Unable to share receipt. Please try again.');
        });
    }
}

// Add to favorites
function addToFavorites() {
    alert('Added to favorites!');
}

// View details
function viewDetails() {
    if (currentTransaction) {
        localStorage.setItem('viewTransactionId', currentTransaction.id);
        window.location.href = '/details.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTransaction();
});