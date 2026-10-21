/**
 * ForgotPassword.jsx
 * ------------------
 * Two-screen flow:
 *   Screen 1 – Request reset: user submits their email address.
 *               Server sends a token-bearing link if the account exists.
 *   Screen 2 – Set new password: mounted at /reset-password?token=<raw>
 *               User enters their new password; submitted to
 *               POST /api/auth/reset-password/:token
 *
 * This file handles both screens:
 *   /forgot-password          → request screen
 *   /reset-password?token=…   → set-new-password screen
 *
 * The second screen is a separate component (ResetPassword.jsx) wired in App.jsx.
 * This file only handles the first screen.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail]                 = useState('');
  const [message, setMessage]             = useState('');
  const [error, setError]                 = useState('');
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [submitted, setSubmitted]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setMessage('');
    setIsGoogleAccount(false);

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setMessage(data.message || 'If this email is registered, you will receive a password-reset link shortly.');
        if (data.isGoogleAccount) {
          setIsGoogleAccount(true);
        }
      } else {
        setError(data.message || 'Request failed. Please try again.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── After submission: show confirmation ─────────────────────────────────
  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo" style={{ color: '#22c55e' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h1 className="auth-title">Check your inbox</h1>
            <p className="auth-subtitle">
              {isGoogleAccount
                ? 'This account uses Google Sign-In'
                : 'A reset link is on its way'}
            </p>
          </div>

          <div className="auth-alert auth-alert--success" role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{message}</span>
          </div>

          {isGoogleAccount && (
            <div className="auth-info-box" style={{ marginTop: '1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <div>
                <strong>Google account detected</strong>
                <p>Your Text-to-Learn account is linked to Google. We don&apos;t manage your Google password.</p>
                <p>
                  To recover your Google account, visit{' '}
                  <a href="https://accounts.google.com" target="_blank" rel="noreferrer">accounts.google.com</a>.
                  Then use &ldquo;Continue with Google&rdquo; to sign in here.
                </p>
              </div>
            </div>
          )}

          {!isGoogleAccount && (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '1rem' }}>
              The link expires in <strong style={{ color: '#f1f5f9' }}>1 hour</strong> and can only be used once.
              Check your spam folder if you don&apos;t see it.
            </p>
          )}

          <div className="auth-switch" style={{ marginTop: '1.5rem' }}>
            <Link to="/login">← Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Request form ─────────────────────────────────────────────────────────
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
          <h1 className="auth-title">Forgot your password?</h1>
          <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="forgot-email">Email address</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <button
            id="forgot-submit"
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading && <span className="btn-spinner" />}
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: '1rem' }}>
          <Link to="/login">← Back to sign in</Link>
        </div>

        {/* Google account note */}
        <div className="auth-note">
          <p>
            <strong>Using Google Sign-In?</strong> Your password is managed by Google.{' '}
            <a href="https://accounts.google.com" target="_blank" rel="noreferrer">
              Recover your Google account →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
