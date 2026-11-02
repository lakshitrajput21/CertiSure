import { prisma } from '../../db/client.js';
import { CertificateStatus } from '@prisma/client';

export class DashboardService {
  async getStats(institutionId?: string | null) {
    const where: any = institutionId ? { institutionId } : {};
    const now = new Date();

    const [total, revoked, expired, active] = await Promise.all([
      prisma.certificate.count({ where }),
      prisma.certificate.count({
        where: { ...where, status: CertificateStatus.REVOKED },
      }),
      prisma.certificate.count({
        where: {
          ...where,
          status: CertificateStatus.ACTIVE,
          expiryDate: { lt: now },
        },
      }),
      prisma.certificate.count({
        where: {
          ...where,
          status: CertificateStatus.ACTIVE,
          OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
        },
      }),
    ]);

    // Query issuances grouped by month
    const certificates = await prisma.certificate.findMany({
      where,
      select: { issueDate: true },
      orderBy: { issueDate: 'asc' },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const countsByMonth: Record<string, number> = {};

    certificates.forEach((c) => {
      const d = new Date(c.issueDate);
      if (!isNaN(d.getTime())) {
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        countsByMonth[key] = (countsByMonth[key] || 0) + 1;
      }
    });

    // Construct smooth monthly trends curve for last 6 months
    const today = new Date();
    const monthlyTrends: { month: string; issuances: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear().toString().slice(-2)}`;
      monthlyTrends.push({
        month: label,
        issuances: countsByMonth[label] || 0,
      });
    }

    const statusDistribution = [
      { name: 'Active & Valid', value: active, color: '#16A34A' },
      { name: 'Revoked', value: revoked, color: '#DC2626' },
      { name: 'Expired', value: expired, color: '#D97706' },
    ];

    // Recent 5 certificates
    const recentIssuances = await prisma.certificate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { institution: true },
    });

    // Recent 5 verification activities
    const recentVerifications = await prisma.verificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      total,
      active,
      revoked,
      expired,
      monthlyTrends,
      statusDistribution,
      recentIssuances: recentIssuances.map((c) => ({
        id: c.documentId,
        holderName: c.holderName,
        title: c.title,
        issueDate: c.issueDate.toISOString().split('T')[0],
        status: c.status === 'REVOKED' ? 'REVOKED' : c.expiryDate && new Date(c.expiryDate) < now ? 'EXPIRED' : 'VALID',
      })),
      recentVerifications: recentVerifications.map((v) => ({
        id: v.id,
        certificateId: v.searchedId,
        outcome: v.outcome,
        method: v.method,
        timestamp: v.createdAt.toISOString(),
      })),
    };
  }
}

export const dashboardService = new DashboardService();
