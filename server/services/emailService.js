/**
 * emailService.js
 * ---------------
 * Central email-sending utility using Resend (https://resend.com).
 *
 * Design decisions:
 *  - All email logic lives here. Controllers call sendEmail() or the helper
 *    functions below. This keeps controllers small and email logic testable.
 *  - If RESEND_API_KEY is missing, every send attempt returns a structured
 *    failure object instead of throwing — the caller decides whether to block
 *    the user-facing request or continue with a warning.
 *  - We never log the full token or API key, only enough to diagnose issues.
 */

const { Resend } = require('resend');

// Lazily initialised so the server starts even without the key configured.
let resend = null;

function getResendClient() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      return null;
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Text-to-Learn <noreply@text-to-learn.dev>';
const APP_NAME     = 'Text-to-Learn';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Low-level email sender.
 * Returns { ok: true } on success or { ok: false, reason: string } on failure.
 * Never throws — callers always receive a result object.
 *
 * @param {object} opts
 * @param {string}   opts.to      - Recipient email address
 * @param {string}   opts.subject - Email subject line
 * @param {string}   opts.html    - HTML body
 * @param {string}   opts.text    - Plain-text fallback body
 */
async function sendEmail({ to, subject, html, text }) {
  const client = getResendClient();

  if (!client) {
    console.warn('[EMAIL] RESEND_API_KEY is not configured — email not sent to:', to);
    return { ok: false, reason: 'Email provider not configured' };
  }

  try {
    const result = await client.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      text
    });

    // Resend SDK returns { data: { id }, error: null } on success
    if (result.error) {
      console.error('[EMAIL] Resend API error:', result.error.message || result.error);
      return { ok: false, reason: result.error.message || 'Unknown provider error' };
    }

    console.log(`[EMAIL] Sent "${subject}" to ${to} — id: ${result.data?.id}`);
    return { ok: true, id: result.data?.id };
  } catch (err) {
    console.error('[EMAIL] Unexpected error sending email:', err.message);
    return { ok: false, reason: err.message };
  }
}

// ─── Template helpers ────────────────────────────────────────────────────────

