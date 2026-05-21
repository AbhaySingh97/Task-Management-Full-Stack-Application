import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import { errorHandler, AppError } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

if (process.argv.includes('--help')) {
  console.log('TaskFlow Backend API Server loaded successfully.');
  process.exit(0);
}

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Security Middlewares
app.use(helmet()); // Secure HTTP headers

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Standard Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Body limit
// app.use(mongoSanitize()); // Prevent NoSQL injections (Disabled due to Express 5 compatibility issue)
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.set('io', io);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/comments', commentRoutes);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

// Socket.io
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined personal room`);
  });

  socket.on('joinWorkspace', (workspaceId) => {
    socket.join(`workspace_${workspaceId}`);
    logger.info(`User joined workspace ${workspaceId}`);
  });

  socket.on('viewingTask', ({ taskId, userId, username }) => {
    socket.to(`task_${taskId}`).emit('userViewing', { userId, username });
    socket.join(`task_${taskId}`);
  });

  socket.on('leavingTask', ({ taskId, userId }) => {
    socket.leave(`task_${taskId}`);
    socket.to(`task_${taskId}`).emit('userLeft', { userId });
  });

  socket.on('typingTask', ({ taskId, userId, username }) => {
    socket.to(`task_${taskId}`).emit('userTyping', { userId, username });
  });

  socket.on('stoppedTypingTask', ({ taskId, userId }) => {
    socket.to(`task_${taskId}`).emit('userStoppedTyping', { userId });
  });
});

const PORT = process.env.PORT || 5000;
const server = httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});
