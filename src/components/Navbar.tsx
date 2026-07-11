import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  Stethoscope, 
  User, 
  LogOut, 
  Calendar, 
  ShieldAlert, 
  Bell, 
  Compass, 
  Sun, 
  Moon,
  Info,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const Navbar: React.FC<{ darkMode: boolean; toggleDarkMode: () => void }> = ({ darkMode, toggleDarkMode }) => {
  const { user, login, logout, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoBar, setShowDemoBar] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Listen for real-time unread notifications if logged in
  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', user.uid),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadNotifications(snapshot.size);
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });
    return unsubscribe;
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleDemoLogin = async (email: string) => {
    try {
      await login(email, 'password123');
      navigate(email === 'dr.mahesh@clinic.com' ? '/doctor' : email === 'admin@clinic.com' ? '/admin' : '/dashboard');
    } catch (err: any) {
      // If user doesn't exist yet, automatically register them!
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const name = email === 'dr.mahesh@clinic.com' ? 'Dr. Mahesh' : email === 'admin@clinic.com' ? 'Clinic Admin' : 'Sample Patient';
          const role = email === 'dr.mahesh@clinic.com' ? 'doctor' : email === 'admin@clinic.com' ? 'admin' : 'patient';
          await register(email, 'password123', name, role);
          navigate(role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/dashboard');
        } catch (regErr) {
          console.error('Failed to register demo user', regErr);
          alert('Demo login error: Make sure Firebase Auth is set up correctly.');
        }
      } else {
        console.error(err);
      }
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/auth';
    if (user.role === 'doctor') return '/doctor';
    if (user.role === 'admin') return '/admin';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 1. Quick Sandbox Demo Access helper */}
      {showDemoBar && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white py-2 px-4 relative flex flex-col md:flex-row items-center justify-between text-xs gap-2 shadow-inner font-sans">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
            <span className="font-semibold">Reviewer Demo Center:</span>
            <span>One-click logins for easy inspection of different role dashboards!</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => handleDemoLogin('patient@clinic.com')}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded font-medium border border-white/20 transition cursor-pointer"
            >
              Patient Profile
            </button>
            <button 
              onClick={() => handleDemoLogin('dr.mahesh@clinic.com')}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded font-medium border border-white/20 transition cursor-pointer"
            >
              Dr. Mahesh (Doctor)
            </button>
            <button 
              onClick={() => handleDemoLogin('admin@clinic.com')}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded font-medium border border-white/20 transition cursor-pointer"
            >
              Admin Controls
            </button>
            <button 
              onClick={() => setShowDemoBar(false)}
              className="text-white/70 hover:text-white p-1 ml-2"
              title="Hide demo help bar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav className={`w-full border-b backdrop-blur-md transition-all duration-300 ${
        darkMode 
          ? 'bg-slate-950/95 border-slate-900 text-white shadow-md' 
          : 'bg-gradient-to-r from-slate-950/98 via-[#03045e]/95 to-slate-900/98 border-slate-800 text-white shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link id="nav-logo" to="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight text-blue-400 hover:opacity-90 transition-opacity">
              <Stethoscope className="w-6 h-6 stroke-[2.5]" />
              <div className="flex flex-col">
                <span className="leading-tight text-white">Mahesh</span>
                <span className="text-xs font-mono font-medium text-slate-400 -mt-0.5">Dental Clinic</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    id={`nav-link-${link.name.toLowerCase()}`}
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-semibold transition-all duration-200 px-3 py-1.5 rounded-lg ${
                      isActive 
                        ? 'bg-white/10 text-white border border-white/15 shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Right Action Controls */}
            <div className="hidden md:flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                id="btn-darkmode"
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

               {user ? (
                <div className="flex items-center gap-4">
                  {/* Notifications */}
                  <Link 
                    id="nav-bell" 
                    to={getDashboardPath()} 
                    className="relative p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>

                  {/* Dashboard Route */}
                  <Link
                    id="nav-dashboard"
                    to={getDashboardPath()}
                    className="flex items-center gap-1.5 text-sm font-semibold bg-blue-950/50 text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-900/50 transition-colors border border-blue-900/30"
                  >
                    <Compass className="w-4 h-4" />
                    <span>
                      {user.role === 'doctor' ? 'Dr. Dashboard' : user.role === 'admin' ? 'Admin Hub' : 'My Portal'}
                    </span>
                  </Link>

                  {/* Log Out */}
                  <button
                    id="nav-logout"
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    id="nav-signin"
                    to="/auth"
                    className="text-sm font-semibold px-4 py-2 text-slate-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    id="nav-signup"
                    to="/book"
                    className="text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Now</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-full text-slate-300 hover:bg-white/10"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                id="btn-mobile-menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-md hover:bg-white/10 text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 pt-2 pb-4 space-y-2 bg-slate-950/98 transition-colors">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                  location.pathname === link.path
                    ? 'bg-blue-950/60 text-blue-400 border border-blue-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-slate-800 pt-3 mt-3 space-y-2">
              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-blue-400 hover:bg-white/5"
                  >
                    <Compass className="w-5 h-5" />
                    <span>
                      {user.role === 'doctor' ? 'Doctor Dashboard' : user.role === 'admin' ? 'Admin Panel' : 'My Patient Portal'}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-rose-400 hover:bg-white/5 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2">
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 px-4 border border-slate-800 text-slate-300 hover:text-white rounded-md text-sm font-semibold hover:bg-white/5"
                  >
                    Login
                  </Link>
                  <Link
                    to="/book"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700"
                  >
                    Book Appointment
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
