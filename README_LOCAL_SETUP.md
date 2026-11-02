# CertiSure — Local setup and verification

This package contains the original React/Vite UI and the Express/Prisma/PostgreSQL backend with API integration. It is **not** a verified production deployment. The frontend and backend must be started against your local PostgreSQL database.

## Requirements

- Node.js 22 and npm
- PostgreSQL 18 running on localhost:5432
- A PostgreSQL database named `certisure_db`

## First-time setup (PowerShell)

From the project root:

```powershell
cd backend
npm install
Copy-Item .env.example .env -ErrorAction SilentlyContinue
```

If `.env` already exists, **do not overwrite it**. Edit `backend/.env` locally and set `DATABASE_URL`, `PORT=5000`, `NODE_ENV=development`, `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. Use unique random JWT secrets; never commit `.env`. If the database password has special URL characters, URL-encode them.

```powershell
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run build
npm run dev
```

**Seed warning:** `npm run seed` inserts/updates demo accounts and demo certificate records. Run it only on the intended local development database. Seeded demo accounts use the development password `DemoPassword123!` and include `admin@pec.edu.in`, `superadmin@certisure.edu.in`, and `lakshit.rajput@pec.edu.in`. Do not use these credentials in production.

In a **second** PowerShell terminal, from project root:

```powershell
npm install
npm run build
npm run dev
```

Frontend: http://localhost:5173
Backend health: http://localhost:5000/api/v1/health
Public verification: http://localhost:5173/verify/CS-2024-88491

Vite proxies `/api` to port 5000. The frontend uses real `/api/v1` requests. Public verification does not require login. Admin and holder actions require login.

## Demo verification IDs

- `CS-2024-88491`: valid
- `CS-2024-88492`: valid
- `CS-2023-41092`: revoked
- `CS-2022-10482`: expired
- `CS-2024-99999`: tampered demo record
- `CS-0000-00000`: intentionally absent

## Important verification checklist

1. `npm run build` in both root and backend should complete with exit code 0.
2. Health endpoint should show `database.status: connected`.
3. Login with a seeded admin and check institution dashboard data.
4. Issue a new certificate, verify it publicly, download its PDF, revoke it, and verify again.
5. Login as holder and confirm other holders' certificates are not shown.
6. Confirm `git check-ignore -v backend/.env` returns an ignore rule, and `git ls-files backend/.env` returns nothing.

## Limitations and security

- The original UI includes development-only demo personas; the backend disables `/auth/demo-login` in production.
- Certificate PDF download requires authentication and authorization; public verification shows certificate metadata, not the private PDF.
- SHA-256 checks protect against accidental or unsanctioned record/file changes relative to hashes stored in the same database; they are **not** independent third-party signatures or blockchain proof.
- Access tokens are kept in browser session storage for this college demonstration. A hardened deployment should use a properly designed refresh/session mechanism and HTTPS.
- No live PostgreSQL/browser test was possible in the environment where this package was prepared. Perform the above local verification before presenting it as fully tested.
