import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0A1628] py-8">
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[length:50px_50px]" />
      
      {/* Floating Effects */}
      <div className="fixed w-[600px] h-[600px] rounded-full -top-[300px] -right-[300px] bg-[radial-gradient(circle,rgba(0,217,255,0.05)_0%,transparent_70%)] animate-[float_20s_ease-in-out_infinite]" />
      <div className="fixed w-[400px] h-[400px] rounded-full -bottom-[200px] -left-[200px] bg-[radial-gradient(circle,rgba(123,104,238,0.05)_0%,transparent_70%)] animate-[float-reverse_15s_ease-in-out_infinite]" />

      {/* Content Wrapper */}
      <div className="w-full max-w-[480px] px-8 z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-br from-[#00D9FF] to-[#7B68EE] bg-clip-text text-transparent">
            Cosmray
          </h1>
          <p className="text-[#c9d1d9]">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="relative rounded-[20px] p-10 bg-[#1a2332] border-2 border-[#00D9FF]/40 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          
          {/* Card Title */}
          <h2 className="text-[28px] font-semibold text-center mb-8 text-white">
            {title}
          </h2>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
