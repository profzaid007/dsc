# Security hardening — 22 November 2026

Production activation was verified on 22 November. At the owner's explicit
request, MFA and standalone email OTP are disabled for both application users
and PocketBase `_superusers`; administrative sign-in uses passwords.
Netlify's deploy post-processing accepted both programmatic rate rules, and a
bounded live API check returned 429 after crossing the limit. Production CSP
nonces matched all rendered script tags. Build logs are now private. The owner
chose to retain the existing environment-variable deploy contexts.

The application now uses a per-response nonce CSP, denies framing, and restricts
browser capabilities. Sign-in uses PocketBase password authentication.
HTML responses must remain dynamic and uncached so the nonce in the response
matches Next.js scripts. Inline styles remain allowed for React and the rich-text
editor; inline script event handlers and unsigned parser-inserted scripts are denied.

Explicit sign-out calls `/api/dsc/auth/logout` before clearing local state. It
rotates the account token key and signs out all devices. The confirmation explains
this behavior; failed revocation leaves the session available for retry.
The application still uses PocketBase's browser auth store. CSP reduces XSS risk;
it does not make browser-readable tokens equivalent to HttpOnly cookies.

`1796400000_security_hardening.js` changes new-upload validation without removing
existing files: photos 5 MiB; documents 10 MiB; media 100 MiB. SVG, HTML and
executable types are excluded. Auth tokens last eight hours. File-type validation
is not an antivirus scan. Both hook trees contain the logout and reset handlers.
Password reset responses no longer disclose whether an email exists.

Production runtime configuration is maintained separately from the portable
schema migration. PocketBase listens on loopback behind Nginx; Nginx overwrites
client IP forwarding headers. Only then may PocketBase trust `X-Real-IP`.
Native limits cover auth, OTP, password reset, creation and general API requests.
Nginx adds a per-IP burst limit and HSTS. Do not trust forwarding headers when
running a backend directly on a public interface.

Settings encryption uses `--encryptionEnv=DSC_SETTINGS_ENCRYPTION_KEY`, supplied
by a root-readable environment file outside `pb_data`. Store a recovery copy of
the key separately from backups. This encrypts sensitive PocketBase settings,
not the entire database or upload directory. Root volume encryption requires
separate infrastructure work.

The 22 November automatic B2 backup was downloaded to a private disposable
directory. A signed object HEAD confirmed `AES256` server-side encryption.
SQLite integrity checks passed, and the extracted copy started successfully
with PocketBase 0.31.0 after disabling outgoing mail and automatic backups in
that copy. Production was not restored. Temporary database/archive copies were
removed after verification; only a non-sensitive receipt remains.

Administrative MFA and OTP must remain disabled per the owner's choice. The
MFA challenge UI was removed. Do not re-enable the server setting without an
explicit decision and a compatible, tested login flow.

Netlify source-based edge limits are 60 requests/minute/IP/domain on `/api/*`
and 600 on `/*`. These limits are distinct from the messaging delivery quotas.
Netlify can take up to ten seconds to begin enforcement. Advanced managed WAF
depends on the hosting plan and is not enabled by these rules.

Use npm and `package-lock.json` for installs. The obsolete Bun lock pinned an
older Next.js and is removed. Next.js and eslint-config-next are patched to
16.4.6, and sanitizer/transitive advisory fixes are locked. Build and deploy on
Netlify's Linux builders; local Windows Node middleware packaging has adapter
limitations. The application does not depend on local adapter modifications.

Validation: 23 isolated PocketBase 0.31.0 integration tests, HTML sanitization
and permission tests, TypeScript, changed-file lint, production compilation,
and a local parser-injection probe confirming CSP blocks the unsigned script.
No live business records are used by the tests.
