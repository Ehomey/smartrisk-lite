import React from 'react';

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-3 rounded-full px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isDark
          ? 'bg-slate-800 text-amber-200 focus:ring-offset-slate-900'
          : 'bg-blue-100 text-blue-600 focus:ring-offset-white'
      }`}
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
    >
      <span
        className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors ${
          isDark ? 'bg-slate-700' : 'bg-blue-200'
        }`}
      >
        <span
          className={`absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-transform duration-300 ${
            isDark
              ? 'translate-x-6 bg-slate-900 text-amber-200'
              : 'bg-white text-yellow-500'
          }`}
        >
          {isDark ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1zm0 10.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7.5-2a1 1 0 0 1-1 1H18a1 1 0 1 1 0-2h1.5a1 1 0 0 1 1 1zM7 14a1 1 0 1 1 0-2H5.5a1 1 0 1 1 0-2H7a1 1 0 0 1 0 2zm9.66-4.66a1 1 0 0 1 0-1.42l1.06-1.06a1 1 0 1 1 1.42 1.42l-1.06 1.06a1 1 0 0 1-1.42 0zm-9.32 6.32a1 1 0 0 1 0-1.42l1.06-1.06a1 1 0 1 1 1.42 1.42L8.76 14.66a1 1 0 0 1-1.42 0zm10.38 0a1 1 0 0 1-1.42 0l-1.06-1.06a1 1 0 0 1 1.42-1.42l1.06 1.06a1 1 0 0 1 0 1.42zM8.76 6.34a1 1 0 0 1-1.42 0L6.28 5.28a1 1 0 0 1 1.42-1.42L8.76 4.9a1 1 0 0 1 0 1.42z" />
            </svg>
          )}
        </span>
      </span>
      <div className="text-left">
        <p className="text-xs font-semibold uppercase tracking-widest">
          {isDark ? 'Dark' : 'Light'} Mode
        </p>
        <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
          {isDark ? 'Rest your eyes' : 'Boost the glow'}
        </p>
      </div>
    </button>
  );
}

export default ThemeToggle;
