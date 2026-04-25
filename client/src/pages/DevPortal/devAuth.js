const SESSION_KEY = 'bridge_dev_auth';
// In production (Vercel), VITE_SERVER_URL is not set → empty string → relative paths.
// In local dev, VITE_SERVER_URL = http://localhost:3001.
const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? '';

export function getDevKey() {
  return import.meta.env.VITE_DEV_ACCESS_CODE || '';
}

export function isDevAuthed() {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return false;
    return atob(stored) === getDevKey();
  } catch {
    return false;
  }
}

export function devLogin(code) {
  if (code === getDevKey() && code.length > 0) {
    sessionStorage.setItem(SESSION_KEY, btoa(code));
    return true;
  }
  return false;
}

export function devLogout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function devFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-dev-key': getDevKey(),
    ...(options.headers || {}),
  };
  return fetch(`${SERVER_URL}/api/dev${path}`, { ...options, headers });
}
