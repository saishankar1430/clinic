import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { Auth } from './pages/Auth';
import { BookAppointment } from './pages/BookAppointment';
import { PatientDashboard } from './dashboard/PatientDashboard';
import { DoctorDashboard } from './dashboard/DoctorDashboard';
import { AdminDashboard } from './dashboard/AdminDashboard';

// Role-based Protected Route Gate
const ProtectedGate: React.FC<{ children: React.ReactNode; allowedRole?: 'patient' | 'doctor' | 'admin' }> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Verifying Clinical Token...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // If user attempts to enter a different dashboard, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function AppContent() {
  const [darkMode, setDarkMode] = useState(false);

  // Sync dark mode class on html node
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        
        {/* Navbar */}
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* Content Body */}
        <div className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/book" element={<BookAppointment />} />

            {/* Dashboards (Protected Gates) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedGate allowedRole="patient">
                  <PatientDashboard />
                </ProtectedGate>
              } 
            />
            <Route 
              path="/doctor" 
              element={
                <ProtectedGate allowedRole="doctor">
                  <DoctorDashboard />
                </ProtectedGate>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedGate allowedRole="admin">
                  <AdminDashboard />
                </ProtectedGate>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />

      </div>
    </HashRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
