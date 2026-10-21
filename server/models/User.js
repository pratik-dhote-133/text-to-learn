/**
 * User.js — Mongoose schema for application users.
 *
 * Fields added in this phase:
 *  - isEmailVerified     : email/password accounts must verify before accessing the app.
 *  - emailVerifyToken    : HASHED token stored in DB (raw token is emailed, never stored).
 *  - emailVerifyExpires  : token expiry timestamp.
 *  - verifyResendAfter   : rate-limit cooldown for resend requests.
 *  - welcomeEmailSent    : idempotency flag — ensures the welcome email is sent only once.
 *  - passwordResetToken  : HASHED reset token.
 *  - passwordResetExpires: reset token expiry.
 *
 * Google-only accounts skip email verification entirely (Google guarantees email ownership).
 * Existing local users without isEmailVerified will be treated as verified (see authMiddleware).
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // Password is optional — Google-only accounts have no local password
  password: { type: String, default: null },

  // ── Google OAuth ──────────────────────────────────────────────────────────
  googleId: { type: String, default: null, index: true, sparse: true },
  picture:  { type: String, default: null },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  // ── Email verification (local accounts only) ──────────────────────────────
  // Default true for existing users so they aren't locked out after this migration.
  // New local registrations are created with false.
  isEmailVerified:    { type: Boolean, default: true },
  emailVerifyToken:   { type: String, default: null },   // bcrypt hash of the raw token
  emailVerifyExpires: { type: Date,   default: null },
  verifyResendAfter:  { type: Date,   default: null },   // earliest next resend timestamp

  // ── Welcome-email idempotency ─────────────────────────────────────────────
  // Set to true the first time the welcome email is queued. Never reset.
  welcomeEmailSent: { type: Boolean, default: false },

  // ── Secure password reset ─────────────────────────────────────────────────
  passwordResetToken:   { type: String, default: null }, // bcrypt hash of the raw token
  passwordResetExpires: { type: Date,   default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
