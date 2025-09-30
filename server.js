const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: 'demo-session-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// PWA Routes - serve manifest and service worker
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

app.get('/browserconfig.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'public', 'browserconfig.xml'));
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/submit-transaction', (req, res) => {
  const transactionData = {
    accountName: req.body.accountName,
    bankName: req.body.bankName,
    accountNumber: req.body.accountNumber,
    phoneNumber: req.body.phoneNumber,
    amount: req.body.amount,
    narration: req.body.narration,
    transactionDate: req.body.transactionDate,
    referenceNumber: generateDemoReferenceNumber(),
    submittedAt: new Date().toISOString()
  };

  // Save to session
  req.session.transactionData = transactionData;

  console.log('✅ Transaction processed:', transactionData);

  // Redirect to receipt page
  res.redirect('/receipt');
});

app.get('/receipt', (req, res) => {
  if (!req.session.transactionData) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'receipt.html'));
});

app.get('/details', (req, res) => {
  if (!req.session.transactionData) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'details.html'));
});

// API endpoint to get transaction data
app.get('/api/transaction-data', (req, res) => {
  if (!req.session.transactionData) {
    return res.status(404).json({ error: 'No transaction data found' });
  }
  res.json(req.session.transactionData);
});

// API endpoint to get Nigerian banks
app.get('/api/banks', (req, res) => {
  const nigerianBanks = [
    { name: 'Access Bank', code: '044', logo: 'https://nigerianbanks.xyz/logo/access-bank.png' },
    { name: 'Citibank', code: '023', logo: 'https://nigerianbanks.xyz/logo/citibank.png' },
    { name: 'Diamond Bank', code: '063', logo: 'https://nigerianbanks.xyz/logo/diamond-bank.png' },
    { name: 'Ecobank Nigeria', code: '050', logo: 'https://nigerianbanks.xyz/logo/ecobank.png' },
    { name: 'Fidelity Bank Nigeria', code: '070', logo: 'https://nigerianbanks.xyz/logo/fidelity-bank.png' },
    { name: 'First Bank of Nigeria', code: '011', logo: 'https://nigerianbanks.xyz/logo/first-bank.png' },
    { name: 'First City Monument Bank', code: '214', logo: 'https://nigerianbanks.xyz/logo/fcmb.png' },
    { name: 'Guaranty Trust Bank', code: '058', logo: 'https://nigerianbanks.xyz/logo/gtbank.png' },
    { name: 'Heritage Bank Plc', code: '030', logo: 'https://nigerianbanks.xyz/logo/heritage-bank.png' },
    { name: 'Keystone Bank Limited', code: '082', logo: 'https://nigerianbanks.xyz/logo/keystone-bank.png' },
    { name: 'Polaris Bank', code: '076', logo: 'https://nigerianbanks.xyz/logo/polaris-bank.png' },
    { name: 'Providus Bank Plc', code: '101', logo: 'https://nigerianbanks.xyz/logo/providus-bank.png' },
    { name: 'Stanbic IBTC Bank Nigeria Limited', code: '221', logo: 'https://nigerianbanks.xyz/logo/stanbic-ibtc.png' },
    { name: 'Standard Chartered Bank', code: '068', logo: 'https://nigerianbanks.xyz/logo/standard-chartered.png' },
    { name: 'Sterling Bank Plc', code: '232', logo: 'https://nigerianbanks.xyz/logo/sterling-bank.png' },
    { name: 'Union Bank of Nigeria', code: '032', logo: 'https://nigerianbanks.xyz/logo/union-bank.png' },
    { name: 'United Bank for Africa', code: '033', logo: 'https://nigerianbanks.xyz/logo/uba.png' },
    { name: 'Unity Bank Plc', code: '215', logo: 'https://nigerianbanks.xyz/logo/unity-bank.png' },
    { name: 'Wema Bank Plc', code: '035', logo: 'https://nigerianbanks.xyz/logo/wema-bank.png' },
    { name: 'Zenith Bank Plc', code: '057', logo: 'https://nigerianbanks.xyz/logo/zenith-bank.png' },
    { name: 'Jaiz Bank', code: '301', logo: 'https://nigerianbanks.xyz/logo/jaiz-bank.png' },
    { name: 'SunTrust Bank Nigeria Limited', code: '100', logo: 'https://nigerianbanks.xyz/logo/suntrust-bank.png' },
    { name: 'Kuda Microfinance Bank', code: '090267', logo: 'https://nigerianbanks.xyz/logo/kuda-bank.png' },
    { name: 'Opay', code: '999992', logo: 'https://nigerianbanks.xyz/logo/opay.png' },
    { name: 'PalmPay', code: '999991', logo: 'https://nigerianbanks.xyz/logo/palmpay.png' },
    { name: 'Moniepoint', code: '50515', logo: 'https://nigerianbanks.xyz/logo/moniepoint.png' },
    { name: 'Carbon', code: '565', logo: 'https://nigerianbanks.xyz/logo/carbon.png' },
    { name: 'Rubies Bank', code: '125', logo: 'https://nigerianbanks.xyz/logo/rubies-bank.png' },
    { name: 'Sparkle Microfinance Bank', code: '51310', logo: 'https://nigerianbanks.xyz/logo/sparkle-bank.png' }
  ];
  
  res.json(nigerianBanks);
});

function generateDemoReferenceNumber() {
  return Math.random().toString(36).substr(2, 12).toUpperCase();
}

app.listen(PORT, () => {
  console.log(`🚀 Receipt Generator App running on http://localhost:${PORT}`);
  console.log('📱 Mobile-optimized transaction receipt generator');
});