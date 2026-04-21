const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
const cors = require('cors');

const corsOptions = {
  // 1. Put your actual Vercel URL here (no trailing slash)
  origin: 'https://money-app-rishi.vercel.app', 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "x-auth-token", 
    "Accept"
  ],
};

app.use(cors(corsOptions));

// Handle the Preflight OPTIONS request manually if standard CORS fails
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ Connection Error:", err));

// --- LINK ALL ROUTES ---
// This handles login and registration
app.use('/api/auth', require('./routes/authRoutes')); 

// This handles your money data
app.use('/api/transactions', require('./routes/transactionRoutes')); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));