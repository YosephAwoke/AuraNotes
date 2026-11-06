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
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/noteapp';

const normalizeOrigin = (value) => {
  if (!value) return '';

  try {
    return new URL(value.trim()).origin;
  } catch (error) {
    return value.trim().replace(/\/$/, '');
  }
};

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

// Connect to MongoDB
mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  })
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

      const requestOrigin = normalizeOrigin(origin);

      if (allowedOrigins.length === 0 || allowedOrigins.includes(requestOrigin)) {
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
// Render uses this endpoint to verify that the process is listening.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'AuraNotes API is running',
  });
});

app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'healthy' : 'degraded',
    database: databaseConnected ? 'connected' : 'unavailable',
    message: databaseConnected
      ? 'Premium Note App API is fully operational'
      : 'API is running but the database is unavailable',
    timestamp: new Date(),
  });
});

// Database-backed routes should fail quickly when MongoDB is unavailable instead
// of waiting for Mongoose's query buffer to time out.
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is temporarily unavailable. Please try again shortly.',
    });
  }

  next();
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
