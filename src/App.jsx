import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/hooks/useLanguage';
import { ThemeProvider } from '@/hooks/useTheme';

// Public pages
import Landing from '@/pages/public/Landing';
import CustomerJoin from '@/pages/public/CustomerJoin';
import CustomerSuccess from '@/pages/public/CustomerSuccess';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyPage from '@/pages/auth/VerifyPage';

// Merchant pages
import MerchantLayout from '@/pages/merchant/MerchantLayout';
import MerchantDashboard from '@/pages/merchant/MerchantDashboard';
import MerchantClients from '@/pages/merchant/MerchantClients';
import MerchantScanner from '@/pages/merchant/MerchantScanner';
import MerchantTransactions from '@/pages/merchant/MerchantTransactions';
import MerchantOffers from '@/pages/merchant/MerchantOffers';
import MerchantNotifications from '@/pages/merchant/MerchantNotifications';
import MerchantCardDesign from '@/pages/merchant/MerchantCardDesign';
import MerchantPublicPage from '@/pages/merchant/MerchantPublicPage';
import MerchantSettings from '@/pages/merchant/MerchantSettings';

// Admin pages
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminMerchants from '@/pages/admin/AdminMerchants';
import AdminMerchantDetail from '@/pages/admin/AdminMerchantDetail';
import AdminCreateMerchant from '@/pages/admin/AdminCreateMerchant';
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions';
import AdminPassKit from '@/pages/admin/AdminPassKit';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminSettings from '@/pages/admin/AdminSettings';

// Superadmin pages
import SuperadminLayout from '@/pages/superadmin/SuperadminLayout';
import SuperadminDashboard from '@/pages/superadmin/SuperadminDashboard';
import SuperadminAdmins from '@/pages/superadmin/SuperadminAdmins';
import SuperadminRoles from '@/pages/superadmin/SuperadminRoles';
import SuperadminSystemSettings from '@/pages/superadmin/SuperadminSystemSettings';
import SuperadminAuditLogs from '@/pages/superadmin/SuperadminAuditLogs';
import SuperadminFeatureFlags from '@/pages/superadmin/SuperadminFeatureFlags';

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/rejoindre/:merchantSlug" element={<CustomerJoin />} />
      <Route path="/rejoindre/:merchantSlug/succes" element={<CustomerSuccess />} />

      {/* Auth */}
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<SignupPage />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
      <Route path="/verification" element={<VerifyPage />} />

      {/* Merchant */}
      <Route path="/merchant" element={<MerchantLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MerchantDashboard />} />
        <Route path="clients" element={<MerchantClients />} />
        <Route path="scanner" element={<MerchantScanner />} />
        <Route path="transactions" element={<MerchantTransactions />} />
        <Route path="offres" element={<MerchantOffers />} />
        <Route path="notifications" element={<MerchantNotifications />} />
        <Route path="card-design" element={<MerchantCardDesign />} />
        <Route path="public-page" element={<MerchantPublicPage />} />
        <Route path="settings" element={<MerchantSettings />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="merchants" element={<AdminMerchants />} />
        <Route path="merchants/new" element={<AdminCreateMerchant />} />
        <Route path="merchants/:id" element={<AdminMerchantDetail />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="passkit" element={<AdminPassKit />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Superadmin */}
      <Route path="/superadmin" element={<SuperadminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperadminDashboard />} />
        <Route path="admins" element={<SuperadminAdmins />} />
        <Route path="roles" element={<SuperadminRoles />} />
        <Route path="system-settings" element={<SuperadminSystemSettings />} />
        <Route path="audit-logs" element={<SuperadminAuditLogs />} />
        <Route path="feature-flags" element={<SuperadminFeatureFlags />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AppRoutes />
            </Router>
            <SonnerToaster position="top-right" richColors />
            <Toaster />
          </QueryClientProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App