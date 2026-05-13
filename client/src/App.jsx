import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import MagneticPointer from './components/MagneticPointer';
import PaletteDevBadge from './components/PaletteDevBadge';
import { applyPalette } from './utils/appearance';
import { resolvePalette } from './utils/routePalette';
import Landing from './pages/landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Mentors from './pages/Mentors';
import MentorProfile from './pages/mentor-profile';
import Dashboard from './pages/dashboard/index.jsx';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import ResumeReview from './pages/ResumeReview';
import Footer from './components/Footer';
import BridgeGlobalAtmosphere from './components/BridgeGlobalAtmosphere';
import About from './pages/about';
import WhyUs from './pages/why-us';
import Careers from './pages/footer/Careers.jsx';
import Blog from './pages/footer/Blog.jsx';
import FAQ from './pages/footer/FAQ.jsx';
import Contact from './pages/footer/Contact.jsx';
import Help from './pages/footer/Help.jsx';
import Trust from './pages/footer/Trust.jsx';
import Community from './pages/footer/Community.jsx';
import Privacy from './pages/footer/Privacy.jsx';
import Terms from './pages/footer/Terms.jsx';
import Cookies from './pages/footer/Cookies.jsx';
import FeedbackFAB from './components/FeedbackFAB';
import ErrorBoundary from './components/ErrorBoundary';
import VideoCall from './pages/VideoCall';
import MeetLobby from './pages/MeetLobby';
import IntakeCall from './pages/IntakeCall';
import MentorOnboarding from './pages/MentorOnboarding';
import DevPortal from './pages/DevPortal/index.jsx';
import BookingFinalize from './pages/booking/finalize.jsx';

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
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/mentors/:id" element={<MentorProfile />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/onboarding" element={<MentorOnboarding />} />
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
        </Routes>
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
