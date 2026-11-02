import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../db/client.js';
import { AppError } from '../../middleware/error.middleware.js';
import { LoginInput, RegisterInput } from './auth.schema.js';
import { UserRole } from '@prisma/client';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'certisure-dev-access-secret-minimum-32-characters-needed');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'certisure-dev-refresh-secret-minimum-32-characters-needed');
const ACCESS_EXPIRES = '15m';
const REFRESH_DAYS = 7;

function generateTokens(user: { id: string; email: string; role: UserRole; institutionId?: string | null }) {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

  const rawRefreshToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  return { accessToken, rawRefreshToken, tokenHash };
}

export class AuthService {
  async login(input: LoginInput) {
    const cleanEmail = input.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { institution: true },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (user.accountStatus !== 'ACTIVE') {
      throw new AppError('Your account has been suspended. Please contact administrator.', 403, 'ACCOUNT_SUSPENDED');
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const { accessToken, rawRefreshToken, tokenHash } = generateTokens(user);

    // Save refresh token record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
        institutionName: user.institution?.name,
        institutionStatus: user.institution?.status,
        designation: user.designation,
        isEmailVerified: user.isEmailVerified,
      },
      token: accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async register(input: RegisterInput) {
    const cleanEmail = input.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    let assignedInstitutionId: string | undefined = undefined;

    // Handle Institution Admin Registration (Issuer Application)
    if (input.role === 'INSTITUTION_ADMIN') {
      if (!input.institution) {
        throw new AppError('Institution details are required for institutional applicant registration.', 400, 'MISSING_INSTITUTION_DATA');
      }

      const existingCode = await prisma.institution.findUnique({ where: { code: input.institution.code } });
      if (existingCode) {
        throw new AppError(`Institution with code "${input.institution.code}" already exists.`, 409, 'INSTITUTION_CODE_EXISTS');
      }

      const instId = `inst-${input.institution.code.toLowerCase()}-${Date.now().toString(36)}`;
      const newInst = await prisma.institution.create({
        data: {
          id: instId,
          name: input.institution.name,
          code: input.institution.code,
          accreditationId: input.institution.accreditationId,
          contactEmail: input.institution.contactEmail,
          phone: input.institution.phone,
          website: input.institution.website,
          address: input.institution.address,
          city: input.institution.city,
          state: input.institution.state,
          country: input.institution.country,
          defaultSignatoryName: input.institution.defaultSignatoryName,
          defaultSignatoryTitle: input.institution.defaultSignatoryTitle,
          establishedYear: input.institution.establishedYear,
          status: 'PENDING', // Super Admin must review and approve before issuing (SRS FR-06, FR-07)
        },
      });
      assignedInstitutionId = newInst.id;
    }

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: input.name.trim(),
        role: input.role as UserRole,
        institutionId: assignedInstitutionId,
        designation: input.designation?.trim(),
        isEmailVerified: true, // Auto-verify in development/mock bridge
      },
      include: { institution: true },
    });

    const { accessToken, rawRefreshToken, tokenHash } = generateTokens(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
        institutionName: user.institution?.name,
        institutionStatus: user.institution?.status,
        designation: user.designation,
        isEmailVerified: user.isEmailVerified,
      },
      token: accessToken,
      refreshToken: rawRefreshToken,
      message: input.role === 'INSTITUTION_ADMIN'
        ? 'Account and institution application registered in PENDING status. Awaiting Central Super Admin approval before issuance.'
        : 'Holder account registered successfully.',
    };
  }

  async logout(userId: string, rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { userId, tokenHash },
        data: { isRevoked: true },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    }
    return { success: true, message: 'Logged out successfully.' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { institution: true },
    });

    if (!user) {
      throw new AppError('User profile not found.', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      institutionId: user.institutionId,
      institutionName: user.institution?.name,
      institutionStatus: user.institution?.status,
      designation: user.designation,
      isEmailVerified: user.isEmailVerified,
      avatarUrl: user.avatarUrl,
    };
  }

  async demoLogin(role: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Demo persona login is disabled in production environment.', 403, 'DEMO_DISABLED');
    }

    let targetEmail = 'admin@pec.edu.in';
    if (role === 'SUPER_ADMIN' || role === 'SYSTEM_ADMIN') {
      targetEmail = 'superadmin@certisure.edu.in';
    } else if (role === 'CERTIFICATE_HOLDER') {
      targetEmail = 'lakshit.rajput@pec.edu.in';
    } else if (role === 'PUBLIC_VERIFIER') {
      targetEmail = 'verifier@globaltalent.org';
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { institution: true },
    });

    if (!user) {
      throw new AppError(`Demo account for role ${role} not found. Please run seed script.`, 404, 'DEMO_NOT_FOUND');
    }

    const { accessToken, rawRefreshToken, tokenHash } = generateTokens(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
        institutionName: user.institution?.name,
        institutionStatus: user.institution?.status,
        designation: user.designation,
        isEmailVerified: user.isEmailVerified,
      },
      token: accessToken,
      refreshToken: rawRefreshToken,
    };
  }
}

export const authService = new AuthService();
