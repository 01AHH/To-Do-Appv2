import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import and validate environment configuration
import { validateEnvironment, getEnv } from './config/env';
import { testDatabaseConnection } from './utils/database';

// Import routes
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import goalRoutes from './routes/goals';
import categoryRoutes from './routes/categories';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Validate environment variables at startup
const env = validateEnvironment();

const app = express();
const PORT = env.PORT;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FocusFlow API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/categories', categoryRoutes);

// API documentation endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'FocusFlow API v1',
    endpoints: {
      auth: '/api/v1/auth',
      tasks: '/api/v1/tasks',
      goals: '/api/v1/goals',
      categories: '/api/v1/categories'
    },
    documentation: 'https://docs.focusflow.app'
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Initialize server with validation checks
async function startServer() {
  try {
    console.log('🔧 Starting FocusFlow API server...');
    
    // Test database connection before starting server
    await testDatabaseConnection();
    
    // Start the server
    app.listen(PORT, () => {
      console.log('✅ FocusFlow API server started successfully!');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api/v1`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🔒 CORS origin: ${env.CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('🛑 Server startup aborted');
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;