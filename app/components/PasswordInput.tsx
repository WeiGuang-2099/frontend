'use client';

import { useState, InputHTMLAttributes } from 'react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export default function PasswordInput({ label, error, className = '', ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-[#c9d1d9] mb-2">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-4 py-3.5 pr-12 rounded-xl text-base text-[#FFFFFF] bg-[#0d1117] border-2 border-[#30363d] transition-all outline-none
            placeholder:text-[#8b949e]
            focus:border-[#00D9FF] focus:bg-[#0d1117] focus:shadow-[0_0_0_2px_rgba(0,217,255,0.2)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[#EE5A6F]' : ''}
            ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#6C7293] hover:text-[#B8BCC8] cursor-pointer transition-colors p-0 flex items-center justify-center"
        >
          {!showPassword ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          )}
        </button>
      </div>
      {error && <div className="text-[#EE5A6F] text-xs mt-1">{error}</div>}
    </div>
  );
}
