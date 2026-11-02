import { prisma } from '../../db/client.js';
import { AppError } from '../../middleware/error.middleware.js';
import { AuthenticatedUser } from '../../middleware/auth.middleware.js';

export class InstitutionService {
  async getProfile(institutionId?: string | null) {
    const id = institutionId || 'inst-pec-chd'; // Fallback to primary institution
    const institution = await prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      throw new AppError('Institution profile not found.', 404, 'INSTITUTION_NOT_FOUND');
    }

    return {
      id: institution.id,
      name: institution.name,
      code: institution.code,
      accreditationId: institution.accreditationId,
      contactEmail: institution.contactEmail,
      phone: institution.phone,
      website: institution.website,
      address: institution.address,
      city: institution.city,
      state: institution.state,
      country: institution.country,
      defaultSignatoryName: institution.defaultSignatoryName,
      defaultSignatoryTitle: institution.defaultSignatoryTitle,
      establishedYear: institution.establishedYear,
      verificationBadgeText: institution.verificationBadgeText,
      status: institution.status,
      logoUrl: institution.logoUrl || undefined,
    };
  }

  async updateProfile(data: any, user: AuthenticatedUser) {
    const id = user.institutionId || data.id || 'inst-pec-chd';

    const updated = await prisma.institution.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        code: data.code ? data.code.trim().toUpperCase() : undefined,
        accreditationId: data.accreditationId ? data.accreditationId.trim() : undefined,
        contactEmail: data.contactEmail ? data.contactEmail.trim().toLowerCase() : undefined,
        phone: data.phone ? data.phone.trim() : undefined,
        website: data.website ? data.website.trim() : undefined,
        address: data.address ? data.address.trim() : undefined,
        city: data.city ? data.city.trim() : undefined,
        state: data.state ? data.state.trim() : undefined,
        country: data.country ? data.country.trim() : undefined,
        defaultSignatoryName: data.defaultSignatoryName ? data.defaultSignatoryName.trim() : undefined,
        defaultSignatoryTitle: data.defaultSignatoryTitle ? data.defaultSignatoryTitle.trim() : undefined,
        establishedYear: data.establishedYear ? Number(data.establishedYear) : undefined,
        verificationBadgeText: data.verificationBadgeText ? data.verificationBadgeText.trim() : undefined,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      accreditationId: updated.accreditationId,
      contactEmail: updated.contactEmail,
      phone: updated.phone,
      website: updated.website,
      address: updated.address,
      city: updated.city,
      state: updated.state,
      country: updated.country,
      defaultSignatoryName: updated.defaultSignatoryName,
      defaultSignatoryTitle: updated.defaultSignatoryTitle,
      establishedYear: updated.establishedYear,
      verificationBadgeText: updated.verificationBadgeText,
      status: updated.status,
      logoUrl: updated.logoUrl || undefined,
    };
  }
}

export const institutionService = new InstitutionService();
