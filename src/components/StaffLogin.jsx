import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';

// Simple hardcoded staff password for offline use.
// Replace with real Firebase auth once credentials are set.
const STAFF_PASSWORD = 'teacher123';
const STAFF_EMAIL = 'teacher';

export default function StaffLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Offline-compatible check — swap with Firebase staffLogin() when ready
    await new Promise(r => setTimeout(r, 600)); // simulate network
    if (email.trim() === STAFF_EMAIL && password === STAFF_PASSWORD) {
      onLogin({ role: 'staff', name: 'המורה' });
    } else {
      setError('שם משתמש או סיסמה שגויים. נסי שוב.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, hsla(270,80%,60%,0.15), hsla(207,90%,61%,0.15))'
    }}>
      <div className="card animate-pop" style={{ maxWidth: '460px', width: '100%', padding: '3rem', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-blue))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Lock size={36} color="white" />
        </div>

        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>כניסת צוות</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
          לחברי הצוות בלבד
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email / username */}
          <div style={{ position: 'relative' }}>
            <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="שם משתמש"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '1rem 3rem 1rem 1rem',
                borderRadius: '16px', border: '2px solid var(--glass-border)',
                fontSize: '1.1rem', outline: 'none', textAlign: 'right',
                background: 'hsla(210,20%,98%,1)', boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {showPw ? <EyeOff size={20} color="var(--text-muted)" /> : <Eye size={20} color="var(--text-muted)" />}
            </button>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="סיסמה"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '1rem 1rem 1rem 3rem',
                borderRadius: '16px', border: '2px solid var(--glass-border)',
                fontSize: '1.1rem', outline: 'none', textAlign: 'right',
                background: 'hsla(210,20%,98%,1)', boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {error && (
            <div style={{ color: 'var(--primary-red)', fontSize: '1rem', fontWeight: 600 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="giant-button"
            style={{
              width: '100%', background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-blue))',
              color: 'white', paddingInline: '2rem', gap: '0.75rem', opacity: loading ? 0.7 : 1
            }}
          >
            <LogIn size={24} />
            {loading ? 'כניסה...' : 'כניסה'}
          </button>
        </form>

        <button
          onClick={onBack}
          style={{ marginTop: '2rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
        >
          ← חזרה לעמוד הבחירה
        </button>
      </div>
    </div>
  );
}
