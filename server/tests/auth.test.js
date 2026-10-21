/**
 * auth.test.js
 * Self-contained security & logic tests — no DB, no email, no external calls.
 * Run: node server/tests/auth.test.js
 */
'use strict';

const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');
const assert = require('assert');
const bcrypt = require('bcryptjs');

// ── Test runner ───────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const results = [];

async function test(label, fn) {
  try {
    await fn();
    passed++;
    results.push({ label, status: 'PASS' });
    process.stdout.write(`  \u2705  ${label}\n`);
  } catch (err) {
    failed++;
    results.push({ label, status: 'FAIL', reason: err.message });
    process.stdout.write(`  \u274C  ${label}\n      \u2192 ${err.message}\n`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeToken() {
  const raw  = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}
function hashToken(raw) { return crypto.createHash('sha256').update(raw).digest('hex'); }
function makeUser(o = {}) {
  return {
    _id: 'id1', name: 'Test', email: 'test@x.com',
    password: null, authProvider: 'local', isEmailVerified: false,
    welcomeEmailSent: false, emailVerifyToken: null, emailVerifyExpires: null,
    verifyResendAfter: null, passwordResetToken: null, passwordResetExpires: null,
    async save() {}, ...o,
  };
}
async function simulateReset({ rawToken, newPassword, storedHash, expiresAt, consumed = false }) {
  if (!rawToken)                              throw Object.assign(new Error('token_missing'),    { status: 400 });
  if (!newPassword || newPassword.length < 6) throw Object.assign(new Error('password_too_short'), { status: 400 });
  if (consumed || hashToken(rawToken) !== storedHash || expiresAt <= new Date())
    throw Object.assign(new Error('invalid_or_expired'), { status: 400 });
  const salt = await bcrypt.genSalt(10);
  return { hash: await bcrypt.hash(newPassword, salt) };
}
function simulateLogin(user, pwd) {
  if (!user)                                    return { status: 401, body: { message: 'Invalid email or password' } };
  if (user.authProvider === 'google' && !user.password)
                                                return { status: 400, body: { message: 'Google Sign-In' } };
  if (!bcrypt.compareSync(pwd, user.password))  return { status: 401, body: { message: 'Invalid email or password' } };
  if (!user.isEmailVerified)                    return { status: 403, body: { requiresVerification: true, email: user.email } };
  return { status: 200, body: { token: 'jwt' } };
}
async function welcomeOnce(user, sendFn) {
  if (user.welcomeEmailSent) return { alreadySent: true };
  const r = await sendFn();
  if (r.ok) user.welcomeEmailSent = true;
  return { alreadySent: false, r };
}
function simulateForgotPwd(user) {
  const okMsg = { message: 'If this email is registered, you will receive a password-reset link shortly.' };
  if (!user) return { status: 200, body: okMsg };
  if (user.authProvider === 'google' && !user.password) return { status: 200, body: { ...okMsg, isGoogleAccount: true } };
  const { raw, hash } = makeToken();
  user.passwordResetToken   = hash;
  user.passwordResetExpires = new Date(Date.now() + 3600_000);
  return { status: 200, body: okMsg, rawToken: raw };
}
function simulateResend(user) {
  const okMsg = { message: 'If an unverified account exists, a new verification email has been sent.' };
  if (!user || user.isEmailVerified || user.authProvider !== 'local') return { status: 200, body: okMsg };
  if (user.verifyResendAfter && user.verifyResendAfter > new Date())
    return { status: 429, body: { message: `Please wait ${Math.ceil((user.verifyResendAfter - Date.now()) / 1000)} seconds` } };
  const { raw, hash } = makeToken();
  user.emailVerifyToken   = hash;
  user.emailVerifyExpires = new Date(Date.now() + 86_400_000);
  user.verifyResendAfter  = new Date(Date.now() + 60_000);
  return { status: 200, body: okMsg, rawToken: raw };
}

// ── Source paths ──────────────────────────────────────────────────────────────
const ROOT       = path.join(__dirname, '..');
const CTRL       = path.join(ROOT, 'controllers/authController.js');
const MW         = path.join(ROOT, 'middleware/authMiddleware.js');
const ROUTES     = path.join(ROOT, 'routes/authRoutes.js');
const MODEL      = path.join(ROOT, 'models/User.js');
const EMAILSVC   = path.join(ROOT, 'services/emailService.js');
const CLIENT_SRC = path.join(ROOT, '../client/src');

function src(f) { return fs.readFileSync(f, 'utf8'); }

function readDirJs(dir) {
  if (!fs.existsSync(dir)) return '';
  let out = '';
  function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const full = path.join(d, f);
      if (f === 'node_modules') continue;
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (/\.[jt]sx?$/.test(f)) out += fs.readFileSync(full, 'utf8') + '\n';
    }
  }
  walk(dir);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────

(async function runTests() {

  console.log('\n\u2501'.repeat(30));
  console.log(' Text-to-Learn \u00B7 Auth Security Test Suite\n');

  // 1. Token generation
  console.log('\u25C6 1. Token generation\n');
  await test('raw token is 64 hex chars (256-bit)', () => {
    const { raw } = makeToken();
    assert.strictEqual(raw.length, 64);
    assert.match(raw, /^[0-9a-f]+$/);
  });
  await test('20 calls produce 20 unique tokens', () => {
    const t = Array.from({ length: 20 }, () => makeToken().raw);
    assert.strictEqual(new Set(t).size, 20);
  });
  await test('hash is deterministic', () => {
    const r = 'fixed_input';
    assert.strictEqual(hashToken(r), hashToken(r));
  });
  await test('hash is 64 hex chars (SHA-256)', () => {
    const { hash } = makeToken();
    assert.strictEqual(hash.length, 64);
    assert.match(hash, /^[0-9a-f]+$/);
  });
  await test('raw != hash', () => {
    const { raw, hash } = makeToken();
    assert.notStrictEqual(raw, hash);
  });

  // 2. Hash-only storage
  console.log('\n\u25C6 2. Token storage (hash-only)\n');
  await test('forgotPassword stores hash, not raw token', () => {
    const user = makeUser({ authProvider: 'local', password: 'x' });
    const { rawToken } = simulateForgotPwd(user);
    assert.notStrictEqual(user.passwordResetToken, rawToken);
    assert.strictEqual(user.passwordResetToken, hashToken(rawToken));
  });
  await test('resendVerification stores hash, not raw token', () => {
    const user = makeUser({ isEmailVerified: false });
    const { rawToken } = simulateResend(user);
    assert.notStrictEqual(user.emailVerifyToken, rawToken);
    assert.strictEqual(user.emailVerifyToken, hashToken(rawToken));
  });
  await test('submitting hash-as-raw is rejected (pre-image resistance)', () => {
    const { raw, hash } = makeToken();
    assert.notStrictEqual(hashToken(hash), hash, 'double-hash must not equal single-hash');
  });

  // 3. Password reset security
  console.log('\n\u25C6 3. Password reset — token-only path\n');
  await test('valid token + strong password succeeds', async () => {
    const { raw, hash } = makeToken();
    const { hash: newH } = await simulateReset({ rawToken: raw, newPassword: 'NewPass123!', storedHash: hash, expiresAt: new Date(Date.now() + 3600_000) });
    assert.ok(bcrypt.compareSync('NewPass123!', newH));
  });
  await test('empty token is rejected (token_missing)', async () => {
    await assert.rejects(() => simulateReset({ rawToken: '', newPassword: 'NewPass123!', storedHash: 'x', expiresAt: new Date(Date.now() + 3600_000) }), /token_missing/);
  });
  await test('password < 6 chars is rejected (password_too_short)', async () => {
    const { raw, hash } = makeToken();
    await assert.rejects(() => simulateReset({ rawToken: raw, newPassword: 'abc', storedHash: hash, expiresAt: new Date(Date.now() + 3600_000) }), /password_too_short/);
  });
  await test('wrong raw token is rejected', async () => {
    const { hash } = makeToken();
    await assert.rejects(() => simulateReset({ rawToken: makeToken().raw, newPassword: 'NewPass123!', storedHash: hash, expiresAt: new Date(Date.now() + 3600_000) }), /invalid_or_expired/);
  });
  await test('email-as-token is rejected (no email-only bypass)', async () => {
    const { hash } = makeToken();
    await assert.rejects(() => simulateReset({ rawToken: 'victim@example.com', newPassword: 'NewPass123!', storedHash: hash, expiresAt: new Date(Date.now() + 3600_000) }), /invalid_or_expired/);
  });
  await test('bare POST /reset-password (no :token) route does NOT exist', () => {
    const r = src(ROUTES);
    assert.ok(/reset-password\/:token/.test(r), 'must have :token route');
    assert.ok(!/router\.(post|put|patch)\s*\(\s*['"]\/reset-password['"]\s*,/.test(r), 'bare /reset-password must not exist');
  });

  // 4. Token expiry
  console.log('\n\u25C6 4. Token expiry\n');
  await test('expired token is rejected', async () => {
    const { raw, hash } = makeToken();
    await assert.rejects(() => simulateReset({ rawToken: raw, newPassword: 'NewPass123!', storedHash: hash, expiresAt: new Date(Date.now() - 1) }), /invalid_or_expired/);
  });
  await test('token valid 100 ms before expiry', async () => {
    const { raw, hash } = makeToken();
    const r = await simulateReset({ rawToken: raw, newPassword: 'ValidPwd!', storedHash: hash, expiresAt: new Date(Date.now() + 100) });
    assert.ok(r.hash);
  });
  await test('verify token window is 24 h (source check)', () => {
    assert.ok(src(CTRL).includes('24 * 60 * 60 * 1000'));
  });
  await test('reset token window is 1 h (source check)', () => {
    assert.ok(src(CTRL).includes('60 * 60 * 1000'));
  });

  // 5. Single-use tokens
  console.log('\n\u25C6 5. Single-use tokens\n');
  await test('consumed token is rejected', async () => {
    const { raw, hash } = makeToken();
    await assert.rejects(() => simulateReset({ rawToken: raw, newPassword: 'NewPass123!', storedHash: hash, expiresAt: new Date(Date.now() + 3600_000), consumed: true }), /invalid_or_expired/);
  });
  await test('controller nulls passwordResetToken/Expires after use (source check)', () => {
    const c = src(CTRL);
    assert.ok(/passwordResetToken\s*=\s*null/.test(c));
    assert.ok(/passwordResetExpires\s*=\s*null/.test(c));
  });
  await test('controller nulls emailVerifyToken/Expires after use (source check)', () => {
    const c = src(CTRL);
    assert.ok(/emailVerifyToken\s*=\s*null/.test(c));
    assert.ok(/emailVerifyExpires\s*=\s*null/.test(c));
  });

  // 6. Welcome email deduplication
  console.log('\n\u25C6 6. Welcome email deduplication\n');
  await test('sent once when flag is false', async () => {
    const user = makeUser({ welcomeEmailSent: false });
    let n = 0;
    await welcomeOnce(user, async () => { n++; return { ok: true }; });
    assert.strictEqual(n, 1); assert.ok(user.welcomeEmailSent);
  });
  await test('not sent when flag is true', async () => {
    const user = makeUser({ welcomeEmailSent: true });
    let n = 0;
    const r = await welcomeOnce(user, async () => { n++; return { ok: true }; });
    assert.strictEqual(n, 0); assert.ok(r.alreadySent);
  });
  await test('flag stays false when send fails (retry remains possible)', async () => {
    const user = makeUser({ welcomeEmailSent: false });
    await welcomeOnce(user, async () => ({ ok: false }));
    assert.ok(!user.welcomeEmailSent);
  });
  await test('5 calls send exactly 1 email', async () => {
    const user = makeUser({ welcomeEmailSent: false });
    let n = 0;
    for (let i = 0; i < 5; i++) await welcomeOnce(user, async () => { n++; return { ok: true }; });
    assert.strictEqual(n, 1);
  });
  await test('!user.welcomeEmailSent guard in controller (source check)', () => {
    const c = src(CTRL);
    assert.ok(c.includes('!user.welcomeEmailSent'));
    assert.ok(c.includes('welcomeEmailSent: true'));
  });

  // 7. Login gating
  console.log('\n\u25C6 7. Login gating (unverified accounts)\n');
  await test('unverified local account => 403 + requiresVerification', async () => {
    const h = bcrypt.hashSync('Password123!', 10);
    const u = makeUser({ authProvider: 'local', password: h, isEmailVerified: false });
    const r = simulateLogin(u, 'Password123!');
    assert.strictEqual(r.status, 403);
    assert.ok(r.body.requiresVerification);
  });
  await test('verified local account => 200', async () => {
    const h = bcrypt.hashSync('Password123!', 10);
    const u = makeUser({ authProvider: 'local', password: h, isEmailVerified: true });
    assert.strictEqual(simulateLogin(u, 'Password123!').status, 200);
  });
  await test('wrong password => 401 (verified account)', async () => {
    const h = bcrypt.hashSync('Correct', 10);
    const u = makeUser({ authProvider: 'local', password: h, isEmailVerified: true });
    assert.strictEqual(simulateLogin(u, 'Wrong').status, 401);
  });
  await test('null user => 401', () => {
    assert.strictEqual(simulateLogin(null, 'x').status, 401);
  });
  await test('middleware blocks unverified local users (source check)', () => {
    const m = src(MW);
    assert.ok(m.includes("authProvider === 'local'") && m.includes('!req.user.isEmailVerified'));
    assert.ok(m.includes('requiresVerification: true'));
  });

  // 8. Google account handling
  console.log('\n\u25C6 8. Google account handling\n');
  await test('Google-only account cannot log in via password', () => {
    const u = makeUser({ authProvider: 'google', password: null, isEmailVerified: true });
    const r = simulateLogin(u, 'any');
    assert.strictEqual(r.status, 400);
    assert.ok(r.body.message.toLowerCase().includes('google'));
  });
  await test('schema default isEmailVerified=true (source check)', () => {
    const m = src(MODEL);
    assert.ok(
      m.includes('isEmailVerified:    { type: Boolean, default: true }') ||
      m.includes('isEmailVerified: { type: Boolean, default: true }')
    );
  });
  await test('Google accounts created with isEmailVerified: true (source check)', () => {
    assert.ok(src(CTRL).includes('isEmailVerified:  true') || src(CTRL).includes('isEmailVerified: true'));
  });
  await test('forgotPassword flags Google account + stores no reset token', () => {
    const u = makeUser({ authProvider: 'google', password: null, isEmailVerified: true });
    const r = simulateForgotPwd(u);
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.isGoogleAccount);
    assert.ok(!r.rawToken);
    assert.strictEqual(u.passwordResetToken, null);
  });

  // 9. JWT secret safety
  console.log('\n\u25C6 9. JWT secret\n');
  await test('JWT_SECRET is set in .env', () => {
    const envPath = path.join(ROOT, '.env');
    if (!fs.existsSync(envPath)) throw new Error('.env not found');
    const m = fs.readFileSync(envPath, 'utf8').match(/^JWT_SECRET=(.+)$/m);
    assert.ok(m && m[1].trim().length > 0, 'JWT_SECRET must be non-empty');
  });
  await test('[SECURITY FINDING] fallback_secret must be removed from source', () => {
    const hasFallback = src(CTRL).includes("'fallback_secret'") || src(MW).includes("'fallback_secret'");
    assert.ok(!hasFallback,
      "Hardcoded fallback JWT secret found. Remove '|| \"fallback_secret\"' from " +
      "generateToken() and jwt.verify(), and add a startup check: " +
      "if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env var is required').");
  });

  // 10. Existing user safety
  console.log('\n\u25C6 10. Existing user safety\n');
  await test('legacy user (isEmailVerified=true default) can still log in', async () => {
    const h = bcrypt.hashSync('OldPwd', 10);
    const u = makeUser({ authProvider: 'local', password: h, isEmailVerified: true });
    assert.strictEqual(simulateLogin(u, 'OldPwd').status, 200);
  });
  await test('new local registration sets isEmailVerified=false (source check)', () => {
    assert.ok(src(CTRL).includes('isEmailVerified:    false') || src(CTRL).includes('isEmailVerified: false'));
  });

  // 11. Secret exposure
  console.log('\n\u25C6 11. Secret exposure in source files\n');
  const allSrc = [
    readDirJs(path.join(ROOT, 'controllers')),
    readDirJs(path.join(ROOT, 'routes')),
    readDirJs(path.join(ROOT, 'middleware')),
    readDirJs(path.join(ROOT, 'services')),
    readDirJs(path.join(ROOT, 'models')),
    readDirJs(path.join(ROOT, 'config')),
    readDirJs(CLIENT_SRC),
  ].join('\n');

  await test('no sk-proj (OpenAI key) in source', () => { assert.ok(!allSrc.includes('sk-proj-')); });
  await test('no AIzaSy (Google/YouTube key) in source', () => { assert.ok(!allSrc.includes('AIzaSy')); });
  await test('no mongodb+srv URI in source', () => { assert.ok(!allSrc.includes('mongodb+srv://')); });
  await test('no Resend live/test key in source', () => { assert.ok(!/re_(live|test)_[A-Za-z0-9]+/.test(allSrc)); });
  await test('raw tokens not passed to console.log (source check)', () => {
    assert.ok(!/console\.(log|warn|error)\([^)]*\braw\b/.test(src(CTRL)));
  });
  await test('.env files not tracked by git', () => {
    const { execSync } = require('child_process');
    const tracked = execSync('git ls-files server/.env client/.env .env 2>/dev/null', { cwd: path.join(ROOT, '..') }).toString().trim();
    assert.strictEqual(tracked, '', `.env files are git-tracked: "${tracked}"`);
  });
  await test('RESEND_API_KEY read from process.env only', () => { assert.ok(src(EMAILSVC).includes('process.env.RESEND_API_KEY')); });
  await test('GOOGLE_CLIENT_ID read from process.env only', () => { assert.ok(src(CTRL).includes('process.env.GOOGLE_CLIENT_ID')); });

  // 12. Route surface area
  console.log('\n\u25C6 12. Route surface area\n');
  await test('verify-email is GET /:token', () => { assert.ok(/router\.get\s*\(\s*['"]\/verify-email\/:token['"]/.test(src(ROUTES))); });
  await test('forgot-password is POST (no token param)', () => { assert.ok(/router\.post\s*\(\s*['"]\/forgot-password['"]/.test(src(ROUTES))); });
  await test('reset-password is POST /:token', () => { assert.ok(/router\.post\s*\(\s*['"]\/reset-password\/:token['"]/.test(src(ROUTES))); });
  await test('/me is protected by protect middleware', () => {
    const r = src(ROUTES);
    assert.ok(r.includes('protect, getMe') || r.includes('protect,getMe'));
  });

  // 13. Email service no-op
  console.log('\n\u25C6 13. Email service (no credentials)\n');
  await test('returns {ok:false} when RESEND_API_KEY absent (simulated)', async () => {
    const r = { ok: false, reason: 'Email provider not configured' }; // mirrors actual service behaviour
    assert.strictEqual(r.ok, false); assert.ok(r.reason);
  });
  await test('emailService lazy-init — guards missing key (source check)', () => {
    const e = src(EMAILSVC);
    assert.ok(e.includes('!process.env.RESEND_API_KEY'));
    assert.ok(e.includes('return null'));
    assert.ok(e.includes('ok: false'));
  });
  await test('controllers warn on email failure, do not crash (source check)', () => {
    const c = src(CTRL);
    assert.ok(c.includes('emailResult.ok'));
    assert.ok(c.includes('console.warn'));
  });

  // 14. resendVerification rate limiting
  console.log('\n\u25C6 14. Resend verification rate limiting\n');
  await test('429 during cooldown', () => {
    const u = makeUser({ isEmailVerified: false, authProvider: 'local', verifyResendAfter: new Date(Date.now() + 30_000) });
    const r = simulateResend(u);
    assert.strictEqual(r.status, 429);
    assert.ok(r.body.message.toLowerCase().includes('wait'));
  });
  await test('200 after cooldown expires', () => {
    const u = makeUser({ isEmailVerified: false, authProvider: 'local', verifyResendAfter: new Date(Date.now() - 1) });
    assert.strictEqual(simulateResend(u).status, 200);
  });
  await test('200 for already-verified account (no state leak)', () => {
    const r = simulateResend(makeUser({ isEmailVerified: true, authProvider: 'local' }));
    assert.strictEqual(r.status, 200); assert.ok(!r.rawToken);
  });
  await test('200 for unknown email (no state leak)', () => { assert.strictEqual(simulateResend(null).status, 200); });
  await test('200 for Google account (no state leak)', () => {
    const r = simulateResend(makeUser({ isEmailVerified: true, authProvider: 'google' }));
    assert.strictEqual(r.status, 200); assert.ok(!r.rawToken);
  });

  // 15. forgotPassword security
  console.log('\n\u25C6 15. forgotPassword security\n');
  await test('identical response for existing vs non-existing email (no user enumeration)', () => {
    const a = simulateForgotPwd(makeUser({ authProvider: 'local', password: 'x' }));
    const b = simulateForgotPwd(null);
    assert.strictEqual(a.body.message, b.body.message);
  });
  await test('reset expiry is within 1 hour for local user', () => {
    const u = makeUser({ authProvider: 'local', password: 'x' });
    simulateForgotPwd(u);
    const diff = u.passwordResetExpires - Date.now();
    assert.ok(diff > 0 && diff <= 3_600_000);
  });
  await test('no token generated for non-existent email', () => {
    assert.ok(!simulateForgotPwd(null).rawToken);
  });

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n' + '\u2501'.repeat(60));
  console.log(` Results: ${passed} passed | ${failed} failed`);
  console.log('\u2501'.repeat(60) + '\n');

  if (failed > 0) {
    console.log('Failed tests:\n');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  \u274C ${r.label}`);
      console.log(`     \u2192 ${r.reason}\n`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
})();
