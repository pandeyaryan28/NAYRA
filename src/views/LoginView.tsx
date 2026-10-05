import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Sun, Moon, Eye, EyeOff, Lock, Mail, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, continueAsGuest, error, setError, isLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Clear errors when toggling modes
  const handleSwitchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setLocalError(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setLocalError('Please enter your name.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(name, email, password);
      }
    } catch (err: any) {
      // Error is set in AuthContext or thrown
      setLocalError(err?.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setLocalError(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 select-none">
      {/* Top Bar with Brand & Theme Toggle */}
      <header className="h-16 px-6 sm:px-12 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-wider">
            N
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 block">
              NAYRA
            </span>
            <span className="text-[10px] text-zinc-400 block -mt-0.5 tracking-wider uppercase font-mono">
              Autonomous Personal OS
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="h-8 w-8 text-zinc-600 dark:text-zinc-300"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      {/* Main Auth Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Card Header */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {mode === 'signin' ? 'Sign In to Your Workspace' : 'Create Your NAYRA Account'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {mode === 'signin'
                ? 'Authenticate to access your isolated personal database and synchronized services.'
                : 'Set up your dedicated user database with end-to-end cloud sync.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-950">
            <button
              type="button"
              onClick={() => handleSwitchMode('signin')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                mode === 'signin'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('signup')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                mode === 'signup'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message Banner */}
          {activeError && (
            <div className="p-3 rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1 leading-snug">{activeError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                placeholder="Aryan Pandey"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="operator@nayra.internal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 pr-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || isLoading}
              className="w-full mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : mode === 'signin' ? (
                'Sign In to NAYRA'
              ) : (
                'Register & Initialize Workspace'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Or
            </span>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || isLoading}
            className="w-full gap-2.5"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          {/* Guest Mode Link */}
          <div className="text-center pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleGuestAccess}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Explore as Guest (Local Sandbox)</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 px-6 flex items-center justify-center border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 font-mono">
        NAYRA Personal Operating System • Isolated Multi-Tenant Firestore Database
      </footer>
    </div>
  );
};
