# AGENTS.md

Guidance for AI coding agents (Claude Code, Cursor, Copilot, etc.) working in this repository. Humans should read [`README.md`](README.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md); this file is the machine-facing summary of how to build, test, and change the code safely.

---

## Project snapshot

- **What:** Frontend SPA/PWA for *Prajaakeeya*, a multi-election democratic platform (voters, aspirants, guests, admins).
- **Stack:** React 18 + TypeScript + Vite 5 + MUI 5 + Zustand + React Router 6 + React Hook Form/Yup + Axios + i18next (en/kn) + vite-plugin-pwa.
- **Node:** 20.x. **Package manager:** pnpm only (`pnpm-lock.yaml`).

---

## Commands

```bash
pnpm install            # install deps
pnpm run dev            # dev server → http://localhost:5173 (proxies /api → :3000)
pnpm run build          # tsc -b && vite build  → dist/   (MUST pass before commit)
pnpm run lint           # ESLint over src
pnpm run test:run       # run full Vitest suite once (CI uses this)
pnpm test               # Vitest watch mode
pnpm run test:coverage  # tests + coverage report
```

After any change, the bar to clear is: **`pnpm run lint` clean, `pnpm run test:run` green, `pnpm run build` succeeds.**

---

## Code conventions

- **TypeScript strict.** Avoid `any` unless mirroring existing loosely-typed code; prefer explicit prop interfaces.
- **Functional components + hooks only.**
- **Styling:** MUI `sx` + theme tokens from [`src/theme/`](src/theme/). Use the `BRAND` palette; don't hard-code hex colors.
- **State:** local → `useState`; global → Zustand stores in [`src/store/`](src/store/) (`useAuthStore`, `useThemeStore`).
- **Networking:** never call `axios` directly in components/pages. Add or reuse a function in [`src/services/`](src/services/) (one file per backend domain). All requests go through the shared `apiClient` (auth header + 401 handling).
- **i18n:** never hard-code user-facing strings. Add keys to [`src/i18n/`](src/i18n/) for **both** English and Kannada and use `t('key')`.
- **Routing:** all routes are declared in [`src/App.tsx`](src/App.tsx), grouped under `/user`, `/guest`, `/admin`, and auth routes, each with a layout in [`src/layouts/`](src/layouts/).

---

## Testing — read this before writing tests

- All tests live in **`src/test/`** as `<Name>.test.ts(x)`. Do **not** co-locate tests next to source.
- Tooling: **Vitest + React Testing Library + jsdom**. Vitest globals are enabled — use `describe/it/expect/vi` **without importing** them.
- Use the shared helper: `import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils'` (wraps MUI Theme + MemoryRouter). Pass a route via `renderWithProviders(<X/>, { route: '/path' })`.
- **Mock i18n** in any test that renders a component using `useTranslation`/`Trans`:
  ```ts
  vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k, o) => o?.defaultValue ?? k, i18n: { language: 'en', changeLanguage: () => Promise.resolve() } }),
    Trans: ({ children }) => children,
    initReactI18next: { type: '3rdParty', init: () => {} },
  }));
  ```
  `t()` returns the **key** (or `defaultValue`) — assert on keys or hard-coded English, never on translated text.
- **Mock services** the component imports (`vi.mock('../services/...', () => ({ fn: vi.fn(() => Promise.resolve({ data: ... })) }))`). Never hit the network. Match the response shape the code reads (e.g. `res.data.data`).
- **Mock `useNavigate`** with a partial router mock when asserting navigation:
  ```ts
  const navigate = vi.fn();
  vi.mock('react-router-dom', async (orig) => ({ ...(await orig() as any), useNavigate: () => navigate }));
  ```
- For pages reading route params, extend that mock with `useParams: () => ({ id: '1' })`.
- Controlled inputs: use `fireEvent.change(el, { target: { value } })`, not per-keystroke typing.
- Prefer selectors: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`.

---

## Repo-specific gotchas (important)

- **The production build type-checks test files.** `tsc -b` compiles `src/test/`, so a test-file type error or a missing test dependency will **break the deploy build** — not just the tests. Keep test files type-clean.
- **`@testing-library/react@16` needs `@testing-library/dom` as an explicit dep.** It's a peer dependency that pnpm does not auto-install. It must stay declared in `package.json`, or the Amplify build fails with "no exported member 'screen'".
- **jsdom polyfills** for `matchMedia`, `IntersectionObserver`, `ResizeObserver`, `scrollTo`, and `localStorage`/`sessionStorage` are set up in [`src/test/setupTests.ts`](src/test/setupTests.ts). Don't re-stub them; add new global stubs there if needed.
- **App mode:** `VITE_APP_MODE` is `api` or `mock` (default `mock` if unset) — see [`src/config/appMode.ts`](src/config/appMode.ts). Mock mode renders built-in demo data with no backend.
- **MUI `<Collapse>` / dialogs keep children mounted** — assert on state classes (e.g. `MuiCollapse-hidden`) or visibility, not on DOM absence.
- ** The `/user/complete-profile` and `/user/dashboard/profile` routes use `src/pages/aspirant/AspirantProfilePage.tsx`.

---

## Deployment & CI

- **Two pipelines:** (1) **AWS Amplify** auto-builds/deploys on push to `main`/`staging` (`pnpm install` → `pnpm run build`); (2) **GitHub Actions** [`.github/workflows/deploy-frontend.yml`](.github/workflows/deploy-frontend.yml) runs lint + tests and gates an S3/CloudFront deploy (`needs: test`).
- `main` = production, `staging` = staging.
- Don't push directly to `main`. Branch from `staging`, PR into `staging`.

---

## Safety / do-not-touch

- Never commit a real `.env` or secrets. Only `.env.example` (placeholders) belongs in git.
- Don't edit `dist/`, `node_modules/`, or build artifacts (`dist.zip`).
- Don't modify `src/test/setupTests.ts`, `src/test/test-utils.tsx`, `vite.config.js`, or `tsconfig.json` casually — they affect the whole suite and the build.
- Don't introduce direct `axios` usage, hard-coded strings, or hard-coded colors (see conventions above).

---

## Commit & PR conventions

Conventional Commits (`feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `ci`). Branch from `staging`, open PRs into `staging`, ensure lint + tests + build pass. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for details.
