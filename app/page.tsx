export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          Hello World
        </h1>
        <p style={{
          fontSize: '1.5rem',
          color: '#4b5563',
          marginBottom: '2rem'
        }}>
          Welcome to Next.js!
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
          >
            Documentation
          </a>
          <a
            href="/api/hello"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1f2937',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
          >
            Test API
          </a>
        </div>
      </div>
    </div>
  );
}
