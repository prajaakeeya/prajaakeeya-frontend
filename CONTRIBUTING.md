# Contributing to Prajaakeeya Frontend

Thanks for contributing! This guide covers how to set up the project, the conventions we follow, and how to get a pull request merged. For an overview of the app, see [`README.md`](README.md).

---

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Getting set up](#getting-set-up)
- [Branching strategy](#branching-strategy)
- [Commit messages](#commit-messages)
- [Code style](#code-style)
- [Writing tests](#writing-tests)
- [Before you open a PR](#before-you-open-a-pr)
- [Pull request process](#pull-request-process)

---

## Code of conduct

Be respectful and constructive. We're building civic infrastructure — assume good intent, keep reviews kind, and focus on the work.

---

## Getting set up

Requires **Node.js 20.x**.

```bash
git clone git@github.com:prajaakeeya/prajaakeeya-frontend.git
cd prajaakeeya-frontend
pnpm install
cp .env.example .env     # then fill in values
pnpm run dev
```

> This project uses **pnpm** as the sole package manager. The lockfile is `pnpm-lock.yaml`. If you change dependencies, run `pnpm install` to update it. Before committing, ensure `pnpm run build` passes.

---

## Branching strategy

- **`main`** → production. Do not push to it directly.
- **`staging`** → integration/QA. This is the branch you branch **off of** and open PRs **into**.
- **Feature branches** → branch from `staging`, named by type:

  ```
  feat/aspirant-chat-typing-indicator
  fix/voting-window-timezone
  test/registered-aspirants-page
  docs/readme-env-vars
  chore/bump-mui
  ```

Releases flow `staging → main`.

---

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional scope): <short summary>
```

**Types:** `feat`, `fix`, `test`, `docs`, `refactor`, `style`, `perf`, `chore`, `ci`.

Examples:

```
feat(civic-issues): add hand-raise toggle on the issue card
fix(auth): clear stale session before attaching a new OAuth token
test(pages): cover RegisteredAspirantsPage search + navigation
docs: document VITE_APP_MODE in the README
```

Keep the summary in the imperative mood (“add”, not “added”) and under ~72 chars.

---

## Code style

- **TypeScript, strict mode.** Avoid `any` where a real type is reasonable; prefer explicit prop interfaces.
- **Linting:** run `pnpm run lint`. Fix errors before pushing (warnings are tolerated but don't add new ones gratuitously).
- **Components:** functional components + hooks. Co-locate component-specific helpers; put shared logic in `src/utils` or `src/hooks`.
- **Styling:** use MUI’s `sx` prop / theme tokens (see [`src/theme/`](src/theme/)). Don’t hard-code brand colors — use the `BRAND` tokens.
- **State:** local UI state with `useState`; cross-cutting state via the Zustand stores in [`src/store/`](src/store/).
- **API calls:** never call `axios` directly in a component. Add/extend a service in [`src/services/`](src/services/) and import the function.
- **i18n:** never hard-code user-facing text. Add keys to [`src/i18n/`](src/i18n/) (English **and** Kannada) and use `t('your.key')`.
- **Imports:** use relative paths consistent with the surrounding files.

---

## Writing tests

All tests live in **`src/test/`** as `<Name>.test.ts(x)` and run on **Vitest + React Testing Library**. New features and bug fixes should come with tests.

**The recipe** (works for almost any component/page):

```tsx
import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
import MyComponent from '../components/MyComponent';
import { getThing } from '../services/myService';

// 1. Mock i18n → t() returns the key (or its defaultValue)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, o?: any) => o?.defaultValue ?? k }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// 2. Mock services → never hit the network
vi.mock('../services/myService', () => ({
  getThing: vi.fn(() => Promise.resolve({ data: [] })),
}));

// 3. Render with providers (MUI theme + router) and assert what the user sees
it('renders and reacts to a click', async () => {
  renderWithProviders(<MyComponent />, { route: '/some/path' });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Saved')).toBeInTheDocument();
});
```

**Guidelines**

- Use `renderWithProviders` (from [`src/test/test-utils.tsx`](src/test/test-utils.tsx)) for anything using MUI/router; plain `render` for trivial components.
- Prefer **stable selectors**: `getByRole`, `getByLabelText`, `getByText` — not CSS classes.
- For controlled inputs use `fireEvent.change(input, { target: { value } })`.
- For async UI use `await screen.findBy...` / `waitFor`.
- Keep each file focused (3–8 meaningful tests). Don’t leave `.skip`/failing tests.
- See [`TEST_REPORT.md`](TEST_REPORT.md) for the current coverage map.

Run them:

```bash
pnpm test              # watch while developing
pnpm run test:run      # one-shot (what CI runs)
pnpm run test:coverage # with coverage
```

---

## Before you open a PR

Make sure all of these pass locally:

```bash
pnpm run lint        # no errors
pnpm run test:run    # all tests green
pnpm run build       # tsc -b && vite build succeeds
```

The build type-checks test files too, so a broken test type will fail the build — keep them clean.

---

## Pull request process

1. Branch from `staging`, commit using the conventions above.
2. Ensure lint + tests + build pass locally.
3. Open the PR **against `staging`** with a clear description and screenshots/GIFs for UI changes.
4. CI runs lint + the test suite; the deploy is **gated on tests passing**. A red check blocks merge.
5. Address review feedback, keep the branch up to date with `staging`, and squash-merge once approved.

Thanks again for contributing! 🙏
