# CertiSure — Digital Document Verification & Certificate Management System

> **A College Software Engineering Project**  
> **Punjab Engineering College (Deemed to be University), Chandigarh**

---

### Project Authors
- **Lakshit Rajput** — SID: `24106061`
- **Agampal Singh** — SID: `24106036`

---

## 1. Project Overview

**CertiSure** is an enterprise-grade digital credential lifecycle and verification system designed for academic universities and accreditation bodies. The platform allows institutions to issue digital certificates with cryptographic fingerprints, manage credential statuses (active, expired, revoked), and enables anyone to instantly inspect credential validity via direct search or QR code lookup.

This repository contains the complete **Phase 1 Frontend Architecture**, structured with a clean service layer, centralized mock data store, reactive context state management, and high-fidelity institutional aesthetics.

---

## 2. Technology Stack

- **Core Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Enterprise design system: clean surfaces, deep navy `#0B192C`, crisp blue accents `#2563EB`)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Analytics & Visualizations**: Recharts (Issuance area trends, status distribution donuts)
- **QR Code Engine**: `qrcode.react` (Level H high-density vector QR generation)
- **PDF Generation**: `jspdf` (Client-side vector demonstration certificate generation)

---

## 3. Application Structure & Pages

The application is structured into 12 dedicated pages:

| # | Page Name | Route | Description & Features |
|---|---|---|---|
| **1** | **Public Landing Page** | `/` | Hero section, hero verification search, 3-step lifecycle explanation, enterprise feature highlights, quick-test sample chips, academic footer credits. |
| **2** | **Public Verification Page** | `/verify` & `/verify/:id` | Search input, preset test buttons, loading state, outcome banner (`VALID`, `REVOKED`, `EXPIRED`, `INTEGRITY_FAILED`, `NOT_FOUND`), metadata breakdown, visual specimen view. |
| **3** | **Login Page** | `/login` | Email/password fields, show/hide password toggle, remember me, validation, and **1-click quick-login demo role personas**. |
| **4** | **Institution Dashboard** | `/institution/dashboard` | 4 KPI stat cards, monthly issuance trend chart, status distribution donut, recent issuances table, real-time verification activity stream. |
| **5** | **Certificate Management** | `/institution/certificates` | Searchable table, status filters (`ALL`, `VALID`, `REVOKED`, `EXPIRED`), column sorting, pagination, quick actions, revocation dialog. |
| **6** | **Issue Certificate Page** | `/institution/issue` | Validated multi-field form (candidate, degree, honors, dates), real-time interactive certificate preview, mock ID generation, immediate registry update. |
| **7** | **Certificate Details Page** | `/institution/certificates/:id` | Full visual certificate specimen, machine-readable metadata, cryptographic hash inspection, complete audit timeline, and revocation action. |
| **8** | **Holder Dashboard** | `/holder/dashboard` | Candidate credential locker, filtered to candidate credentials, KPI summary, card grid, QR code modal, copy link, and specimen download. |
| **9** | **Holder Certificate Details** | `/holder/certificates/:id` | Focused candidate view with shareable QR code, official verification link copy, and audit trail. |
| **10** | **Verification History** | `/institution/verifications` & `/verifications` | Live audit telemetry table recording all verification lookups performed in the session with method (`QR_CODE`, `DIRECT_SEARCH`, `URL_LOOKUP`), timestamp, location, and outcome. |
| **11** | **Institution Settings** | `/institution/settings` | Editable institutional profile (PEC name, accreditation ID, contact email, campus address, default signatories) persisted in local storage. |
| **12** | **Not Found (404) Page** | `*` | Clean, polite 404 handler with quick navigation actions. |

---

## 4. Demo Roles & Quick Switcher

CertiSure features a top **Prototype Banner** with a 1-click persona switcher:

1. **Institution Administrator**:
   - Persona: *Dr. Rajiv Sharma (Controller of Examinations & Registry Admin)*
   - Email: `admin@pec.edu.in`
   - Permissions: Full dashboard metrics, certificate issuance, certificate revocation, institution profile settings.
2. **Certificate Holder**:
   - Persona: *Lakshit Rajput (Student / Graduate SID: 24106061)*
   - Email: `lakshit.rajput@pec.edu.in`
   - Permissions: Candidate credential locker, view personal conferred certificates, copy verification URLs, download PDFs.
3. **Public Verifier / Screener**:
   - Persona: *Sarah Jenkins (TalentCheck Global)*
   - Email: `verifier@globaltalent.org`
   - Permissions: Public verification portal, instant status inspection.

*(Passwords in demo mode are not stored or validated on a backend).*

---

## 5. Sample Credentials for Evaluation

You can test every supported verification state with the pre-populated credentials:

| Certificate ID | Status | Candidate | Credential Conferred |
|---|---|---|---|
| `CS-2024-88491` | **VALID** | Lakshit Rajput | B.Tech in Computer Science & Engineering (Distinction) |
| `CS-2024-88492` | **VALID** | Agampal Singh | B.Tech in Computer Science & Engineering (Honors) |
| `CS-2024-77120` | **VALID** | Priya Verma | M.Tech in Information Security (Gold Medalist) |
| `CS-2024-65219` | **VALID** | Kabir Mehta | Executive Certificate in Distributed Systems |
| `CS-2023-41092` | **REVOKED** | Rohan Batra | Diploma in Industrial Computing (Revoked per Senate inquiry) |
| `CS-2022-10482` | **EXPIRED** | Ananya Sen | Certified Information Systems Auditor (Expired 2023-12-31) |
| `CS-2024-99999` | **INTEGRITY_FAILED** | Vikramaditya Rao | Fellowship (Simulated Tampered Hash Signature) |
| `CS-0000-00000` | **NOT_FOUND** | *Unknown* | Non-existent record fallback |

---

## 6. Installation & Running Instructions

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
```bash
# Navigate to workspace
cd d:/CertiSure

# Install dependencies
npm install
```

### Run Locally (Development Server)
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your web browser.

### Production Build
```bash
npm run build
```
Validates full TypeScript compliance (`tsc`) and compiles optimized production bundles in `dist/`.

### Preview Production Build
```bash
npm run preview
```

---

## 7. Architecture & Future Backend Integration

All mock data operations and API logic are strictly isolated within dedicated services in `src/services/`:
- `certificateService.ts`: CRUD operations, issuance generator, revocation handler, metrics computation.
- `verificationService.ts`: Verification outcome engine, audit logger, telemetry recorder.
- `authService.ts`: Session and role management.
- `institutionService.ts`: Institution profile settings.
- `storageService.ts`: Local storage persistence and state reset.
- `pdfService.ts`: Vector PDF generation with specimen watermarks.

To integrate a real backend API (e.g. Node.js/Express, Python/FastAPI, or Spring Boot), developers simply replace the internal localStorage calls inside `src/services/` with `fetch` or `axios` API calls without altering UI components.

---

## 8. Disclaimer & Academic Context

*This software has been developed as an academic Software Engineering project at Punjab Engineering College (Deemed to be University), Chandigarh by Lakshit Rajput and Agampal Singh. It demonstrates frontend software engineering best practices, role-based interfaces, state persistence, and responsive UI design. Cryptographic signatures, hash checks, and authentication routines in Phase 1 are simulated for demonstration purposes.*
