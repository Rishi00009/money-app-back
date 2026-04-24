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
  'http://localhost:5173',           // Vite dev server
  'http://localhost:3000',            // React dev server
  'https://rishi-money-management-app.netlify.app', // Your deployed frontend
  'capacitor://localhost',            // Capacitor Android (IMPORTANT!)
  'https://localhost',                // Capacitor HTTPS (IMPORTANT!)
  'http://localhost',                 // Capacitor HTTP fallback
  'capacitor://localhost:5173',       // Capacitor with port
  'https://localhost:5173',           // HTTPS localhost with port
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log incoming origins for debugging
  console.log('Incoming request from origin:', origin);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Enhanced origin checking for Capacitor
  let isAllowed = false;
  
  if (!origin) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    isAllowed = true;
  } else if (allowedOrigins.includes(origin)) {
    isAllowed = true;
  } else if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    // Allow any localhost origin (for development)
    isAllowed = true;
  } else if (origin.includes('capacitor://')) {
    // Allow any capacitor:// origin
    isAllowed = true;
  } else if (origin.includes('192.168')) {
    // Allow local network IPs
    isAllowed = true;
  }
  
  if (isAllowed) {
    // Set the specific origin or * for no origin
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  } else {
    console.log('❌ Blocked origin:', origin);
  }

  // Handle preflight requests immediately
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

// 6. 404 Handler for undefined routes
app.use('*', (req, res) => {
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