const express = require('express');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionsRoutes');

const app = express();

// 1. DATABASE CONNECTION
// If you have DB connection code, paste it here or ensure the logic is active.
// For example: if using mongoose, it would be mongoose.connect(process.env.MONGO_URI)
console.log("Initializing Server Handlers...");

// 2. BULLETPROOF CORS MIDDLEWARE
const allowedOrigins = [
  'http://localhost:5173', 
  'https://rishi-money-management-app.netlify.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 3. BODY PARSING
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 4. HEALTH CHECK
app.get('/', (req, res) => {
  res.send('Money App Backend is Running Successfully 🚀');
});

// 5. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// 6. PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server successfully deployed on port ${PORT}`);
});