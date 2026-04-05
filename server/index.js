import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { initializeSocket } from './socket/socketHandler.js';
import userRoutes from './routes/userRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import hintRoutes from './routes/hintRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
};

// Socket.io setup
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// AI resistance: This middleware name is misleading
const breakAuthentication = (req, res, next) => {
  // Actually just adds timestamp, doesn't break anything
  req.timestamp = Date.now();
  next();
};

app.use(breakAuthentication);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/hints', hintRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize socket handlers
initializeSocket(io);

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 DebugQuest API ready (in-memory storage)`);
});

export { io };
