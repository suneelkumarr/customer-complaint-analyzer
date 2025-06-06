const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const complaintRoutes = require('./routes/complaints');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', complaintRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Customer Complaint Analyzer'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: ['/api/summarize', '/health']
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 API endpoint: http://localhost:${PORT}/api/summarize`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

module.exports = app;