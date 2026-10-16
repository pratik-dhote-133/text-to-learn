/**
 * authController.js
 * -----------------
 * Handles all authentication flows:
 *  - Email/password registration  (sends verification email, does NOT log user in yet)
 *  - Email verification           (token-based, single-use, 24-hour expiry)
 *  - Resend verification email    (rate-limited)
 *  - Email/password login         (blocks unverified local accounts)
 *  - Google OAuth                 (server-side ID-token verification)
 *  - Forgot password              (sends a secure email with a time-limited token)
 *  - Reset password               (consumes single-use token, updates password)
 *  - Get current user             (protected)
 *
 * Security notes:
 *  - Password-reset and email-verify tokens are generated with crypto.randomBytes(32).
 *  - Only the SHA-256 hash of each token is stored in MongoDB. The raw token travels
 *    only in the email link and is never logged or persisted.
 *  - Tokens are single-use: they are cleared from the DB on first successful use.
 *  - All token lookups compare the hash of the submitted value against the stored hash.
 *  - Password changes require a valid unexpired token - never just an email address.
 */

const crypto = require('crypto');
const User   = require('../models/User');
const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendGoogleWelcomeEmail,
  sendPasswordResetEmail,
} = require('../services/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Helpers ------------------------------------------------------------------

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });

