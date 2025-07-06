import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/login/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import LogsPage from '@/pages/logs/LogsPage';
import ProxyRulesPage from '@/pages/proxy-rules/ProxyRulesPage';
import UsersPage from '@/pages/users/UsersPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import UserDashboardPage from '@/pages/dashboard/UserDashboardPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Admin Route Wrapper Component
const AdminRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component - redirects to dashboard if authenticated
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};



const AppRoutes: React.FC = () => {
  const { isAdmin } = useAuth();
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <ErrorBoundary>
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          </ErrorBoundary>
        } 
      />
      
      {/* Protected Routes - Single MainLayout for all authenticated routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MainLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={
          <ErrorBoundary>
            {isAdmin ? <DashboardPage /> : <UserDashboardPage />}
          </ErrorBoundary>
        } />
      </Route>

      {/* Admin-only routes */}
      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <AdminRouteWrapper>
              <ErrorBoundary>
                <MainLayout />
              </ErrorBoundary>
            </AdminRouteWrapper>
          </ProtectedRoute>
        }
      >
        <Route index element={
          <ErrorBoundary>
            <LogsPage />
          </ErrorBoundary>
        } />
      </Route>

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AdminRouteWrapper>
              <ErrorBoundary>
                <MainLayout />
              </ErrorBoundary>
            </AdminRouteWrapper>
          </ProtectedRoute>
        }
      >
        <Route index element={
          <ErrorBoundary>
            <SettingsPage />
          </ErrorBoundary>
        } />
      </Route>

      <Route
        path="/proxy-rules"
        element={
          <ProtectedRoute>
            <AdminRouteWrapper>
              <ErrorBoundary>
                <MainLayout />
              </ErrorBoundary>
            </AdminRouteWrapper>
          </ProtectedRoute>
        }
      >
        <Route index element={
          <ErrorBoundary>
            <ProxyRulesPage />
          </ErrorBoundary>
        } />
      </Route>

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminRouteWrapper>
              <ErrorBoundary>
                <MainLayout />
              </ErrorBoundary>
            </AdminRouteWrapper>
          </ProtectedRoute>
        }
      >
        <Route index element={
          <ErrorBoundary>
            <UsersPage />
          </ErrorBoundary>
        } />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster 
            position="top-right"
            richColors
            closeButton
          />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
