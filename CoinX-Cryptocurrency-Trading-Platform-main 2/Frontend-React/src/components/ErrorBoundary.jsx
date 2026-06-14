import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught:', error, errorInfo);
    // In production, you might want to log this to an error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ marginBottom: '1rem', textAlign: 'center', maxWidth: '600px' }}>
            We encountered an unexpected error. Please check the browser console for details and try refreshing the page.
          </p>
          <details style={{ 
            backgroundColor: '#1e293b', 
            padding: '1rem', 
            borderRadius: '8px', 
            maxWidth: '600px',
            overflow: 'auto',
            maxHeight: '300px',
            cursor: 'pointer'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Error Details (for debugging)
            </summary>
            <pre style={{ 
              margin: 0, 
              overflow: 'auto', 
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#06b6d4',
              color: '#0f172a',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
