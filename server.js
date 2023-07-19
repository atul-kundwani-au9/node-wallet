
const express = require('express');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');

const app = express();
const port = 3001;

// Connect to the database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
