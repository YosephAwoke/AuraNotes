const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/noteapp')
  .then(() => {
    console.log('MongoDB successfully connected.');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS not allowed for this origin'));
    },
    credentials: true,
  })
);
app.use(express.json()); // Body parser for JSON content
app.use(morgan('dev')); // Dev logger

// Base API route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Premium Note App API is fully operational',
    timestamp: new Date(),
  });
});

// Routes middleware
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/todos', todoRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
