/**
 * ResetPassword.jsx
 * -----------------
 * Mounted at /reset-password?token=<raw>
 * Submits to POST /api/auth/reset-password/:token with the new password.
 * Token is taken from the query-string, never stored in state beyond the call.
 */
import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const [newPassword, setNewPassword]     = useState('');
  const [confirmPwd, setConfirmPwd]       = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [message, setMessage]             = useState('');
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);

  const token = searchParams.get('token');

  // Missing token in URL
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo" style={{ color: '#ef4444' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1 className="auth-title">Invalid link</h1>
            <p className="auth-subtitle">This reset link is missing a token.</p>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Please use the link from your password-reset email or request a new one.
          </p>
          <Link to="/forgot-password" className="btn-primary auth-submit-btn" style={{ display: 'block', textAlign: 'center' }}>
            Request new reset link
          </Link>
          <div className="auth-switch" style={{ marginTop: '1rem' }}>
            <Link to="/login">← Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPwd) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/reset-password/${encodeURIComponent(token)}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage(data.message || 'Password reset successful! Redirecting to sign in…');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Password reset failed. Please try again.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo" style={{ color: '#22c55e' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1 className="auth-title">Password updated!</h1>
            <p className="auth-subtitle">You can now sign in with your new password.</p>
          </div>
          <div className="auth-alert auth-alert--success" role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{message}</span>
          </div>
          <div className="auth-switch" style={{ marginTop: '1.5rem' }}>
            <Link to="/login">Go to sign in →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
            </svg>
          </div>
          <h1 className="auth-title">Set new password</h1>
          <p className="auth-subtitle">Choose a strong password for your account</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>
              {error}
              {error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid') ? (
                <> <Link to="/forgot-password" style={{ color: '#6366f1', marginLeft: 4 }}>Request a new link →</Link></>
              ) : null}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reset-new-password">New password</label>
            <div className="password-input-wrapper">
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reset-confirm-password">Confirm new password</label>
            <div className="password-input-wrapper">
              <input
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            id="reset-submit"
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading && <span className="btn-spinner" />}
            {loading ? 'Saving…' : 'Reset password'}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: '1rem' }}>
          <Link to="/login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
