## Implements #44 — Add Native Share App Button

### What was added
A "Share App" button in the main navigation menu (both mobile drawer and desktop header). When tapped, it uses the browser's native Web Share API (available on Android and iOS) to let users share the Prajaakeeya app link via any installed app (WhatsApp, SMS, email, etc.). On desktop browsers that do not support the Web Share API, the button falls back to copying the URL to the clipboard.

### Where it was added
- `src/layouts/PublicLayout.tsx`: added `handleShareApp` handler, integrated a `ShareIcon` button in the mobile drawer list and the desktop top navigation stack.
- `src/i18n/locales/en.json`: added translation keys under `share` (English).
- Kannada translations (`src/i18n/locales/lazy/kn.json`) already existed.

### i18n
Added new keys:
```json
"share": {
  "button_label": "Share App",
  "app_title": "Prajaakeeya",
  "app_text": "Your Voice, Your Rule, Your Vote. Join Prajaakeeya today!",
  "copied": "Link copied to clipboard"
}
```
Kannada translations were already present in `kn.json`.

### Testing
- Added `src/test/ShareAppButton.test.tsx` with 6 test cases covering:
  - Button presence in both mobile and desktop navigation
  - `navigator.share` called with correct args when available
  - Clipboard fallback when share is unavailable
  - No errors on user cancellation or clipboard failures

All tests pass. Existing test suite also passes.

### Checklist
- [x] `npm run lint` passes (no new errors)
- [x] `npm run test:run` passes (all tests green)
- [x] `npm run build` succeeds
- [x] All user-facing text uses `t()` keys – no hardcoded strings
- [x] New keys added to both `en.json` and `kn.json` (kn already complete)
- [x] MUI styling matches existing navigation items
- [x] No `.env` files committed
