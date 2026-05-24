import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import MagneticPointer from './components/MagneticPointer';
import PaletteDevBadge from './components/PaletteDevBadge';
import { applyPalette } from './utils/appearance';
import { isMarketingRoute } from './utils/marketingRoute';
import { resolvePalette } from './utils/routePalette';
import Footer from './components/Footer';
import BridgeGlobalAtmosphere from './components/BridgeGlobalAtmosphere';
import FeedbackFAB from './components/FeedbackFAB';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthPage, PublicPage } from './components/routing/RouteGuards';
import LegacyCompanyRedirect from './components/routing/LegacyCompanyRedirect';
import DevPortal from './pages/DevPortal/index.jsx';

const Landing          = lazy(() => import('./pages/landing'));
const Login            = lazy(() => import('./pages/Login'));
const Register         = lazy(() => import('./pages/Register'));
const Mentors          = lazy(() => import('./pages/Mentors'));
const MentorProfile    = lazy(() => import('./pages/mentor-profile'));
const Dashboard        = lazy(() => import('./pages/dashboard/index.jsx'));
const Profile          = lazy(() => import('./pages/Profile'));
const Settings         = lazy(() => import('./pages/Settings'));
const Pricing          = lazy(() => import('./pages/Pricing'));
const ResumeReview     = lazy(() => import('./pages/ResumeReview'));
const Company          = lazy(() => import('./pages/company'));
const HowItWorks       = lazy(() => import('./pages/how-it-works'));
const VideoCall        = lazy(() => import('./pages/VideoCall'));
const MeetLobby        = lazy(() => import('./pages/MeetLobby'));
const IntakeCall       = lazy(() => import('./pages/IntakeCall'));
const BookingFinalize  = lazy(() => import('./pages/booking/finalize.jsx'));
const SubmitReferencePage   = lazy(() => import('./pages/refs/SubmitReference.jsx'));
const AdminVerification     = lazy(() => import('./pages/admin/verification/index.jsx'));
const AdminBlog             = lazy(() => import('./pages/admin/blog/index.jsx'));
const WriteBlogPost         = lazy(() => import('./pages/blog/WriteBlogPost.jsx'));
const Careers   = lazy(() => import('./pages/footer/Careers.jsx'));
const Blog      = lazy(() => import('./pages/footer/Blog.jsx'));
const FAQ       = lazy(() => import('./pages/footer/FAQ.jsx'));
const Contact   = lazy(() => import('./pages/footer/Contact.jsx'));
const Help      = lazy(() => import('./pages/footer/Help.jsx'));
const Trust     = lazy(() => import('./pages/footer/Trust.jsx'));
const Community = lazy(() => import('./pages/footer/Community.jsx'));
const Privacy   = lazy(() => import('./pages/footer/Privacy.jsx'));
const Terms     = lazy(() => import('./pages/footer/Terms.jsx'));
const Cookies   = lazy(() => import('./pages/footer/Cookies.jsx'));

function PageLoadingFallback() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center"
      style={{ minHeight: 'calc(100vh - 5.25rem)' }}
      aria-hidden="true"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full"
        style={{
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
          borderTopColor: 'var(--color-primary)',
        }}
      />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isVideoCall = location.pathname.includes('/video') || location.pathname.startsWith('/meet/');
  const isLanding = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isMentorsRoute =
    location.pathname === '/mentors' || location.pathname.startsWith('/mentors/');
  const hideFooter =
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/settings') ||
    isDashboard ||
    isVideoCall ||
    isAuthPage ||
    isMentorsRoute;
  const hideNavbar = isVideoCall || isDashboard || isAuthPage;

  // Scroll to top on route change, but don't fight in-page anchor scrolling.
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    applyPalette(resolvePalette(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const marketing = isMarketingRoute(location.pathname);
    root.classList.toggle('is-marketing-route', marketing);
    return () => root.classList.remove('is-marketing-route');
  }, [location.pathname]);

  return (
    <div className="relative isolate min-h-screen bg-bridge-page text-stone-900 font-sans antialiased flex flex-col" style={{ overflowX: 'clip' }}>
      {!isAuthPage && <BridgeGlobalAtmosphere />}
      {!isVideoCall && !isAuthPage && <ScrollProgress />}
      {!isVideoCall && !isAuthPage && <MagneticPointer />}
      {!hideNavbar && <Navbar />}
      <div
        key={location.pathname}
        className={`relative z-10 flex flex-1 flex-col animate-page-enter ${isLanding || isDashboard || isAuthPage ? '' : 'pt-[5.25rem]'}`}
      >
        <ErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<PublicPage><Landing /></PublicPage>} />
          <Route path="/login" element={<AuthPage><Login /></AuthPage>} />
          <Route path="/register" element={<AuthPage><Register /></AuthPage>} />
          <Route path="/mentors" element={<PublicPage><Mentors /></PublicPage>} />
          <Route path="/mentors/:id" element={<PublicPage><MentorProfile /></PublicPage>} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/refs/:token" element={<SubmitReferencePage />} />
          <Route path="/admin/verification" element={<AdminVerification />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/blog/write" element={<WriteBlogPost />} />
          <Route path="/profile" element={<PublicPage><Profile /></PublicPage>} />
          <Route path="/settings" element={<PublicPage><Settings /></PublicPage>} />
          <Route path="/session/:sessionId/video" element={<VideoCall />} />
          <Route path="/meet/:slug" element={<MeetLobby />} />
          <Route path="/intake/:sessionId" element={<IntakeCall />} />
          <Route path="/booking/finalize" element={<BookingFinalize />} />
          <Route path="/pricing" element={<PublicPage><Pricing /></PublicPage>} />
          <Route path="/resume" element={<PublicPage><ResumeReview /></PublicPage>} />
          <Route path="/company" element={<PublicPage><Company /></PublicPage>} />
          <Route path="/how-it-works" element={<PublicPage><HowItWorks /></PublicPage>} />
          <Route path="/about" element={<LegacyCompanyRedirect />} />
          <Route path="/why-us" element={<LegacyCompanyRedirect />} />
          <Route path="/careers" element={<PublicPage><Careers /></PublicPage>} />
          <Route path="/blog" element={<PublicPage><Blog /></PublicPage>} />
          <Route path="/faq" element={<PublicPage><FAQ /></PublicPage>} />
          <Route path="/contact" element={<PublicPage><Contact /></PublicPage>} />
          <Route path="/help" element={<PublicPage><Help /></PublicPage>} />
          <Route path="/trust" element={<PublicPage><Trust /></PublicPage>} />
          <Route path="/community" element={<PublicPage><Community /></PublicPage>} />
          <Route path="/privacy" element={<PublicPage><Privacy /></PublicPage>} />
          <Route path="/terms" element={<PublicPage><Terms /></PublicPage>} />
          <Route path="/cookies" element={<PublicPage><Cookies /></PublicPage>} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </div>
      {!isVideoCall && !isAuthPage && <FeedbackFAB />}
      {!hideFooter && <Footer />}
      <PaletteDevBadge />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Hidden developer portal — completely outside normal layout */}
          <Route path="/bridge-internal/*" element={<DevPortal />} />
          {/* All regular app routes */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
