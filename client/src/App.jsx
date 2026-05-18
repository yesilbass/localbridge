import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import MagneticPointer from './components/MagneticPointer';
import PaletteDevBadge from './components/PaletteDevBadge';
import { applyPalette } from './utils/appearance';
import { resolvePalette } from './utils/routePalette';
import Footer from './components/Footer';
import BridgeGlobalAtmosphere from './components/BridgeGlobalAtmosphere';
import FeedbackFAB from './components/FeedbackFAB';
import ErrorBoundary from './components/ErrorBoundary';
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
const About            = lazy(() => import('./pages/about'));
const WhyUs            = lazy(() => import('./pages/why-us'));
const VideoCall        = lazy(() => import('./pages/VideoCall'));
const MeetLobby        = lazy(() => import('./pages/MeetLobby'));
const IntakeCall       = lazy(() => import('./pages/IntakeCall'));
const MentorOnboarding = lazy(() => import('./pages/MentorOnboarding'));
const BookingFinalize  = lazy(() => import('./pages/booking/finalize.jsx'));
const VerifyMentorWizard    = lazy(() => import('./pages/onboarding/mentor/verify/index.jsx'));
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
  const hideFooter =
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/settings') ||
    isDashboard ||
    isVideoCall;
  const hideNavbar = isVideoCall || isDashboard;

  // Scroll to top on route change, but don't fight in-page anchor scrolling.
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.hash]);

  // 3-palette comparison build: set <html data-palette="…"> based on the
  // current route group. Modals/portals inherit via the cascade since they
  // render below <html>. See utils/routePalette.js for the mapping.
  useEffect(() => {
    applyPalette(resolvePalette(location.pathname));
  }, [location.pathname]);

  return (
    <div className="relative isolate min-h-screen bg-bridge-page text-stone-900 font-sans antialiased flex flex-col" style={{ overflowX: 'clip' }}>
      <BridgeGlobalAtmosphere />
      {!isVideoCall && <ScrollProgress />}
      {!isVideoCall && <MagneticPointer />}
      {!hideNavbar && <Navbar />}
      <div
        key={location.pathname}
        className={`relative z-10 flex flex-1 flex-col animate-page-enter ${isLanding || isDashboard ? '' : 'pt-[5.25rem]'}`}
      >
        <ErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/mentors/:id" element={<MentorProfile />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/onboarding" element={<MentorOnboarding />} />
          <Route path="/onboarding/mentor" element={<MentorOnboarding />} />
          <Route path="/onboarding/mentor/verify" element={<VerifyMentorWizard />} />
          <Route path="/refs/:token" element={<SubmitReferencePage />} />
          <Route path="/admin/verification" element={<AdminVerification />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/blog/write" element={<WriteBlogPost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/session/:sessionId/video" element={<VideoCall />} />
          <Route path="/meet/:slug" element={<MeetLobby />} />
          <Route path="/intake/:sessionId" element={<IntakeCall />} />
          <Route path="/booking/finalize" element={<BookingFinalize />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/resume" element={<ResumeReview />} />
          <Route path="/about" element={<About />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/community" element={<Community />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/onboarding" element={<MentorOnboarding />} />
          <Route path="/onboarding/mentor" element={<MentorOnboarding />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </div>
      {!isVideoCall && <FeedbackFAB />}
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
