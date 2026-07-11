import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, CheckCircle2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // Toggle Modes
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient');

  // Status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name) {
          setError('Full name is required.');
          setLoading(false);
          return;
        }
        const profile = await register(email, password, name, role);
        setSuccess('Registration completed successfully!');
        setTimeout(() => {
          navigate(profile.role === 'doctor' ? '/doctor' : profile.role === 'admin' ? '/admin' : '/dashboard');
        }, 1500);
      } else {
        const profile = await login(email, password);
        setSuccess(`Welcome back, ${profile.displayName || 'User'}!`);
        setTimeout(() => {
          navigate(profile.role === 'doctor' ? '/doctor' : profile.role === 'admin' ? '/admin' : '/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      const lowerEmail = email.toLowerCase().trim();
      if (!isSignUp) {
        if (lowerEmail === 'shubhuusinha777@gmail.com' && password === 'webdev14') {
          try {
            const profile = await register(email, password, 'Clinical Admin', 'admin');
            setSuccess('Admin account initialized and logged in successfully!');
            setTimeout(() => {
              navigate('/admin');
            }, 1500);
            return;
          } catch (regErr: any) {
            console.error('Auto-registration failed:', regErr);
            if (regErr.code === 'auth/email-already-in-use') {
              setError('Admin email "shubhuusinha777@gmail.com" already exists, but the password provided is incorrect. Please sign in with your previously registered password.');
              return;
            }
          }
        } else if (lowerEmail === 'admin@clinic.com' && password === 'password123') {
          try {
            const profile = await register(email, password, 'Clinic Admin', 'admin');
            setSuccess('Admin account initialized and logged in successfully!');
            setTimeout(() => {
              navigate('/admin');
            }, 1500);
            return;
          } catch (regErr: any) {
            console.error('Auto-registration failed:', regErr);
            if (regErr.code === 'auth/email-already-in-use') {
              setError('Admin email "admin@clinic.com" already exists, but the password provided is incorrect. Please sign in with your registered password.');
              return;
            }
          }
        } else if (lowerEmail === 'dr.mahesh@clinic.com' && password === 'password123') {
          try {
            const profile = await register(email, password, 'Dr. Mahesh', 'doctor');
            setSuccess('Doctor account initialized and logged in successfully!');
            setTimeout(() => {
              navigate('/doctor');
            }, 1500);
            return;
          } catch (regErr: any) {
            console.error('Auto-registration failed:', regErr);
            if (regErr.code === 'auth/email-already-in-use') {
              setError('Doctor email "dr.mahesh@clinic.com" already exists, but the password provided is incorrect. Please sign in with your registered password.');
              return;
            }
          }
        }
      }
      let msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/invalid-credential') {
        msg = 'Invalid credentials. If you are registering a new account, please toggle to Sign Up mode above.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already in use. If you already have an account, please switch to Sign In mode above.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address in the field above first, then click "Forgot Password?".');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('../firebase/config');
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess('A password reset link has been sent to your email address! Please check your inbox.');
    } catch (err: any) {
      console.error('Password reset failed:', err);
      let msg = err.message || 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No registered user was found with this email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 transition-colors duration-300 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            {isSignUp ? 'Create New Account' : 'Welcome to Your Portal'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Sign up to log appointments and track dental charts.' : 'Sign in to access your appointments and medical notes.'}
          </p>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@clinic.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-semibold text-center">{error}</p>
          )}

          {success && (
            <p className="text-xs text-emerald-500 font-semibold text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{success}</span>
            </p>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2">
          <button
            id="auth-toggle-mode"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>

      </div>
    </div>
  );
};
