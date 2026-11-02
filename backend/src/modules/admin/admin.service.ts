import { prisma } from '../../db/client.js';
import { AppError } from '../../middleware/error.middleware.js';
import { InstitutionStatus } from '@prisma/client';

export class AdminService {
  async listInstitutions(status?: string) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status as InstitutionStatus;
    }

    const institutions = await prisma.institution.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            designation: true,
            createdAt: true,
          },
        },
        _count: {
          select: { certificates: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return institutions.map((inst) => ({
      id: inst.id,
      name: inst.name,
      code: inst.code,
      accreditationId: inst.accreditationId,
      contactEmail: inst.contactEmail,
      phone: inst.phone,
      website: inst.website,
      address: inst.address,
      city: inst.city,
      state: inst.state,
      country: inst.country,
      defaultSignatoryName: inst.defaultSignatoryName,
      defaultSignatoryTitle: inst.defaultSignatoryTitle,
      status: inst.status,
      rejectionReason: inst.rejectionReason,
      appliedAt: inst.appliedAt.toISOString(),
      certificatesCount: inst._count.certificates,
      administrators: inst.users,
    }));
  }

  async updateInstitutionStatus(
    id: string,
    status: InstitutionStatus,
    reason?: string
  ) {
    const inst = await prisma.institution.findUnique({ where: { id } });
    if (!inst) {
      throw new AppError(`Institution "${id}" not found.`, 404, 'NOT_FOUND');
    }

    const updated = await prisma.institution.update({
      where: { id },
      data: {
        status,
        rejectionReason: reason || null,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      status: updated.status,
      rejectionReason: updated.rejectionReason,
    };
  }

  async listUsers() {
    const users = await prisma.user.findMany({
      include: { institution: { select: { name: true, code: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      designation: u.designation,
      accountStatus: u.accountStatus,
      institutionId: u.institutionId,
      institutionName: u.institution?.name,
      institutionStatus: u.institution?.status,
      createdAt: u.createdAt.toISOString(),
    }));
  }
}

export const adminService = new AdminService();
