import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client.js';
import { AppError } from './error.middleware.js';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  institutionId?: string | null;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId?: string | null;
  institutionName?: string | null;
  isEmailVerified: boolean;
  designation?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'certisure-dev-access-secret-minimum-32-characters-needed');

export async function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : undefined;

  if (!token) {
    return next(new AppError('Authentication required. Missing token.', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as AuthenticatedUserPayload;
    
    // Load fresh user state from database to ensure account is active and role is fresh
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { institution: true },
    });

    if (!user) {
      return next(new AppError('User account not found.', 401, 'USER_NOT_FOUND'));
    }

    if (user.accountStatus !== 'ACTIVE') {
      return next(new AppError('User account is suspended or disabled.', 403, 'ACCOUNT_SUSPENDED'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      institutionId: user.institutionId,
      institutionName: user.institution?.name,
      isEmailVerified: user.isEmailVerified,
      designation: user.designation,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN'));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as AuthenticatedUserPayload;
    prisma.user.findUnique({ where: { id: decoded.userId }, include: { institution: true } })
      .then((user) => {
        if (user && user.accountStatus === 'ACTIVE') {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            institutionId: user.institutionId,
            institutionName: user.institution?.name,
            isEmailVerified: user.isEmailVerified,
            designation: user.designation,
          };
        }
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    // SUPER_ADMIN and SYSTEM_ADMIN have full supervisory access
    if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.SYSTEM_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Required role [${allowedRoles.join(', ')}] not held by caller [${req.user.role}].`,
          403,
          'FORBIDDEN_ROLE'
        )
      );
    }

    next();
  };
}

export async function requireApprovedInstitution(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
  }

  // Super admin can act on any institution
  if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.SYSTEM_ADMIN) {
    return next();
  }

  if (!req.user.institutionId) {
    return next(new AppError('No institution associated with this administrator account.', 403, 'NO_INSTITUTION'));
  }

  const institution = await prisma.institution.findUnique({
    where: { id: req.user.institutionId },
  });

  if (!institution) {
    return next(new AppError('Associated institution does not exist.', 404, 'INSTITUTION_NOT_FOUND'));
  }

  if (institution.status !== 'APPROVED') {
    return next(
      new AppError(
        `Institution "${institution.name}" is currently ${institution.status}. Only APPROVED institutions may issue or manage certificates.`,
        403,
        'INSTITUTION_NOT_APPROVED'
      )
    );
  }

  next();
}
