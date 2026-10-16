/**
 * VerifyEmail.jsx
 * ---------------
 * Handles the /verify-email route.
 * On mount it extracts the token from the URL query-string and calls
 * GET /api/auth/verify-email/:token.
 * On success it logs the user in automatically (the API returns a JWT).
 * On failure it shows the error and offers a resend link.
 */
import { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';

const VerifyEmail = () => {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { login }       = useContext(AuthContext);

  const [status, setStatus]             = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage]           = useState('');
  const [resendEmail, setResendEmail]   = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const didRun = useRef(false); // prevent double-fire in React StrictMode

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Verification link is missing a token. Please use the link from your email.');
      return;
    }

    (async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/api/auth/verify-email/${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified! Redirecting…');
          // Log the user in automatically
          if (data.token) {
            login(data);
            setTimeout(() => navigate('/'), 2000);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      } catch {
        setStatus('error');
        setMessage('A network error occurred. Please try again.');
      }
    })();
  }, [searchParams, login, navigate]);

  const handleResend = async () => {
    if (!resendEmail || resendLoading) return;
    setResendMessage('');
    setResendLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      setResendMessage(data.message || 'Verification email sent!');
    } catch {
      setResendMessage('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" style={{ color: status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#6366f1' }}>
            {status === 'verifying' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            )}
            {status === 'success' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
            {status === 'error' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
          </div>
          <h1 className="auth-title">
            {status === 'verifying' && 'Verifying your email…'}
            {status === 'success'   && 'Email verified!'}
            {status === 'error'     && 'Verification failed'}
          </h1>
          <p className="auth-subtitle">
            {status === 'verifying' && 'Please wait a moment.'}
            {status === 'success'   && 'You will be redirected to the app shortly.'}
            {status === 'error'     && 'The link may be expired or already used.'}
          </p>
        </div>

        {status === 'verifying' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
            <span className="btn-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        )}

        {status === 'success' && (
          <div className="auth-alert auth-alert--success" role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{message}</span>
          </div>
        )}

        {status === 'error' && (
          <>
            <div className="auth-alert auth-alert--error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{message}</span>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              Request a new verification email by entering your address below:
            </p>

            <div className="form-group">
              <label htmlFor="verify-resend-email">Email address</label>
              <input
                id="verify-resend-email"
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {resendMessage && (
              <div className="auth-alert auth-alert--success" role="status" style={{ marginBottom: '1rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>{resendMessage}</span>
              </div>
            )}

            <button
              id="resend-verify-btn"
              className="btn-primary auth-submit-btn"
              onClick={handleResend}
              disabled={resendLoading || !resendEmail}
            >
              {resendLoading && <span className="btn-spinner" />}
              {resendLoading ? 'Sending…' : 'Resend verification email'}
            </button>
          </>
        )}

        <div className="auth-switch" style={{ marginTop: '1.5rem' }}>
          <Link to="/login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
