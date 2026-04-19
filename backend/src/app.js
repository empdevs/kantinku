const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === 'true';

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (!allowVercelPreviews) {
    return false;
  }

  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

app.use(cors({
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin tidak diizinkan oleh CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/merchant', require('./routes/merchant'));
app.use('/api', require('./routes/customer'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'KantinKu API is running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 KantinKu API running on http://localhost:${PORT}`));
}

module.exports = app;
