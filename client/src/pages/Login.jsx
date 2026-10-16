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

const Login = () => {
  const [email, setEmail]                       = useState('');
  const [password, setPassword]                 = useState('');
  const [showPassword, setShowPassword]         = useState(false);
  const [error, setError]                       = useState('');
  const [googleError, setGoogleError]           = useState('');
  const [loading, setLoading]                   = useState(false);
  const [googleLoading, setGoogleLoading]       = useState(false);
  // Unverified-email state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail]     = useState('');
  const [resendMessage, setResendMessage]         = useState('');
  const [resendLoading, setResendLoading]         = useState(false);

  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  // ── Email/password login ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setGoogleError('');
    setNeedsVerification(false);
    setResendMessage('');
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        navigate('/');
      } else if (data.requiresVerification) {
        // Blocked — account exists but email not verified
        setNeedsVerification(true);
        setUnverifiedEmail(data.email || email);
        setError(data.message || 'Please verify your email address before signing in.');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
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
        body:    JSON.stringify({ email: unverifiedEmail }),
      });
      const data = await res.json();
      setResendMessage(data.message || 'Verification email sent!');
    } catch {
      setResendMessage('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    if (googleLoading) return;
    setGoogleError('');
    setError('');
    setNeedsVerification(false);
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
        setGoogleError(data.message || 'Google Sign-In failed. Please try again.');
      }
    } catch {
      setGoogleError('A network error occurred. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google Sign-In was cancelled or failed. Please try again.');
    setGoogleLoading(false);
  };

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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue learning</p>
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

        {/* Unverified-email: resend button */}
        {needsVerification && (
          <div className="auth-info-box" style={{ marginBottom: '1rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <div>
              <strong>Verify your email to continue</strong>
              <p style={{ margin: '4px 0 8px', fontSize: '0.88rem' }}>
                A verification link was sent to <strong>{unverifiedEmail}</strong>. Didn't receive it?
              </p>
              {resendMessage && (
                <p style={{ color: '#22c55e', fontSize: '0.85rem', marginBottom: '6px' }}>{resendMessage}</p>
              )}
              <button
                id="resend-from-login"
                className="btn-primary"
                onClick={handleResend}
                disabled={resendLoading}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                {resendLoading && <span className="btn-spinner" style={{ width: 12, height: 12 }} />}
                {resendLoading ? 'Sending…' : 'Resend verification email'}
              </button>
            </div>
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

        {/* Google Sign-In */}
        <div className="google-login-wrapper">
          {googleLoading ? (
            <div className="google-btn google-btn--loading" aria-busy="true">
              <span className="btn-spinner btn-spinner--dark" />
              <span>Signing in with Google…</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              width="360"
              text="continue_with"
              shape="rectangular"
            />
          )}
        </div>

        {/* Divider */}
        <div className="auth-divider">
          <span>or sign in with email</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
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

          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading && <span className="btn-spinner" />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
