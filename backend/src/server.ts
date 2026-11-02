import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './db/client.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET)) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required in production.');
  }
  console.log('[Server] Initializing CertiSure Backend API...');
  
  // Connect database
  const connected = await connectDatabase();
  if (!connected) {
    console.warn('[Server] Notice: Database connection could not be established immediately. The server will start in degraded mode.');
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] CertiSure API listening on http://localhost:${PORT}`);
    console.log(`[Server] Health endpoint: http://localhost:${PORT}/api/v1/health`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      await disconnectDatabase();
      console.log('[Server] Graceful shutdown complete. Exiting.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
