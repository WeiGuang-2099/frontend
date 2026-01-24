interface AlertProps {
  type: 'error' | 'success';
  children: React.ReactNode;
}

export default function Alert({ type, children }: AlertProps) {
  const styles = {
    error: 'bg-[rgba(238,90,111,0.1)] border-[rgba(238,90,111,0.2)] text-[#ff6b6b]',
    success: 'bg-[rgba(0,245,160,0.1)] border-[rgba(0,245,160,0.2)] text-[#00F5A0]',
  };

  return (
    <div className={`mb-6 px-4 py-4 rounded-xl text-sm border ${styles[type]}`}>
      {children}
    </div>
  );
}
