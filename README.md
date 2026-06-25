# Prajaakeeya — Frontend

**Prajaakeeya** is a multi-election democratic platform that connects voters, aspirants, and candidates across ward, municipal, Gram Panchayat, Vidhan Sabha (State Assembly), and Lok Sabha elections. This repository contains the **frontend web app** — a React + TypeScript single-page application (also installable as a PWA).

> _Your Voice, Your Rule, Your Vote._

---

## Table of contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [App modes (mock vs api)](#app-modes-mock-vs-api)
- [Project structure](#project-structure)
- [Routing overview](#routing-overview)
- [Internationalization (i18n)](#internationalization-i18n)
- [Testing](#testing)
- [PWA / offline support](#pwa--offline-support)
- [Build & deployment](#build--deployment)
- [Contributing](#contributing)

---

## Tech stack

| Area | Technology |
|------|-----------|
| Framework | [React 19](https://react.dev/) + [TypeScript 6](https://www.typescriptlang.org/) |
| Build tool | [Vite 5](https://vitejs.dev/) |
| UI | [MUI 9](https://mui.com/) + [Emotion](https://emotion.sh/) |
| Routing | [React Router 6](https://reactrouter.com/) |
| State | [Zustand](https://github.com/pmndrs/zustand) (with `persist`) |
| Forms & validation | [React Hook Form](https://react-hook-form.com/) + [Yup](https://github.com/jquense/yup) |
| HTTP | [Axios](https://axios-http.com/) |
| i18n | [i18next](https://www.i18next.com/) / react-i18next (English + Kannada) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) |
| Auth | Google OAuth (via backend) + Firebase config |
| Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |

---

## Features

- **Voters** — register/sign in (Google OAuth), complete profile, browse wards & aspirants, view candidate details, raise civic issues, vote, and chat with aspirants.
- **Aspirants** — register, upload documents, complete SOP agreement, manage profile, posts, meetings, and requests.
- **Guests** — browse aspirants, wards, civic issues and SOP read-only without an account.
- **Admins** — dashboards, user management, ward creation, booth PDF uploads, reports, and verification.
- **Multilingual** — full English & Kannada support.
- **Installable PWA** — offline banner, service worker caching, home-screen install.

---

## Prerequisites

- **Node.js 24.17.0** (the runtime uses Node 24 LTS)
- **npm** (local development) — the project also commits a **`yarn.lock`** because the Amplify deploy pipeline uses **yarn**. Use whichever you prefer locally, but keep lockfiles in sync.

---

## Getting started

```bash
# 1. Clone
git clone git@github.com:prajaakeeya/prajaakeeya-frontend.git
cd prajaakeeya-frontend

# 2. Install dependencies
npm install          # or: yarn install

# 3. Configure environment
cp .env.example .env
#   then edit .env (see Environment variables below)

# 4. Start the dev server
npm run dev          # or: yarn dev
```

The app runs at **http://localhost:5173**. During development, requests to `/api` are proxied to `http://localhost:3000` (the backend) — see [`vite.config.js`](vite.config.js).

---

## Environment variables

Copy `.env.example` to `.env` and fill in the values. All variables are prefixed `VITE_` so Vite exposes them to the client.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_MODE` | yes | `api` to talk to the real backend, `mock` to run with built-in demo data. |
| `VITE_API_URL` | yes (api mode) | Base URL of the backend API. `/api` is appended automatically. |
| `VITE_API_BASE_URL` | optional | Fallback used if `VITE_API_URL` is not set. |
| `VITE_FIREBASE_API_KEY` | for auth | Firebase Web API key (Firebase Console → Project Settings). |
| `VITE_FIREBASE_AUTH_DOMAIN` | for auth | Firebase auth domain. |
| `VITE_FIREBASE_PROJECT_ID` | for auth | Firebase project id. |
| `VITE_FIREBASE_STORAGE_BUCKET` | for auth | Firebase storage bucket. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | for auth | Firebase messaging sender id. |
| `VITE_FIREBASE_APP_ID` | for auth | Firebase app id. |
| `VITE_FIREBASE_MEASUREMENT_ID` | optional | Firebase Analytics measurement id. |
| `VITE_AUDIO_BASE_URL` | optional | Base URL (S3/CDN) for audio assets. |

> ⚠️ Never commit a real `.env`. Only `.env.example` (with placeholder values) belongs in git.

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server (HMR) on port 5173. |
| `npm run build` | Type-check (`tsc -b`) and build the production bundle to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint over `src`. |
| `npm test` | Run the test suite in **watch** mode. |
| `npm run test:run` | Run the full test suite once (used in CI). |
| `npm run test:coverage` | Run tests once and produce a coverage report (`/coverage`). |

---

## App modes (mock vs api)

The app supports two runtime modes via `VITE_APP_MODE` (see [`src/config/appMode.ts`](src/config/appMode.ts)):

- **`api`** — talks to the real backend (`VITE_API_URL`).
- **`mock`** (default if unset) — renders built-in demo data so you can run the UI without a backend. Useful for design/QA and for parts of the test suite.

---

## Project structure

```
src/
├─ App.tsx              # Root component + all route definitions
├─ index.tsx            # App entry point
├─ assets/              # Images, fonts, static media
├─ components/          # Reusable UI components (admin/, aspirant/, shared)
├─ config/              # App config (appMode)
├─ hooks/               # Custom React hooks (useSnackbar, useExtractionPolling)
├─ i18n/                # i18next setup + locale resources (en, kn)
├─ layouts/             # Route layouts (User, Guest, Admin, Auth, Public)
├─ pages/               # Page components (admin/, aspirant/, guest/, shared)
├─ services/            # API clients (axios) — one file per backend domain
├─ store/               # Zustand stores (useAuthStore, useThemeStore)
├─ theme/               # MUI theme factory + brand tokens
├─ types/               # Shared TypeScript types
├─ utils/               # Pure helpers (validation, fileUtils, profileUtils)
└─ test/                # All tests + test setup (see Testing)
```

---

## Routing overview

Routes are defined in [`src/App.tsx`](src/App.tsx) and grouped by audience, each with its own layout:

| Prefix | Layout | Audience | Examples |
|--------|--------|----------|----------|
| `/`, `/login`, `/register` | Public / Auth | Everyone | landing, login, registration |
| `/onboarding/location` | — | New users | constituency onboarding |
| `/user/*` | `UserLayout` | Authenticated voters/aspirants | dashboard, complete-profile, vote, civic-issues, chat, notifications |
| `/guest/*` | `GuestLayout` | Guests (no account) | dashboard, aspirants, civic-issues, registered-aspirants, sop |
| `/admin`, `/admin/*` | `AdminLayout` | Admins | dashboard, users, wards, reports |

---

## Internationalization (i18n)

The app ships with **English** and **Kannada**. Translation keys live under [`src/i18n/`](src/i18n/) and are accessed via the `useTranslation()` hook (`t('some.key')`). Add new UI strings as keys in the locale resources rather than hard-coding text, so both languages stay in sync.

---

## Testing

The frontend has a **Vitest + React Testing Library** suite. All tests live in [`src/test/`](src/test/) as `*.test.ts(x)`.

```bash
npm test                # watch mode while developing
npm run test:run        # run once (CI)
npm run test:coverage   # run once + coverage report
```

- **Unit tests** — pure logic (validation, file/profile utils, stores).
- **UI tests** — components and pages rendered with mocked services & i18n; assertions on rendering and user interactions.

> A detailed, shareable breakdown lives in [`TEST_REPORT.md`](TEST_REPORT.md). Conventions and the test "recipe" are in [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## PWA / offline support

The app is a Progressive Web App via `vite-plugin-pwa` (Workbox). It precaches the build, caches fonts and API responses, shows an **offline banner** when the network drops, and can be installed to the home screen. PWA behavior is **disabled in dev** and active in production builds — see the `VitePWA(...)` config in [`vite.config.js`](vite.config.js).

---

## Build & deployment

Build the production bundle:

```bash
npm run build     # tsc -b && vite build  →  outputs to dist/
```

There are two deployment paths:

1. **AWS Amplify** — auto-builds and deploys on push to `main` / `staging` (`yarn install` → `yarn build`). Build settings live in the Amplify Console (or an `amplify.yml` if present).
2. **GitHub Actions** — [`.github/workflows/deploy-frontend.yml`](.github/workflows/deploy-frontend.yml) runs **lint + tests** and deploys the build to S3 + CloudFront only if they pass (`needs: test`).

> The `main` branch maps to **production** and `staging` to the **staging** environment.

---

## Contributing

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request — it covers branch naming, commit conventions, code style, and how to add tests. In short: branch off `staging`, keep the suite green (`npm run test:run`) and lint clean (`npm run lint`), and open a PR against `staging`.
