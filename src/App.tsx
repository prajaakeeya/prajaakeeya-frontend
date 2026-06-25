import { Suspense, useEffect, lazy } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress, Box } from "@mui/material";

// ── Static imports ──
// Layouts, store and always-on components are rendered outside <Suspense>,
// so they stay in the entry chunk.
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import AuthLayout from "./layouts/AuthLayout";
import PublicLayout from "./layouts/PublicLayout";
import GuestLayout from "./layouts/GuestLayout";
import useAuthStore from "./store/useAuthStore";
import { COOKIE_AUTH } from "./config/authMode";
// C-PERF-4 follow-up: load the push-notification service lazily. A static import
// pulls the whole Firebase SDK (firebase/app + firebase/messaging) into the main
// entry chunk, so every visitor downloads it on first paint even though push only
// matters for authenticated users who grant permission. Importing it on demand
// inside the effects below moves Firebase into its own chunk, off the critical path.
const loadPush = () => import("./services/pushNotifications");
import Preloader, { dismissPreloader } from "./components/Preloader";
import OfflineBanner from "./components/OfflineBanner";
import usePreferenceStore from "./store/usePreferenceStore";
import { BRAND } from "./theme";

// Coming Soon branch renders these BEFORE the <Suspense> boundary, so keep
// them static (the legal pages are tiny and also reused in normal routes).
import ComingSoonPage from "./pages/ComingSoonPage";
import ChildSafetyPage from "./pages/ChildSafetyPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import CommunityGuidelinesPage from "./pages/CommunityGuidelinesPage";

// ── Set to false to disable the Coming Soon banner and restore normal routes ──
const COMING_SOON = false;

