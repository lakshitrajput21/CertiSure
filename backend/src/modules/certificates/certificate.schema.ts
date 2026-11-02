import { z } from 'zod';

export const issueCertificateSchema = z.object({
  body: z
    .object({
      holderName: z.string().trim().min(2, 'Candidate name must be at least 2 characters.'),
      holderEmail: z.string().trim().email('Invalid candidate email address.'),
      title: z.string().trim().min(3, 'Credential title must be at least 3 characters.'),
      type: z.enum([
        'Degree',
        'Diploma',
        'Course Completion',
        'Academic Merit',
        'Professional License',
        'Internship Credential',
        'DEGREE',
        'DIPLOMA',
        'COURSE_COMPLETION',
        'ACADEMIC_MERIT',
        'PROFESSIONAL_LICENSE',
        'INTERNSHIP_CREDENTIAL',
      ]),
      issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format.'),
      expiryDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format.')
        .optional()
        .nullable(),
      description: z.string().trim().min(5, 'Description must be at least 5 characters.'),
      gradeOrScore: z.string().trim().optional(),
      signatoryName: z.string().trim().optional(),
      signatoryTitle: z.string().trim().optional(),
    })
    .refine(
      (data) => {
        if (data.expiryDate && data.issueDate) {
          return new Date(data.expiryDate) > new Date(data.issueDate);
        }
        return true;
      },
      {
        message: 'Expiry date must be strictly after the issue date.',
        path: ['expiryDate'],
      }
    ),
});

export const revokeCertificateSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(5, 'Official administrative revocation reason is required (min 5 characters).'),
  }),
});

export const queryCertificatesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['ALL', 'VALID', 'ACTIVE', 'REVOKED', 'EXPIRED']).optional(),
    type: z.string().optional(),
    sortBy: z.enum(['issueDate', 'documentId', 'holderName', 'title', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }),
});

export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>['body'];
export type RevokeCertificateInput = z.infer<typeof revokeCertificateSchema>['body'];
export type QueryCertificatesInput = z.infer<typeof queryCertificatesSchema>['query'];
