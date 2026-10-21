import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { VerifyPage } from '../pages/VerifyPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Institution Pages
import { InstitutionDashboardPage } from '../pages/institution/InstitutionDashboardPage';
import { CertificateManagementPage } from '../pages/institution/CertificateManagementPage';
import { IssueCertificatePage } from '../pages/institution/IssueCertificatePage';
import { CertificateDetailsPage } from '../pages/institution/CertificateDetailsPage';
import { VerificationHistoryPage } from '../pages/institution/VerificationHistoryPage';
import { InstitutionSettingsPage } from '../pages/institution/InstitutionSettingsPage';

// Holder Pages
import { HolderDashboardPage } from '../pages/holder/HolderDashboardPage';
import { HolderCertificateDetailsPage } from '../pages/holder/HolderCertificateDetailsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verify/:id" element={<VerifyPage />} />
        <Route path="/verifications" element={<VerificationHistoryPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Institution Dashboard Layout (Protected for Admin) */}
      <Route
        path="/institution"
        element={
          <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/institution/dashboard" replace />} />
        <Route path="dashboard" element={<InstitutionDashboardPage />} />
        <Route path="certificates" element={<CertificateManagementPage />} />
        <Route path="certificates/:id" element={<CertificateDetailsPage />} />
        <Route path="issue" element={<IssueCertificatePage />} />
        <Route path="verifications" element={<VerificationHistoryPage />} />
        <Route path="settings" element={<InstitutionSettingsPage />} />
      </Route>

      {/* Holder Dashboard Layout (Protected for Holder) */}
      <Route
        path="/holder"
        element={
          <ProtectedRoute allowedRoles={['CERTIFICATE_HOLDER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/holder/dashboard" replace />} />
        <Route path="dashboard" element={<HolderDashboardPage />} />
        <Route path="certificates/:id" element={<HolderCertificateDetailsPage />} />
      </Route>

      {/* 404 Not Found Page */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
