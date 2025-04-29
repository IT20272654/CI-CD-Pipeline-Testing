import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Logintest';
import Dashboardtest from './pages/Dashboardtest';
import AdminProfile from './pages/AdminProfile';
import AdminUsers from './pages/AdminUsers';
import Companies from './pages/Companies';
import CompanyProfile from './pages/CompanyProfile';
import Dashboard from './pages/Dashboard';
import DoorDetails from './pages/DoorDetails';
import Doors from './pages/Doors';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import QRGenerator from './pages/QRGenerator';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import Users from './pages/Users';
import LandingPage from './pages/LandingPage';
import CompanyRequest from './pages/CompanyRequest';
import AuditLogs from './pages/AuditLogsPage';
import Payment from './pages/Payment';
import Checkout from './pages/payment/Checkout';
import PaymentSuccess from './pages/payment/PaymentSucess';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logintest" element={<Login />} />
            <Route path="/notify" element={<PaymentSuccess />} />

            {/* Protected for All Authenticated Users */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboardtest" element={<ProtectedRoute><Dashboardtest /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/logout" element={<ProtectedRoute><LogoutPage /></ProtectedRoute>} />
            <Route path="/dashbord" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Admin Only */}
            <Route path="/users" element={<ProtectedRoute allowedRoles={['Admin']}><Users /></ProtectedRoute>} />
            <Route path="/users/:id" element={<ProtectedRoute allowedRoles={['Admin']}><UserProfile /></ProtectedRoute>} />
            <Route path="/doors" element={<ProtectedRoute allowedRoles={['Admin']}><Doors /></ProtectedRoute>} />
            <Route path="/doors/:id" element={<ProtectedRoute allowedRoles={['Admin']}><DoorDetails /></ProtectedRoute>} />
            <Route path="/create-door" element={<ProtectedRoute allowedRoles={['Admin']}><QRGenerator /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute allowedRoles={['Admin']}><Payment /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute allowedRoles={['Admin']}><Checkout /></ProtectedRoute>} />

            {/* SuperAdmin Only */}
            <Route path="/companies" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><Companies /></ProtectedRoute>} />
            <Route path="/request" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><CompanyRequest /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><AuditLogs /></ProtectedRoute>} />
            <Route path="/companies/:id" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><CompanyProfile /></ProtectedRoute>} />
            <Route path="/admin-users" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin-users/:id" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><AdminProfile /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
