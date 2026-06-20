import { Suspense, useEffect, lazy } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress, Box } from "@mui/material";

// ── Static imports ──
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import AuthLayout from "./layouts/AuthLayout";
import PublicLayout from "./layouts/PublicLayout";
import GuestLayout from "./layouts/GuestLayout";
import useAuthStore from "./store/useAuthStore";
import { setupPushForUser, setPushNavigator, consumePendingPushRoute } from "./services/pushNotifications";
import Preloader, { dismissPreloader } from "./components/Preloader";
import OfflineBanner from "./components/OfflineBanner";

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
const UploadBoothPdfsPage = lazy(() => import("./pages/UploadBoothPdfsPage"));
const VoterCountPage = lazy(() => import("./pages/VoterCountPage"));
const ReportsListPage = lazy(() => import("./pages/admin/ReportsListPage"));
const ReportDetailsPage = lazy(() => import("./pages/admin/ReportDetailsPage"));
const AdminUsersListPage = lazy(() => import("./pages/admin/AdminUsersListPage"));
const AdminUserDetailsPage = lazy(() => import("./pages/admin/AdminUserDetailsPage"));
const AdminCreateUserPage = lazy(() => import("./pages/admin/AdminCreateUserPage"));
const AdminEditUserPage = lazy(() => import("./pages/admin/AdminEditUserPage"));
const AdminMeetingsPage = lazy(() => import("./pages/admin/AdminMeetingsPage"));
const AdminCreateMeetingPage = lazy(() => import("./pages/admin/AdminCreateMeetingPage"));
const AdminEditMeetingPage = lazy(() => import("./pages/admin/AdminEditMeetingPage"));
const AdminVotingWindowPage = lazy(() => import("./pages/admin/AdminVotingWindowPage"));
const AdminTelegramLinksPage = lazy(() => import("./pages/admin/AdminTelegramLinksPage"));
const AdminElectionsPage = lazy(() => import("./pages/admin/AdminElectionsPage"));
const AdminParliamentaryPage = lazy(() => import("./pages/admin/AdminParliamentaryPage"));
const AdminAssemblyPage = lazy(() => import("./pages/admin/AdminAssemblyPage"));
const AdminMunicipalityPage = lazy(() => import("./pages/admin/AdminMunicipalityPage"));
const AdminGramaPanchayatPage = lazy(() => import("./pages/admin/AdminGramaPanchayatPage"));
const AdminUploadSopPage = lazy(() => import("./pages/admin/AdminUploadSopPage"));
const AdminAspirantListPage = lazy(() => import("./pages/admin/AdminAspirantListPage"));
const UserLoginPage = lazy(() => import("./pages/UserLoginPage"));
const UserRegisterPage = lazy(() => import("./pages/UserRegisterPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const UserPledgePage = lazy(() => import("./pages/UserPledgePage"));
const UserConstituencyOnboardingPage = lazy(() => import("./pages/UserConstituencyOnboardingPage"));
const UserDashboardPage = lazy(() => import("./pages/UserDashboardPage"));
const CivicIssuesPage = lazy(() => import("./pages/CivicIssuesPage"));
const ReportIssuePage = lazy(() => import("./pages/ReportIssuePage"));
const CivicIssueDetailPage = lazy(() => import("./pages/CivicIssueDetailPage"));
const AspirantDeclarationPage = lazy(() => import("./pages/AspirantDeclarationPage"));
const AspirantRegistrationPage = lazy(() => import("./pages/AspirantRegistrationPage"));
const DocumentsUploadPage = lazy(() => import("./pages/DocumentsUploadPage"));
// SOP upload step removed from aspirant registration flow
// const SopUploadPage = lazy(() => import("./pages/SopUploadPage"));
const SopPage = lazy(() => import("./pages/SopPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SignedSopPage = lazy(() => import("./pages/SignedSopPage"));
const AspirantApprovalPage = lazy(() => import("./pages/AspirantApprovalPage"));
const WardCandidateListPage = lazy(() => import("./pages/WardCandidateListPage"));
const WardVotersPage = lazy(() => import("./pages/WardVotersPage"));
const RegisteredAspirantsPage = lazy(() => import("./pages/RegisteredAspirantsPage"));
const AspirantViewDetailsPage = lazy(() => import("./pages/AspirantViewDetailsPage"));
const DemoAspirantViewPage = lazy(() => import("./pages/DemoAspirantViewPage"));
const CandidateDetailsPage = lazy(() => import("./pages/CandidateDetailsPage"));
const AspirantOtpVerificationPage = lazy(() => import("./pages/AspirantOtpVerificationPage"));
const VotingPage = lazy(() => import("./pages/VotingPage"));
const VotingResultPage = lazy(() => import("./pages/VotingResultPage"));
const WardDiscussionPage = lazy(() => import("./pages/WardDiscussionPage"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const LoadingPage = lazy(() => import("./pages/LoadingPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const OathPage = lazy(() => import("./pages/OathPage"));

// Aspirant mobile route pages
const AspirantProfilePage = lazy(() => import("./pages/aspirant/AspirantProfilePage"));
const AspirantMeetingLinksPage = lazy(() => import("./pages/aspirant/AspirantMeetingLinksPage"));
const AspirantChatPage = lazy(() => import("./pages/aspirant/AspirantChatPage"));
const AspirantDiscussionPage = lazy(() => import("./pages/AspirantDiscussionPage"));
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
  const { isAdmin, isAuthenticated, token, fetchProfile } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Let push-notification deep links (iOS native bridge) navigate in-SPA
    // instead of doing a full page reload.
    setPushNavigator((path) => navigate(path));
    return () => setPushNavigator(null);
  }, [navigate]);

  useEffect(() => {
    // Web-push notification tap → navigate. The FCM service worker stashes the
    // target route in the Cache API; we PULL it whenever the app (re)gains focus.
    void consumePendingPushRoute();

    const onVisible = () => {
      if (document.visibilityState === "visible") void consumePendingPushRoute();
    };
    const onFocus = () => void consumePendingPushRoute();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    let onSwMessage: ((event: MessageEvent) => void) | undefined;
    if ("serviceWorker" in navigator) {
      onSwMessage = (event: MessageEvent) => {
        const msg = event.data as { type?: string } | null;
        if (msg && msg.type === "PUSH_NAVIGATE") void consumePendingPushRoute();
      };
      navigator.serviceWorker.addEventListener("message", onSwMessage);
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
    // On page reload / first mount, if we have a persisted token, fetch fresh user data
    if (token) {
      void fetchProfile();
    }
  }, [token, fetchProfile]);

  useEffect(() => {
    // Wire web push (FCM) for the signed-in user:
    if (isAuthenticated && token) {
      return setupPushForUser();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    // Dismiss the preloader after the animation completes (~5 s)
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
      {(location.pathname === "/" ||
        location.pathname === "/index.html" ||
        location.pathname === "/loading") && <Preloader />}
      <OfflineBanner />
      <Suspense
        fallback={
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
          >
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
          <Route element={<AuthLayout title={t("userLogin.title")} />}>
            <Route
              path="/login"
              element={
                <RedirectIfAuth>
                  <UserLoginPage />
                </RedirectIfAuth>
              }
            />
          </Route>
          <Route element={<AuthLayout title={t("userRegister.title")} />}>
            <Route
              path="/signup"
              element={
                <RedirectIfAuth>
                  <UserPledgePage />
                </RedirectIfAuth>
              }
            />
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
            <Route path="/aspirants" element={<AspirantApprovalPage />} />
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
            <Route path="/aspirants/:id" element={<CandidateDetailsPage />} />
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
            <Route path="upload-pdfs" element={<UploadBoothPdfsPage />} />
            <Route path="voter-count" element={<VoterCountPage />} />
            <Route
              path="aspirants/approval"
              element={<AspirantApprovalPage />}
            />
            <Route path="voting-results" element={<VotingResultPage />} />
            <Route path="reports" element={<ReportsListPage />} />
            <Route path="reports/:id" element={<ReportDetailsPage />} />
            <Route path="users" element={<AdminUsersListPage />} />
            <Route path="users/create" element={<AdminCreateUserPage />} />
            <Route path="users/:id/edit" element={<AdminEditUserPage />} />
            <Route path="meetings" element={<AdminMeetingsPage />} />
            <Route
              path="meetings/create"
              element={<AdminCreateMeetingPage />}
            />
            <Route
              path="meetings/:id/edit"
              element={<AdminEditMeetingPage />}
            />
            <Route path="voting-window" element={<AdminVotingWindowPage />} />
            <Route path="telegram-links" element={<AdminTelegramLinksPage />} />
            <Route path="elections" element={<AdminElectionsPage />} />
            <Route path="parliamentary" element={<AdminParliamentaryPage />} />
            <Route path="assembly" element={<AdminAssemblyPage />} />
            <Route path="municipalities" element={<AdminMunicipalityPage />} />
            <Route
              path="grama-panchayat"
              element={<AdminGramaPanchayatPage />}
            />
            <Route path="upload-sop" element={<AdminUploadSopPage />} />
            <Route path="registered-aspirants" element={<AdminAspirantListPage />} />
            <Route path="registered-aspirants/:id" element={<AdminUserDetailsPage />} />
            {/* Ensure child route is relative under /admin */}
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
            <Route path="civic-issues/:id" element={<CivicIssueDetailPage />} />
            <Route path="dashboard/profile" element={<AspirantProfilePage />} />
            <Route
              path="dashboard/meetings"
              element={<AspirantMeetingLinksPage />}
            />
            <Route path="dashboard/chat" element={<AspirantChatPage />} />
            <Route
              path="dashboard/aspirant-discussion"
              element={<AspirantDiscussionPage />}
            />
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
            <Route
              path="aspirants/verify-otp"
              element={<AspirantOtpVerificationPage />}
            />
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
            <Route path="vote" element={<VotingPage />} />
            <Route path="discussions" element={<WardDiscussionPage />} />
            <Route path="sop" element={<SopPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Guest routes — no auth required */}
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
          </Route>

          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/oauth/success" element={<AuthCallbackPage />} />
          <Route path="/loading" element={<LoadingPage />} />
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
    </>
  );
};

export default App;