import { useState } from 'react';
import { MOCK_USERS } from '../../data/users.js';

function FilmHoles() {
  return (
    <div className="auth-strip">
      {Array.from({ length: 14 }, (_, i) => <div key={i} className="auth-hole" />)}
    </div>
  );
}

export default function AuthScreen({ visible, dispatch }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function switchMode(m) {
    setMode(m);
    setError('');
  }

  function fillDemo() {
    setEmail('demo@streamingbuddies.app');
    setPassword('demo123');
    setError('');
  }

  function handleSubmit() {
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }

    if (mode === 'login') {
      const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) { setError('Invalid email or password'); return; }
      const { password: _, ...safe } = found;
      dispatch({ type: 'LOGIN', user: safe });
    } else {
      if (!username) { setError('Please choose a username'); return; }
      const user = {
        id: 'u' + Date.now(),
        email,
        username: username.toLowerCase(),
        displayName: username,
        avatar: username[0].toUpperCase(),
        avatarColor: '#E84830',
        bio: '',
      };
      dispatch({ type: 'LOGIN', user });
    }
  }

  return (
    <div className={`auth-screen${visible ? ' visible' : ''}`}>
      <FilmHoles />
      <div className="auth-logo-block">
        <div className="auth-logo">
          <span style={{ color: 'var(--red)' }}>STREAMING</span>
          <span style={{ color: 'var(--text)' }}>BUDDIES</span>
        </div>
        <div className="auth-tagline">◈ SOCIAL WATCHLOG ◈</div>
      </div>

      <div className="auth-toggle">
        <button className={`auth-tab${mode === 'login' ? ' active' : ''}`} onClick={() => switchMode('login')}>SIGN IN</button>
        <button className={`auth-tab${mode === 'signup' ? ' active' : ''}`} onClick={() => switchMode('signup')}>CREATE ACCOUNT</button>
      </div>

      <div className="auth-form">
        <div className="auth-label">EMAIL</div>
        <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />

        {mode === 'signup' && (
          <>
            <div className="auth-label">USERNAME</div>
            <input className="auth-input" placeholder="cinefan42" value={username} onChange={e => setUsername(e.target.value)} />
          </>
        )}

        <div className="auth-label">PASSWORD</div>
        <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

        <div className="auth-error">{error}</div>
        <button className="auth-submit" onClick={handleSubmit}>
          {mode === 'login' ? '▶ SIGN IN' : '◈ CREATE ACCOUNT'}
        </button>
      </div>

      {mode === 'login' && (
        <div className="auth-demo">
          <button className="auth-demo-btn" onClick={fillDemo}>USE DEMO ACCOUNT</button>
        </div>
      )}
      <div className="auth-strip" />
    </div>
  );
}
