import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0e0f13', color: '#fff', fontFamily: 'monospace', gap: 16, padding: 32, textAlign: 'center' }}>
          <div style={{ color: '#E84830', fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>STREAMINGBUDDIES</div>
          <div style={{ color: '#888', fontSize: 12, letterSpacing: 2 }}>SOMETHING WENT WRONG</div>
          <button
            onClick={() => window.location.href = '/'}
            style={{ marginTop: 8, background: '#E84830', color: '#fff', border: 'none', padding: '10px 24px', fontFamily: 'monospace', fontSize: 11, letterSpacing: 2, cursor: 'pointer' }}
          >
            RELOAD APP
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
