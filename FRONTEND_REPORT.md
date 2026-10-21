# CertiSure — Frontend Implementation Report

**Project Title**: CertiSure — Digital Document Verification & Certificate Management System  
**Project Authors**:
- Lakshit Rajput — SID: 24106061
- Agampal Singh — SID: 24106036  
**Institution**: Punjab Engineering College (Deemed to be University), Chandigarh  
**Date**: October 21, 2026  
**Phase**: Phase 1 (Frontend Complete)

---

## 1. Executive Summary

Phase 1 of **CertiSure** has been fully constructed in the workspace folder `d:\CertiSure`. The application implements a complete, enterprise-grade software frontend for digital document verification and institutional certificate lifecycle management. It adheres strictly to the specified architectural guidelines, separation of concerns, institutional UI/UX design direction, accessibility best practices, and project scope.

---

## 2. Implemented Features & Pages

### Complete 12-Page Coverage
1. **Public Landing Page (`/`)**:
   - Hero headline: *"Trust Every Credential."*
   - Interactive certificate verification search form right in the hero banner.
   - Quick preset sample chips to test credentials with 1 click.
   - Three-step workflow diagram: *Issue a Certificate &rarr; Share Securely &rarr; Verify Instantly*.
   - Feature highlights: QR verification, status tracking, revocation support, and integrity checks.
   - Project footer identifying Lakshit Rajput and Agampal Singh at Punjab Engineering College, Chandigarh.
2. **Public Certificate Verification Page (`/verify` & `/verify/:id`)**:
   - Input field accepting certificate ID with search and direct URL parameter binding.
   - Presets toolbar simulating QR code scan outcomes (`VALID`, `REVOKED`, `EXPIRED`, `INTEGRITY_FAILED`, `NOT_FOUND`).
   - Distinct, rich result banners with iconography, timestamps, and contextual alerts.
   - Public metadata table and expandable high-fidelity visual specimen certificate with download options.
   - Clear disclaimers stating verification is a frontend demonstration.
3. **Login Page (`/login`)**:
   - Form fields for email and password with show/hide password toggle.
   - "Remember me" checkbox, forgot password link, form validation, and clear error banners.
   - 1-click Demo Role Personas for **Institution Administrator** (`admin@pec.edu.in`), **Certificate Holder** (`lakshit.rajput@pec.edu.in`), and **Public Verifier** (`verifier@globaltalent.org`).
   - Explicit disclaimer explaining demo authentication is not production auth. No passwords stored in localStorage.
4. **Institution Dashboard (`/institution/dashboard`)**:
   - 4 metric KPI cards: Total Registered, Active & Valid, Revoked, and Expired.
   - Interactive Recharts graphs: Monthly Certificate Issuance Trend (Area chart) and Status Distribution Breakdown (Donut chart).
   - Recent Certificate Issuances table with status badges and detail links.
   - Real-time Verification Activity telemetry stream showing simulated verifications by external screeners.
5. **Certificate Management Page (`/institution/certificates`)**:
   - Full data table displaying Certificate ID, Candidate Name, Credential Title, Issue Date, Expiry Date, Status, and Actions.
   - Real-time search by ID, name, or title.
   - Status filters (`ALL`, `VALID`, `REVOKED`, `EXPIRED`).
   - Column sorting by Issue Date, Certificate ID, and Candidate Name.
   - Pagination controls.
   - Revocation workflow: modal dialog requiring official administrative reason, immediately updating central store and changing subsequent verification status.
6. **Issue Certificate Page (`/institution/issue`)**:
   - Form for Candidate Name, Candidate Email, Credential Title, Type, Issue Date, Expiry Date, Honors/CGPA, Description, and Signatories.
   - Validation ensuring email format, required fields, and non-inverted expiry dates.
   - Auto-generated mock ID (`CS-2024-XXXXX`) and digital fingerprint.
   - **Real-Time Live Certificate Specimen Preview**: updates interactively as the user types.
   - Simulation of issuance saving to central mock store and immediately reflecting in all lists and verification searches.
