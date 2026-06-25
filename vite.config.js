/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ command, mode }) => {
  // Load ALL env vars (empty prefix) so we can read the build-only, un-prefixed
  // SENTRY_* secrets here in the Node config. These are used solely to upload
  // source maps at build time — they never reach the browser bundle.
  const env = loadEnv(mode, process.cwd(), '');

  return {
  // ---- Vitest test configuration ----
  // Kept inside vite.config.js (not a separate vitest.config.ts) so tests reuse
  // the same plugins/resolve config as the app. This block only affects tests.
  test: {
    globals: true,            // use describe/it/expect without importing them
    environment: 'jsdom',     // simulate a browser (document/window) in Node
    setupFiles: './src/test/setupTests.ts', // runs before every test file
    css: false,               // skip CSS processing in tests (faster)
    // Vitest auto-discovers any *.test.ts(x) / *.spec.ts(x) under src/.
    // Exclude build output and (future) Playwright e2e tests.
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],          // terminal summary + HTML report in /coverage
      exclude: [
        '**/*.config.*', '**/*.d.ts', 'src/index.tsx', 'src/main.tsx',
        'src/vite-env.d.ts', '**/types/**', 'src/test/**', 'e2e/**',
      ],
    },
    server: {
      deps: {
        inline: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['prajakeeya.png', 'images/**/*'],
      devOptions: { enabled: false },
      manifest: {
        name: 'Prajaakeeya - Multi-Election Democratic Platform',
        short_name: 'Prajaakeeya',
        description: 'Prajaakeeya - Your Voice, Your Rule, Your Vote',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#0A0808',
        background_color: '#0A0808',
        categories: ['politics', 'social'],
        icons: [
          {
            src: '/images/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
          },
          {
            src: '/images/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            src: '/images/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: '/images/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/prajakeeya.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: '/prajakeeya.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
          },
        ],
      },
      workbox: {
        // Don't emit source maps for the generated service worker. When the
        // app build enables source maps (for Sentry upload), Workbox would
        // otherwise also emit sw.js.map / workbox-*.js.map into dist — and
        // those are produced after Sentry's cleanup step, so they'd ship
        // publicly. The SW is generic boilerplate, so no map is needed.
        sourcemap: false,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // C-PERF-1: Precache only the critical app shell — NOT every asset.
        // The old '**/*.{js,...}' precached ~5 MB on first install: all 11
        // language chunks (~2.6 MB), every Admin page, and images, even for an
        // English-only voter who never opens /admin. We now precache just the
        // shell and let everything else cache on first actual use via the
        // runtime rule below (offline support preserved — languages are loaded
        // through dynamic import() in src/i18n, so they fetch on demand).
        globPatterns: [
          'index.html',
          'manifest.webmanifest',
          'favicon.ico',
          'assets/index-*.js',
          'assets/vendor-*.js',
          'assets/i18n-vendor-*.js',
          'assets/*.css',
        ],
        globIgnores: [
          'assets/[a-z][a-z]-*.js', // language chunks (bn-, hi-, kn-, ta-, ma-, …)
          'assets/Admin*.js',       // admin page chunks
          '**/images/**',           // images load on the pages that use them
          '**/*.map',
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Route / language / page chunks that aren't precached: cache them
            // on first visit so subsequent loads (and offline) work, without
            // paying for all of them up front. Matches Vite's hashed assets.
            urlPattern: /\/assets\/.*-[A-Za-z0-9_-]{8}\.js$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-chunks',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
    // Upload source maps to Sentry so production stack traces show real file
    // names / line numbers instead of minified code. Runs ONLY when an auth
    // token is present (CI / Amplify), so a plain local `vite build` is
    // unaffected. The org auth token (sntrys_*) encodes the EU region, so the
    // plugin routes uploads to the correct data centre automatically.
    ...(command === 'build' && env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            org: env.SENTRY_ORG,
            project: env.SENTRY_PROJECT,
            authToken: env.SENTRY_AUTH_TOKEN,
            // Don't send plugin-usage telemetry to Sentry.
            telemetry: false,
            sourcemaps: {
              // Delete the .map files after upload so they are never served
              // publicly from the dist bundle.
              filesToDeleteAfterUpload: ['./dist/**/*.map'],
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      'react-transition-group/TransitionGroupContext': 'react-transition-group/cjs/TransitionGroupContext.js',
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  // L-SEC-1: strip all console.* and debugger statements from the production
  // bundle. Several call sites log raw server error payloads (err.response.data),
  // which can carry PII/internal details — this guarantees none of that reaches a
  // user's devtools in prod, current or future, without touching the 73 call sites
  // (they stay intact for local dev). Error reporting is unaffected: it goes
  // through Sentry.captureException, not console.
  esbuild: { drop: command === 'build' ? ['console', 'debugger'] : [] },
  build: {
    // 'hidden' emits source maps for Sentry to upload but omits the
    // //# sourceMappingURL comment, so the deleted maps aren't referenced.
    // Only generate them when we actually upload (token present).
    sourcemap: command === 'build' && env.SENTRY_AUTH_TOKEN ? 'hidden' : false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // C-PERF-3: framer-motion gets its own chunk. It's a leaf dependency
          // (imports React, but nothing in the `vendor` triad imports it back),
          // so unlike React/MUI/emotion it carries NO circular-reference risk.
          // It's only used by a handful of (mostly lazy) routes, so isolating it
          // keeps ~100 KB out of the entry vendor chunk that loads on every page.
          if (id.includes('framer-motion')) return 'framer';
          // Keep React + MUI + emotion in ONE chunk. Splitting React away from
          // MUI creates a circular chunk reference that can break module init
          // order at runtime — keep this triad together.
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('react-router') ||
            id.includes('@mui') ||
            id.includes('@emotion')
          ) {
            return 'vendor';
          }
          if (id.includes('i18next')) return 'i18n-vendor';
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
  }
  };
});
