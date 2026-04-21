const express = require('express');
const cors = require('cors');
const path = require('path');
// Import your database connection and routes
const connectDB = require('./config/db'); // Ensure this path matches your structure
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

const app = express();

// 1. DATABASE CONNECTION
connectDB();

// 2. CORS CONFIGURATION
// This allows your Netlify frontend to communicate with this Render backend
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://rishi-money-management-app.netlify.app'
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle Pre-flight requests

// 3. BODY PARSING MIDDLEWARE
// Increased limit to 10mb to handle Rishi's profile picture uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 4. HEALTH CHECK ROUTE
app.get('/', (req, res) => {
  res.send('Money App Backend is Running... 🚀');
});

// 5. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// 6. PORT CONFIGURATION
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server successfully deployed on port ${PORT}`);
});