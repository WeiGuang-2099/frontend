import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function FormInput({ label, error, hint, className = '', ...props }: FormInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
        {label}
        {hint && <span className="text-xs text-[#8b949e] ml-1">{hint}</span>}
      </label>
      <input
        className={`w-full px-4 py-3.5 rounded-xl text-base text-[#FFFFFF] bg-[#0d1117] border-2 border-[#30363d] transition-all outline-none
          placeholder:text-[#8b949e]
          focus:border-[#00D9FF] focus:bg-[#0d1117] focus:shadow-[0_0_0_2px_rgba(0,217,255,0.2)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[#EE5A6F]' : ''}
          ${className}`}
        {...props}
      />
      {error && <div className="text-[#EE5A6F] text-xs mt-1">{error}</div>}
    </div>
  );
}
