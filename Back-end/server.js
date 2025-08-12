const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Import routes
const apiRoutes = require('./routes');

// Import models to initialize associations 
const db = require('./models');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    process.env.FRONTEND_URL || false : 
    true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded files)
const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
app.use('/uploads', express.static(path.join(__dirname, uploadPath)));

// API routes
app.use('/api', apiRoutes);

// Serve uploaded files with proper headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  next();
}, express.static(path.join(__dirname, uploadPath)));

// 404 handler for undefined routes
app.use('*', notFound);

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database (only in development)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: false });
      console.log('✅ Database synchronized successfully.');
    }
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: Import postman_collection.json`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📖 API Info: http://localhost:${PORT}/api/`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 Environment: Development`);
        console.log(`📁 Uploads Directory: ${path.join(__dirname, uploadPath)}`);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;