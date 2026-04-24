const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// 1. DATABASE CONNECTION
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
  }
};

connectDB();

// 2. COMPLETE CORS MIDDLEWARE (FIXED FOR CAPACITOR)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://rishi-money-management-app.netlify.app',
  'capacitor://localhost',
  'https://localhost',
  'http://localhost',
  'capacitor://localhost:5173',
  'https://localhost:5173',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  console.log('Incoming request from origin:', origin);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  let isAllowed = false;
  
  if (!origin) {
    isAllowed = true;
  } else if (allowedOrigins.includes(origin)) {
    isAllowed = true;
  } else if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    isAllowed = true;
  } else if (origin.includes('capacitor://')) {
    isAllowed = true;
  } else if (origin.includes('192.168')) {
    isAllowed = true;
  }
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  } else {
    console.log('❌ Blocked origin:', origin);
  }

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
  res.json({
    status: 'success',
    message: 'Money App Backend is Running Successfully 🚀',
    timestamp: new Date().toISOString()
  });
});

// 5. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// 6. 404 HANDLER - FIXED (no '*' pattern)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// 7. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 8. PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server successfully running on port ${PORT}`);
  console.log(`📍 Allowed origins:`, allowedOrigins);
});