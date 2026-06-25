# Frontend Test Report — Prajaakeeya

**Project:** prajaakeeya-frontend
**Report date:** 2026-06-03
**Status:** ✅ All tests passing

---

## 1. Executive summary

| Metric | Value |
|---|---|
| Test files | **52** |
| Total tests | **292** |
| Passing | **292 (100%)** |
| Failing / skipped | 0 / 0 |
| Test framework | Vitest 4 + React Testing Library |
| Build typecheck (`tsc -b`) | ✅ 0 errors |

Two kinds of tests were written:

| Type | Files | Tests | What it checks |
|---|---|---|---|
| **Unit tests** (pure logic) | 5 | 52 | functions, validation rules, stores — no UI |
| **UI tests** (render + interact) | 47 | 240 | components & pages render correctly and respond to user actions |

> "Unit" = a single function/store tested in isolation. "UI" = a component or page is rendered (in a simulated browser) and verified the way a user would see/use it. Some files are both (a small component tested in isolation is a unit *and* a UI test).

---

## 2. Tooling

| Tool | Role |
|---|---|
| **Vitest** | Test runner (executes tests, reports pass/fail, coverage) |
| **jsdom** | Simulated browser environment (DOM) for Node |
| **@testing-library/react** | Renders components and queries them like a user |
| **@testing-library/jest-dom** | DOM assertions (`toBeInTheDocument`, `toBeDisabled`, …) |
| **@testing-library/user-event** | Realistic user interactions |
| **@vitest/coverage-v8** | Code-coverage reporting |

Configuration: [`vite.config.js`](vite.config.js) (`test` block) · [`src/test/setupTests.ts`](src/test/setupTests.ts) (global setup) · [`src/test/test-utils.tsx`](src/test/test-utils.tsx) (`renderWithProviders` helper).

---

## 3. How to run

```bash
pnpm test              # watch mode (re-runs on file change)
pnpm run test:run      # run once (used by CI)
pnpm run test:coverage # run once + coverage report (HTML in /coverage)
```

---

## 4. Code coverage

| Metric | Coverage |
|---|---|
| Statements | **51.37%** (3018 / 5875) |
| Branches | 35.40% (2464 / 6960) |
| Functions | 41.29% (524 / 1269) |
| Lines | **53.83%** (2726 / 5064) |

Coverage is concentrated on the **reusable layer** (all components, all utils, both stores) plus the **high-traffic user/guest/aspirant pages**. Low-value static pages (Privacy, Terms, etc.) and thin API-wrapper service files are intentionally not unit-tested (services are exercised indirectly via mocks inside component/page tests).

---

## 5. UNIT TESTS — 5 files, 52 tests

Pure logic, no rendering.

| File | Tests | Covers |
|---|---|---|
| `validation.test.ts` | 28 | phone / email / OTP / EPIC-id rules, election age limits, aspirant schema |
| `fileUtils.test.ts` | 8 | file-size validation, byte formatting |
| `profileUtils.test.ts` | 7 | profile-completeness checks, missing-field detection |
| `useAuthStore.test.ts` | 6 | login/setAuth, admin flag, session clearing, localStorage preservation |
| `useThemeStore.test.ts` | 3 | default mode, toggle, set mode |

---

## 6. UI TESTS — COMPONENTS (27 files, 145 tests)

Each reusable component is rendered and its rendering + key interactions verified.

| Component | Tests | Component | Tests |
|---|---|---|---|
| AspirantMeetingLinksTab | 10 | NotificationBell | 6 |
| AspirantRequestsTab | 7 | PhoneRevealCard | 6 |
| SopFlowChart | 7 | Preloader | 6 |
| AspirantPostsTab | 6 | SopAgreementCard | 6 |
| CandidateInformationStep | 6 | DeclarationStep | 6 |
| DocumentsUploadStep | 6 | ReportsTable | 5 |
| AspirantProfileTab | 5 | ReportStatusModal | 5 |
| AspirantMobileNav | 5 | UsersTable | 5 |
| ConstituencyPickerDialog | 5 | SplitAuthLayout | 5 |
| FileUploadInput | 5 | StatsCard | 5 |
| LivePhotoCaptureStep | 5 | OfflineBanner | 5 |
| AspirantChatTab | 4 | LanguageSelector | 4 |
| AuthFooter | 4 | SelfieLivenessCapture | 4 |
| ModernLoginLayout | 2 | | |

---

## 7. UI TESTS — PAGES (19 files, 93 tests)

Full pages rendered with mocked services + routing. Routes noted for traceability.

| Page (route) | Tests |
|---|---|
| AspirantProfilePage (`/user/complete-profile`, `/user/dashboard/profile`) | 7 |
| RegisteredAspirantsPage (`/user/registered-aspirants`) | 6 |
| GuestRegisteredAspirantsPage (`/guest/registered-aspirants`) | 6 |
| UserLoginPage (`/login`) | 5 |
| UserDashboardPage (`/user/dashboard`) | 5 |
| UserChatPage (`/user/chat/:aspirantId`) | 5 |
| VotingPage (`/user/vote`) | 5 |
| CivicIssuesPage (`/user/civic-issues`) | 5 |
| WardCandidateListPage (`/user/aspirantslist`) | 5 |
| CandidateDetailsPage (`/aspirants/:id`) | 5 |
| AspirantViewDetailsPage (`/user|guest/aspirants/:id/view`) | 5 |
| NotificationsPage (`/user/notifications`) | 5 |
| GuestDashboardPage (`/guest/dashboard`) | 5 |
| AspirantPostsPage (`/user/dashboard/posts`) | 4 |
| AspirantRegistrationPage (`/user/aspirants/registration`) | 4 |
| UserRegisterPage (`/register`) | 4 |
| GuestAspirantsPage (`/guest/aspirants`) | 4 |
| GuestCivicIssuesPage (`/guest/civic-issues`) | 4 |
| GuestSopPage (`/guest/sop`) | 4 |

*(Plus `setup.test.tsx` — 2 framework smoke tests.)*

---

## 8. Continuous Integration

The deploy workflow [`.github/workflows/deploy-frontend.yml`](.github/workflows/deploy-frontend.yml) runs a **`test` job** (lint + `pnpm run test:run`) that the **`deploy` job depends on** (`needs: test`). A failing test blocks the deployment — satisfying the requirement *"deploy only after tests pass."*

---

## 9. Testing conventions (for contributors)

- All tests live in **`src/test/`**, named `<Thing>.test.ts(x)`.
- Render via **`renderWithProviders`** ([`src/test/test-utils.tsx`](src/test/test-utils.tsx)) — wraps MUI Theme + Router.
- **i18n** is mocked so `t()` returns the translation key (assert on keys or hardcoded English).
- **Services / network** are mocked with `vi.mock` — tests never hit a backend.
- Prefer **stable selectors**: `getByRole`, `getByLabelText`, `getByText`.

---

## 10. Out of scope / pending

- Remaining low-priority and static pages (Privacy, Terms, ContactUs, etc.).
- Hooks: `useSnackbar`, `useExtractionPolling`.
- **End-to-end (Playwright)** real-browser journeys — separate layer, not yet started.