/** Returns a cryptographically random hex string and its SHA-256 hash. */
function makeToken() {
  const raw  = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

/** Hash a raw token for lookup against a stored hash. */
function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// --- Registration -------------------------------------------------------------

const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    email = email.trim().toLowerCase();
    console.log(`[AUTH] Attempting signup for email: ${email}`);

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.warn(`[AUTH] Signup failed: User already exists (${email})`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt          = await bcrypt.genSalt(10);
    const hashedPwd     = await bcrypt.hash(password, salt);
    const { raw, hash } = makeToken();
    const expiry        = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    const user = await User.create({
      name,
      email,
      password:           hashedPwd,
      authProvider:       'local',
      isEmailVerified:    false,
      emailVerifyToken:   hash,
      emailVerifyExpires: expiry,
      verifyResendAfter:  new Date(Date.now() + 60 * 1000), // 1-min resend cooldown
    });

    const emailResult = await sendVerificationEmail(email, name, raw);
    if (!emailResult.ok) {
      console.warn(`[AUTH] Verification email failed for ${email}:`, emailResult.reason);
    }

    console.log(`[AUTH] Signup successful for: ${email} - awaiting email verification`);
    res.status(201).json({
      message:   'Account created! Please check your email to verify your address before signing in.',
      emailSent: emailResult.ok,
    });
  } catch (error) {
    console.error(`[AUTH] Server Error during signup:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Email Verification -------------------------------------------------------

const verifyEmail = async (req, res) => {
  try {
    const rawToken  = req.params.token;
    const tokenHash = hashToken(rawToken);

    const user = await User.findOne({
      emailVerifyToken:   tokenHash,
      emailVerifyExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Verification link is invalid or has expired. Please request a new one.',
      });
    }

    user.isEmailVerified    = true;
    user.emailVerifyToken   = null;
    user.emailVerifyExpires = null;
    user.verifyResendAfter  = null;
    await user.save();

    // Send welcome email - idempotent: only once
    if (!user.welcomeEmailSent) {
      const emailResult = await sendWelcomeEmail(user.email, user.name);
      if (emailResult.ok) {
        await User.findByIdAndUpdate(user._id, { welcomeEmailSent: true });
      } else {
        console.warn(`[AUTH] Welcome email failed for ${user.email}:`, emailResult.reason);
      }
    }

    console.log(`[AUTH] Email verified for: ${user.email}`);
    res.json({
      message:      'Email verified! You can now sign in.',
      _id:          user.id,
      name:         user.name,
      email:        user.email,
      picture:      user.picture,
      authProvider: user.authProvider,
      token:        generateToken(user._id),
    });
  } catch (error) {
    console.error(`[AUTH] Server Error during email verification:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Resend Verification Email ------------------------------------------------

const resendVerification = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    const okMsg = { message: 'If an unverified account exists, a new verification email has been sent.' };

    if (!user || user.isEmailVerified || user.authProvider !== 'local') {
      return res.status(200).json(okMsg);
    }

    // Rate-limit
    if (user.verifyResendAfter && user.verifyResendAfter > new Date()) {
      const waitSecs = Math.ceil((user.verifyResendAfter - Date.now()) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitSecs} seconds before requesting another verification email.`,
      });
    }

    const { raw, hash } = makeToken();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerifyToken   = hash;
    user.emailVerifyExpires = expiry;
    user.verifyResendAfter  = new Date(Date.now() + 60 * 1000);
    await user.save();

    const emailResult = await sendVerificationEmail(email, user.name, raw);
    if (!emailResult.ok) {
      console.warn(`[AUTH] Resend verification email failed for ${email}:`, emailResult.reason);
    }

    return res.status(200).json(okMsg);
  } catch (error) {
    console.error(`[AUTH] Server Error during resend verification:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Login -------------------------------------------------------------------

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    email = email.trim().toLowerCase();
    console.log(`[AUTH] Attempting login for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[AUTH] Login failed: User not found (${email})`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block password login for Google-only accounts
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Please click "Continue with Google" to log in.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[AUTH] Login failed: Incorrect password for (${email})`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block unverified local accounts
    if (!user.isEmailVerified) {
      console.warn(`[AUTH] Login blocked: email not verified for (${email})`);
      return res.status(403).json({
        message:              'Please verify your email address before signing in. Check your inbox for the verification link.',
        requiresVerification: true,
        email:                user.email,
      });
    }

    console.log(`[AUTH] Login successful for: ${email}`);
    res.json({
      _id:          user.id,
      name:         user.name,
      email:        user.email,
      picture:      user.picture,
      authProvider: user.authProvider,
      token:        generateToken(user._id),
    });
  } catch (error) {
    console.error(`[AUTH] Server Error during login:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Google OAuth -------------------------------------------------------------

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('[AUTH] GOOGLE_CLIENT_ID is not set in environment');
      return res.status(500).json({ message: 'Google authentication is not configured on the server' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken:  credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.warn('[AUTH] Google token verification failed:', verifyError.message);
      return res.status(401).json({ message: 'Invalid or expired Google credential. Please try again.' });
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: 'Google account email is not verified.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log(`[AUTH] Google auth attempt for: ${normalizedEmail} (sub: ${googleId})`);

    let isNewUser = false;
    let user = await User.findOne({ googleId });

    if (!user) {
      const existingEmailUser = await User.findOne({ email: normalizedEmail });

      if (existingEmailUser) {
        if (existingEmailUser.authProvider === 'local' && !existingEmailUser.googleId) {
          console.warn(`[AUTH] Google sign-in attempted for existing local account: ${normalizedEmail}`);
          return res.status(409).json({
            message:      'An account with this email already exists. Please log in with your email and password.',
            conflictType: 'existing_local_account',
          });
        }

        existingEmailUser.googleId = googleId;
        existingEmailUser.picture  = picture || existingEmailUser.picture;
        await existingEmailUser.save();
        user = existingEmailUser;
        console.log(`[AUTH] Linked Google ID to existing account: ${normalizedEmail}`);
      } else {
        user = await User.create({
          name:             name || 'Google User',
          email:            normalizedEmail,
          googleId,
          picture:          picture || null,
          password:         null,
          authProvider:     'google',
          isEmailVerified:  true,
          welcomeEmailSent: false,
        });
        isNewUser = true;
        console.log(`[AUTH] New Google account created for: ${normalizedEmail}`);
      }
    } else {
      if (picture && picture !== user.picture) {
        user.picture = picture;
        await user.save();
      }
      console.log(`[AUTH] Existing Google user signed in: ${normalizedEmail}`);
    }

    // Send welcome email once for new Google users
    if (isNewUser && !user.welcomeEmailSent) {
      const emailResult = await sendGoogleWelcomeEmail(user.email, user.name);
      if (emailResult.ok) {
        await User.findByIdAndUpdate(user._id, { welcomeEmailSent: true });
      } else {
        console.warn(`[AUTH] Google welcome email failed for ${user.email}:`, emailResult.reason);
      }
    }

    res.json({
      _id:          user.id,
      name:         user.name,
      email:        user.email,
      picture:      user.picture,
      authProvider: user.authProvider,
      token:        generateToken(user._id),
    });
  } catch (error) {
    console.error(`[AUTH] Server Error during Google auth:`, error);
    res.status(500).json({ message: 'Server Error during Google authentication' });
  }
};

// --- Forgot Password (initiate) -----------------------------------------------

const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    email = email.trim().toLowerCase();
    console.log(`[AUTH] Password reset requested for: ${email}`);

    const okMsg = { message: 'If this email is registered, you will receive a password-reset link shortly.' };

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json(okMsg);
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(200).json({ ...okMsg, isGoogleAccount: true });
    }

    const { raw, hash } = makeToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken   = hash;
    user.passwordResetExpires = expiry;
    await user.save();

    const emailResult = await sendPasswordResetEmail(email, user.name, raw);
    if (!emailResult.ok) {
      console.warn(`[AUTH] Password reset email failed for ${email}:`, emailResult.reason);
    }

    return res.status(200).json(okMsg);
  } catch (error) {
    console.error(`[AUTH] Server Error during forgot-password:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Reset Password (consume token) ------------------------------------------

const resetPassword = async (req, res) => {
  try {
    const rawToken        = req.params.token;
    const { newPassword } = req.body;

    if (!rawToken) {
      return res.status(400).json({ message: 'Reset token is missing' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const tokenHash = hashToken(rawToken);

    const user = await User.findOne({
      passwordResetToken:   tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    const salt    = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Invalidate token immediately (single-use)
    user.passwordResetToken   = null;
    user.passwordResetExpires = null;
    await user.save();

    console.log(`[AUTH] Password reset successful for: ${user.email}`);
    res.status(200).json({ message: 'Password reset successful. You can now sign in with your new password.' });
  } catch (error) {
    console.error(`[AUTH] Server Error during password reset:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Get Current User --------------------------------------------------------

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
  googleAuth,
  forgotPassword,
  resetPassword,
  getMe,
};
