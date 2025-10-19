// File: src/app/admin/components/AdminHeader.tsx - Add dark mode toggle
import React, { useState, useEffect } from 'react';
import { FiSave, FiClock, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from 'next-themes';

interface AdminHeaderProps {
  selectedFile: string | null;
  hasChanges: boolean;
  isSaving: boolean;
  message: string;
  lastSaved: string | null;
  onSaveAll: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  selectedFile,
  hasChanges,
  isSaving,
  message,
  lastSaved,
  onSaveAll
}) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // After mounting, we can safely access the theme
  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="h-16 bg-secondary/30 border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onSaveAll}
          disabled={!hasChanges || isSaving}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiSave className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save All'}</span>
        </button>
        {selectedFile && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="font-mono truncate max-w-xs">{selectedFile}</span>
            {hasChanges && (
              <span className="text-yellow-500">• Modified</span>
            )}
            {lastSaved && (
              <span className="text-green-500 flex items-center">
                <FiClock className="h-3 w-3 mr-1" />
                {lastSaved}
              </span>
            )}
          </div>
        )}
        {message && (
          <span className="text-sm text-muted-foreground max-w-xs truncate">
            {message}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Dark Mode Toggle - match main site styling */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors"
          title="Toggle theme"
        >
          {mounted && theme === 'dark' ? (
            <FiSun className="h-5 w-5" />
          ) : (
            <FiMoon className="h-5 w-5" />
          )}
        </button>

        {/* This space is reserved for the logout button from parent component */}
      </div>
    </div>
  );
};

export default AdminHeader;
