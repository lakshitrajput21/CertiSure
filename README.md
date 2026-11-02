# CertiSure — Digital Document Verification & Certificate Management System

**Software Engineering Project | Punjab Engineering College (Deemed to be University), Chandigarh**

**Developed by:**
- **Lakshit Rajput** — SID: 24106061
- **Agampal Singh** — SID: 24106036

---

## 1. Project Overview

**CertiSure** is a full-stack digital credential management and verification platform designed for educational institutions, universities, and accreditation bodies.

The system enables authorized institutions to issue, manage, verify, and revoke digital certificates through a centralized platform. Each certificate is assigned a unique identification number and a SHA-256 cryptographic fingerprint to support integrity verification.

Certificate holders can access their credentials, while third-party verifiers can check certificate authenticity through a public verification portal or QR code.

The project demonstrates full-stack software engineering principles, including REST API development, relational database design, authentication, role-based authorization, cryptographic hashing, and frontend-backend integration.

## 2. Technology Stack

### Frontend
- **React 18** — Component-based user interface
- **TypeScript** — Type-safe application development
- **Vite** — Development server and production bundling
- **Tailwind CSS** — Responsive styling and design system
- **React Router v6** — Client-side routing
- **Recharts** — Dashboard analytics and visualizations
- **Lucide React** — Interface icons
- **QR Code and PDF Libraries** — Certificate visualization and document generation

### Backend
- **Node.js** — JavaScript runtime
- **Express.js** — REST API framework
- **TypeScript** — Type-safe backend development
- **Prisma ORM** — Database access and migrations
- **PostgreSQL** — Relational database
- **JWT** — Token-based authentication
- **bcrypt** — Password hashing
- **Zod** — Request validation
- **SHA-256** — Certificate integrity fingerprinting

### Development Tools
- Git and GitHub
- Visual Studio Code
- npm
- Prisma CLI

## 3. Core Features

### Authentication and Authorization

CertiSure supports authenticated access with role-based permissions for institutional administrators, certificate holders, and system administration functionality.

- Email and password authentication
- JWT-based API authorization
- Protected routes and role-aware dashboards
- Password hashing
- Authorization checks for restricted certificate operations

### Certificate Issuance and Management

Authorized institution administrators can:

- Issue digital certificates to registered candidates
- Assign credential type, title, description, issue date, and optional expiry date
- Generate unique certificate identification numbers
- Manage certificate records in a centralized registry
- Search, filter, sort, and inspect issued credentials
- Revoke certificates with an administrative reason

### Public Certificate Verification

The public verification portal allows users to check credentials without signing in.

Supported verification outcomes include:

| Status | Meaning |
|---|---|
| `VALID` | Certificate exists and passes applicable validity checks |
| `REVOKED` | Certificate has been administratively revoked |
| `EXPIRED` | Certificate has passed its expiry date |
| `INTEGRITY_FAILED` | Certificate integrity verification has failed |
| `NOT_FOUND` | No matching certificate was found |

### PDF Certificates and QR Codes

- Downloadable certificate documents
- QR codes linking to certificate verification
- Unique certificate identifiers
- Certificate metadata and integrity fingerprints
- Visual indication of certificate status

### Dashboards and Audit Information

**Institution Dashboard**
- Certificate issuance statistics
- Certificate status distribution
- Recent certificate records
- Verification activity
- Certificate management actions

**Certificate Holder Dashboard**
- Personal credential listing
- Certificate details
- Verification links
- Certificate access and download

## 4. System Architecture

CertiSure follows a client-server architecture with a separate frontend, backend, and relational database.

```text
                 User / Web Browser
                         |
                         v
              React + TypeScript
                   Frontend
                         |
                  HTTP REST API
                         |
                         v
              Express + TypeScript
                    Backend
                         |
              Authentication / RBAC
              Validation / Services
                         |
                         v
                    Prisma ORM
                         |
                         v
                    PostgreSQL
```

### Certificate Lifecycle

```text
Institution Administrator
          |
          v
  Issue Certificate
          |
          v
 Validate Input Data
          |
          v
 Generate Certificate ID
          |
          v
 Calculate SHA-256 Hash
          |
          v
 Store in PostgreSQL
          |
          v
 Generate PDF + QR Code
          |
          v
 Public Verification
          |
          v
 VALID / REVOKED / EXPIRED /
 INTEGRITY_FAILED / NOT_FOUND
```

## 5. Project Structure

