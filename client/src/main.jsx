import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './appearance.css';
import App from './App.jsx';
import { applyAppearanceFromStorage, initGlobalThemeListeners } from './utils/appearance';
import { I18nProvider } from './i18n';
import { ContentProvider } from './content';

applyAppearanceFromStorage();
initGlobalThemeListeners();

// After a Vercel deploy, the user's tab still references the old chunk hashes.
// Their next lazy import 404s and the page goes blank — that's the "I have to
// refresh every time" symptom. Detect it and reload exactly once so the user
// gets the fresh bundle without ever seeing a broken page.
const RELOAD_KEY = 'bridge:lastChunkReload';
function looksLikeStaleChunk(err) {
  const m = String(err?.message || err || '').toLowerCase();
  return (
    m.includes('failed to fetch dynamically imported module')
    || m.includes('importing a module script failed')
    || m.includes('error loading dynamically imported module')
    || m.includes("unexpected token '<'") // common when index.html served instead of JS
    || m.includes('chunkloaderror')
  );
}
function maybeReloadForStaleChunk(err) {
  if (!looksLikeStaleChunk(err)) return;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 10_000) return; // already tried once recently
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    window.location.reload();
  } catch { /* ignore */ }
}
window.addEventListener('error', (e) => maybeReloadForStaleChunk(e?.error || e?.message));
window.addEventListener('unhandledrejection', (e) => maybeReloadForStaleChunk(e?.reason));

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <I18nProvider>
            <ContentProvider>
                <App />
            </ContentProvider>
        </I18nProvider>
    </StrictMode>,
);