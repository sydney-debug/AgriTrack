require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const farmsRoutes = require('./routes/farms');
const cropsRoutes = require('./routes/crops');
const livestockRoutes = require('./routes/livestock');
const healthRecordsRoutes = require('./routes/healthRecords');
const salesRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const pregnanciesRoutes = require('./routes/pregnancies');
const vetsContactsRoutes = require('./routes/vetsContacts');
const notebookRoutes = require('./routes/notebook');
const marketplaceRoutes = require('./routes/marketplace');
const farmVetAssociationsRoutes = require('./routes/farmVetAssociations');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'AgriTrack API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmsRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/livestock', livestockRoutes);
app.use('/api/health-records', healthRecordsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pregnancies', pregnanciesRoutes);
app.use('/api/vets-contacts', vetsContactsRoutes);
app.use('/api/notebook', notebookRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/farm-vet-associations', farmVetAssociationsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`AgriTrack API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
