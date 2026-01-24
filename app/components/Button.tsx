import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'social';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  if (variant === 'social') {
    return (
      <button
        className={`px-4 py-3.5 rounded-xl flex items-center justify-center text-xl bg-[#0d1117] border-2 border-[#30363d] text-[#FFFFFF] cursor-pointer transition-all
          hover:border-[#00D9FF] hover:bg-[rgba(0,217,255,0.08)] hover:-translate-y-0.5
          ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={`w-full px-4 py-4 rounded-xl font-semibold text-lg border-none cursor-pointer transition-all mb-8
        bg-gradient-to-br from-[#00D9FF] to-[#7B68EE] text-white shadow-[0_1px_2px_rgba(0,0,0,0.3)]
        relative overflow-hidden shadow-[0_4px_6px_rgba(0,217,255,0.1)]
        before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full 
        before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] before:transition-[left] before:duration-500
        hover:before:left-full hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
