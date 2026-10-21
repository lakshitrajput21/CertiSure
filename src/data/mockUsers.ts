import { User } from '../types/user';

export const DEMO_USERS: User[] = [
  {
    id: 'user-admin-1',
    email: 'admin@pec.edu.in',
    name: 'Dr. Rajiv Sharma',
    role: 'INSTITUTION_ADMIN',
    institutionId: 'inst-pec-chd',
    institutionName: 'Punjab Engineering College',
    designation: 'Controller of Examinations & Registry Admin',
  },
  {
    id: 'user-holder-1',
    email: 'lakshit.rajput@pec.edu.in',
    name: 'Lakshit Rajput',
    role: 'CERTIFICATE_HOLDER',
    holderEmail: 'lakshit.rajput@pec.edu.in',
    designation: 'Student / Graduate (SID: 24106061)',
  },
  {
    id: 'user-holder-2',
    email: 'agampal.singh@pec.edu.in',
    name: 'Agampal Singh',
    role: 'CERTIFICATE_HOLDER',
    holderEmail: 'agampal.singh@pec.edu.in',
    designation: 'Student / Graduate (SID: 24106036)',
  },
  {
    id: 'user-verifier-1',
    email: 'verifier@globaltalent.org',
    name: 'Sarah Jenkins',
    role: 'PUBLIC_VERIFIER',
    designation: 'Senior Credentials Evaluator, TalentCheck Global',
  },
];
