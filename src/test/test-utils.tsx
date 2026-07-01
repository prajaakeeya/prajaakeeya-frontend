// Shared test helpers. Import from here instead of '@testing-library/react'
// so every test gets the providers most components need (MUI theme + Router).
//
// Usage:
//   import { renderWithProviders, screen } from './test-utils';
//   renderWithProviders(<MyComponent />);
//   // or with a starting route:
//   renderWithProviders(<MyPage />, { route: '/aspirants/5' });

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { getTheme } from '../theme';

interface ProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  // Initial URL the in-memory router starts at (default '/').
  route?: string;
  // Optional route state for the MemoryRouter initial entry. Lets tests exercise
  // components that branch on `location.state` (e.g. SopPage's
  // `fromAspirantRegistration` flag).
  state?: Record<string, unknown>;
}

// Wraps children in the app's MUI theme + an in-memory router.
// MemoryRouter is used (not BrowserRouter) so navigation works without a real
// browser URL bar, and tests can start at any route (optionally with state).
function AllProviders({
  children,
  route = '/',
  state,
}: {
  children: ReactNode;
  route?: string;
  state?: Record<string, unknown>;
}) {
  const entry = state ? { pathname: route, state } : route;
  return (
    <ThemeProvider theme={getTheme('light')}>
      <MemoryRouter initialEntries={[entry]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{children}</MemoryRouter>
    </ThemeProvider>
  );
}

export function renderWithProviders(ui: ReactElement, options: ProvidersOptions = {}) {
  const { route, state, ...rest } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders route={route} state={state}>
        {children}
      </AllProviders>
    ),
    ...rest,
  });
}

// Re-export everything from RTL so tests have a single import source.
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
