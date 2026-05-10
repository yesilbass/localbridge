/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { APPEARANCE_STORAGE_KEY } from '../utils/appearance';

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'zh', label: 'Chinese (Simplified)', nativeLabel: '简体中文' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', rtl: true },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

export const SUPPORTED_LANGUAGE_CODES = LANGUAGE_OPTIONS.map((l) => l.code);
const DEFAULT_LANGUAGE = 'en';

const TRANSLATIONS = {
  en: {
    'brand.bridge': 'Bridge',
    'brand.mentorship': 'Mentorship',
    'nav.mentors': 'Mentors',
    'nav.dashboard': 'Dashboard',
    'nav.resume': 'Resume',
    'nav.pricing': 'Pricing',
    'nav.about': 'About',
    'nav.login': 'Log in',
    'nav.getStarted': 'Get started',
    'nav.getStartedFree': 'Get started free',
    'nav.findMentor': 'Find a Mentor',
    'nav.myProfile': 'My Profile',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Log out',
    'nav.mentorAccount': 'Mentor Account',
    'nav.memberAccount': 'Member Account',
    'nav.openMenu': 'Open menu',
    'nav.closeMenu': 'Close menu',
    'common.close': 'Close',
    'common.home': 'Home',
    'common.sessions': 'Sessions',
    'common.saved': 'Saved',
    'common.billing': 'Billing',
    'common.availability': 'Availability',
    'common.earnings': 'Earnings',
    'common.reviews': 'Reviews',
    'common.hours': 'Hours',
    'dashboard.skipToContent': 'Skip to content',
    'dashboard.expandSidebar': 'Expand sidebar',
    'dashboard.collapseSidebar': 'Collapse sidebar',
    'dashboard.pageMissingTitle': "That page doesn't exist.",
    'dashboard.pageMissingBody': 'Use the sidebar to navigate.',
    'dashboard.loadErrorTitle': "We couldn't load your dashboard.",
    'dashboard.loadErrorBody': "That's on us, not you.",
    'dashboard.retry': 'Retry',
    'footer.stayInLoop': 'Stay in the loop',
    'footer.newsletterBody': 'Mentor spotlights, career resources, product updates. No spam, ever.',
    'footer.subscribed': "You're subscribed!",
    'footer.subscribe': 'Subscribe',
    'footer.displayMode': 'Display mode',
    'footer.light': 'Light',
    'footer.system': 'System',
    'footer.dark': 'Dark',
    'footer.platform': 'Platform',
    'footer.company': 'Company',
    'footer.getInTouch': 'Get in touch',
    'footer.allSystemsOperational': 'All systems operational',
    'footer.rightsReserved': 'All rights reserved.',
    'footer.browseMentors': 'Browse Mentors',
    'footer.aiMatching': 'AI Matching',
    'footer.resumeReview': 'Resume Review',
    'footer.dashboard': 'Dashboard',
    'footer.blog': 'Blog',
    'footer.careers': 'Careers',
    'footer.trustSafety': 'Trust & Safety',
    'footer.community': 'Community',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.cookies': 'Cookies',
    'footer.help': 'Help',
    'footer.contact': 'Contact',
    'settings.languageRegion': 'Language & Region',
    'settings.language': 'Language',
    'settings.timezone': 'Timezone',
    'auth.checkingSession': 'Checking your session…',
    'auth.emailAddress': 'Email address',
    'auth.password': 'Password',
    'auth.confirm': 'Confirm',
    'auth.hidePassword': 'Hide password',
    'auth.showPassword': 'Show password',
    'auth.forgot': 'Forgot?',
    'auth.loginTitle': 'Welcome back',
    'auth.loginSubtitle': 'Step back into your mentor network with a focused, secure, beautifully crafted gateway.',
    'auth.loginRedirectPrefix': 'Sign in and we will send you back to',
    'auth.signIn': 'Sign In',
    'auth.signingIn': 'Signing in…',
    'auth.noAccount': 'No account?',
    'auth.createOne': 'Create one',
    'auth.alreadyInTitle': 'You are already in',
    'auth.alreadyInSubtitlePrefix': 'Signed in as',
    'auth.alreadyInSubtitleSuffix': 'Continue to Bridge without authenticating again.',
    'auth.continueBridge': 'Continue to Bridge',
    'auth.invalidEmail': 'Enter a valid email address.',
    'auth.shortPassword': 'Password must be at least 6 characters.',
    'auth.somethingWrong': 'Something went wrong. Please try again.',
    'auth.socialSigninNotConnectedSuffix': 'sign-in is not connected yet.',
    'auth.socialSignupNotConnectedSuffix': 'sign-up is not connected yet.',
    'auth.registerTitle': 'Create account',
    'auth.registerMentorTitle': 'Create mentor access',
    'auth.registerSubtitle': 'Launch a secure Bridge identity with role-aware onboarding, human trust signals, and a premium first impression.',
    'auth.alreadyHaveOne': 'Already have one?',
    'auth.signInLink': 'Sign in',
    'auth.fullName': 'Full name',
    'auth.passwordStrongPlaceholder': 'Strong password',
    'auth.repeatPasswordPlaceholder': 'Repeat password',
    'auth.findMentorTitle': 'Find a mentor',
    'auth.findMentorDesc': 'Browse, save, and book high-signal sessions.',
    'auth.beMentorTitle': 'Be a mentor',
    'auth.beMentorDesc': 'Build a trusted profile and receive requests.',
    'auth.createAccount': 'Create Account',
    'auth.createMentorAccount': 'Create mentor account',
    'auth.creatingAccount': 'Creating account…',
    'auth.signupAgreementPrefix': 'By signing up you agree to our',
    'auth.terms': 'Terms',
    'auth.and': 'and',
    'auth.privacyPolicy': 'Privacy Policy',
    'auth.signupAgreementSuffix': '.',
    'auth.alreadyOnBridgeTitle': 'You are already on Bridge',
    'auth.alreadyOnBridgeSubtitlePrefix': 'Signed in as',
    'auth.alreadyOnBridgeSubtitleSuffix': 'New signup is not needed.',
    'auth.browseMentors': 'Browse mentors',
    'auth.fullNameRequired': 'Please enter your full name.',
    'auth.validEmailRequired': 'Please enter a valid email address.',
    'auth.passwordsDoNotMatch': 'Passwords do not match.',
    'auth.chooseRole': 'Choose how you will use Bridge.',
  },
  es: {
    'brand.bridge': 'Bridge',
    'brand.mentorship': 'Mentoría',
    'nav.mentors': 'Mentores',
    'nav.dashboard': 'Panel',
    'nav.resume': 'Currículum',
    'nav.pricing': 'Precios',
    'nav.about': 'Acerca de',
    'nav.login': 'Iniciar sesión',
    'nav.getStarted': 'Comenzar',
    'nav.getStartedFree': 'Comenzar gratis',
    'nav.findMentor': 'Encontrar un mentor',
    'nav.myProfile': 'Mi perfil',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar sesión',
    'nav.mentorAccount': 'Cuenta de mentor',
    'nav.memberAccount': 'Cuenta de miembro',
    'nav.openMenu': 'Abrir menú',
    'nav.closeMenu': 'Cerrar menú',
    'common.close': 'Cerrar',
    'common.home': 'Inicio',
    'common.sessions': 'Sesiones',
    'common.saved': 'Guardado',
    'common.billing': 'Facturación',
    'common.availability': 'Disponibilidad',
    'common.earnings': 'Ingresos',
    'common.reviews': 'Reseñas',
    'common.hours': 'Horas',
    'dashboard.skipToContent': 'Saltar al contenido',
    'dashboard.expandSidebar': 'Expandir barra lateral',
    'dashboard.collapseSidebar': 'Contraer barra lateral',
    'dashboard.pageMissingTitle': 'Esa página no existe.',
    'dashboard.pageMissingBody': 'Usa la barra lateral para navegar.',
    'dashboard.loadErrorTitle': 'No pudimos cargar tu panel.',
    'dashboard.loadErrorBody': 'Es nuestro error, no tuyo.',
    'dashboard.retry': 'Reintentar',
    'footer.stayInLoop': 'Mantente al día',
    'footer.newsletterBody': 'Mentores destacados, recursos de carrera y novedades del producto. Sin spam.',
    'footer.subscribed': 'Ya estás suscrito.',
    'footer.subscribe': 'Suscribirse',
    'footer.displayMode': 'Modo de pantalla',
    'footer.light': 'Claro',
    'footer.system': 'Sistema',
    'footer.dark': 'Oscuro',
    'footer.platform': 'Plataforma',
    'footer.company': 'Empresa',
    'footer.getInTouch': 'Contáctanos',
    'footer.allSystemsOperational': 'Todos los sistemas operativos',
    'footer.rightsReserved': 'Todos los derechos reservados.',
    'footer.browseMentors': 'Explorar mentores',
    'footer.aiMatching': 'Emparejamiento IA',
    'footer.resumeReview': 'Revisión de CV',
    'footer.dashboard': 'Panel',
    'footer.blog': 'Blog',
    'footer.careers': 'Carreras',
    'footer.trustSafety': 'Confianza y seguridad',
    'footer.community': 'Comunidad',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',
    'footer.cookies': 'Cookies',
    'footer.help': 'Ayuda',
    'footer.contact': 'Contacto',
    'settings.languageRegion': 'Idioma y región',
    'settings.language': 'Idioma',
    'settings.timezone': 'Zona horaria',
    'auth.checkingSession': 'Comprobando tu sesión…',
    'auth.emailAddress': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.confirm': 'Confirmar',
    'auth.hidePassword': 'Ocultar contraseña',
    'auth.showPassword': 'Mostrar contraseña',
    'auth.forgot': '¿Olvidaste?',
    'auth.loginTitle': 'Bienvenido de nuevo',
    'auth.loginSubtitle': 'Vuelve a tu red de mentores con un acceso seguro, enfocado y bien diseñado.',
    'auth.loginRedirectPrefix': 'Inicia sesión y te llevaremos de vuelta a',
    'auth.signIn': 'Iniciar sesión',
    'auth.signingIn': 'Iniciando sesión…',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.createOne': 'Crear una',
    'auth.alreadyInTitle': 'Ya has iniciado sesión',
    'auth.alreadyInSubtitlePrefix': 'Sesión iniciada como',
    'auth.alreadyInSubtitleSuffix': 'Continúa en Bridge sin autenticarte de nuevo.',
    'auth.continueBridge': 'Continuar a Bridge',
    'auth.invalidEmail': 'Introduce un correo válido.',
    'auth.shortPassword': 'La contraseña debe tener al menos 6 caracteres.',
    'auth.somethingWrong': 'Algo salió mal. Inténtalo de nuevo.',
    'auth.socialSigninNotConnectedSuffix': 'no está conectado para iniciar sesión.',
    'auth.socialSignupNotConnectedSuffix': 'no está conectado para registrarse.',
    'auth.registerTitle': 'Crear cuenta',
    'auth.registerMentorTitle': 'Crear acceso de mentor',
    'auth.registerSubtitle': 'Crea una identidad segura en Bridge con onboarding por rol y señales de confianza.',
    'auth.alreadyHaveOne': '¿Ya tienes una?',
    'auth.signInLink': 'Inicia sesión',
    'auth.fullName': 'Nombre completo',
    'auth.passwordStrongPlaceholder': 'Contraseña segura',
    'auth.repeatPasswordPlaceholder': 'Repite la contraseña',
    'auth.findMentorTitle': 'Encontrar mentor',
    'auth.findMentorDesc': 'Explora, guarda y reserva sesiones de alto valor.',
    'auth.beMentorTitle': 'Ser mentor',
    'auth.beMentorDesc': 'Crea un perfil confiable y recibe solicitudes.',
    'auth.createAccount': 'Crear cuenta',
    'auth.createMentorAccount': 'Crear cuenta de mentor',
    'auth.creatingAccount': 'Creando cuenta…',
    'auth.signupAgreementPrefix': 'Al registrarte aceptas nuestros',
    'auth.terms': 'Términos',
    'auth.and': 'y',
    'auth.privacyPolicy': 'Política de Privacidad',
    'auth.signupAgreementSuffix': '.',
    'auth.alreadyOnBridgeTitle': 'Ya estás en Bridge',
    'auth.alreadyOnBridgeSubtitlePrefix': 'Sesión iniciada como',
    'auth.alreadyOnBridgeSubtitleSuffix': 'No necesitas crear otra cuenta.',
    'auth.browseMentors': 'Explorar mentores',
    'auth.fullNameRequired': 'Por favor introduce tu nombre completo.',
    'auth.validEmailRequired': 'Por favor introduce un correo válido.',
    'auth.passwordsDoNotMatch': 'Las contraseñas no coinciden.',
    'auth.chooseRole': 'Elige cómo usarás Bridge.',
  },
};