```text
CertiSure/
|
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- src/
|   |   |-- db/
|   |   |-- middleware/
|   |   |-- modules/
|   |   |   |-- admin/
|   |   |   |-- auth/
|   |   |   |-- certificates/
|   |   |   |-- dashboard/
|   |   |   |-- holder/
|   |   |   |-- institution/
|   |   |   |-- pdf/
|   |   |   `-- verification/
|   |   |-- utils/
|   |   |-- app.ts
|   |   `-- server.ts
|   |-- .env.example
|   |-- package.json
|   `-- prisma.config.ts
|
|-- src/
|   |-- components/
|   |-- context/
|   |-- pages/
|   |-- routes/
|   |-- services/
|   `-- types/
|
|-- README.md
|-- README_LOCAL_SETUP.md
|-- package.json
`-- vite.config.ts
```

## 6. Installation and Local Setup

### Prerequisites

- Node.js 22
- npm
- PostgreSQL 18
- Git

Create a PostgreSQL database named:

```sql
CREATE DATABASE certisure_db;
```

### Clone the Repository

```bash
git clone https://github.com/lakshitrajput21/CertiSure.git
cd CertiSure
```

### Backend Setup

Open a terminal in the project root:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Configure `backend/.env` with the required environment variables, including:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/certisure_db"
PORT=5000
NODE_ENV=development
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_another_long_random_secret
```

Use your own PostgreSQL credentials and secure, unique JWT secrets. Never commit `.env` to GitHub.

Initialize Prisma and the database:

```powershell
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npm run seed
```

Start the backend:

```powershell
npm run dev
```

Backend API: `http://localhost:5000`

Health endpoint: `http://localhost:5000/api/v1/health`

### Frontend Setup

Open a second terminal in the project root:

```powershell
npm install
npm run dev
```

Frontend application: `http://localhost:5173`

Vite proxies frontend `/api` requests to the local backend.

### Production Build Verification

Frontend:

```powershell
npm run build
```

Backend:

```powershell
cd backend
npm run build
```

For additional configuration and troubleshooting instructions, refer to [README_LOCAL_SETUP.md](README_LOCAL_SETUP.md).

## 7. Demo Accounts

The development seed script provides sample users for local evaluation.

| Role | Email |
|---|---|
| Institution Administrator | `admin@pec.edu.in` |
| System Administrator | `superadmin@certisure.edu.in` |
| Certificate Holder | `lakshit.rajput@pec.edu.in` |

**Development-only password:** `DemoPassword123!`

These credentials are intended strictly for the local demonstration database and must not be used in production.

## 8. Sample Certificate Verification

The seeded database contains example certificates for testing different verification scenarios.

| Certificate ID | Expected Status |
|---|---|
| `CS-2024-88491` | VALID |
| `CS-2024-88492` | VALID |
| `CS-2023-41092` | REVOKED |
| `CS-2022-10482` | EXPIRED |
| `CS-2024-99999` | INTEGRITY_FAILED |
| `CS-0000-00000` | NOT_FOUND |

Open the public verification page:

`http://localhost:5173/verify`

Enter a certificate ID or use the available demo verification options.

## 9. Testing and Verification

The following workflows have been exercised in the local development environment:

- Frontend TypeScript compilation and production build
- Backend TypeScript compilation
- PostgreSQL migrations and database seeding
- Institution administrator login
- Institution dashboard data retrieval
- Certificate issuance with and without an expiry date
- Certificate registry updates
- PDF generation and download
- QR code generation
- Certificate revocation
- Public verification across the supplied demo status scenarios

These tests demonstrate the core application workflows. They do not constitute comprehensive automated, security, performance, or production deployment testing.

## 10. Security Considerations and Limitations

- Passwords are hashed rather than stored in plaintext.
- Restricted API operations use authentication and authorization checks.
- Certificate integrity is checked using SHA-256 fingerprints.
- Certificate revocation and expiry are reflected in verification results.
- Sensitive environment variables are stored in local `.env` files excluded from version control.
- Public verification exposes credential metadata rather than unrestricted private PDF access.

**Important limitations:**

- SHA-256 fingerprints stored alongside records are not equivalent to independent digital signatures, blockchain verification, or third-party attestation.
- The project is configured for local academic demonstration rather than a hardened production environment.
- Production deployment would require HTTPS, secure secret management, session hardening, operational monitoring, and further security testing.

## 11. Academic Context and Contributions

CertiSure was developed as a Software Engineering project at **Punjab Engineering College (Deemed to be University), Chandigarh**.

**Lakshit Rajput**
- Frontend architecture and development
- React component design
- User interface and responsive layouts
- Dashboard and verification interface development

**Agampal Singh**
- Backend architecture and REST API development
- PostgreSQL database and Prisma integration
- Authentication and authorization integration
- Certificate issuance, verification, revocation, and PDF/QR workflows
- Frontend-backend integration and functional testing

The project demonstrates the design and implementation of an integrated digital credential management system using modern full-stack development technologies.

---

**CertiSure — Issue. Manage. Verify.**