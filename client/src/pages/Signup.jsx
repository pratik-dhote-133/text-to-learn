import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import { GoogleLogin } from '@react-oauth/google';

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

const Signup = () => {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [googleError, setGoogleError] = useState('');
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // After successful registration, show the "check your email" screen
  const [registered, setRegistered]   = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendMessage, setResendMessage]     = useState('');
  const [resendLoading, setResendLoading]     = useState(false);

  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  // ── Email/password signup ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setGoogleError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Registration succeeded — user must verify email before logging in
        setRegisteredEmail(email);
        setRegistered(true);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend verification email ─────────────────────────────────────────────
  const handleResend = async () => {
    if (resendLoading) return;
    setResendMessage('');
    setResendLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: registeredEmail }),
      });
      const data = await res.json();
      setResendMessage(data.message || 'Verification email sent!');
    } catch {
      setResendMessage('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Google signup ─────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    if (googleLoading) return;
    setGoogleError('');
    setError('');
    setGoogleLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        navigate('/');
      } else {
        setGoogleError(data.message || 'Google Sign-Up failed. Please try again.');
      }
    } catch {
      setGoogleError('A network error occurred. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google Sign-Up was cancelled or failed. Please try again.');
    setGoogleLoading(false);
  };

  // ── "Check your email" screen ─────────────────────────────────────────────
  if (registered) {
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
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-subtitle">One more step to activate your account</p>
          </div>

          <div className="auth-alert auth-alert--success" role="status" style={{ marginBottom: '1.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Account created! We sent a verification link to <strong>{registeredEmail}</strong>.</span>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Click the link in the email to verify your address and activate your account.
            The link expires in <strong style={{ color: '#f1f5f9' }}>24 hours</strong>.
          </p>

          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            Didn't receive it? Check your spam folder, or:
          </p>

          {resendMessage && (
            <div className="auth-alert auth-alert--success" role="status" style={{ marginBottom: '1rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{resendMessage}</span>
            </div>
          )}

          <button
            id="resend-verification"
            className="btn-primary auth-submit-btn"
            onClick={handleResend}
            disabled={resendLoading}
            style={{ marginBottom: '1rem' }}
          >
            {resendLoading && <span className="btn-spinner" />}
            {resendLoading ? 'Sending…' : 'Resend verification email'}
          </button>

          <div className="auth-switch">
            <Link to="/login">← Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal signup form ────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start your learning journey today</p>
        </div>

        {/* Error messages */}
        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}
        {googleError && (
          <div className="auth-alert auth-alert--error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{googleError}</span>
          </div>
        )}

        {/* Google Sign-Up */}
        <div className="google-login-wrapper">
          {googleLoading ? (
            <div className="google-btn google-btn--loading" aria-busy="true">
              <span className="btn-spinner btn-spinner--dark" />
              <span>Signing up with Google…</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              width="360"
              text="signup_with"
              shape="rectangular"
            />
          )}
        </div>

        {/* Divider */}
        <div className="auth-divider">
          <span>or sign up with email</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email address</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            id="signup-submit"
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading && <span className="btn-spinner" />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