function normalizeLanguage(input) {
  if (!input || typeof input !== 'string') return DEFAULT_LANGUAGE;
  const base = input.toLowerCase().split('-')[0];
  return SUPPORTED_LANGUAGE_CODES.includes(base) ? base : DEFAULT_LANGUAGE;
}

function readStoredLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.language) return normalizeLanguage(parsed.language);
    }
  } catch {
    /* ignore */
  }
  return normalizeLanguage(window.navigator.language);
}

function saveLanguage(language) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    const prev = raw ? JSON.parse(raw) : {};
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify({ ...prev, language }));
  } catch {
    /* ignore */
  }
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  useEffect(() => {
    const lang = normalizeLanguage(language);
    const meta = LANGUAGE_OPTIONS.find((l) => l.code === lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', meta?.rtl ? 'rtl' : 'ltr');
    saveLanguage(lang);
  }, [language]);

  const value = useMemo(() => {
    const lang = normalizeLanguage(language);
    const t = (key, fallback = '') => {
      if (!key) return fallback;
      const localized = TRANSLATIONS[lang]?.[key];
      if (localized != null) return localized;
      const english = TRANSLATIONS.en[key];
      if (english != null) return english;
      return fallback || key;
    };
    return {
      language: lang,
      setLanguage: (next) => setLanguageState(normalizeLanguage(next)),
      t,
      languages: LANGUAGE_OPTIONS,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