7. **Certificate Details Page (`/institution/certificates/:id`)**:
   - Visual certificate specimen with ornate gold borders, institutional seal, watermark, and signatures.
   - Machine-readable metadata and SHA-256 fingerprint display.
   - Chronological audit timeline documenting issuance, verification queries, and revocations.
   - Revocation trigger and specimen PDF download button.
8. **Certificate Holder Dashboard (`/holder/dashboard`)**:
   - Welcome banner and candidate KPI summary.
   - Credential locker showing certificates conferred upon the logged-in candidate.
   - Quick QR modal, copy public verification link, and download demo PDF.
9. **Holder Certificate Details Page (`/holder/certificates/:id`)**:
   - Dedicated recipient view with shareable QR code, official URL copy button, and audit timeline.
10. **Verification History Page (`/institution/verifications` & `/verifications`)**:
    - Audit log recording all simulated verification queries executed during the session.
    - Captures timestamp, certificate ID, title, method (`QR_CODE`, `DIRECT_SEARCH`, `URL_LOOKUP`), simulated location, and outcome.
    - Filterable by outcome and searchable by ID/title.
11. **Institution Settings Page (`/institution/settings`)**:
    - Editable fields for institution name, code, accreditation ID, contact email, phone, website, campus address, and default signatories.
    - Saves changes to persistent mock storage and updates future issuances.
    - "Reset Default Settings" button.
12. **Not Found (404) Page (`*`)**:
    - Polished error screen with direct navigation back to Home and Verification portals.

---

## 3. Directory & File Organization

```
d:/CertiSure/
├── index.html                   # HTML entry point with Inter & Merriweather typography
├── package.json                 # React 18, Vite, TypeScript, Tailwind, Recharts, Lucide, jsPDF
├── tailwind.config.js           # Institutional enterprise color palette (Navy, Slate, Emerald, Rose)
├── tsconfig.json                # Strict TypeScript configuration
├── vite.config.ts               # Vite configuration with path aliases
├── src/
│   ├── types/
│   │   ├── certificate.ts       # Certificate, CertificateStatus, AuditEvent interfaces
│   │   ├── user.ts              # User, UserRole, AuthState interfaces
│   │   ├── verification.ts      # VerificationLog, VerificationResult interfaces
│   │   └── institution.ts       # InstitutionProfile interface
│   ├── data/
│   │   ├── mockCertificates.ts  # Pre-populated samples (VALID, REVOKED, EXPIRED, TAMPERED)
│   │   ├── mockUsers.ts         # Demo personas (Admin, Holder, Verifier)
│   │   ├── mockVerifications.ts # Initial audit telemetry logs
│   │   └── mockInstitution.ts   # Punjab Engineering College initial institutional profile
│   ├── services/
│   │   ├── storageService.ts    # Safe localStorage wrapper with memory fallback
│   │   ├── certificateService.ts# CRUD, issuance, revocation, and metrics logic
│   │   ├── verificationService.ts # Status calculation and telemetry recorder
│   │   ├── authService.ts       # Demo role authentication routines
│   │   ├── institutionService.ts# Profile retrieval and updates
│   │   └── pdfService.ts        # jsPDF vector certificate generation with specimen notice
│   ├── context/
│   │   ├── AuthContext.tsx      # User authentication and demo persona switching
│   │   └── CertificateContext.tsx # Centralized certificate state, toasts, and triggers
│   ├── utils/
│   │   ├── statusConfig.ts      # Centralized colors, badges, banners, and icons for statuses
│   │   ├── dateUtils.ts         # Formatting and past-date calculations
│   │   └── idGenerator.ts       # Certificate ID and SHA-256 fingerprint simulator
│   ├── components/
│   │   ├── ui/                  # Reusable Badge, Button, Card, Input, Select, Modal, Toast
│   │   ├── layout/              # Navbar, Footer, Sidebar, PublicLayout, DashboardLayout
│   │   ├── certificates/        # CertificateView, QRCodeDisplay, VerificationBanner, AuditTimeline, RevokeModal
│   │   └── dashboard/           # StatCard, IssuanceChart, StatusPieChart, Recent tables
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── VerifyPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── institution/         # Dashboard, Management, Issue, Details, Verifications, Settings
│   │   └── holder/              # Holder Dashboard, Holder Certificate Details
│   ├── routes/
│   │   ├── AppRoutes.tsx        # React Router hierarchy
│   │   └── ProtectedRoute.tsx   # Role check with demo role-switch helper
│   ├── index.css                # Tailwind directives and print stylesheets
│   ├── App.tsx                  # App root with providers
│   └── main.tsx                 # React DOM mount point
```

