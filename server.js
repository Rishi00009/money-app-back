const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // Assuming MongoDB based on your 'models' folder
require('dotenv').config(); // Load .env for local testing

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// 1. DATABASE CONNECTION
// This is the most likely cause of a 500 error.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    // Don't exit on production so the health check still works
  }
};

connectDB();

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

// 6. GLOBAL ERROR HANDLER
// This prevents the server from crashing and returns a JSON error instead of a 500 HTML page
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 7. PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server successfully deployed on port ${PORT}`);
});