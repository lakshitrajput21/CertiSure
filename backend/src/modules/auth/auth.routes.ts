import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { loginSchema, registerSchema, demoLoginSchema } from './auth.schema.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post('/login', loginLimiter, validate(loginSchema), authController.login);
authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/logout', authenticateToken, authController.logout);
authRouter.get('/me', authenticateToken, authController.getMe);
if (process.env.NODE_ENV !== 'production') {
  authRouter.post('/demo-login', loginLimiter, validate(demoLoginSchema), authController.demoLogin);
}