// ── Lazy-loaded route pages (each becomes its own on-demand chunk) ──
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const CreateWardPage = lazy(() => import("./pages/CreateWardPage"));
const AdminUsersListPage = lazy(() => import("./pages/admin/AdminUsersListPage"));
const AdminUserDetailsPage = lazy(() => import("./pages/admin/AdminUserDetailsPage"));
const AdminCreateUserPage = lazy(() => import("./pages/admin/AdminCreateUserPage"));
const AdminEditUserPage = lazy(() => import("./pages/admin/AdminEditUserPage"));
const AdminMeetingsPage = lazy(() => import("./pages/admin/AdminMeetingsPage"));
const AdminVotingWindowPage = lazy(() => import("./pages/admin/AdminVotingWindowPage"));
const AdminElectionsPage = lazy(() => import("./pages/admin/AdminElectionsPage"));
const AdminParliamentaryPage = lazy(() => import("./pages/admin/AdminParliamentaryPage"));
const AdminAssemblyPage = lazy(() => import("./pages/admin/AdminAssemblyPage"));
const AdminMunicipalityPage = lazy(() => import("./pages/admin/AdminMunicipalityPage"));
const AdminGramaPanchayatPage = lazy(() => import("./pages/admin/AdminGramaPanchayatPage"));
const AdminAspirantListPage = lazy(() => import("./pages/admin/AdminAspirantListPage"));
const UserRegisterPage = lazy(() => import("./pages/UserRegisterPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const UserConstituencyOnboardingPage = lazy(() => import("./pages/UserConstituencyOnboardingPage"));
const UserDashboardPage = lazy(() => import("./pages/UserDashboardPage"));
const CivicIssuesPage = lazy(() => import("./pages/CivicIssuesPage"));
const ReportIssuePage = lazy(() => import("./pages/ReportIssuePage"));
const AspirantDeclarationPage = lazy(() => import("./pages/AspirantDeclarationPage"));
const AspirantRegistrationPage = lazy(() => import("./pages/AspirantRegistrationPage"));
const DocumentsUploadPage = lazy(() => import("./pages/DocumentsUploadPage"));
// SOP upload step removed from aspirant registration flow
// const SopUploadPage = lazy(() => import("./pages/SopUploadPage"));
const SopPage = lazy(() => import("./pages/SopPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SignedSopPage = lazy(() => import("./pages/SignedSopPage"));
const WardCandidateListPage = lazy(() => import("./pages/WardCandidateListPage"));
const WardVotersPage = lazy(() => import("./pages/WardVotersPage"));
const RegisteredAspirantsPage = lazy(() => import("./pages/RegisteredAspirantsPage"));
const AspirantViewDetailsPage = lazy(() => import("./pages/AspirantViewDetailsPage"));
const DemoAspirantViewPage = lazy(() => import("./pages/DemoAspirantViewPage"));
const VotingResultPage = lazy(() => import("./pages/VotingResultPage"));
const KattePage = lazy(() => import("./pages/KattePage"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const LoadingPage = lazy(() => import("./pages/LoadingPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const OathPage = lazy(() => import("./pages/OathPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PreferencesPage = lazy(() => import("./pages/PreferencesPage"));

// Aspirant mobile route pages
const AspirantProfilePage = lazy(() => import("./pages/aspirant/AspirantProfilePage"));
const AspirantMeetingLinksPage = lazy(() => import("./pages/aspirant/AspirantMeetingLinksPage"));
const AspirantChatPage = lazy(() => import("./pages/aspirant/AspirantChatPage"));
const AspirantPostsPage = lazy(() => import("./pages/aspirant/AspirantPostsPage"));
const AspirantRequestsPage = lazy(() => import("./pages/aspirant/AspirantRequestsPage"));

// Guest route pages
const GuestDashboardPage = lazy(() => import("./pages/guest/GuestDashboardPage"));
// GuestVotersPage route removed (H4): voter-roll page de-linked from guests to
// avoid exposing voter PII to anonymous users. Component kept at
// pages/guest/GuestVotersPage.tsx for future re-enable behind auth.
const GuestAspirantsPage = lazy(() => import("./pages/guest/GuestAspirantsPage"));
const GuestRegisteredAspirantsPage = lazy(() => import("./pages/guest/GuestRegisteredAspirantsPage"));
const GuestCivicIssuesPage = lazy(() => import("./pages/guest/GuestCivicIssuesPage"));
const GuestSopPage = lazy(() => import("./pages/guest/GuestSopPage"));
const GuestPlaceholderPage = lazy(() => import("./pages/guest/GuestPlaceholderPage"));

const UserChatPage = lazy(() => import("./pages/UserChatPage"));

const RedirectIfAuth = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (isAuthenticated) {
    if (isAdmin) return <Navigate to="/admin/users" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }
  return children;
};

const App = () => {
  const { t } = useTranslation();
  const { isAdmin, isAuthenticated, token, user, fetchProfile } = useAuthStore();
  const { activeLayout } = usePreferenceStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Let push-notification deep links (iOS native bridge) navigate in-SPA
    // instead of doing a full page reload.
    void loadPush().then((m) => m.setPushNavigator((path) => navigate(path)));
    return () => {
      void loadPush().then((m) => m.setPushNavigator(null));
    };
  }, [navigate]);

  useEffect(() => {
    // Web-push notification tap → navigate. The FCM service worker stashes the
    // target route in the Cache API; we PULL it whenever the app (re)gains focus.
    // This is reliable even for a page launched via openWindow (which loads
    // UNCONTROLLED, so the SW's postMessage isn't delivered — the real cause of
    // "navigates only after a refresh"). Triggers: mount, visibilitychange,
    // window focus, and the PUSH_NAVIGATE message as a fast-path nudge. The
    // consumer deletes the stash, so multiple triggers never double-navigate.
    const consumeRoute = () => void loadPush().then((m) => m.consumePendingPushRoute());
    consumeRoute();

    const onVisible = () => {
      if (document.visibilityState === "visible") consumeRoute();
    };
    const onFocus = () => consumeRoute();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    let onSwMessage: ((event: MessageEvent) => void) | undefined;
    if ("serviceWorker" in navigator) {
      onSwMessage = (event: MessageEvent) => {
        const msg = event.data as { type?: string } | null;
        if (msg && msg.type === "PUSH_NAVIGATE") consumeRoute();
      };
      navigator.serviceWorker.addEventListener("message", onSwMessage);
      // addEventListener('message') does not start the client message queue;
      // startMessages() does. Harmless even though the stash is the primary path.
      navigator.serviceWorker.startMessages();
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      if (onSwMessage && "serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onSwMessage);
      }
    };
  }, []);

  useEffect(() => {
    // On page reload / first mount, restore the session by fetching fresh user
    // data. Legacy mode only bothers when a token was persisted. Cookie mode has
    // no client-side token — the httpOnly session cookie is the only signal —
    // so we always ask /auth/me, which returns the user if the cookie is valid
    // or 401s (→ interceptor handles refresh/logout) if not.
    if (COOKIE_AUTH || token) {
      void fetchProfile();
    }
  }, [token, fetchProfile]);

  useEffect(() => {
    // Constituency onboarding guard. The decision must be data-driven (are all
    // four constituencies null?) rather than relying on the "celebrated" flag in
    // AuthCallbackPage — otherwise a returning login (e.g. after the user deleted
    // their account and signed in again) skips onboarding even though their
    // constituencies are null. Once the fresh profile is loaded, send a
    // non-admin user with no constituency set to the onboarding wizard. Only
    // redirect from /user/* routes so we never hijack onboarding/login/admin/
    // public pages. Mirrors the "hasAny" check on UserConstituencyOnboardingPage
    // (gramPanchayat is matched as != null, the others by .id).
    if (!isAuthenticated || isAdmin || !user) return;
    // If the user already went through the wizard and chose to skip every
    // constituency, don't trap them back here on each /user/* navigation.
    // Keep this string in sync with ONBOARDING_DISMISSED_KEY in
    // UserConstituencyOnboardingPage (kept local to preserve the page's lazy
    // chunk instead of importing from it).
    if (localStorage.getItem("__USER_LOCATION_ONBOARDED__") === "1") return;
    const hasAnyConstituency =
      user.lokSabhaConstituency?.id != null ||
      user.stateAssemblyConstituency?.id != null ||
      user.municipalCorporationConstituency?.id != null ||
      user.gramPanchayatConstituency != null;
    if (!hasAnyConstituency && location.pathname.startsWith("/user")) {
      navigate("/onboarding/location", { replace: true });
    }
  }, [isAuthenticated, isAdmin, user, location.pathname, navigate]);

  useEffect(() => {
    // Wire web push (FCM) for the signed-in user: registers silently if the
    // user already granted notifications, otherwise prompts on their next
    // gesture. No-op unless Firebase env is configured + push is supported.
    // Cookie mode has no client-side token, so gate on isAuthenticated alone —
    // requiring `token` here would silently disable push for cookie-auth users.
    if (isAuthenticated && (COOKIE_AUTH || token)) {
      // The service's setupPushForUser() returns a cleanup fn, but the dynamic
      // import resolves async — capture it and run it when the effect tears down
      // (even if teardown happens before the import settles).
      let cleanup: (() => void) | undefined;
      let cancelled = false;
      void loadPush().then((m) => {
        if (cancelled) return;
        cleanup = m.setupPushForUser();
      });
      return () => {
        cancelled = true;
        cleanup?.();
      };
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    // Dismiss the preloader after the animation completes (~5 s)
    // Only if on the root path where the preloader is shown.
    if (
      location.pathname === "/" ||
      location.pathname === "/index.html" ||
      location.pathname === "/loading"
    ) {
      const t = setTimeout(dismissPreloader, 5000);
      return () => clearTimeout(t);
    } else {
      // If direct link to another page, dismiss immediately
      dismissPreloader();
    }
  }, [location.pathname]);

  if (COMING_SOON) {
    return (
      <Routes>
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route
          path="/terms-and-conditions"
          element={<TermsAndConditionsPage />}
        />
        <Route
          path="/community-guidelines"
          element={<CommunityGuidelinesPage />}
        />
        <Route path="/child-safety" element={<ChildSafetyPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Routes>
    );
  }

  return (
    <>
      {activeLayout && (
        <style>{`
          /* Preferences Overrides */

          /* --- REVERSE VIEW PREFERENCE --- */
          .layout-pref-reverse .MuiGrid-container,
          .layout-pref-reverse .MuiGrid2-container,
          .layout-pref-reverse .MuiGrid-root.MuiGrid-container,
          .layout-pref-reverse .MuiGrid2-root.MuiGrid2-container {
            flex-direction: row-reverse !important;
          }

          /* --- STRAIGHT STACK VIEW PREFERENCE --- */
          .layout-pref-straight .MuiGrid-item,
          .layout-pref-straight .MuiGrid2-root:not(.MuiGrid2-container) {
            max-width: 100% !important;
            flex-basis: 100% !important;
            width: 100% !important;
          }

          /* --- CARD OVER FLOW VIEW PREFERENCE --- */
          .layout-pref-cardover .MuiGrid-item,
          .layout-pref-cardover .MuiGrid2-root:not(.MuiGrid2-container) {
            max-width: 100% !important;
            flex-basis: 100% !important;
            width: 100% !important;
            position: sticky !important;
            background-color: inherit;
            border-radius: 12px;
          }

          /* Card over z-indexes for smooth overlapping transitions */
          .layout-pref-cardover .MuiGrid-item:nth-of-type(1),
          .layout-pref-cardover .MuiGrid2-root:nth-of-type(1) {
            top: 100px !important;
            z-index: 10 !important;
          }

          .layout-pref-cardover .MuiGrid-item:nth-of-type(2),
          .layout-pref-cardover .MuiGrid2-root:nth-of-type(2) {
            top: 130px !important;
            z-index: 20 !important;
          }

          .layout-pref-cardover .MuiGrid-item:nth-of-type(3),
          .layout-pref-cardover .MuiGrid2-root:nth-of-type(3) {
            top: 160px !important;
            z-index: 30 !important;
          }

          .layout-pref-cardover .MuiCard-root,
          .layout-pref-cardover .MuiPaper-root {
            box-shadow: 0 -10px 30px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.15) !important;
          }
        `}</style>
      )}

      <Box className={activeLayout ? `layout-pref-${activeLayout}` : ""} sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {(location.pathname === "/" ||
          location.pathname === "/index.html" ||
          location.pathname === "/loading") && <Preloader />}
        <OfflineBanner />
        <Suspense
        fallback={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh"
            }}>
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <RedirectIfAuth>
                <HomePage />
              </RedirectIfAuth>
            }
          />
          <Route
            path="/oath"
            element={
              <RedirectIfAuth>
                <OathPage />
              </RedirectIfAuth>
            }
          />
          <Route element={<AuthLayout title={t("adminLogin.title")} />}>
            <Route
              path="/admin/login"
              element={
                <RedirectIfAuth>
                  <AdminLoginPage />
                </RedirectIfAuth>
              }
            />
          </Route>
          <Route element={<AuthLayout title={t("userRegister.title")} />}>
            <Route
              path="/register"
              element={
                <RedirectIfAuth>
                  <UserRegisterPage />
                </RedirectIfAuth>
              }
            />
          </Route>

          {/* Public routes accessible from landing page */}
          <Route element={<PublicLayout />}>
            {/* <Route path="/aspirantslist" element={<WardCandidateListPage />} /> */}
            <Route path="/elections" element={<VotingResultPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          {/* Signed SOP should use the same header as UserLayout */}
          <Route element={<UserLayout />}>
            <Route
              path="/aspirants/:id/signed-sop"
              element={<SignedSopPage />}
            />
          </Route>

          {/* Candidate details should use the UserLayout header (same as dashboard) */}
          <Route element={<UserLayout />}>
          </Route>

          {/* Admin routes - auth required but API calls bypassed */}
          <Route
            path="/admin"
            element={
              isAuthenticated && isAdmin ? (
                <AdminLayout />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="wards/create" element={<CreateWardPage />} />
            <Route path="voting-results" element={<VotingResultPage />} />
            <Route path="users" element={<AdminUsersListPage />} />
            <Route path="users/create" element={<AdminCreateUserPage />} />
            <Route path="users/:id/edit" element={<AdminEditUserPage />} />
            <Route path="meetings" element={<AdminMeetingsPage />} />
            <Route path="voting-window" element={<AdminVotingWindowPage />} />
            <Route path="elections" element={<AdminElectionsPage />} />
            <Route path="parliamentary" element={<AdminParliamentaryPage />} />
            <Route path="assembly" element={<AdminAssemblyPage />} />
            <Route path="municipalities" element={<AdminMunicipalityPage />} />
            <Route
              path="grama-panchayat"
              element={<AdminGramaPanchayatPage />}
            />
            <Route path="registered-aspirants" element={<AdminAspirantListPage />} />
            <Route path="registered-aspirants/:id" element={<AdminUserDetailsPage />} />
            <Route path="users/:id" element={<AdminUserDetailsPage />} />
          </Route>

          {/* Standalone onboarding route — auth required, no UserLayout chrome */}
          <Route
            path="/onboarding/location"
            element={
              isAuthenticated ? (
                <UserConstituencyOnboardingPage />
              ) : (
                <Navigate to="/register" />
              )
            }
          />

          {/* User routes - auth required but API calls bypassed */}
          <Route
            path="/user"
            element={
              isAuthenticated ? <UserLayout /> : <Navigate to="/register" />
            }
          >
            <Route path="dashboard" element={<UserDashboardPage />} />
            <Route
              path="complete-profile"
              element={<AspirantProfilePage />}
            />
            <Route path="civic-issues" element={<CivicIssuesPage />} />
            <Route path="civic-issues/report" element={<ReportIssuePage />} />
            <Route path="dashboard/profile" element={<AspirantProfilePage />} />
            <Route
              path="dashboard/meetings"
              element={<AspirantMeetingLinksPage />}
            />
            <Route path="dashboard/chat" element={<AspirantChatPage />} />
            <Route path="dashboard/posts" element={<AspirantPostsPage />} />
            <Route
              path="dashboard/requests"
              element={<AspirantRequestsPage />}
            />
            <Route
              path="aspirants/declaration"
              element={<AspirantDeclarationPage />}
            />
            <Route
              path="aspirants/register"
              element={<AspirantRegistrationPage />}
            />
            <Route
              path="aspirants/documents"
              element={<DocumentsUploadPage />}
            />
            {/* SOP upload step removed from aspirant registration flow */}
            {/* <Route
              path="aspirants/sop"
              element={<SopUploadPage />}
            /> */}
            <Route path="aspirantslist" element={<WardCandidateListPage />} />
            <Route path="voters" element={<WardVotersPage />} />
            <Route
              path="registered-aspirants"
              element={<RegisteredAspirantsPage />}
            />
            <Route
              path="aspirants/:id/view"
              element={<AspirantViewDetailsPage />}
            />
            <Route
              path="aspirants/demo/view"
              element={<DemoAspirantViewPage />}
            />
            <Route path="wards" element={<WardVotersPage />} />
            <Route
              path="wards/:wardNumber/voters"
              element={<WardVotersPage />}
            />
            <Route path="chat/:aspirantId" element={<UserChatPage />} />
            <Route path="discussions" element={<KattePage />} />
            <Route path="sop" element={<SopPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="karyakartas" element={<GuestPlaceholderPage title="Karyakartas" />} />
            <Route path="stats" element={<GuestPlaceholderPage title="Stats" />} />
            <Route path="contact-us" element={<GuestPlaceholderPage title="Contact Us" />} />
            <Route path="about" element={<AboutPage />} />
          </Route>

          {/* Guest routes — no auth required */}
          {/* test comment */}
          <Route path="/guest" element={<GuestLayout />}>
            <Route path="dashboard" element={<GuestDashboardPage />} />
            <Route path="aspirants" element={<GuestAspirantsPage />} />
            <Route path="civic-issues" element={<GuestCivicIssuesPage />} />
            <Route path="sop" element={<GuestSopPage />} />
            <Route
              path="registered-aspirants"
              element={<GuestRegisteredAspirantsPage />}
            />
            <Route
              path="aspirants/:id/view"
              element={<AspirantViewDetailsPage />}
            />
            <Route
              path="aspirants/demo/view"
              element={<DemoAspirantViewPage />}
            />
            <Route path="about" element={<AboutPage />} />
            <Route path="elections" element={<VotingResultPage />} />
            <Route path="stats" element={<GuestPlaceholderPage title="Stats" />} />
            <Route path="contact-us" element={<GuestPlaceholderPage title="Contact Us" />} />
            <Route path="karyakartas" element={<GuestPlaceholderPage title="Karyakartas" />} />
            <Route path="discussions" element={<KattePage />} />
          </Route>

          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/oauth/success" element={<AuthCallbackPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditionsPage />}
          />
          <Route path="/child-safety" element={<ChildSafetyPage />} />
          <Route
            path="/community-guidelines"
            element={<CommunityGuidelinesPage />}
          />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
      </Box>
    </>
  );
};

export default App;
