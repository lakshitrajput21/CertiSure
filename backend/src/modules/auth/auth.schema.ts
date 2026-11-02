import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address format.'),
    password: z.string().min(1, 'Password is required.'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address format.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one digit.'),
    name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
    // Never allow a public user to self-assign SUPER_ADMIN or SYSTEM_ADMIN (SRS Security rule)
    role: z
      .enum(['CERTIFICATE_HOLDER', 'INSTITUTION_ADMIN'], {
        errorMap: () => ({ message: 'Role must be CERTIFICATE_HOLDER or INSTITUTION_ADMIN.' }),
      })
      .default('CERTIFICATE_HOLDER'),
    designation: z.string().trim().optional(),
    // Required if role === 'INSTITUTION_ADMIN' (applicant applying for new institution)
    institution: z
      .object({
        name: z.string().trim().min(3, 'Institution name must be at least 3 characters.'),
        code: z.string().trim().min(2, 'Institution code must be at least 2 characters.').toUpperCase(),
        accreditationId: z.string().trim().min(3, 'Accreditation ID is required.'),
        contactEmail: z.string().trim().email('Invalid contact email.'),
        phone: z.string().trim().min(7, 'Phone number is required.'),
        website: z.string().trim().url('Invalid website URL.'),
        address: z.string().trim().min(5, 'Campus address is required.'),
        city: z.string().trim().min(2, 'City is required.'),
        state: z.string().trim().min(2, 'State is required.'),
        country: z.string().trim().default('India'),
        defaultSignatoryName: z.string().trim().min(2, 'Default signatory name is required.'),
        defaultSignatoryTitle: z.string().trim().min(2, 'Default signatory title is required.'),
        establishedYear: z.number().int().min(1800).max(new Date().getFullYear()),
      })
      .optional(),
  }),
});

export const demoLoginSchema = z.object({
  body: z.object({
    role: z.enum(['SUPER_ADMIN', 'SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'CERTIFICATE_HOLDER', 'PUBLIC_VERIFIER']),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type DemoLoginInput = z.infer<typeof demoLoginSchema>['body'];
