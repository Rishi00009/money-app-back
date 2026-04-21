const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

const app = express();

// 1. DATABASE CONNECTION
connectDB();

// 2. BULLETPROOF CORS MIDDLEWARE
const allowedOrigins = [
  'http://localhost:5173', 
  'https://rishi-money-management-app.netlify.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if the request origin is in our whitelist
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle the 'Preflight' OPTIONS request immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// 3. BODY PARSING MIDDLEWARE
// Set to 10mb for those Ghibli-style profile pic uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 4. HEALTH CHECK ROUTE
app.get('/', (req, res) => {
  res.send('Money App Backend is Running Successfully 🚀');
});

// 5. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// 6. PORT CONFIGURATION
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server successfully deployed on port ${PORT}`);
});