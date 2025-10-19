// File: src/app/admin/page.tsx - Add theme provider
'use client';

import React, { useState, useEffect } from 'react';
import AdminComponent from './AdminComponent';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { ThemeProvider } from 'next-themes';

export default function SecretAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin-authenticated') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Test authentication by making a request to the API
      const response = await fetch(`/api/admin/files?key=${encodeURIComponent(password)}`);

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin-authenticated', 'true');
        sessionStorage.setItem('admin-key', password);
        setPassword(''); // Clear password from state for security
      } else {
        setError('Invalid access key');
      }
    } catch (error) {
      setError(`Authentication failed. Please try again. ${error}`);
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin-authenticated');
    sessionStorage.removeItem('admin-key');
    setPassword('');
  };

  if (isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AdminPageWithAuth onLogout={handleLogout} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Access
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Enter your secret key to access the blog editor
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secret Key
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-slate-700 text-gray-900 dark:text-white pr-12"
                  placeholder="Enter your secret key"
                  required
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-primary/50 focus:outline-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This is a secure area. Access is logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

// Wrapper component that provides authentication context to AdminPage
function AdminPageWithAuth({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="relative h-screen">
      {/* Logout button */}
      <button
        onClick={onLogout}
        className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Logout
      </button>

      <AdminComponent />
    </div>
  );
}
