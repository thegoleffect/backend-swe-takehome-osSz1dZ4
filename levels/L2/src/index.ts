import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { gameRoutes } from './routes/games';
import { playerRoutes } from './routes/players';
import { leaderboardRoutes } from './routes/leaderboard';
import { errorHandler } from './middleware/errorHandler';
import { validationMiddleware } from './middleware/validation';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize metrics if enabled

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// TODO: Add compression middleware (compression)
// Example: app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/games', gameRoutes);
app.use('/players', playerRoutes);
app.use('/leaderboard', leaderboardRoutes);

// API documentation endpoint (Swagger/OpenAPI)

// Metrics endpoint

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// TODO: Implement graceful shutdown logic
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  // TODO: Close database connections
  // TODO: Wait for ongoing requests to complete
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  // TODO: Close database connections
  // TODO: Wait for ongoing requests to complete
  process.exit(0);
});

export default app;