/** Shared HTML wrapper used by all email templates */
function wrapHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body  { margin:0; padding:0; background:#0b1020; font-family:Inter,system-ui,sans-serif; color:#f1f5f9; }
    .wrap { max-width:560px; margin:40px auto; background:#111827; border:1px solid rgba(99,102,241,0.15);
            border-radius:16px; overflow:hidden; }
    .hdr  { background:linear-gradient(135deg,#6366f1,#8b5cf6); padding:32px 40px; text-align:center; }
    .hdr h1 { margin:0; font-size:22px; color:#fff; letter-spacing:-0.3px; }
    .hdr p  { margin:6px 0 0; font-size:13px; color:rgba(255,255,255,0.8); }
    .body { padding:36px 40px; }
    .body p { margin:0 0 16px; font-size:15px; color:#94a3b8; line-height:1.7; }
    .body strong { color:#f1f5f9; }
    .btn  { display:inline-block; margin:24px 0 8px; padding:14px 32px;
            background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff !important;
            border-radius:8px; font-size:15px; font-weight:600; text-decoration:none; }
    .note { font-size:12px !important; color:#64748b !important; margin-top:24px !important; }
    .ftr  { padding:20px 40px; border-top:1px solid rgba(99,102,241,0.1);
            text-align:center; font-size:12px; color:#475569; }
    .ftr a { color:#6366f1; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h1>📚 ${APP_NAME}</h1>
      <p>AI-powered personalised learning</p>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="ftr">
      &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br/>
      <a href="${FRONTEND_URL}">text-to-learn.dev</a>
    </div>
  </div>
</body>
</html>`;
}

// ─── High-level send helpers ──────────────────────────────────────────────────

/**
 * Sends a verification email with a one-time link.
 * @param {string} to        - Recipient email
 * @param {string} name      - Recipient display name
 * @param {string} token     - Raw (unhashed) verification token
 */
async function sendVerificationEmail(to, name, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const html = wrapHtml('Verify your email — ' + APP_NAME, `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thanks for signing up for <strong>${APP_NAME}</strong>! Please verify your email address to activate your account and start learning.</p>
    <p>This link expires in <strong>24 hours</strong> and can only be used once.</p>
    <a href="${verifyUrl}" class="btn">Verify Email Address</a>
    <p>Or paste this link into your browser:</p>
    <p style="word-break:break-all;font-size:13px;color:#6366f1;">${verifyUrl}</p>
    <p class="note">
      If you did not create an account on ${APP_NAME}, you can safely ignore this email.
      Your email address will not be used without verification.
    </p>
  `);

  const text = `Hi ${name},\n\nPlease verify your email address to activate your ${APP_NAME} account.\n\nVerification link (expires in 24 hours):\n${verifyUrl}\n\nIf you did not create this account, ignore this email.\n\n— The ${APP_NAME} Team`;

  return sendEmail({ to, subject: `Verify your email — ${APP_NAME}`, html, text });
}

/**
 * Sends a welcome email. Called ONCE after email verification succeeds.
 * @param {string} to   - Recipient email
 * @param {string} name - Recipient display name
 */
async function sendWelcomeEmail(to, name) {
  const loginUrl = `${FRONTEND_URL}/login`;

  const html = wrapHtml('Welcome to ' + APP_NAME, `
    <p>Hi <strong>${name}</strong> 🎉</p>
    <p>Your account is verified and ready to go. Welcome to <strong>${APP_NAME}</strong> — where AI creates a personalised course on any topic you want to learn.</p>
    <p>Here's what you can do:</p>
    <p>
      • <strong>Generate a course</strong> on any topic in seconds<br/>
      • <strong>Work through structured lessons</strong> with interactive content<br/>
      • <strong>Track your progress</strong> and test yourself with quizzes<br/>
      • <strong>Watch curated YouTube videos</strong> alongside each lesson
    </p>
    <a href="${loginUrl}" class="btn">Start Learning →</a>
    <p class="note">
      If you did not create this account, please contact us immediately.
    </p>
  `);

  const text = `Hi ${name},\n\nWelcome to ${APP_NAME}! Your account is verified and ready.\n\nSign in and start learning: ${loginUrl}\n\n— The ${APP_NAME} Team`;

  return sendEmail({ to, subject: `Welcome to ${APP_NAME} 🎉`, html, text });
}

/**
 * Sends a welcome email for new Google sign-ups. Called ONCE on first Google login.
 * @param {string} to   - Recipient email
 * @param {string} name - Recipient display name
 */
async function sendGoogleWelcomeEmail(to, name) {
  const appUrl = `${FRONTEND_URL}/`;

  const html = wrapHtml('Welcome to ' + APP_NAME, `
    <p>Hi <strong>${name}</strong> 🎉</p>
    <p>You've joined <strong>${APP_NAME}</strong> using your Google account. Great choice!</p>
    <p>
      • <strong>Generate a course</strong> on any topic in seconds<br/>
      • <strong>Work through structured lessons</strong> with interactive content<br/>
      • <strong>Track your progress</strong> and test yourself with quizzes<br/>
      • <strong>Watch curated YouTube videos</strong> alongside each lesson
    </p>
    <p>Sign in anytime with "Continue with Google".</p>
    <a href="${appUrl}" class="btn">Go to ${APP_NAME} →</a>
    <p class="note">
      If you did not create this account, please contact us immediately.
    </p>
  `);

  const text = `Hi ${name},\n\nWelcome to ${APP_NAME}! You signed up with Google.\n\nStart learning: ${appUrl}\n\n— The ${APP_NAME} Team`;

  return sendEmail({ to, subject: `Welcome to ${APP_NAME} 🎉`, html, text });
}

/**
 * Sends a secure password-reset email.
 * @param {string} to    - Recipient email
 * @param {string} name  - Recipient display name
 * @param {string} token - Raw (unhashed) reset token
 */
async function sendPasswordResetEmail(to, name, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const html = wrapHtml('Reset your password — ' + APP_NAME, `
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your <strong>${APP_NAME}</strong> account.</p>
    <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong> and can only be used once.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p>Or paste this link into your browser:</p>
    <p style="word-break:break-all;font-size:13px;color:#6366f1;">${resetUrl}</p>
    <p class="note">
      If you did not request a password reset, ignore this email — your password will not change.
      For security, this link expires in 1 hour.
    </p>
  `);

  const text = `Hi ${name},\n\nReset your ${APP_NAME} password using the link below (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.\n\n— The ${APP_NAME} Team`;

  return sendEmail({ to, subject: `Reset your password — ${APP_NAME}`, html, text });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendGoogleWelcomeEmail,
  sendPasswordResetEmail
};
