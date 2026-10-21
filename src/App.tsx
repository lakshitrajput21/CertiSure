import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CertificateProvider } from './context/CertificateContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CertificateProvider>
          <AppRoutes />
        </CertificateProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
