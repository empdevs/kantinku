const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); // Allow all origins for debugging
app.use(express.json());

// Serve static images from local folder
app.use('/images', express.static('C:/kantinku - update/images'));

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
app.listen(PORT, () => console.log(`🚀 KantinKu API running on http://localhost:${PORT}`));
