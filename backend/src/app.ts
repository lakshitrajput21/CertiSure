import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from './db/client.js';

// Route imports
import { authRouter } from './modules/auth/auth.routes.js';
import { certificateRouter } from './modules/certificates/certificate.routes.js';
import { verificationRouter } from './modules/verification/verification.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { holderRouter } from './modules/holder/holder.routes.js';
import { institutionRouter } from './modules/institution/institution.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';

dotenv.config();

export const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS request blocked by security policy'));
    }
  },
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check Endpoint
app.get('/api/v1/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'CertiSure Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
    },
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/certificates', certificateRouter);
app.use('/api/v1/verify', verificationRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/holder', holderRouter);
app.use('/api/v1/institution', institutionRouter);
app.use('/api/v1/admin', adminRouter);

// Centralized 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested API route does not exist.',
    },
  });
});

// Centralized Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[AppError]', (err as any).code || err.name);
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: (err as any).code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal server error occurred.',
    },
  });
});