---

## 4. Commands Executed & Verification Results

| Command | Working Directory | Result | Notes |
|---|---|---|---|
| `npm.cmd install` | `d:\CertiSure` | **Passed (Exit code 0)** | Installed 197 packages (React, Vite, Tailwind, Recharts, Lucide, jsPDF, qrcode.react). |
| `npm.cmd run build` | `d:\CertiSure` | **Passed (Exit code 0)** | Strict TypeScript compilation (`tsc`) passed with zero errors; Vite generated production bundle in `dist/`. |
| `npm.cmd run dev` | `d:\CertiSure` | **Running** | Started Vite development server on port 5173. |
| `curl.exe -I http://localhost:5173/` | `d:\CertiSure` | **Passed (200 OK)** | Confirmed dev server is actively serving requests. |

---

## 5. Local URL & How to Test

- **Local Development URL**: `http://localhost:5173/`
- **Key Testing Scenarios**:
  1. **Valid Certificate**: Open `http://localhost:5173/verify/CS-2024-88491` to see Lakshit Rajput's verified B.Tech credential.
  2. **Valid Certificate 2**: Open `http://localhost:5173/verify/CS-2024-88492` to see Agampal Singh's verified B.Tech credential.
  3. **Revoked Certificate**: Open `http://localhost:5173/verify/CS-2023-41092` to inspect the official revocation notice and disciplinary justification.
  4. **Expired Certificate**: Open `http://localhost:5173/verify/CS-2022-10482` to view an expired professional license.
  5. **Integrity Check Failure**: Open `http://localhost:5173/verify/CS-2024-99999` to see a simulated cryptographic checksum tampering alert.
  6. **Issuing a Certificate**: Navigate to `/institution/issue`, fill in candidate information, see the real-time preview, click *Publish & Register Credential*, and verify that it immediately appears in `/institution/certificates` and responds to search on `/verify`.
  7. **Revoking a Certificate**: On `/institution/certificates`, click the Revoke icon on an active certificate, enter a reason, confirm, and verify that subsequent queries on `/verify` reflect the `REVOKED` state.
  8. **Download PDF**: On any certificate view, click *Download Specimen PDF* to save a client-side vector PDF document with the DEMONSTRATION DOCUMENT watermark.

---

## 6. Known Limitations (Phase 1 Scope)

1. **Simulated Backend & Cryptography**: Verification results, digital fingerprints, and audit records are generated and processed client-side via the service layer. No real asymmetric public/private keys or blockchain consensus are utilized in Phase 1.
2. **Mock Authentication**: Role switching and credentials are for evaluation only. Passwords are validated client-side and never saved to persistent storage.
3. **Local Storage Persistence**: Modifying records (new issuances, revocations, profile edits) persists in browser `localStorage`. A *"Reset Samples"* button is available in the top banner to restore the initial database state.

---

## 7. Next Steps for Phase 2 (Backend Integration)

Because all UI components communicate strictly through `src/services/` (`certificateService.ts`, `verificationService.ts`, `authService.ts`, `institutionService.ts`), integrating a real database and backend will require:
1. Replacing internal `storageService` calls inside `src/services/` with asynchronous REST or GraphQL client endpoints (`/api/certificates`, `/api/verify/:id`, etc.).
2. Implementing backend JWT authentication and secure cookie handling.
3. Attaching real cryptographic digital signatures (e.g., RSA-SHA256 or Ed25519) on PDF generation.
